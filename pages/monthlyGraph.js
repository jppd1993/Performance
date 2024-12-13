import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MonthlyGraph() {
  const router = useRouter();
  const { month } = router.query; // รับเดือนจากพารามิเตอร์ใน URL
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!month) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/getMonthlyData?month=${month}`); // API ที่ใช้ Query ที่ระบุ
        const result = await response.json();

        // ดึงข้อมูลสำหรับกราฟ
        const labels = result.map((row) => row.farm); // แกน x เป็นฟาร์ม
        const biogasData = result.map((row) => row.totalBiogasProduction);
        const solarData = result.map((row) => row.totalSolarProduction);
        const peaData = result.map((row) => row.totalPeaEUse);

        // ตั้งค่า Chart Data
        setChartData({
          labels,
          datasets: [
            {
              label: "Biogas (kW)",
              data: biogasData,
              backgroundColor: "#36A2EB", // สีฟ้า
            },
            {
              label: "Solar (kW)",
              data: solarData,
              backgroundColor: "#4BC0C0", // สีเขียว
            },
            {
              label: "PEA (kW)",
              data: peaData,
              backgroundColor: "#9966FF", // สีม่วง
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching monthly graph data:", error);
      }
    };

    fetchData();
  }, [month]);

  const formatMonth = (yearMonth) => {
    const [year, month] = yearMonth.split("-");
    const date = new Date(`${year}-${month}-01`);
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const formattedMonth = monthNames[date.getMonth()];
    const thaiYear = parseInt(year, 10);
    return `เดือน${formattedMonth} ${thaiYear}`;
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">
        รายงานการใช้พลังงาน{month ? ` ${formatMonth(month)}` : " กำลังโหลด..."}
      </h1>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            plugins: {
              legend: { position: "top" },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toLocaleString()} kW`;
                  },
                },
              },
            },
            responsive: true,
            scales: {
              x: {
                title: { display: true, text: "ฟาร์ม" },
              },
              y: {
                title: { display: true, text: "kW" },
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <p className="text-center">กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
}
