import { query } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const results = await query(`SELECT apfType, apfName, apfAddress, apfTel FROM biogas.apFarm`);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch farm data" });
  }
}
