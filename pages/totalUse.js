import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import plugin for labels
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

export default function TotalUse() {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [totalEnergyUsage, setTotalEnergyUsage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getElectricityData");
        const result = await response.json();
        setData(result);

        const totalUsage = result.reduce(
          (acc, row) => acc + row.totalEnergyUsage,
          0
        );
        setTotalEnergyUsage(totalUsage);

        const totalBiogas = result.reduce(
          (acc, row) => acc + row.totalBiogasProduction,
          0
        );
        const totalSolar = result.reduce(
          (acc, row) => acc + row.totalSolarProduction,
          0
        );
        const totalPea = result.reduce(
          (acc, row) => acc + row.totalPeaEUse,
          0
        );

        setChartData({
          labels: ["Biogas", "Solar", "PEA"],
          datasets: [
            {
              data: [totalBiogas, totalSolar, totalPea],
              backgroundColor: ["#36A2EB", "#4BC0C0", "#9966FF"], // สีที่ระบุ
              hoverBackgroundColor: ["#36A2EB", "#4BC0C0", "#9966FF"],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching electricity data:", error);
      }
    };

    fetchData();
  }, []);

  // ฟังก์ชันสำหรับแปลง yearMonth เป็นเดือนแบบย่อ (ม.ค., ก.พ., ...)
  const formatMonth = (yearMonth) => {
    const [year, month] = yearMonth.split("-");
    const date = new Date(`${year}-${month}-01`);

    if (isNaN(date)) return yearMonth; // Return original if invalid date

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
    const thaiMonth = months[date.getMonth()];
    const thaiYear = date.getFullYear() -2500; // Convert to Buddhist Era (BE)

    return `${thaiMonth} ${thaiYear}`;
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">สัดส่วนการใช้พลังงาน</h1>

      <div className="row">
        {/* กราฟแสดงข้อมูล */}
        <div className="col-md-6">
          {chartData.labels ? (
            <Pie
              data={chartData}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => {
                        const label = chartData.labels[tooltipItem.dataIndex];
                        const value =
                          chartData.datasets[0].data[tooltipItem.dataIndex];
                        return `${label}: ${value.toLocaleString()} kW`;
                      },
                    },
                  },
                  legend: {
                    position: "top",
                  },
                  datalabels: {
                    formatter: (value, context) => {
                      const total = context.dataset.data.reduce(
                        (acc, val) => acc + val,
                        0
                      );
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${percentage}%`;
                    },
                    color: "#fff",
                    font: {
                      weight: "bold",
                      size: 16,
                    },
                  },
                },
              }}
            />
          ) : (
            <p className="text-center">กำลังโหลดข้อมูล...</p>
          )}
        </div>

        {/* รายละเอียดข้อมูลพลังงาน */}
        <div className="col-md-6">
          <h3 className="text-center">รายละเอียดข้อมูลพลังงาน</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>เดือน</th>
                <th>Biogas (kW)</th>
                <th>Solar (kW)</th>
                <th>PEA (kW)</th>
                <th>ค่าไฟ (บาท)</th>
                <th>มูลค่ารวม (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>
                    <a href={`/monthlyGraph?month=${row.yearMonth}`}>
                      {formatMonth(row.yearMonth)}
                    </a>
                  </td>
                  <td>{row.totalBiogasProduction.toLocaleString()}</td>
                  <td>{row.totalSolarProduction.toLocaleString()}</td>
                  <td>{row.totalPeaEUse.toLocaleString()}</td>
                  <td>{row.avgPeaAvgPrice.toFixed(2)}</td>
                  <td>
                    {(
                      row.totalEnergyUsage * row.avgPeaAvgPrice
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td><strong>รวม</strong></td>
                <td>
                  {data
                    .reduce((acc, row) => acc + row.totalBiogasProduction, 0)
                    .toLocaleString()}
                </td>
                <td>
                  {data
                    .reduce((acc, row) => acc + row.totalSolarProduction, 0)
                    .toLocaleString()}
                </td>
                <td>
                  {data
                    .reduce((acc, row) => acc + row.totalPeaEUse, 0)
                    .toLocaleString()}
                </td>
                <td>-</td>
                <td>
                  {data
                    .reduce(
                      (acc, row) =>
                        acc + row.totalEnergyUsage * row.avgPeaAvgPrice,
                      0
                    )
                    .toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ลิงก์ไปหน้ารายงานพลังงานรายฟาร์ม */}
          <div className="text-center mt-4 d-flex justify-content-center gap-3">
            <a href="/farmEnergyReport" className="btn btn-primary">
              รายงานการใช้พลังงานรายฟาร์ม
            </a>
            <a href="/waterReport" className="btn btn-primary">
              รายงานข้อมูลคุณภาพน้ำ
            </a>
            <a href="/ghgReport" className="btn btn-primary">
              รายงานข้อมูล GHG
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
