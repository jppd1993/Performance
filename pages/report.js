import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import plugin
import { pool } from '../lib/dbt';
import moment from 'moment'; // ใช้สำหรับจัดการวันที่

// Register the components with Chart.js, including ChartDataLabels
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export async function getServerSideProps({ query }) {
    const { fromDate, toDate } = query;

    try {
        const start = fromDate ? fromDate : '1970-01-01';
        const end = toDate ? toDate : moment().format('YYYY-MM-DD');

        // Query ข้อมูลโดยกรองตามช่วงวันที่ใน fromDate และ toDate
        const [rows] = await pool.query(
            'SELECT * FROM biogas.biogasInput WHERE saveDate BETWEEN ? AND ?',
            [start, end]
        );

        // แปลงวันที่จาก object เป็น string และจัดกลุ่มข้อมูลตามฟาร์ม
        const data = rows.map(row => ({
            ...row,
            fromDate: moment(row.fromDate).format('YYYY-MM-DD'),
            toDate: moment(row.toDate).format('YYYY-MM-DD')
        }));

        // จัดกลุ่มข้อมูลตามฟาร์มและรวมค่า kwSTD, productKw, productValue และ hrBreakdown
        const groupedData = data.reduce((acc, current) => {
            const farm = current.farm;
            if (!acc[farm]) {
                acc[farm] = {
                    kwSTD: 0,
                    productKw: 0,
                    productValue: 0,
                    hrBreakdown: 0,
                    peaUnit: current.peaUnit || 0 // ใช้ peaUnit จากข้อมูลที่ส่งมา
                };
            }
            acc[farm].kwSTD += current.kwSTD;
            acc[farm].productKw += current.productKw;
            acc[farm].productValue += current.productValue;
            acc[farm].hrBreakdown += current.hrBreakdown; // เพิ่มค่า Breakdown Hours
            return acc;
        }, {});

        // แปลงข้อมูลที่จัดกลุ่มกลับเป็น array
        const aggregatedData = Object.keys(groupedData).map(farm => ({
            farm,
            kwSTD: groupedData[farm].kwSTD,
            productKw: groupedData[farm].productKw,
            productValue: groupedData[farm].productValue,
            hrBreakdown: groupedData[farm].hrBreakdown,
            peaUnit: groupedData[farm].peaUnit // เก็บค่า peaUnit ต่อฟาร์ม
        }));

        return {
            props: {
                data: aggregatedData,
                fromDate: start,
                toDate: end
            }
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            props: {
                data: [],
            }
        };
    }
}

export default function Report({ data, fromDate, toDate }) {
    const [from, setFrom] = useState(fromDate);
    const [to, setTo] = useState(toDate);

    const totalKwSTD = data.reduce((sum, row) => sum + row.kwSTD, 0).toLocaleString();
    const totalProductKw = data.reduce((sum, row) => sum + row.productKw, 0).toLocaleString();
    const totalProductValue = Number(data.reduce((sum, row) => sum + row.productValue, 0).toFixed(2)).toLocaleString();

    const chartData = {
        labels: data.map(row => row.farm),
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
                    const farmData = data[rowIndex];

                    // คำนวณมูลค่าของ Target
                    if (context.dataset.label === 'Target (kW)') {
                        const targetValue = (farmData.peaUnit * farmData.kwSTD).toFixed(2);
                        return `${value.toLocaleString()} kW\n${Number(targetValue).toLocaleString()} บาท`; // มูลค่า Target
                    }

                    // แสดงค่าของ Production พร้อมกับตรวจสอบว่า farm มี Breakdown Hours หรือไม่
                    const breakdownText = farmData.hrBreakdown > 0
                        ? `\nBreakdown: ${farmData.hrBreakdown} hrs` // แสดง Breakdown Hours
                        : '';
                    
                    return `${value.toLocaleString()} kW\n${Number(farmData.productValue).toLocaleString()} บาท${breakdownText}`;
                },
                textAlign: 'center',
                color: (context) => {
                    return context.dataset.label === 'Produced (kW)' && data[context.dataIndex].hrBreakdown > 0 ? 'red' : 'black'; // สีแดงถ้ามี Breakdown
                },
                font: {
                    weight: (context) => {
                        return context.dataset.label === 'Produced (kW)' && data[context.dataIndex].hrBreakdown > 0 ? 'bold' : 'normal'; // ตัวหนาถ้ามี Breakdown
                    }
                }
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

    const handleFilter = () => {
        window.location.href = `?fromDate=${from}&toDate=${to}`;
    };

    return (
        <div className="container mt-5" align='center'>
            <h3 className="text-center">ภาพรวมประสิทธิภาพไบโอแก๊ส</h3>

            {/* ส่วนของการกรองวันที่ */}
            <div className="mb-4">
                <label>จากวันที่: </label>
                <input 
                    type="date" 
                    value={from} 
                    onChange={e => setFrom(e.target.value)} 
                />
                <label> ถึงวันที่: </label>
                <input 
                    type="date" 
                    value={to} 
                    onChange={e => setTo(e.target.value)} 
                />
                <button onClick={handleFilter} className="btn btn-primary">กรองข้อมูล</button>
            </div>
            
            {/* แสดงตัวเลขผลรวมทั้งหมดในกรอบสี่เหลี่ยม */}
            <div className="text-center mb-4" style={{
                border: '2px solid black', 
                display: 'inline-block', 
                padding: '10px', 
                fontWeight: 'bold', 
                lineHeight: '1.2',
                borderRadius: '8px',
                margin: '0 auto', 
                textAlign: 'center' 
            }}>
                <p style={{ margin: 0 }}>พลังงานทั้งหมด: {totalProductKw} kW</p>
                <p style={{ margin: 0 }}>เป้าหมาย: {totalKwSTD} kW</p>
                <p style={{ margin: 0 }}>มูลค่าทั้งหมด: {totalProductValue} บาท</p>
            </div>
            
            {data.length > 0 ? (
                <Bar data={chartData} options={options} />
            ) : (
                <p className="text-center">ไม่มีข้อมูลการผลิตไบโอแก๊ส</p>
            )}
        </div>
    );
}
