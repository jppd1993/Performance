import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

const farmOrder = ["SK", "WT", "PTC", "JKR", "RE", "KK", "UD", "SSN", "NP", "CHTBR", "ND", "NK", "CHN"];

const formatThaiDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear() + 543).slice(-2);
  return `${day}/${month}/${year}`;
};

export default function DataMappingTable() {
  const [filters, setFilters] = useState({
    fromDate: moment().subtract(7, "days").format("YYYY-MM-DD"),
    toDate: moment().format("YYYY-MM-DD"),
  });
  const [data, setData] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/getBiogasData", { params: filters });
        const sortedData = res.data.sort((a, b) => farmOrder.indexOf(a.farm) - farmOrder.indexOf(b.farm));

        // ดึงวันที่เฉพาะ และเรียงตามลำดับ
        const dates = Array.from(new Set(sortedData.map((row) => row.saveDate))).sort((a, b) => new Date(a) - new Date(b));
        setUniqueDates(dates);

        // เพิ่มสถานะสำหรับแต่ละฟาร์มและวันที่
        const mappedData = farmOrder.map((farm) => {
          const farmData = dates.map((date) => {
            const hasData = sortedData.some((row) => row.farm === farm && row.saveDate === date);
            return hasData; // true = มีข้อมูล, false = ไม่มีข้อมูล
          });
          return { farm, data: farmData };
        });

        setData(mappedData);
      } catch (error) {
        console.error("Error fetching biogas data:", error);
        setData([]);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">รายงานการกรอกข้อมูลประสิทธิภาพ Biogas</h2>

      {/* Filter Section */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">จากวันที่</label>
          <input
            type="date"
            className="form-control"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">ถึงวันที่</label>
          <input
            type="date"
            className="form-control"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={() => setFilters({ ...filters })}>
            กรองข้อมูล
          </button>
        </div>
      </div>

      {/* ตารางข้อมูล */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ฟาร์ม</th>
              {uniqueDates.map((date) => (
                <th key={date} className="text-center">
                  {formatThaiDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.farm}>
                <td>{row.farm}</td>
                {row.data.map((hasData, index) => (
                  <td
                    key={index}
                    className="text-center"
                    style={{
                      backgroundColor: hasData ? "green" : "red",
                      color: "white",
                    }}
                  >
                    {hasData ? "✔" : "✖"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* หมายเหตุ */}
      <div className="mt-3">
        <p>
          <span style={{ color: "green", fontWeight: "bold" }}>✔</span> = มีข้อมูล{" "}
          <span style={{ color: "red", fontWeight: "bold" }}>✖</span> = ไม่มีข้อมูล
        </p>
      </div>
    </div>
  );
}
