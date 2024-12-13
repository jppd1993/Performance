import { query } from "../../lib/db";

export default async function handler(req, res) {
  const { farm, fromDate, toDate, energyType } = req.query;

  // ตรวจสอบพารามิเตอร์
  if (!farm || !fromDate || !toDate || !energyType) {
    return res.status(400).json({ error: "พารามิเตอร์ไม่ครบถ้วน" });
  }

  // กำหนด table จาก energyType
  const table = energyType === "Biogas" 
    ? "biogasDatas" 
    : energyType === "Solar" 
    ? "solarData" 
    : "peaData";

  const column = energyType === "PEA" ? "eUse" : "production";

  const sql = `
    SELECT
      dataDate AS date,
      SUM(${column}) AS value
    FROM biogas.${table}
    WHERE farm = ? AND dataDate BETWEEN ? AND ?
    GROUP BY dataDate
    ORDER BY dataDate ASC
  `;

  console.log("Executing SQL Query:", sql, [farm, fromDate, toDate]);

  try {
    const results = await query(sql, [farm, fromDate, toDate]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching farm energy data:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลได้" });
  }
}
