import { pool } from '../../lib/dbt';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { saveDate, farm, machineType, hrBefore, hrAfter, productHr, kwBefore, kwAfter, productKw, kwSTD, peaUnit, productValue } = req.body;

        try {
            await pool.query(
                'INSERT INTO biogas.biogasData (saveDate, farm, machineType, hrBefore, hrAfter, productHr, kwBefore, kwAfter, productKw, kwSTD, peaUnit, productValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [saveDate, farm, machineType, hrBefore, hrAfter, productHr, kwBefore, kwAfter, productKw, kwSTD, peaUnit, productValue]
            );
            res.status(200).json({ message: 'Data saved successfully!' });
        } catch (error) {
            res.status(500).json({ message: 'Error saving data', error });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
