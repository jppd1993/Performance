import { query } from '../../lib/db';

export default async function handler(req, res) {
    const { date, farm, machineType } = req.query;

    if (!date || !farm || !machineType) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    try {
        // Query to get hrAfter and kwAfter from the previous day's data
        const results = await query(
            'SELECT hrAfter, kwAfter FROM biogas.biogasInput WHERE saveDate = ? AND farm = ? AND machineType = ? ORDER BY saveDate DESC LIMIT 1',
            [date, farm, machineType]
        );

        if (results.length > 0) {
            const { hrAfter, kwAfter } = results[0];
            res.status(200).json({ hrAfter, kwAfter });
        } else {
            // If no data found, return hrAfter and kwAfter as 0
            res.status(200).json({ hrAfter: 0, kwAfter: 0 });
        }
    } catch (error) {
        console.error('Error fetching previous data:', error);
        res.status(500).json({ error: 'An error occurred while fetching previous data' });
    }
}
