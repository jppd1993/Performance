import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Import Link for navigation
import { FaHome } from 'react-icons/fa'; // Icon for Home

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear() + 543).slice(-2); // เพิ่ม 543 และใช้เฉพาะ 2 หลักท้าย
    return `${day}-${month}-${year}`;
};

export default function GradingCheck() {
    const [data, setData] = useState([]);
    const [farms, setFarms] = useState([]);
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        shortArea: '',
    });

    useEffect(() => {
        // Fetch dropdown data for farms
        const fetchFarms = async () => {
            try {
                const res = await axios.get('/api/getFarmData');
                setFarms(res.data.farms || []);
            } catch (error) {
                console.error('Error fetching farms:', error);
            }
        };

        fetchFarms();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleFilter = async () => {
        try {
            const res = await axios.get('/api/getGradingData', {
                params: {
                    fromDate: filters.fromDate,
                    toDate: filters.toDate,
                    shortArea: filters.shortArea,
                },
            });
            setData(res.data || []);
        } catch (error) {
            console.error('Error fetching grading data:', error);
        }
    };

    return (
        <div className="container mt-5">
            {/* Home Button */}
            {/* <div className="mb-4">
                <Link href="https://performance-git-master-jatuphong-s-projects.vercel.app/menu" passHref>
                    <button className="btn btn-dark">
                        <FaHome /> Home
                    </button>
                </Link>
            </div> */}

            <h1 className="text-center">ตรวจสอบข้อมูลการคัด</h1>

            {/* Filter Section */}
            <div className="row mb-4">
                <div className="col-md-4">
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
                <div className="col-md-4">
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
                <div className="col-md-4">
                    <label htmlFor="shortArea" className="form-label">ฟาร์ม</label>
                    <select
                        id="shortArea"
                        name="shortArea"
                        className="form-select"
                        value={filters.shortArea}
                        onChange={handleFilterChange}
                    >
                        <option value="">-- เลือกฟาร์ม --</option>
                        {farms.map((farm, index) => (
                            <option key={index} value={farm.shortArea}>
                                {farm.shortArea}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="text-center mb-4">
                <button onClick={handleFilter} className="btn btn-primary">
                    กรองข้อมูล
                </button>
            </div>

            {/* Data Table */}
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>วันที่บันทึก</th>
                            <th>ฟาร์ม</th>
                            <th>กำลังการผลิต</th>
                            <th>ยอดผลิต</th>
                            <th>ประสิทธิภาพ (%)</th>
                            <th>เวลาคัด (นาที)</th>
                            <th>รายการ Breakdown</th>
                            <th>เวลาซ่อม (นาที)</th>
                            <th>ตำแหน่งที่เสีย</th>
                            <th>เวลาที่หาย (นาที)</th>
                            <th>วิธีซ่อม</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row, index) => (
                                <tr key={row.inputId}>
                                    <td>{index + 1}</td>
                                    <td>{formatDate(row.inputDate)}</td>
                                    <td>{row.shortArea}</td>
                                    <td>{row.machineCap.toLocaleString()}</td>
                                    <td>{row.product.toLocaleString()}</td>
                                    <td>{row.productPerformance.toFixed(2)}</td>
                                    <td>{row.workTime}</td>
                                    <td>{row.breakdownList || '-'}</td>
                                    <td>{row.fixTime}</td>
                                    <td>{row.fixLocation || '-'}</td>
                                    <td>{row.lostTime}</td>
                                    <td>{row.fixCourse || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12" className="text-center">
                                    ไม่พบข้อมูล
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
