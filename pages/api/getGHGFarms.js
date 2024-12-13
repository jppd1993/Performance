import { query } from "../../lib/db";

export default async function handler(req, res) {
  const sql = `
    SELECT DISTINCT farm
    FROM biogas.ghgData
    ORDER BY farm ASC
  `;

  try {
    const results = await query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching farms:", error);
    res.status(500).json({ error: "Failed to fetch farms" });
  }
}
