import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export async function getServerSideProps() {
    const res = await fetch('https://performance-git-master-jatuphong-s-projects.vercel.app/api/getDropdownData');
    const data = await res.json();

    if (!data) {
        return {
            props: {
                farms: [],
                machines: [],
                machinesNo: []
            }
        };
    }

    const { farms, machines, machinesNo = [{ machineNum:1},{ machineNum:2},{ machineNum:3},{ machineNum:4},{ machineNum:5}

    ]} = data;

    return {
        props: {
            farms: farms || [],
            machines: machines || [],
            machinesNo
        }
    };
}

export default function Home({ farms, machines, machinesNo }) {
    const [formData, setFormData] = useState({
        saveDate: '',
        farm: 'CHTBR',
        machineType: 550,
        hrBefore: 0,
        hrAfter: 0,
        productHr: 0,
        kwBefore: 0,
        kwAfter: 0,
        productKw: 0,
        kwSTD: 0,
        peaUnit: 0,
        productValue: 0,
        hrStd: 0,
        hrBreakdown: 0,
        machineNo: 1
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchPreviousData = async () => {
            if (!formData.saveDate || !formData.farm || !formData.machineType || !formData.machineNo) return;

            const previousDate = new Date(formData.saveDate);
            previousDate.setDate(previousDate.getDate() - 1);
            const formattedPreviousDate = previousDate.toISOString().split('T')[0];

            try {
                const res = await fetch(`/api/getPreviousData?date=${formattedPreviousDate}&farm=${formData.farm}&machineType=${formData.machineType}&machineNo=${formData.machineNo}`);
                const data = await res.json();

                if (data.hrAfter !== undefined && data.kwAfter !== undefined) {
                    setFormData(prevFormData => ({
                        ...prevFormData,
                        hrBefore: data.hrAfter,
                        kwBefore: data.kwAfter
                    }));
                } else {
                    setFormData(prevFormData => ({
                        ...prevFormData,
                        hrBefore: 0,
                        kwBefore: 0
                    }));
                }
            } catch (error) {
                console.error("Error fetching previous data:", error);
            }
        };

        fetchPreviousData();
    }, [formData.saveDate, formData.farm, formData.machineType, formData.machineNo]);

    useEffect(() => {
        const productHr = formData.hrAfter - formData.hrBefore;
        const productKw = formData.kwAfter - formData.kwBefore;
        const productValue = (productKw * formData.peaUnit).toFixed(2);

        const hrStd = formData.farm === 'SSN' ? 8 : 24;
        const hrBreakdown = hrStd - productHr;
        const kwSTD = (formData.machineType * 75 / 100) * hrStd;

        setFormData({
            ...formData,
            productHr,
            productKw,
            productValue,
            hrStd: isNaN(hrStd) ? 0 : hrStd,
            hrBreakdown: isNaN(hrBreakdown) || hrBreakdown < 0 ? 0 : hrBreakdown,
            kwSTD: isNaN(kwSTD) ? 0 : kwSTD
        });
    }, [formData.hrAfter, formData.hrBefore, formData.kwAfter, formData.kwBefore, formData.peaUnit, formData.machineType, formData.machineNo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: ['hrAfter', 'kwAfter', 'peaUnit', 'machineNo','productValue'].includes(name)
                ? Number(value) // แปลงค่าที่ควรเป็นตัวเลข
                : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};

        if (!formData.saveDate) {
            newErrors.saveDate = 'กรุณาระบุวันบันทึกข้อมูล';
        }
        if (!formData.farm) {
            newErrors.farm = 'กรุณาเลือกฟาร์ม';
        }
        if (!formData.machineType) {
            newErrors.machineType = 'กรุณาเลือกประเภทเครื่องเจน';
        }
        if (!formData.machineNo){
            newErrors.machineNo = 'กรุณาเลือกหมายเลขเครื่อง'
        }
        if (formData.hrAfter === '') {
            newErrors.hrAfter = 'กรุณาระบุค่า Current Running Hours';
        }
        if (formData.kwAfter === '') {
            newErrors.kwAfter = 'กรุณาระบุค่า Current Power Production';
        }
        if (formData.peaUnit === '') {
            newErrors.peaUnit = 'กรุณาระบุค่า PEA Unit';
        }

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

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
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

        handleClear();
    };

    const handleClear = () => {
        setFormData({
            saveDate: '',
            farm: 'CHTBR',
            machineType: 550,
            hrBefore: 0,
            hrAfter: 0,
            productHr: 0,
            kwBefore: 0,
            kwAfter: 0,
            productKw: 0,
            kwSTD: 0,
            peaUnit: 0,
            productValue: 0,
            hrStd: 0,
            hrBreakdown: 0,
            machineNo: 1
        });

        setErrors({});
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">ระบบกรอกข้อมูล Biogas</h1>
            <form onSubmit={handleSubmit}>
                <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div className="flex-fill">
            <label htmlFor="saveDate" className="form-label">วันที่บันทึก</label>
            <input
                type="date"
                className="form-control"
                id="saveDate"
                name="saveDate"
                value={formData.saveDate}
                onChange={handleChange}
                required
            />
            {errors.saveDate && <p className="text-danger">{errors.saveDate}</p>}
        </div>
        <div className="flex-fill">
            <label htmlFor="farm" className="form-label">ฟาร์ม</label>
            <select
                className="form-select"
                id="farm"
                name="farm"
                value={formData.farm}
                onChange={handleChange}
                required
            >
                {farms.map((farm, index) => (
                    <option key={index} value={farm.farmShort}>{farm.farmShort}</option>
                ))}
            </select>
            {errors.farm && <p className="text-danger">{errors.farm}</p>}
        </div>
        <div className="flex-fill">
            <label htmlFor="machineType" className="form-label">ประเภทเครื่องเจน(kw/h)</label>
            <select
                className="form-select"
                id="machineType"
                name="machineType"
                value={formData.machineType}
                onChange={handleChange}
                required
            >
                {machines.map((machine, index) => (
                    <option key={index} value={machine.machineType}>{machine.machineType}</option>
                ))}
            </select>
            {errors.machineType && <p className="text-danger">{errors.machineType}</p>}
        </div>
        <div className="flex-fill">
            <label htmlFor="machineNum" className="form-label">เครื่องที่</label>
            <select
                className="form-select"
                id="machineNum"
                name="machineNo"
                value={formData.machineNo}
                onChange={handleChange}
                required
            >
                {machinesNo.map((macNo, index) => (
                    <option key={index} value={macNo.machineNum}>{macNo.machineNum}</option>
                ))}
            </select>
            {errors.machineNum && <p className="text-danger">{errors.machineNum}</p>}
        </div>
    </div>


                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="hrAfter" className="form-label">เลขเดินเครื่องปัจจุบัน(Run Hours)</label>
                        <input type="number" className="form-control" id="hrAfter" name="hrAfter" value={formData.hrAfter} onChange={handleChange} required />
                        {errors.hrAfter && <p className="text-danger">{errors.hrAfter}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="kwAfter" className="form-label">เลขกำลังไฟฟ้าปัจจุบัน(kwh)</label>
                        <input type="number" className="form-control" id="kwAfter" name="kwAfter" value={formData.kwAfter} onChange={handleChange} required />
                        {errors.kwAfter && <p className="text-danger">{errors.kwAfter}</p>}
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="peaUnit" className="form-label">ราคาต่อหน่วย(ได้จากการไฟฟ้า)</label>
                        <input type="number" step="0.01" className="form-control" id="peaUnit" name="peaUnit" value={formData.peaUnit} onChange={handleChange} required />
                        {errors.peaUnit && <p className="text-danger">{errors.peaUnit}</p>}
                    </div>
                </div>

                <div className="border mt-5 p-3" style={{ border: '2px solid black', borderRadius: '8px' }}>
                    <h5 className="text-center mb-4">ข้อมูลการคำนวณอัตโนมัติ</h5>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="hrBefore" className="form-label">เลขเดินเครื่องครั้งก่อน(Run Hours)</label>
                            <input type="number" className="form-control" id="hrBefore" name="hrBefore" value={formData.hrBefore} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="kwBefore" className="form-label">เลขกำลังไฟฟ้าครั้งก่อน(kwh)</label>
                            <input type="number" className="form-control" id="kwBefore" name="kwBefore" value={formData.kwBefore} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="productHr" className="form-label">ชั่วโมงเดินเครื่อง</label>
                            <input type="number" className="form-control" id="productHr" name="productHr" value={formData.productHr} readOnly />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="productKw" className="form-label">กำลังไฟฟ้าที่ผลิตได้</label>
                            <input type="number" className="form-control" id="productKw" name="productKw" value={formData.productKw} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="kwSTD" className="form-label">มาตรฐานกำลังไฟฟ้า</label>
                            <input type="number" className="form-control" id="kwSTD" name="kwSTD" value={formData.kwSTD} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="productValue" className="form-label">มูลค่าพลังงาน</label>
                            <input type="number" className="form-control" id="productValue" name="productValue" value={formData.productValue} readOnly />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="hrStd" className="form-label">มาตรฐานชั่วโมงเดินเครื่อง</label>
                            <input type="number" className="form-control" id="hrStd" name="hrStd" value={formData.hrStd} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="hrBreakdown" className="form-label">ชั่วโมง Breakdown</label>
                            <input type="number" className="form-control" id="hrBreakdown" name="hrBreakdown" value={formData.hrBreakdown} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center mt-4">
                    <div className="col-md-6 text-center">
                        <button type="button" className="btn btn-secondary me-2" onClick={handleClear}>Clear</button>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </div>
                {/* <div className="row justify-content-center mt-3">
                    <div className="col-md-2 text-center">
                        <Link href="https://performance-git-master-jatuphong-s-projects.vercel.app/menu" passHref>
                            <button type="button" className="btn btn-dark text-white">
                                <FaHome /> Home
                            </button>
                        </Link>
                    </div>
                </div> */}
            </form>
        </div>
    );
}
