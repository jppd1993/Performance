import { query } from '../../lib/db';

export default async function handler(req, res) {
    try {
        const { fromDate, toDate, farm } = req.query;

        const filters = [];
        let sql = `
            SELECT inputId,farm, saveDate, hrAfter, hrBefore, kwAfter, kwBefore, kwSTD, machineType, peaUnit, productKw, productHr, productValue, hrStd, hrBreakdown, machineNo
            FROM biogas.biogasInput
            WHERE 1=1
        `;

        if (fromDate) {
            sql += ` AND saveDate >= ?`;
            filters.push(fromDate);
        }
        if (toDate) {
            sql += ` AND saveDate <= ?`;
            filters.push(toDate);
        }
        if (farm) {
            sql += ` AND farm = ?`;
            filters.push(farm);
        }

        const data = await query(sql, filters);

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching grading data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
