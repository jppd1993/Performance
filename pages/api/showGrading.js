import { pool } from '../../lib/dbt';
import moment from 'moment'; // ใช้สำหรับจัดการวันที่

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // รับค่าจาก query สำหรับฟิลเตอร์ช่วงวันที่
            const { fromDate, toDate } = req.query;

            let query = 'SELECT farm, SUM(kwSTD) as totalTarget, SUM(productKw) as totalProduct FROM biogas.biogasInput';
            let queryParams = [];

            // ตรวจสอบว่ามีการกรองตามช่วงวันที่หรือไม่
            if (fromDate && toDate) {
                query += ' WHERE saveDate BETWEEN ? AND ?';
                queryParams.push(fromDate, toDate);
            }

            query += ' GROUP BY farm'; // จัดกลุ่มข้อมูลตามฟาร์ม

            const [rows] = await pool.query(query, queryParams);

            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: 'ไม่มีข้อมูลการผลิตไบโอแก๊สในช่วงวันที่ที่เลือก' });
            }

            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: 'Method not allowed' });
    }
}
