import { query } from '../../lib/db';

export default async function handler(req, res) {
    try {
        const { fromDate, toDate, shortArea } = req.query;

        const filters = [];
        let sql = `
            SELECT inputId, shortArea, machineTpye, machineCap, product, productPerformance, workTime,
                   breakdownList, inputDate, fixTime, fixLocation, lostTime, fixCourse
            FROM grading.production
            WHERE 1=1
        `;

        if (fromDate) {
            sql += ` AND inputDate >= ?`;
            filters.push(fromDate);
        }
        if (toDate) {
            sql += ` AND inputDate <= ?`;
            filters.push(toDate);
        }
        if (shortArea) {
            sql += ` AND shortArea = ?`;
            filters.push(shortArea);
        }

        const data = await query(sql, filters);

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching grading data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
