import { useState, useEffect } from 'react';

export async function getServerSideProps() {
    // Fetch dropdown data for areas
    const res = await fetch('http://localhost:3000/api/getAreaData');
    const data = await res.json();

    if (!data) {
        return {
            props: {
                areas: []
            }
        };
    }

    const { areas } = data;

    return {
        props: {
            areas: areas || []
        }
    };
}

export default function GradingDataEntry({ areas }) {
    const [formData, setFormData] = useState({
        inputDate: '',
        shortArea: 'SK',
        workTime: 0,
        product: 0,
        machineCap: 0,
        productPerformance: 0,
        breakdown: false,
        breakdownList: '',
        fixCourse: '',
        fixTime: 0,
        lostTime: 0,
        fixLocation: ''
    });

    const [errors, setErrors] = useState({});
    const [showBreakdownFields, setShowBreakdownFields] = useState(false);

    useEffect(() => {
        // Calculate Cap and Performance
        const machineCap = formData.workTime * 2000;
        const productPerformance = machineCap ? ((formData.product * 100) / machineCap).toFixed(2) : 0;

        setFormData(prevFormData => ({
            ...prevFormData,
            machineCap,
            productPerformance
        }));
    }, [formData.workTime, formData.product]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (name === 'breakdown') {
            setShowBreakdownFields(checked);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};
        if (!formData.inputDate) newErrors.inputDate = 'กรุณาระบุวันที่เก็บข้อมูล';
        if (!formData.shortArea) newErrors.shortArea = 'กรุณาเลือกสถานที่';
        if (!formData.workTime) newErrors.workTime = 'กรุณาระบุเวลาคัด';
        if (!formData.product) newErrors.product = 'กรุณาระบุยอดไข่ที่คัดได้';

        // if (formData.breakdown) {
        //     if (!formData.breakdownList) newErrors.breakdownList = 'กรุณาระบุรายการ Breakdown';
        //     if (!formData.fixCourse) newErrors.fixCourse = 'กรุณาระบุวิธีซ่อม';
        //     if (!formData.fixTime) newErrors.fixTime = 'กรุณาระบุเวลาซ่อม';
        //     if (!formData.lostTime) newErrors.lostTime = 'กรุณาระบุเวลาที่หายจากกิจกรรม';
        //     if (!formData.fixLocation) newErrors.fixLocation = 'กรุณาระบุ Zone ที่เสีย';
        // }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        try {
            const res = await fetch('/api/saveGradingData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการส่งข้อมูล');

            const result = await res.json();
            alert(result.message);
        } catch (error) {
            console.error("Error occurred while submitting:", error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }

        handleClear();
    };

    const handleClear = () => {
        setFormData({
            inputDate: '',
            shortArea: '',
            workTime: 0,
            product: 0,
            machineCap: 0,
            productPerformance: 0,
            breakdown: false,
            breakdownList: '',
            fixCourse: '',
            fixTime: 0,
            lostTime: 0,
            fixLocation: ''
        });

        setErrors({});
        setShowBreakdownFields(false);
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">ระบบกรอกข้อมูลประสิทธิภาพเครื่องคัด</h1>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="inputDate" className="form-label">วันที่</label>
                        <input type="date" className="form-control" id="inputDate" name="inputDate" value={formData.inputDate} onChange={handleChange} required />
                        {errors.inputDate && <p className="text-danger">{errors.inputDate}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="shortArea" className="form-label">สถานที่</label>
                        <select className="form-select" id="shortArea" name="shortArea" value={formData.shortArea} onChange={handleChange} required>
                            {areas.map((area, index) => (
                                <option key={index} value={area.areaShort}>{area.areaShort}</option>
                            ))}
                        </select>
                        {errors.shortArea && <p className="text-danger">{errors.shortArea}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="workTime" className="form-label">เวลาคัด (นาที)</label>
                        <input type="number" className="form-control" id="workTime" name="workTime" value={formData.workTime} onChange={handleChange} required />
                        {errors.workTime && <p className="text-danger">{errors.workTime}</p>}
                    </div>
                </div>
                
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="product" className="form-label">ยอดไข่ที่คัดได้ (ฟอง)</label>
                        <input type="number" className="form-control" id="product" name="product" value={formData.product} onChange={handleChange} required />
                        {errors.product && <p className="text-danger">{errors.product}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="machineCap" className="form-label">Cap (ฟอง)</label>
                        <input type="number" className="form-control" id="machineCap" name="machineCap" value={formData.machineCap} readOnly />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="productPerformance" className="form-label">ประสิทธิภาพ (%)</label>
                        <input type="number" className="form-control" id="productPerformance" name="productPerformance" value={formData.productPerformance} readOnly />
                    </div>
                </div>
                
                <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="breakdown" name="breakdown" checked={formData.breakdown} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="breakdown">
                        Breakdown
                    </label>
                </div>

                {showBreakdownFields && (
                    <div className="border mt-3 p-3" style={{ border: '2px solid black', borderRadius: '8px' }}>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label htmlFor="breakdownList" className="form-label">รายการ Breakdown</label>
                                <textarea className="form-control" id="breakdownList" name="breakdownList" value={formData.breakdownList} onChange={handleChange}></textarea>
                                {errors.breakdownList && <p className="text-danger">{errors.breakdownList}</p>}
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="fixCourse" className="form-label">วิธีซ่อม</label>
                                <textarea className="form-control" id="fixCourse" name="fixCourse" value={formData.fixCourse} onChange={handleChange}></textarea>
                                {errors.fixCourse && <p className="text-danger">{errors.fixCourse}</p>}
                            </div>
                        </div>
                        
                        <div className="row mb-3">
                            <div className="col-md-4">
                                <label htmlFor="fixTime" className="form-label">เวลาซ่อม (นาที)</label>
                                <input type="number" className="form-control" id="fixTime" name="fixTime" value={formData.fixTime} onChange={handleChange} />
                                {errors.fixTime && <p className="text-danger">{errors.fixTime}</p>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="lostTime" className="form-label">เวลาที่หายจากกิจกรรม (นาที)</label>
                                <input type="number" className="form-control" id="lostTime" name="lostTime" value={formData.lostTime} onChange={handleChange} />
                                {errors.lostTime && <p className="text-danger">{errors.lostTime}</p>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="fixLocation" className="form-label">Zone ที่เสีย</label>
                                <input type="text" className="form-control" id="fixLocation" name="fixLocation" value={formData.fixLocation} onChange={handleChange} />
                                {errors.fixLocation && <p className="text-danger">{errors.fixLocation}</p>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="row justify-content-center mt-4">
                    <div className="col-md-6 text-center">
                        <button type="button" className="btn btn-secondary me-2" onClick={handleClear}>Clear</button>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
