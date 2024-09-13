import { useState, useEffect } from 'react';

export async function getServerSideProps() {
    const res = await fetch('https://performance-39fwkax8b-jatuphong-s-projects.vercel.app/api/getDropdownData/');
    const data = await res.json();

    if (!data) {
        return {
            props: {
                farms: [],
                machines: []
            }
        };
    }

    const { farms, machines } = data;

    return {
        props: {
            farms: farms || [],
            machines: machines || []
        }
    };
}

export default function Home({ farms, machines }) {
    const [formData, setFormData] = useState({
        saveDate: '', // ใช้ saveDate แทนจาก fromDate และ toDate
        farm: 'CHTBR', // ตั้งค่า default ให้กับ Farm
        machineType: 550, // ตั้งค่า default ให้กับ Machine Type
        hrBefore: 0,
        hrAfter: 0,
        productHr: 0,
        kwBefore: 0,
        kwAfter: 0,
        productKw: 0,
        kwSTD: 0, // Standard Power Production
        peaUnit: 0,
        productValue: 0,
        hrStd: 0, // Standard Work Hours (ตั้งต้นไว้ที่ 0)
        hrBreakdown: 0 // Breakdown Hours
    });

    const [errors, setErrors] = useState({}); // ใช้สำหรับเก็บข้อผิดพลาดของฟิลด์ต่างๆ

    useEffect(() => {
        const productHr = formData.hrAfter - formData.hrBefore;
        const productKw = formData.kwAfter - formData.kwBefore;
        const productValue = (productKw * formData.peaUnit).toFixed(2);

        // สมมติว่า Standard Work Hours คำนวณได้จากจำนวนชั่วโมงในวัน หรือค่าคงที่ เช่น 24 ชั่วโมง
        const hrStd = 24; // แทนค่าจำนวนชั่วโมงทำงานมาตรฐานเป็น 24 ชั่วโมงต่อวัน

        // คำนวณ Breakdown Hours (hrBreakdown) โดยใช้ Standard Work Hours ลบ Running Hours
        const hrBreakdown = hrStd - productHr;

        // คำนวณ Standard Power Production (kwSTD) ตามสูตร [(Machine Type * 80 / 100) * Standard Work Hours]
        const kwSTD = (formData.machineType * 80 / 100) * hrStd;

        setFormData({
            ...formData,
            productHr,
            productKw,
            productValue,
            hrStd: isNaN(hrStd) ? 0 : hrStd,
            hrBreakdown: isNaN(hrBreakdown) || hrBreakdown < 0 ? 0 : hrBreakdown,
            kwSTD: isNaN(kwSTD) ? 0 : kwSTD
        });
    }, [formData.hrAfter, formData.hrBefore, formData.kwAfter, formData.kwBefore, formData.peaUnit, formData.machineType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};

        // ตรวจสอบว่าค่าที่สำคัญถูกกรอกหรือไม่
        if (!formData.saveDate) {
            newErrors.saveDate = 'กรุณาระบุวันบันทึกข้อมูล';
        }
        if (!formData.farm) {
            newErrors.farm = 'กรุณาเลือกฟาร์ม';
        }
        if (!formData.machineType) {
            newErrors.machineType = 'กรุณาเลือกประเภทเครื่องเจน';
        }
        if (formData.hrBefore === '') {
            newErrors.hrBefore = 'กรุณาระบุค่า Previous Running Hours';
        }
        if (formData.hrAfter === '') {
            newErrors.hrAfter = 'กรุณาระบุค่า Current Running Hours';
        }
        if (formData.kwBefore === '') {
            newErrors.kwBefore = 'กรุณาระบุค่า Previous Power Production';
        }
        if (formData.kwAfter === '') {
            newErrors.kwAfter = 'กรุณาระบุค่า Current Power Production';
        }
        if (formData.peaUnit === '') {
            newErrors.peaUnit = 'กรุณาระบุค่า PEA Unit';
        }

        // ตรวจสอบว่า PEA Unit, Current Running Hours, และ Current Power Production ต้องไม่เป็น 0
        if (formData.peaUnit == 0) {
            newErrors.peaUnit = 'PEA Unit ต้องไม่เป็น 0';
        }
        if (formData.hrAfter == 0) {
            newErrors.hrAfter = 'Current Running Hours ต้องไม่เป็น 0';
        }
        if (formData.kwAfter == 0) {
            newErrors.kwAfter = 'Current Power Production ต้องไม่เป็น 0';
        }

        setErrors(newErrors);

        // ถ้ามีข้อผิดพลาด ให้หยุดการส่งฟอร์ม
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            // ส่งข้อมูลไปยัง backend
            const res = await fetch('/api/saveInput', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('เกิดข้อผิดพลาดในการส่งข้อมูล');
            }

            const result = await res.json();
            alert(result.message);
        } catch (error) {
            console.error("Error occurred while submitting:", error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }

        // ล้างค่าในฟอร์มหลังจาก submit สำเร็จ
        handleClear();
    };

    const handleClear = () => {
        setFormData({
            saveDate: '',
            farm: 'CHTBR', // เคลียร์เป็นค่า default ของฟาร์ม
            machineType: 550, // เคลียร์เป็นค่า default ของ Machine Type
            hrBefore: 0,
            hrAfter: 0,
            productHr: 0,
            kwBefore: 0,
            kwAfter: 0,
            productKw: 0,
            kwSTD: 0,
            peaUnit: 0,
            productValue: 0,
            hrStd: 0, // เคลียร์ค่า Standard Work Hours
            hrBreakdown: 0 // เคลียร์ค่า Breakdown Hours
        });

        setErrors({}); // ล้างข้อผิดพลาด
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Biogas Production Data Entry</h1>
            <form onSubmit={handleSubmit}>
                {/* ฟิลด์ข้อมูลที่สามารถกรอกได้ */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="saveDate" className="form-label">Save Date</label>
                        <input type="date" className="form-control" id="saveDate" name="saveDate" value={formData.saveDate} onChange={handleChange} required />
                        {errors.saveDate && <p className="text-danger">{errors.saveDate}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="farm" className="form-label">Farm</label>
                        <select className="form-select" id="farm" name="farm" value={formData.farm} onChange={handleChange} required>
                            {farms.map((farm, index) => (
                                <option key={index} value={farm.farmShort}>{farm.farmShort}</option>
                            ))}
                        </select>
                        {errors.farm && <p className="text-danger">{errors.farm}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="machineType" className="form-label">Machine Type</label>
                        <select className="form-select" id="machineType" name="machineType" value={formData.machineType} onChange={handleChange} required>
                            {machines.map((machine, index) => (
                                <option key={index} value={machine.machineType}>{machine.machineType}</option>
                            ))}
                        </select>
                        {errors.machineType && <p className="text-danger">{errors.machineType}</p>}
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="hrBefore" className="form-label">Previous Running Hours</label>
                        <input type="number" className="form-control" id="hrBefore" name="hrBefore" value={formData.hrBefore} onChange={handleChange} required />
                        {errors.hrBefore && <p className="text-danger">{errors.hrBefore}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="hrAfter" className="form-label">Current Running Hours</label>
                        <input type="number" className="form-control" id="hrAfter" name="hrAfter" value={formData.hrAfter} onChange={handleChange} required />
                        {errors.hrAfter && <p className="text-danger">{errors.hrAfter}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="kwBefore" className="form-label">Previous Power Production</label>
                        <input type="number" className="form-control" id="kwBefore" name="kwBefore" value={formData.kwBefore} onChange={handleChange} required />
                        {errors.kwBefore && <p className="text-danger">{errors.kwBefore}</p>}
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="kwAfter" className="form-label">Current Power Production</label>
                        <input type="number" className="form-control" id="kwAfter" name="kwAfter" value={formData.kwAfter} onChange={handleChange} required />
                        {errors.kwAfter && <p className="text-danger">{errors.kwAfter}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="peaUnit" className="form-label">PEA Unit</label>
                        <input type="number" step="0.01" className="form-control" id="peaUnit" name="peaUnit" value={formData.peaUnit} onChange={handleChange} required />
                        {errors.peaUnit && <p className="text-danger">{errors.peaUnit}</p>}
                    </div>
                </div>

                {/* ข้อมูลที่ไม่สามารถกรอกได้ */}
                <div className="border mt-5 p-3" style={{ border: '2px solid black', borderRadius: '8px' }}>
                    <h5 className="text-center mb-4">ข้อมูลการคำนวณอัตโนมัติ</h5>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="productHr" className="form-label">Running Hours</label>
                            <input type="number" className="form-control" id="productHr" name="productHr" value={formData.productHr} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="productKw" className="form-label">Power Produced</label>
                            <input type="number" className="form-control" id="productKw" name="productKw" value={formData.productKw} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="kwSTD" className="form-label">Standard Power Production</label>
                            <input type="number" className="form-control" id="kwSTD" name="kwSTD" value={formData.kwSTD} readOnly />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="productValue" className="form-label">Power Value</label>
                            <input type="number" className="form-control" id="productValue" name="productValue" value={formData.productValue} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="hrStd" className="form-label">Standard Work Hours</label>
                            <input type="number" className="form-control" id="hrStd" name="hrStd" value={formData.hrStd} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="hrBreakdown" className="form-label">Breakdown Hours</label>
                            <input type="number" className="form-control" id="hrBreakdown" name="hrBreakdown" value={formData.hrBreakdown} readOnly />
                        </div>
                    </div>
                </div>

                {/* ปุ่ม Submit และ Clear ย้ายไปอยู่ล่างสุด */}
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
