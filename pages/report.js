import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import plugin
import { pool } from '../lib/dbt';
import moment from 'moment'; // ใช้สำหรับจัดการวันที่

// Register the components with Chart.js, including ChartDataLabels
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export async function getServerSideProps({ query }) {
    const { fromDate, toDate } = query; // รับค่าจาก URL query params

    try {
        // ตรวจสอบว่ามีการส่งวันที่มาหรือไม่ ถ้าไม่มีให้ใช้วันที่ล่าสุด
        const start = fromDate ? fromDate : '1970-01-01'; // ถ้าไม่มี fromDate ให้ใช้ค่าเริ่มต้นเป็นวันเริ่มต้น
        const end = toDate ? toDate : moment().format('YYYY-MM-DD'); // ถ้าไม่มี toDate ให้ใช้วันที่ปัจจุบัน

        // Query ข้อมูลโดยกรองตามช่วงวันที่ใน fromDate และ toDate
        const [rows] = await pool.query(
            'SELECT * FROM biogas.biogasData WHERE fromDate BETWEEN ? AND ? OR toDate BETWEEN ? AND ?',
            [start, end, start, end]
        );

        // แปลงวันที่จาก object เป็น string และจัดกลุ่มข้อมูลตามฟาร์ม
        const data = rows.map(row => ({
            ...row,
            fromDate: moment(row.fromDate).format('YYYY-MM-DD'), // แปลงวันที่เป็น string
            toDate: moment(row.toDate).format('YYYY-MM-DD') // แปลงวันที่เป็น string
        }));

        // จัดกลุ่มข้อมูลตามฟาร์มและรวมค่า kwSTD, productKw และ productValue
        const groupedData = data.reduce((acc, current) => {
            const farm = current.farm;
            if (!acc[farm]) {
                acc[farm] = {
                    kwSTD: 0,
                    productKw: 0,
                    productValue: 0
                };
            }
            acc[farm].kwSTD += current.kwSTD;
            acc[farm].productKw += current.productKw;
            acc[farm].productValue += current.productValue;
            return acc;
        }, {});

        // แปลงข้อมูลที่จัดกลุ่มกลับเป็น array
        const aggregatedData = Object.keys(groupedData).map(farm => ({
            farm,
            kwSTD: groupedData[farm].kwSTD,
            productKw: groupedData[farm].productKw,
            productValue: groupedData[farm].productValue
        }));

        return {
            props: {
                data: aggregatedData, // ส่งข้อมูลที่จัดกลุ่มไปยัง frontend
                fromDate: start,
                toDate: end
            }
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            props: {
                data: [], // หากเกิดข้อผิดพลาดให้ส่งข้อมูลว่าง
            }
        };
    }
}

export default function Report({ data, fromDate, toDate }) {
    const [from, setFrom] = useState(fromDate); // ตั้งค่าวันที่เริ่มต้น
    const [to, setTo] = useState(toDate); // ตั้งค่าวันที่สิ้นสุด

    // คำนวณค่ารวมของ Target, Product และ Product Value (มูลค่าทั้งหมด)
    const totalKwSTD = data.reduce((sum, row) => sum + row.kwSTD, 0);
    const totalProductKw = data.reduce((sum, row) => sum + row.productKw, 0);
    const totalProductValue = data.reduce((sum, row) => sum + row.productValue, 0).toFixed(2); // ปัดเศษมูลค่าให้มีทศนิยม 2 ตำแหน่ง

    const chartData = {
        labels: data.map(row => row.farm), // แสดงชื่อฟาร์มบนแกน X
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
                formatter: Math.round // ปัดเศษตัวเลขเป็นจำนวนเต็ม
            }
        },
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'ฟาร์ม' // แสดงชื่อฟาร์มบนแกน X
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'kWh' // แกน Y เป็นหน่วย kWh
                },
                beginAtZero: true
            }
        }
    };

    // ฟังก์ชันส่งคำขอไปยัง backend เพื่อกรองข้อมูลตามช่วงวันที่
    const handleFilter = () => {
        window.location.href = `?fromDate=${from}&toDate=${to}`; // ส่งค่าช่วงวันที่ไปใน URL query
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
                margin: '0 auto', // จัดให้อยู่ตรงกลางแนวนอน
                textAlign: 'center' // จัดข้อความให้อยู่ตรงกลาง
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
