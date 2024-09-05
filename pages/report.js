import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { pool } from '../lib/dbt';

// Register the components with Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export async function getServerSideProps() {
    const [rows] = await pool.query('SELECT * FROM biogas.biogasData');
    return {
        props: {
            data: rows,
        }
    };
}

export default function Report({ data }) {
    const chartData = {
        labels: data.map(row => row.saveDate),
        datasets: [
            {
                label: 'Target (kW)',
                data: data.map(row => row.kwSTD),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'Produced (kW)',
                data: data.map(row => row.productKw),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };

    const options = {
        plugins: {
            title: {
                display: true,
                text: 'ภาพรวมการผลิตไบโอแก๊ส'
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
            legend: {
                position: 'top',
            }
        },
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'ฟาร์ม'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'kWh'
                },
                beginAtZero: true
            }
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Biogas Production Report</h1>
            <Bar data={chartData} options={options} />
        </div>
    );
}
