import { query } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const sql = `
      SELECT 
          DATE_FORMAT(a.dataDate, '%Y-%m') AS yearMonth,
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
      GROUP BY 
          yearMonth
      ORDER BY 
          yearMonth;
    `;

    const results = await query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching electricity data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
