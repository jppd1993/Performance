import { query } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const results = await query('SELECT * FROM biogas.farm');
    res.status(200).json(results);
  } catch (e) {
    console.error('Database query error:', e);
    res.status(500).json({ message: e.message });
  }
}
