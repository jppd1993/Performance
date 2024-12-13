import { query } from "../../lib/db";

export default async function handler(req, res) {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "Missing parameter: month" });
  }

  try {
    const results = await query(`
      SELECT 
        DATE_FORMAT(a.dataDate, '%Y-%m') AS yearMonth,
        a.farm AS farm,
        SUM(a.runtime) AS totalBiogasRuntime,
        SUM(a.production) AS totalBiogasProduction,
        AVG(a.standard) AS avgBiogasStandard,
        SUM(b.production) AS totalSolarProduction,
        SUM(c.eUse) AS totalPeaEUse,
        AVG(c.avgPrice) AS avgPeaAvgPrice,
        (SUM(a.production) + SUM(b.production) + SUM(c.eUse)) AS totalEnergyUsage
      FROM biogas.biogasDatas a
      LEFT JOIN biogas.solarData b 
          ON a.dataDate = b.dataDate AND a.farm = b.farm
      LEFT JOIN biogas.peaData c
          ON a.dataDate = c.dataDate AND a.farm = c.farm
      WHERE DATE_FORMAT(a.dataDate, '%Y-%m') = ?
      GROUP BY yearMonth, farm
      ORDER BY farm
    `, [month]);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    res.status(500).json({ error: "Error fetching monthly data" });
  }
}
