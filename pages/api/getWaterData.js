import { query } from "../../lib/db";

export default async function handler(req, res) {
  const { farm, parameter } = req.query;

  // ตรวจสอบว่าพารามิเตอร์ครบถ้วนหรือไม่
  if (!farm || !parameter) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const sql = `
      SELECT 
          DATE_FORMAT(wd.dataDate, '%Y-%m') AS monthYear, 
          wd.farm AS farm,
          wd.pool AS pool,
          SUM(wd.${parameter}) AS ${parameter}
      FROM biogas.waterData wd
      WHERE wd.farm = ?
      GROUP BY monthYear, farm, pool
      ORDER BY monthYear ASC, pool ASC
    `;

    const results = await query(sql, [farm]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching water data:", error);
    res.status(500).json({ error: "Failed to fetch water data" });
  }
}
