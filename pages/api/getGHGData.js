import { query } from "../../lib/db";

export default async function handler(req, res) {
  const { farm } = req.query;

  if (!farm) {
    return res.status(400).json({ error: "Missing farm parameter" });
  }

  const sql = `
    SELECT 
      DATE_FORMAT(dataDate, '%Y-%m') AS dataDate,
      farm,
      source,
      SUM(production) AS totalProduction,
      AVG(GHG) AS avgGHG
    FROM biogas.ghgData
    WHERE farm = ?
    GROUP BY dataDate, farm, source
    ORDER BY dataDate, farm ASC
  `;

  try {
    const results = await query(sql, [farm]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching GHG data:", error);
    res.status(500).json({ error: "Failed to fetch GHG data" });
  }
}
