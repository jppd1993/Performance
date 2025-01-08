import { useState, useEffect } from "react";
import axios from "axios";

export default function EditGrading() {
  const [areas, setAreas] = useState([]);
  const [gradingData, setGradingData] = useState([]);
  const [filters, setFilters] = useState({
    shortArea: "",
    fromDate: "",
    toDate: "",
  });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    inputDate: "",
    shortArea: "",
    workTime: 0,
    product: 0,
    machineCap: 0,
    productPerformance: 0,
    breakdown: false,
    breakdownList: "",
    fixCourse: "",
    fixTime: 0,
    lostTime: 0,
    fixLocation: "",
  });

  const [errors, setErrors] = useState({});
  const [showBreakdownFields, setShowBreakdownFields] = useState(false);

  // ฟังก์ชันปรับวันที่ให้เป็นรูปแบบ YYYY-MM-DD
  const formatDateToLocal = (isoDate) => {
    const date = new Date(isoDate);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  };

  // Fetch areas for dropdown
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.get("/api/getAreaData");
        setAreas(res.data.areas || []);
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    };

    fetchAreas();
  }, []);

  // Fetch grading data based on filters
  useEffect(() => {
    const fetchGradingData = async () => {
      if (!filters.shortArea || !filters.fromDate || !filters.toDate) return;

      try {
        const res = await axios.get("/api/getGradingData", {
          params: filters,
        });
        setGradingData(res.data || []);
      } catch (error) {
        console.error("Error fetching grading data:", error);
      }
    };

    fetchGradingData();
  }, [filters]);

  // Update formData based on selected entry
  useEffect(() => {
    if (selectedEntry) {
      const machineCap =
        selectedEntry.shortArea === "BN"
          ? selectedEntry.workTime * 2000
          : selectedEntry.shortArea === "CHN"
          ? selectedEntry.workTime * 2400
          : selectedEntry.workTime * 1000;

      const productPerformance = machineCap
        ? ((selectedEntry.product * 100) / machineCap).toFixed(2)
        : 0;

      setFormData({
        ...selectedEntry,
        inputDate: formatDateToLocal(selectedEntry.inputDate), // แปลงวันที่
        machineCap,
        productPerformance,
      });
      setShowBreakdownFields(selectedEntry.breakdown || false);
    }
  }, [selectedEntry]);

  // Update machineCap and productPerformance when related fields change
  useEffect(() => {
    const machineCap =
      formData.shortArea === "BN"
        ? formData.workTime * 2000
        : formData.shortArea === "CHN"
        ? formData.workTime * 2400
        : formData.workTime * 1000;

    const productPerformance = machineCap
      ? ((formData.product * 100) / machineCap).toFixed(2)
      : 0;

    setFormData((prevFormData) => ({
      ...prevFormData,
      machineCap,
      productPerformance,
    }));
  }, [formData.workTime, formData.product, formData.shortArea]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "breakdown") {
      setShowBreakdownFields(checked);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!formData.inputDate) newErrors.inputDate = "กรุณาระบุวันที่เก็บข้อมูล";
    if (!formData.shortArea) newErrors.shortArea = "กรุณาเลือกสถานที่";
    if (!formData.workTime) newErrors.workTime = "กรุณาระบุเวลาคัด";
    if (!formData.product) newErrors.product = "กรุณาระบุยอดไข่ที่คัดได้";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.put("/api/updateGradingData", formData);
      alert("อัปเดตข้อมูลสำเร็จ");
      setSelectedEntry(null);
      setGradingData((prev) =>
        prev.map((item) => (item.id === formData.id ? { ...formData } : item))
      );
    } catch (error) {
      console.error("Error occurred while updating:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">แก้ไขข้อมูลการคัดไข่</h1>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label htmlFor="shortArea" className="form-label">
            สถานที่
          </label>
          <select
            id="shortArea"
            name="shortArea"
            className="form-select"
            value={filters.shortArea}
            onChange={handleFilterChange}
          >
            <option value="">-- เลือกสถานที่ --</option>
            {areas.map((area, index) => (
              <option key={index} value={area.areaShort}>
                {area.areaShort}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
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
        <div className="col-md-3">
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

      {/* Grading Data Table */}
      <div className="row">
        <div className="col-md-12">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>สถานที่</th>
                <th>เวลาคัด</th>
                <th>ยอดไข่ที่คัดได้</th>
                <th>แก้ไข</th>
              </tr>
            </thead>
            <tbody>
              {gradingData.map((entry, index) => (
                <tr key={index}>
                  <td>{formatDateToLocal(entry.inputDate)}</td>
                  <td>{entry.shortArea}</td>
                  <td>{entry.workTime}</td>
                  <td>{entry.product}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form */}
      {selectedEntry && (
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="inputDate" className="form-label">
                วันที่
              </label>
              <input
                type="date"
                className="form-control"
                id="inputDate"
                name="inputDate"
                value={formData.inputDate}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="shortArea" className="form-label">
                สถานที่
              </label>
              <input
                type="text"
                className="form-control"
                id="shortArea"
                name="shortArea"
                value={formData.shortArea}
                readOnly
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="workTime" className="form-label">
                เวลาคัด (นาที)
              </label>
              <input
                type="number"
                className="form-control"
                id="workTime"
                name="workTime"
                value={formData.workTime}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="product" className="form-label">
                ยอดไข่ที่คัดได้
              </label>
              <input
                type="number"
                className="form-control"
                id="product"
                name="product"
                value={formData.product}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="machineCap" className="form-label">
                Cap (ฟอง)
              </label>
              <input
                type="number"
                className="form-control"
                id="machineCap"
                name="machineCap"
                value={formData.machineCap}
                readOnly
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="productPerformance" className="form-label">
                ประสิทธิภาพ (%)
              </label>
              <input
                type="number"
                className="form-control"
                id="productPerformance"
                name="productPerformance"
                value={formData.productPerformance}
                readOnly
              />
            </div>
          </div>
          <button type="submit" className="btn btn-success">
            บันทึกการแก้ไข
          </button>
        </form>
      )}
    </div>
  );
}
