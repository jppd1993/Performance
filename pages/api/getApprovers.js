import { query } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const results = await query(`SELECT apvTitle, apvName, apvPosition FROM biogas.approver`);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch approver data" });
  }
}
