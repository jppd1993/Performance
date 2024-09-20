import { useState, useEffect } from 'react';

export async function getServerSideProps() {
    const res = await fetch('https://performance-kappa.vercel.app/api/getDropdownData/api/getDropdownData');
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
        fromDate: '',
        toDate: '',
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
        hrStd: 0, // Standard Work Hours (ชั่วโมงจาก From Date ถึง To Date)
        hrBreakdown: 0 // Breakdown Hours
    });

    const [errors, setErrors] = useState({
        fromDate: '',
        toDate: '',
        farm: '',
        machineType: ''
    });

    useEffect(() => {
        const productHr = formData.hrAfter - formData.hrBefore;
        const productKw = formData.kwAfter - formData.kwBefore;
        const productValue = (productKw * formData.peaUnit).toFixed(2);

        // คำนวณ Standard Work Hours (hrStd)
        const fromDateObj = new Date(formData.fromDate);
        const toDateObj = new Date(formData.toDate);

        const hrStd = (!isNaN(fromDateObj.getTime()) && !isNaN(toDateObj.getTime()))
            ? Math.abs((toDateObj - fromDateObj) / (1000 * 60 * 60)) + 24 // เพิ่ม 24 ชั่วโมงเพื่อรวมทั้งวัน
            : 0;

        // คำนวณ Breakdown Hours (hrBreakdown) จาก Standard Work Hours ลบ Running Hours
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
    }, [formData.hrAfter, formData.hrBefore, formData.kwAfter, formData.kwBefore, formData.peaUnit, formData.fromDate, formData.toDate, formData.machineType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let hasError = false;
        let newErrors = { fromDate: '', toDate: '', farm: '', machineType: '' };

        // ตรวจสอบว่าค่าที่สำคัญถูกกรอกหรือไม่
        if (!formData.fromDate) {
            newErrors.fromDate = 'กรุณาระบุวันสิ้นสุด';
            hasError = true;
        }
        if (!formData.toDate) {
            newErrors.toDate = 'กรุณาระบุกวันเริ่มต้น';
            hasError = true;
        }
        if (!formData.farm) {
            newErrors.farm = 'กรุณาเลือกฟาร์ม';
            hasError = true;
        }
        if (!formData.machineType) {
            newErrors.machineType = 'กรุณาเลือกประเภทเครื่องเจน';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            return; // ถ้ามีข้อผิดพลาด ให้หยุดการส่งฟอร์ม
        }

        // หากไม่มีข้อผิดพลาด ทำการส่งข้อมูล
        const res = await fetch('/api/saveData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await res.json();
        alert(result.message);

        // ล้างค่าในฟอร์มหลังจาก submit สำเร็จ
        handleClear();
    };

    const handleClear = () => {
        setFormData({
            fromDate: '',
            toDate: '',
            farm: 'CHTBR', // เคลียร์เป็นค่า default ของฟาร์ม
            machineType: 550, // เคลียร์เป็นค่า default ของ Machine Type
            hrBefore:0,
            hrAfter: 0,
            productHr: 0,
            kwBefore: 0,
            kwAfter: 0,
            productKw: 0,
            kwSTD: 0,
            peaUnit: 0,
            productValue: 0,
            hrStd: 0,
            hrBreakdown: 0
        });

        setErrors({ fromDate: '', toDate: '', farm: '', machineType: '' });
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Biogas Production Data Entry</h1>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="fromDate" className="form-label">From Date</label>
                        <input type="date" className="form-control" id="fromDate" name="fromDate" value={formData.fromDate} onChange={handleChange} required />
                        {errors.fromDate && <p className="text-danger">{errors.fromDate}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="toDate" className="form-label">To Date</label>
                        <input type="date" className="form-control" id="toDate" name="toDate" value={formData.toDate} onChange={handleChange} required />
                        {errors.toDate && <p className="text-danger">{errors.toDate}</p>}
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
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="machineType" className="form-label">Machine Type</label>
                        <select className="form-select" id="machineType" name="machineType" value={formData.machineType} onChange={handleChange} required>
                            {machines.map((machine, index) => (
                                <option key={index} value={machine.machineType}>{machine.machineType}</option>
                            ))}
                        </select>
                        {errors.machineType && <p className="text-danger">{errors.machineType}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="hrBefore" className="form-label">Previous Running Hours</label>
                        <input type="number" className="form-control" id="hrBefore" name="hrBefore" value={formData.hrBefore} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="hrAfter" className="form-label">Current Running Hours</label>
                        <input type="number" className="form-control" id="hrAfter" name="hrAfter" value={formData.hrAfter} onChange={handleChange} required />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="productHr" className="form-label">Running Hours</label>
                        <input type="number" className="form-control" id="productHr" name="productHr" value={formData.productHr} readOnly />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="kwBefore" className="form-label">Previous Power Production</label>
                        <input type="number" className="form-control" id="kwBefore" name="kwBefore" value={formData.kwBefore} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="kwAfter" className="form-label">Current Power Production</label>
                        <input type="number" className="form-control" id="kwAfter" name="kwAfter" value={formData.kwAfter} onChange={handleChange} required />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="productKw" className="form-label">Power Produced</label>
                        <input type="number" className="form-control" id="productKw" name="productKw" value={formData.productKw} readOnly />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="kwSTD" className="form-label">Standard Power Production</label>
                        <input type="number" className="form-control" id="kwSTD" name="kwSTD" value={formData.kwSTD} readOnly />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="peaUnit" className="form-label">PEA Unit</label>
                        <input type="number" step="0.01" className="form-control" id="peaUnit" name="peaUnit" value={formData.peaUnit} onChange={handleChange} required />
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

                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <button type="button" className="btn btn-secondary me-2" onClick={handleClear}>Clear</button>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
