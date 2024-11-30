import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export async function getServerSideProps() {
    const res = await fetch('https://performance-git-master-jatuphong-s-projects.vercel.app/api/getDropdownData');
    const data = await res.json();

    return {
        props: {
            farms: data.farms || [],
            machines: data.machines || [],
        }
    };
}

export default function Home({ farms, machines }) {
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
        hrBreakdown: 0
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!formData.saveDate || !formData.farm || !formData.machineType) return;

        const fetchPreviousData = async () => {
            const previousDate = new Date(formData.saveDate);
            previousDate.setDate(previousDate.getDate() - 1);
            const formattedPreviousDate = previousDate.toISOString().split('T')[0];

            try {
                const res = await fetch(`/api/getPreviousData?date=${formattedPreviousDate}&farm=${formData.farm}&machineType=${formData.machineType}`);
                const data = await res.json();

                setFormData((prevFormData) => ({
                    ...prevFormData,
                    hrBefore: data.hrAfter ?? 0,
                    kwBefore: data.kwAfter ?? 0
                }));
            } catch (error) {
                console.error("Error fetching previous data:", error);
            }
        };

        fetchPreviousData();
    }, [formData.saveDate, formData.farm, formData.machineType]);

    useEffect(() => {
        setFormData((prevFormData) => {
            const productHr = prevFormData.hrAfter - prevFormData.hrBefore;
            const productKw = prevFormData.kwAfter - prevFormData.kwBefore;
            const productValue = (productKw * prevFormData.peaUnit).toFixed(2);
            const hrStd = 24;
            const hrBreakdown = Math.max(hrStd - productHr, 0);
            const kwSTD = (prevFormData.machineType * 80 / 100) * hrStd;

            return {
                ...prevFormData,
                productHr,
                productKw,
                productValue,
                hrStd,
                hrBreakdown,
                kwSTD
            };
        });
    }, [formData.hrAfter, formData.hrBefore, formData.kwAfter, formData.kwBefore, formData.peaUnit, formData.machineType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};
        if (!formData.saveDate) newErrors.saveDate = 'กรุณาระบุวันบันทึกข้อมูล';
        if (!formData.farm) newErrors.farm = 'กรุณาเลือกฟาร์ม';
        if (!formData.machineType) newErrors.machineType = 'กรุณาเลือกประเภทเครื่องเจน';
        if (!formData.hrAfter) newErrors.hrAfter = 'กรุณาระบุค่า Current Running Hours';
        if (!formData.kwAfter) newErrors.kwAfter = 'กรุณาระบุค่า Current Power Production';
        if (!formData.peaUnit) newErrors.peaUnit = 'กรุณาระบุค่า PEA Unit';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        try {
            const res = await fetch('/api/saveInput', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            hrBreakdown: 0
        });
        setErrors({});
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">ระบบกรอกข้อมูล Biogas</h1>
            {/* Form content */}
            <form onSubmit={handleSubmit}>
                {/* Form fields */}
            </form>
            <div className="row justify-content-center mt-3">
                <div className="col-md-2 text-center">
                    <Link href="https://performance-git-master-jatuphong-s-projects.vercel.app/menu" passHref>
                        <button type="button" className="btn btn-dark text-white">
                            <FaHome /> Home
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
