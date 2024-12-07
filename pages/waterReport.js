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

export default function WaterReport() {
  const [farms, setFarms] = useState([]);
  const [filters, setFilters] = useState({
    farm: "",
    parameter: "COD",
  });
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Function to format "monthYear" into "ม.ค. 67"
  const monthYearFormatter = (monthYear) => {
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    const [year, month] = monthYear.split("-");
    return `${months[parseInt(month, 10) - 1]} ${year.slice(-2)}`;
  };

  useEffect(() => {
    // Fetch farm list for dropdown
    const fetchFarms = async () => {
      try {
        const res = await axios.get("/api/getWaterFarm");
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
    // Fetch water data based on filters
    const fetchData = async () => {
      if (!filters.farm || !filters.parameter) return;

      try {
        const res = await axios.get("/api/getWaterData", {
          params: {
            farm: filters.farm,
            parameter: filters.parameter,
          },
        });
        setData(res.data || []);
        generateChart(res.data || []);
      } catch (error) {
        console.error("Error fetching water data:", error.response?.data || error.message);
      }
    };

    fetchData();
  }, [filters]);

  const generateChart = (data) => {
    const labels = [...new Set(data.map((row) => monthYearFormatter(row.monthYear)))];
    const pools = [...new Set(data.map((row) => row.pool))];

    const datasets = pools.map((pool, index) => {
      return {
        label: pool,
        data: labels.map((monthYear) => {
          const originalMonthYear = data.find(
            (d) => monthYearFormatter(d.monthYear) === monthYear && d.pool === pool
          );
          return originalMonthYear ? originalMonthYear[filters.parameter] : 0;
        }),
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: `hsl(${index * 60}, 70%, 90%)`,
        tension: 0.4,
      };
    });

    setChartData({
      labels,
      datasets,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">รายงานข้อมูลคุณภาพน้ำ</h1>

      {/* Filter Section */}
      <div className="row mb-4">
        <div className="col-md-4">
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
        <div className="col-md-4">
          <label htmlFor="parameter" className="form-label">เลือกข้อมูล</label>
          <select
            id="parameter"
            name="parameter"
            className="form-select"
            value={filters.parameter}
            onChange={handleFilterChange}
          >
            <option value="BOD">BOD</option>
            <option value="COD">COD</option>
            <option value="PH">PH</option>
            <option value="TKN">TKN</option>
            <option value="TSS">TSS</option>
            <option value="Ammonia">Ammonia</option>
            <option value="TP">TP</option>
            <option value="ALK">ALK</option>
            <option value="VFA">VFA</option>
          </select>
        </div>
      </div>

      {/* Chart Section */}
      {chartData ? (
        <Line
          data={chartData}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${context.dataset.label}: ${context.raw.toLocaleString()} ${filters.parameter}`;
                  },
                },
              },
              legend: { display: true, position: "top" },
            },
            responsive: true,
            scales: {
              x: {
                title: { display: true, text: "ช่วงเวลา" },
              },
              y: {
                title: { display: true, text: `${filters.parameter}` },
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <p className="text-center">ไม่มีข้อมูล</p>
      )}
    </div>
  );
}
