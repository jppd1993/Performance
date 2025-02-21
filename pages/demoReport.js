import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { pool } from '../lib/dbt';
import moment from 'moment';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const FARM_ORDER = ['SK', 'WT', 'PTC', 'JKR', 'RE', 'KK', 'UD', 'SSN', 'NP', 'CHTBR', 'ND', 'NK', 'CHN'];

export async function getServerSideProps({ query }) {
    const { fromDate, toDate } = query;

    try {
        const start = fromDate ? fromDate : moment().format('YYYY-MM-DD');
        const end = toDate ? toDate : moment().format('YYYY-MM-DD');
        const previousStart = moment(start).subtract(7, 'days').format('YYYY-MM-DD');

        const [currentRows] = await pool.query(
            'SELECT * FROM biogas.biogasInput WHERE saveDate BETWEEN ? AND ?',
            [start, end]
        );

        const [previousRows] = await pool.query(
            'SELECT * FROM biogas.biogasInput WHERE saveDate BETWEEN ? AND ?',
            [previousStart, moment(start).subtract(1, 'days').format('YYYY-MM-DD')]
        );

        const processRows = (rows) => {
            const groupedData = rows.reduce((acc, current) => {
                const farm = current.farm;
                if (!acc[farm]) {
                    acc[farm] = {
                        kwSTD: 0,
                        productKw: 0,
                        productValue: 0,
                        hrBreakdown: 0,
                        peaUnit: current.peaUnit || 0,
                    };
                }
                acc[farm].kwSTD += current.kwSTD;
                acc[farm].productKw += current.productKw;
                acc[farm].productValue += current.productValue;
                acc[farm].hrBreakdown += current.hrBreakdown;
                return acc;
            }, {});

            return Object.keys(groupedData)
                .map(farm => ({
                    farm,
                    ...groupedData[farm],
                }))
                .sort((a, b) => FARM_ORDER.indexOf(a.farm) - FARM_ORDER.indexOf(b.farm));
        };

        const currentData = processRows(currentRows);
        const previousData = processRows(previousRows);

        return {
            props: {
                currentData,
                previousData,
                fromDate: start,
                toDate: end,
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            props: {
                currentData: [],
                previousData: [],
            },
        };
    }
}

export default function Report({ currentData, previousData, fromDate, toDate }) {
    const [from, setFrom] = useState(fromDate);
    const [to, setTo] = useState(toDate);

    const totalKwSTD = currentData.reduce((sum, row) => sum + row.kwSTD, 0).toLocaleString();
    const totalProductKw = currentData.reduce((sum, row) => sum + row.productKw, 0);
    const totalProductValue = Number(currentData.reduce((sum, row) => sum + row.productValue, 0).toFixed(2)).toLocaleString();

    const previousKwSTD = previousData.reduce((sum, row) => sum + row.kwSTD, 0).toLocaleString();
    const previousProductKw = previousData.reduce((sum, row) => sum + row.productKw, 0);
    const previousProductValue = Number(previousData.reduce((sum, row) => sum + row.productValue, 0).toFixed(2)).toLocaleString();
    const totalbreakdown = Number(currentData.reduce((sum, row) => sum + row.hrBreakdown, 0).toFixed(2)).toLocaleString();

    const percentageChange = previousProductKw
        ? (((totalProductKw - previousProductKw) / previousProductKw) * 100).toFixed(2)
        : 0;

    const chartData = {
        labels: currentData.map(row => row.farm),
        datasets: [
            {
                label: 'Target (kW)',
                data: currentData.map(row => row.kwSTD),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Produced (kW)',
                data: currentData.map(row => row.productKw),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
            },
            legend: {
                position: 'top',
            },
            datalabels: {
                display: true,
                color: 'black',
                anchor: 'end',
                align: 'top',
                formatter: (value, context) => {
                    const rowIndex = context.dataIndex;
                    const farmData = currentData[rowIndex];

                    if (context.dataset.label === 'Target (kW)') {
                        const targetValue = (farmData.peaUnit * farmData.kwSTD).toFixed(2);
                        return `${value.toLocaleString()} kW\n${Number(targetValue).toLocaleString()} ฿`;
                    }

                    const breakdownText = farmData.hrBreakdown > 0
                        ? `\nBD ${farmData.hrBreakdown} hrs`
                        : '';

                    return `${value.toLocaleString()} kW\n${Number(farmData.productValue).toLocaleString()} ฿${breakdownText}`;
                },
                textAlign: 'center',
                color: (context) => {
                    return context.dataset.label === 'Produced (kW)' && currentData[context.dataIndex].hrBreakdown > 0
                        ? 'red'
                        : 'black';
                },
                font: {
                    weight: (context) => {
                        return context.dataset.label === 'Produced (kW)' && currentData[context.dataIndex].hrBreakdown > 0
                            ? 'bold'
                            : 'normal';
                    },
                },
            },
        },
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'ฟาร์ม',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'kWh',
                },
                beginAtZero: true,
            },
        },
    };

    const handleFilter = () => {
        window.location.href = `?fromDate=${from}&toDate=${to}`;
    };

    return (
        <div className="container mt-5">
            <h3 className="text-center">ภาพรวมประสิทธิภาพไบโอแก๊ส</h3>

            <div className="text-center mb-4">
                <label>จากวันที่: </label>
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                />
                <label> ถึงวันที่: </label>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                />
                <button onClick={handleFilter} className="btn btn-primary">
                    กรองข้อมูล
                </button>
            </div>

            {/* กล่องข้อมูลย้อนหลัง 7 วัน */}
            <div className="d-flex justify-content-center mb-4">
                <div
                    className="text-center"
                    style={{
                        border: '2px solid black',
                        padding: '10px',
                        fontWeight: 'bold',
                        lineHeight: '1.2',
                        borderRadius: '8px',
                        marginRight: '20px',
                        fontSize: '1.5rem', // เพิ่มขนาดตัวอักษร
                    }}
                >
                    <h5>ครั้งก่อน</h5>
                    <p>พลังงานทั้งหมด: {previousProductKw.toLocaleString()} kW</p>
                    <p>เป้าหมาย: {previousKwSTD} kW</p>
                    <p>มูลค่า: {previousProductValue} บาท</p>
                </div>

                {/* กล่องข้อมูลช่วงวันที่ปัจจุบัน */}
                <div
                    className="text-center"
                    style={{
                        border: '2px solid black',
                        padding: '10px',
                        fontWeight: 'bold',
                        lineHeight: '1.2',
                        borderRadius: '8px',
                        marginRight: '20px',
                        fontSize: '1.5rem', // เพิ่มขนาดตัวอักษร
                    }}
                >
                    <h5>ปัจจุบัน</h5>
                    <p>พลังงานทั้งหมด: {totalProductKw.toLocaleString()} kW</p>
                    <p>เป้าหมาย: {totalKwSTD} kW</p>
                    <p>มูลค่าทั้งหมด: {totalProductValue} บาท</p>
                </div>

                {/* เปอร์เซ็นต์การเปลี่ยนแปลง */}
                <div
                    className="text-center"
                    style={{
                        padding: '50px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        fontSize: '1.9rem', // เพิ่มขนาดตัวอักษร
                        color: percentageChange < 0 ? 'red' : 'green',
                    }}
                >
                    {percentageChange < 0
                        ? `ลดลง ${Math.abs(percentageChange)} %`
                        : `เพิ่มขึ้น ${percentageChange} %`}
                        <p></p>
                        <p>Breakdown {totalbreakdown} ชั่วโมง</p>
                </div>
                
            </div>

            {currentData.length > 0 ? (
                <Bar data={chartData} options={options} />
            ) : (
                <p className="text-center">ไม่มีข้อมูลการผลิตไบโอแก๊ส</p>
            )}
        </div>
    );
}
