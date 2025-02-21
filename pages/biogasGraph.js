import { useState, useEffect, useRef } from "react";
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
import DataTable from "react-data-table-component";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import moment from "moment";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const formatThaiDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear() + 543).slice(-2);
  return `${day}/${month}/${year}`;
};

export default function BiogasReport() {
  const [farms, setFarms] = useState([]);
  const [filters, setFilters] = useState({
    farm: "",
    fromDate: moment().subtract(7, "days").format("YYYY-MM-DD"),
    toDate: moment().format("YYYY-MM-DD"),
  });
  const [data, setData] = useState([]);
  const reportRef = useRef();

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await axios.get("/api/getDropdownData");
        setFarms(res.data.farms || []);
      } catch (error) {
        console.error("Error fetching farms:", error);
      }
    };
    fetchFarms();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/getBiogasData", { params: filters });
        const groupedData = res.data.reduce((acc, current) => {
          const date = current.saveDate;
          if (!acc[date]) {
            acc[date] = { saveDate: date, productKw: 0, productHr: 0, productValue: 0, hrBreakdown: 0 };
          }
          acc[date].productKw += current.productKw;
          acc[date].productHr += current.productHr;
          acc[date].productValue += current.productValue;
          acc[date].hrBreakdown += current.hrBreakdown;
          return acc;
        }, {});

        const sortedData = Object.values(groupedData).sort((a, b) => new Date(a.saveDate) - new Date(b.saveDate));
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching biogas data:", error);
        setData([]);
      }
    };
    fetchData();
  }, [filters]);

  const chartData = {
    labels: data.map((row) => formatThaiDate(row.saveDate)),
    datasets: [
      {
        label: "Product (kW)",
        data: data.map((row) => row.productKw),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const row = data[tooltipItem.dataIndex];
            return [
              `ผลิตไฟฟ้า: ${row.productKw.toLocaleString()} kW`,
              `ชั่วโมงเดินเครื่อง: ${row.productHr.toLocaleString()} Hr`,
              `มูลค่า: ${row.productValue.toLocaleString()} บาท`,
              `Breakdown: ${row.hrBreakdown} Hr`,
            ];
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "วันที่" } },
      y: { title: { display: true, text: "kW" }, beginAtZero: true },
    },
  };

  const columns = [
    { name: "วันที่", selector: (row) => formatThaiDate(row.saveDate), sortable: true },
    { name: "ผลิตไฟฟ้า (kW)", selector: (row) => row.productKw, sortable: true },
    { name: "ชั่วโมงเดินเครื่อง", selector: (row) => row.productHr, sortable: true },
    { name: "มูลค่า (บาท)", selector: (row) => row.productValue, sortable: true },
    { name: "Breakdown (Hr)", selector: (row) => row.hrBreakdown, sortable: true },
  ];

  const exportPDF = () => {
    const input = reportRef.current;
    html2canvas(input).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`biogas-report-${filters.fromDate}-${filters.toDate}.pdf`);
    });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        "วันที่": formatThaiDate(row.saveDate),
        "ผลิตไฟฟ้า (kW)": row.productKw,
        "ชั่วโมงเดินเครื่อง": row.productHr,
        "มูลค่า (บาท)": row.productValue,
        "Breakdown (Hr)": row.hrBreakdown,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Biogas Report");
    XLSX.writeFile(wb, `biogas-report-${filters.fromDate}-${filters.toDate}.xlsx`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">รายงานประสิทธิภาพ Biogas</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">ฟาร์ม</label>
          <select className="form-select" value={filters.farm} onChange={(e) => setFilters({ ...filters, farm: e.target.value })}>
            <option value="">-- เลือกฟาร์ม --</option>
            {farms.map((farm) => (
              <option key={farm.farmShort} value={farm.farmShort}>
                {farm.farmShort}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">จากวันที่</label>
          <input type="date" className="form-control" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">ถึงวันที่</label>
          <input type="date" className="form-control" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={() => setFilters({ ...filters })}>
            กรองข้อมูล
          </button>
        </div>
      </div>

      <div ref={reportRef}>
        <div className="card shadow-sm p-3 mb-4">
          <Line data={chartData} options={chartOptions} />
        </div>

        <DataTable title="รายละเอียดข้อมูล Biogas" columns={columns} data={data} pagination highlightOnHover striped responsive />
      </div>

      <div className="text-center mt-3">
        <button className="btn btn-danger me-2" onClick={exportPDF}>
          Export PDF
        </button>
        <button className="btn btn-success" onClick={exportExcel}>
          Export Excel
        </button>
      </div>
    </div>
  );
}
