import { pool } from '../../lib/dbt';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // ตรวจสอบข้อมูลที่ถูกส่งมาจาก Frontend
            console.log("Received data:", req.body);

            const {
                saveDate,
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
                hrStd,
                hrBreakdown,
                machineNo
            } = req.body;

            // ตรวจสอบว่าค่าที่จำเป็นถูกส่งมาครบถ้วนหรือไม่
            if (!saveDate || !farm || !machineType) {
                return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
            }

            // บันทึกข้อมูลลงฐานข้อมูล
            const [result] = await pool.query(
                'INSERT INTO biogas.biogasInput (saveDate, farm, machineType, hrBefore, hrAfter, productHr, kwBefore, kwAfter, productKw, kwSTD, peaUnit, productValue, hrStd, hrBreakdown , machineNo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    saveDate,
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
                    hrStd,
                    hrBreakdown,
                    machineNo
                ]
            );

            console.log("Data saved successfully:", result);

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
