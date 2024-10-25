import { pool } from '../../lib/dbt';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const {
                inputDate,
                shortArea,
                workTime,
                product,
                breakdown,
                breakdownList,
                fixCourse,
                fixTime,
                lostTime,
                fixLocation
            } = req.body;

            // คำนวณค่า machineCap และ productPerformance
            const machineCap = workTime * 2000;
            const productPerformance = machineCap ? ((product * 100) / machineCap).toFixed(2) : 0;

            // ระบุค่า machineTpye หรือกำหนดค่า default (เช่น 0)
            const machineTpye = req.body.machineTpye || 0;

            // ตรวจสอบฟิลด์ที่จำเป็น
            if (!inputDate || !shortArea || !workTime || !product) {
                return res.status(400).json({ message: 'กรุณาระบุข้อมูลที่จำเป็นให้ครบถ้วน' });
            }

            // บันทึกข้อมูลลงฐานข้อมูล
            const [result] = await pool.query(
                `INSERT INTO grading.production 
                (inputDate, shortArea, workTime, product, machineCap, productPerformance, breakdownList, fixCourse, fixTime, lostTime, fixLocation, machineTpye) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    inputDate,
                    shortArea,
                    workTime,
                    product,
                    machineCap,
                    productPerformance,
                    breakdown ? breakdownList : null,
                    breakdown ? fixCourse : null,
                    breakdown ? fixTime : 0,
                    breakdown ? lostTime : 0,
                    breakdown ? fixLocation : null,
                    machineTpye
                ]
            );

            res.status(200).json({ message: 'บันทึกข้อมูลสำเร็จ' });
        } catch (error) {
            console.error('Error saving data:', error);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: 'Method not allowed' });
    }
}
