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

export default function GHGReport() {
  const [farms, setFarms] = useState([]);
  const [sources, setSources] = useState([]);
  const [filters, setFilters] = useState({
    farm: "จันทบุรี",
    source: "Biogas",
  });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch farms and sources for dropdown
    const fetchDropdownData = async () => {
      try {
        const farmRes = await axios.get("/api/getGHGFarms");
        const sourceRes = await axios.get("/api/getGHGSources");
        setFarms(farmRes.data);
        setSources(sourceRes.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.farm || !filters.source) return;

      try {
        const res = await axios.get("/api/getGHGData", {
          params: {
            farm: filters.farm,
            source: filters.source,
          },
        });
        const result = res.data;

        const labels = [...new Set(result.map((row) => row.dataDate))];
        const data = labels.map((label) => {
          const row = result.find(
            (data) => data.dataDate === label && data.source === filters.source
          );
          return row ? row.avgGHG : 0;
        });

        const colors = {
          PEA: "#9966FF",
          Biogas: "#36A2EB",
          Solar: "#4BC0C0",
        };

        setChartData({
          labels: labels.map((label) => {
            const [year, month] = label.split("-");
            const date = new Date(`${year}-${month}-01`);
            const thaiMonths = [
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
            return `${thaiMonths[date.getMonth()]} ${date.getFullYear()}`;
          }),
          datasets: [
            {
              label: `${filters.source} (kg CO2eq)`,
              data,
              borderColor: colors[filters.source] || "#000",
              backgroundColor: `${colors[filters.source]}20`,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching GHG data:", error);
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
      <h1 className="text-center mb-4">รายงาน GHG</h1>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
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
        <div className="col-md-6">
          <label htmlFor="source" className="form-label">แหล่งที่มา</label>
          <select
            id="source"
            name="source"
            className="form-select"
            value={filters.source}
            onChange={handleFilterChange}
          >
            <option value="">-- เลือกแหล่งที่มา --</option>
            {sources.map((source, index) => (
              <option key={index} value={source.source}>{source.source}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
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
                title: { display: true, text: "GHG (kg CO2eq)" },
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <p className="text-center">กรุณาเลือกฟาร์มและแหล่งที่มา</p>
      )}
    </div>
  );
}
