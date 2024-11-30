import { query } from '../../lib/db';

export default async function handler(req, res) {
    try {
        // Query ฟาร์มจากฐานข้อมูล
        const rows = await query(`
            SELECT DISTINCT areaShort AS shortArea
            FROM grading.area
            ORDER BY areaShort
        `);

        // ตรวจสอบผลลัพธ์
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No farm data found' });
        }

        // ส่งข้อมูลกลับในรูปแบบ JSON
        res.status(200).json({ farms: rows });
    } catch (error) {
        console.error('Error fetching farm data:', error);
        res.status(500).json({ error: 'Failed to fetch farm data' });
    }
}
