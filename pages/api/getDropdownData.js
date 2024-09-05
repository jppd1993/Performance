import { pool } from '../../lib/dbt';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const [farms] = await pool.query('SELECT farmShort FROM biogas.farm');
            const [machines] = await pool.query('SELECT machineType FROM biogas.machine');

            res.status(200).json({ farms: farms || [], machines: machines || [] });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching data', error });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
