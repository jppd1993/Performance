import { useState } from "react";

export default function EnergyDashboard() {
  const [filters, setFilters] = useState({
    farm: "",
    fromDate: "",
    toDate: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Energy Dashboard</h1>

      {/* Filter Section */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="farm" className="form-label">
            ฟาร์ม
          </label>
          <select
            id="farm"
            name="farm"
            className="form-select"
            value={filters.farm}
            onChange={handleFilterChange}
          >
            <option value="">-- เลือกฟาร์ม --</option>
            <option value="CHTBR">จันทบุรี</option>
            <option value="CHN">จะนะ</option>
            <option value="KK">ขอนแก่น</option>
            <option value="UD">อุดรธานี</option>
            <option value="SK">สันกำแพง</option>
            <option value="JKR">จักราช</option>
            <option value="RE">อาจสามารถ</option>
            <option value="WT">วังทอง</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="fromDate" className="form-label">
            จากวันที่
          </label>
          <input
            type="date"
            id="fromDate"
            name="fromDate"
            className="form-control"
            value={filters.fromDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="toDate" className="form-label">
            ถึงวันที่
          </label>
          <input
            type="date"
            id="toDate"
            name="toDate"
            className="form-control"
            value={filters.toDate}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="row">
        {/* กราฟ 1 */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center">สัดส่วนการใช้พลังงาน</h5>
              <iframe
                src={`/totalUse?farm=${filters.farm}&fromDate=${filters.fromDate}&toDate=${filters.toDate}`}
                className="w-100 iframe-zoom"
                title="กราฟ 1"
              ></iframe>
            </div>
          </div>
        </div>

        {/* กราฟ 2 */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center">รายงานการใช้พลังงานรายฟาร์ม</h5>
              <iframe
                src={`/farmEnergyReport?farm=${filters.farm}&fromDate=${filters.fromDate}&toDate=${filters.toDate}`}
                className="w-100 iframe-zoom"
                title="กราฟ 2"
              ></iframe>
            </div>
          </div>
        </div>

        {/* กราฟ 3 */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center">รายงานข้อมูลคุณภาพน้ำ</h5>
              <iframe
                src={`/waterReport?farm=${filters.farm}&fromDate=${filters.fromDate}&toDate=${filters.toDate}`}
                className="w-100 iframe-zoom"
                title="กราฟ 3"
              ></iframe>
            </div>
          </div>
        </div>

        {/* กราฟ 4 */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center">รายงาน GHG</h5>
              <iframe
                src={`/ghgReport?farm=${filters.farm}&fromDate=${filters.fromDate}&toDate=${filters.toDate}`}
                className="w-100 iframe-zoom"
                title="กราฟ 4"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .iframe-zoom {
          height: 300px;
          border: none;
          transform: scale(1.0);
          transform-origin: 0 0;
        }
        .card {
          border-radius: 15px;
        }
      `}</style>
    </div>
  );
}
