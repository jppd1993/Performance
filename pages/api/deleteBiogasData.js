import { pool } from '../../lib/dbt';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { inputId } = req.body;

        try {
            const query = 'DELETE FROM biogasInput WHERE inputId = ?';
            const [result] = await pool.query(query, [inputId]);

            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'ลบข้อมูลสำเร็จ' });
            } else {
                res.status(404).json({ message: 'ไม่พบข้อมูลที่ต้องการลบ' });
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
