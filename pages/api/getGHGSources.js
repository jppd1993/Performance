import { query } from "../../lib/db";

export default async function handler(req, res) {
  const sql = `
    SELECT DISTINCT source
    FROM biogas.ghgData
    ORDER BY source ASC
  `;

  try {
    const results = await query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching sources:", error);
    res.status(500).json({ error: "Failed to fetch sources" });
  }
}
