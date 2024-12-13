import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function FarmEnergyReport() {
  const [farms, setFarms] = useState([]);
  const [filters, setFilters] = useState({
    farm: "",
    fromDate: "2024-01-01",
    toDate: "2024-10-01",
    energyType: "Biogas", // Default energy type
  });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch farms for dropdown
    const fetchFarms = async () => {
      try {
        const res = await axios.get("/api/getWaterFarm"); // ใช้ API ฟาร์ม
        setFarms(res.data);
        if (res.data.length > 0) {
          setFilters((prev) => ({ ...prev, farm: res.data[0].farm }));
        }
      } catch (error) {
        console.error("Error fetching farms:", error);
      }
    };

    fetchFarms();
  }, []);

  useEffect(() => {
    // Convert dates to Buddhist Era (BE) for request
    const convertToBE = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString; // Return the original if invalid date
      const year = date.getFullYear() + 543; // Add 543 to convert to BE
      return `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    // Format date to "ก.ค. 2567"
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString; // Return the original if invalid date
      const months = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear(); // Convert to Buddhist Era
      return `${month} ${year}`;
    };

    // Fetch energy data
    const fetchData = async () => {
      if (!filters.farm || !filters.fromDate || !filters.toDate) return;

      try {
        const res = await axios.get("/api/getFarmEnergyData", {
          params: {
            farm: filters.farm,
            fromDate: convertToBE(filters.fromDate), // Convert fromDate to BE
            toDate: convertToBE(filters.toDate), // Convert toDate to BE
            energyType: filters.energyType,
          },
        });
        const result = res.data;

        const labels = result.map((row) => formatDate(row.date)); // Format date to "ก.ค. 2567"
        const data = result.map((row) => row.value); // Energy values

        setChartData({
          labels,
          datasets: [
            {
              label: `${filters.energyType} Usage (kW)`,
              data,
              borderColor: filters.energyType === "Biogas" ? "#36A2EB" : filters.energyType === "Solar" ? "#4BC0C0" : "#9966FF",
              backgroundColor: filters.energyType === "Biogas" ? "rgba(54, 162, 235, 0.2)" : filters.energyType === "Solar" ? "rgba(75, 192, 192, 0.2)" : "rgba(153, 102, 255, 0.2)",
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching energy data:", error);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">รายงานการใช้พลังงานรายฟาร์ม</h1>

      {/* ฟิลเตอร์ */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label htmlFor="farm" className="form-label">ฟาร์ม</label>
          <select
            id="farm"
            name="farm"
            className="form-select"
            value={filters.farm}
            onChange={handleFilterChange}
          >
            <option value="">-- เลือกฟาร์ม --</option>
            {farms.map((farm, index) => (
              <option key={index} value={farm.farm}>{farm.farm}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="fromDate" className="form-label">จากวันที่</label>
          <input
            type="date"
            id="fromDate"
            name="fromDate"
            className="form-control"
            value={filters.fromDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="toDate" className="form-label">ถึงวันที่</label>
          <input
            type="date"
            id="toDate"
            name="toDate"
            className="form-control"
            value={filters.toDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="energyType" className="form-label">ประเภทพลังงาน</label>
          <select
            id="energyType"
            name="energyType"
            className="form-select"
            value={filters.energyType}
            onChange={handleFilterChange}
          >
            <option value="Biogas">Biogas</option>
            <option value="Solar">Solar</option>
            <option value="PEA">PEA</option>
          </select>
        </div>
      </div>

      {/* กราฟ */}
      {chartData ? (
        <Line
          data={chartData}
          options={{
            plugins: {
              legend: { display: true, position: "top" },
            },
            responsive: true,
            scales: {
              x: {
                title: { display: true, text: "ช่วงเวลา" },
              },
              y: {
                title: { display: true, text: "kW" },
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <p className="text-center">กรุณาเลือกฟาร์มและช่วงเวลา</p>
      )}
    </div>
  );
}
