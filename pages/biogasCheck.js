import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Import Link for navigation
import { FaHome } from 'react-icons/fa'; // Icon for Home

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear() + 543).slice(-2); // เพิ่ม 543 และใช้เฉพาะ 2 หลักท้าย
    return `${day}/${month}/${year}`;
};

export default function biogasData() {
    const [data, setData] = useState([]);
    const [farms, setFarms] = useState([]);
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        farm: '',
    });

    useEffect(() => {
        // Fetch dropdown data for farms
        const fetchFarms = async () => {
            try {
                const res = await axios.get('/api/getDropdownData');
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
            const res = await axios.get('/api/getBiogasData', {
                params: {
                    fromDate: filters.fromDate,
                    toDate: filters.toDate,
                    farm: filters.farm,
                },
            });
            setData(res.data || []);
        } catch (error) {
            console.error('Error fetching grading data:', error);
        }
    };

    const handleDelete = async (inputId) => {
        if (confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
            try {
                const res = await axios.delete(`/api/deleteBiogasData`, {
                    data: { inputId },
                });

                if (res.status === 200) {
                    alert('ลบข้อมูลสำเร็จ');
                    setData((prevData) => prevData.filter((row) => row.inputId !== inputId));
                } else {
                    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
                }
            } catch (error) {
                console.error('Error deleting data:', error);
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">ตรวจสอบข้อมูลประสิทธิภาพไบโอแก๊ส</h1>

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
                            <option key={index} value={farm.farmShort}>
                                {farm.farmShort}
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
                            <th>วันที่บันทึก</th>
                            <th>ฟาร์ม</th>
                            <th>ประเภทเครื่องเจน</th>
                            <th>เครื่องที่</th>
                            <th>เลขเดินเครื่องปัจจุบัน</th>
                            <th>เลขเดินเครื่องครั้งก่อน</th>
                            <th>เวลาเดินเครื่อง/ชั่วโมง</th>
                            <th>เลขกำลังไฟฟ้าปัจจุบัน</th>
                            <th>เลขกำลังไฟฟ้าครั้งก่อน</th>
                            <th>กระแสไฟฟ้าที่ผลิตได้/kw</th>
                            <th>Breakdown/ชั่วโมง</th>
                            <th>ลบข้อมูล</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row) => (
                                <tr key={row.inputId}>
                                    <td>{formatDate(row.saveDate)}</td>
                                    <td>{row.farm}</td>
                                    <td>{row.machineType}</td>
                                    <td>{row.machineNo}</td>
                                    <td>{row.hrAfter}</td>
                                    <td>{row.hrBefore}</td>
                                    <td>{row.productHr}</td>
                                    <td>{row.kwAfter}</td>
                                    <td>{row.kwBefore}</td>
                                    <td>{row.productKw}</td>
                                    <td>{row.hrBreakdown}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(row.inputId)}
                                        >
                                            ลบ
                                        </button>
                                    </td>
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
