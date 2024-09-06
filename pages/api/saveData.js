import { pool } from '../../lib/dbt';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { 
            fromDate, 
            toDate, 
            farm, 
            machineType, 
            hrBefore, 
            hrAfter, 
            productHr, 
            kwBefore, 
            kwAfter, 
            productKw, 
            kwSTD, 
            peaUnit, 
            productValue,
            hrStd, // เพิ่ม hrStd
            hrBreakdown // เพิ่ม hrBreakdown
        } = req.body;

        // ตรวจสอบข้อมูลก่อนบันทึก
        if (
            !fromDate || 
            !toDate || 
            !farm || 
            !machineType || 
            hrBefore < 0 || 
            hrAfter < 0 || 
            kwBefore < 0 || 
            kwAfter < 0 || 
            kwSTD < 0 || 
            peaUnit < 0 || 
            productValue < 0 ||
            hrStd < 0 || // ตรวจสอบ hrStd
            hrBreakdown < 0 // ตรวจสอบ hrBreakdown
        ) {
            return res.status(400).json({ message: 'ข้อมูลผิดพลาด ไม่สามารถบันทึกได้' });
        }

        try {
            // บันทึกข้อมูลลงในฐานข้อมูล
            await pool.query(
                'INSERT INTO biogas.biogasData (fromDate, toDate, farm, machineType, hrBefore, hrAfter, productHr, kwBefore, kwAfter, productKw, kwSTD, peaUnit, productValue, hrStd, hrBreakdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [fromDate, toDate, farm, machineType, hrBefore, hrAfter, productHr, kwBefore, kwAfter, productKw, kwSTD, peaUnit, productValue, hrStd, hrBreakdown] // เพิ่ม hrStd และ hrBreakdown ลงใน query
            );
            
            // ส่งข้อความตอบกลับเมื่อบันทึกสำเร็จ
            res.status(200).json({ message: 'บันทึกข้อมูลสำเร็จ' });
        } catch (error) {
            console.error('เกิดข้อผิดพลาด : ', error); // แสดงใน console สำหรับ debug
            res.status(500).json({ message: 'Error saving data. Please try again later.' });
        }
    } else {
        // จัดการเมื่อ method ไม่ใช่ POST
        res.setHeader('Allow', ['POST']); // เพิ่ม Allow header
        res.status(405).json({ message: 'Method not allowed' });
    }
}
