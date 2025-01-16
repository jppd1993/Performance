import { useState, useEffect } from 'react';

export async function getServerSideProps() {
    try {
        const res = await fetch('https://performance-git-master-jatuphong-s-projects.vercel.app/api/getDropdownData');
        const data = await res.json();

        const { farms = [], machines = [], machinesNo = [1, 2, 3] } = data || {};

        return {
            props: {
                farms,
                machines,
                machineNo: machinesNo,
            },
        };
    } catch (error) {
        console.error("Error fetching dropdown data:", error);
        return {
            props: {
                farms: [],
                machines: [],
                machineNo: [1, 2, 3],
            },
        };
    }
}

export default function Home({ farms, machines, machineNo }) {
    const [formData, setFormData] = useState({
        saveDate: '',
        farm: farms[0]?.farmShort || 'CHTBR',
        machineType: machines[0]?.machineType || 550,
        hrBefore: 0,
        hrAfter: 0,
        productHr: 0,
        kwBefore: 0,
        kwAfter: 0,
        productKw: 0,
        kwSTD: 0,
        peaUnit: 0,
        productValue: 0,
        hrStd: 24,
        hrBreakdown: 0,
        machineNo: machineNo[0] || 1,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const calculateDerivedValues = () => {
            const productHr = Math.max(0, formData.hrAfter - formData.hrBefore);
            const productKw = Math.max(0, formData.kwAfter - formData.kwBefore);
            const productValue = (productKw * formData.peaUnit).toFixed(2);
            const hrBreakdown = Math.max(0, formData.hrStd - productHr);
            const kwSTD = ((formData.machineType * 80) / 100) * formData.hrStd;

            setFormData(prev => ({
                ...prev,
                productHr,
                productKw,
                productValue,
                hrBreakdown,
                kwSTD,
            }));
        };

        calculateDerivedValues();
    }, [formData.hrAfter, formData.hrBefore, formData.kwAfter, formData.kwBefore, formData.peaUnit, formData.machineType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!formData.saveDate) newErrors.saveDate = 'กรุณาระบุวันบันทึกข้อมูล';
        if (!formData.farm) newErrors.farm = 'กรุณาเลือกฟาร์ม';
        if (!formData.machineType) newErrors.machineType = 'กรุณาเลือกประเภทเครื่องเจน';
        if (!formData.machineNo) newErrors.machineNo = 'กรุณาเลือกเครื่องที่';
        if (formData.hrAfter <= 0) newErrors.hrAfter = 'กรุณาระบุค่า Current Running Hours มากกว่า 0';
        if (formData.kwAfter <= 0) newErrors.kwAfter = 'กรุณาระบุค่า Current Power Production มากกว่า 0';
        if (formData.peaUnit <= 0) newErrors.peaUnit = 'กรุณาระบุค่า PEA Unit มากกว่า 0';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        try {
            const res = await fetch('/api/saveInput', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการส่งข้อมูล');

            const result = await res.json();
            alert(result.message);
            handleClear();
        } catch (error) {
            console.error("Error occurred while submitting:", error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleClear = () => {
        setFormData({
            saveDate: '',
            farm: farms[0]?.farmShort || 'CHTBR',
            machineType: machines[0]?.machineType || 550,
            hrBefore: 0,
            hrAfter: 0,
            productHr: 0,
            kwBefore: 0,
            kwAfter: 0,
            productKw: 0,
            kwSTD: 0,
            peaUnit: 0,
            productValue: 0,
            hrStd: 24,
            hrBreakdown: 0,
            machineNo: machineNo[0] || 1,
        });
        setErrors({});
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">ระบบกรอกข้อมูล Biogas</h1>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="saveDate" className="form-label">วันที่บันทึก</label>
                        <input type="date" className="form-control" id="saveDate" name="saveDate" value={formData.saveDate} onChange={handleChange} required />
                        {errors.saveDate && <p className="text-danger">{errors.saveDate}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="farm" className="form-label">ฟาร์ม</label>
                        <select className="form-select" id="farm" name="farm" value={formData.farm} onChange={handleChange} required>
                            {farms.map((farm, index) => (
                                <option key={index} value={farm.farmShort}>{farm.farmShort}</option>
                            ))}
                        </select>
                        {errors.farm && <p className="text-danger">{errors.farm}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="machineType" className="form-label">ประเภทเครื่องเจน (kw/h)</label>
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
                        <label htmlFor="machineNo" className="form-label">เครื่องที่</label>
                        <select className="form-select" id="machineNo" name="machineNo" value={formData.machineNo} onChange={handleChange} required>
                            {machineNo.map((no, index) => (
                                <option key={index} value={no}>{no}</option>
                            ))}
                        </select>
                        {errors.machineNo && <p className="text-danger">{errors.machineNo}</p>}
                    </div>
                </div>
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
