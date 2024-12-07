import { query } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const sql = `SELECT DISTINCT farm FROM biogas.waterData`;
    const farms = await query(sql);
    res.status(200).json(farms);
  } catch (error) {
    console.error("Error fetching farms:", error);
    res.status(500).json({ error: "Failed to fetch farms" });
  }
}
