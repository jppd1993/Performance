import { pool } from '../../lib/dbt';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // ดึงข้อมูลสถานที่ทั้งหมดจากฐานข้อมูล
            const [rows] = await pool.query('SELECT areaShort FROM grading.area');
            
            if (rows.length === 0) {
                return res.status(404).json({ message: 'ไม่พบข้อมูลสถานที่' });
            }

            // ส่งข้อมูลกลับในรูปแบบ JSON
            res.status(200).json({ areas: rows });
        } catch (error) {
            console.error('Error fetching area data:', error);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: 'Method not allowed' });
    }
}
