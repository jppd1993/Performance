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
        const start = fromDate ? fromDate : moment().format('YYYY-MM-DD');
        const end = toDate ? toDate : moment().format('YYYY-MM-DD');

        // แสดง query และพารามิเตอร์ใน log
        console.log("Running query: SELECT * FROM grading.production WHERE inputDate BETWEEN '", start, "' AND '", end, "'");
        
        // Query ข้อมูลโดยกรองตามช่วงวันที่ใน fromDate และ toDate
        const [rows] = await pool.query(
            "SELECT * FROM grading.production WHERE inputDate BETWEEN ? AND ?",
            [start, end]
        );

        // แปลงวันที่จาก object เป็น string และจัดกลุ่มข้อมูลตามฟาร์ม
        const data = rows.map(row => ({
            ...row,
            inputDate: moment(row.inputDate).format('YYYY-MM-DD')
        }));

        // จัดกลุ่มข้อมูลตามฟาร์มและรวมค่า MachineCap, product, และ lostTime
        const groupedData = data.reduce((acc, current) => {
            const farm = current.shortArea;
            if (!acc[farm]) {
                acc[farm] = {
                    MachineCap: 0,
                    product: 0,
                    lostTime: 0
                };
            }
            acc[farm].MachineCap += current.machineCap;
            acc[farm].product += current.product;
            acc[farm].lostTime += current.lostTime; // เพิ่มค่า Breakdown Hours
            return acc;
        }, {});

        // แปลงข้อมูลที่จัดกลุ่มกลับเป็น array
        const aggregatedData = Object.keys(groupedData).map(farm => ({
            shortArea: farm,
            Cap: groupedData[farm].MachineCap,
            product: groupedData[farm].product,
            Breakdown: groupedData[farm].lostTime
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

    const totalMachineCap = data.reduce((sum, row) => sum + row.Cap, 0).toLocaleString();
    const totalProduct = data.reduce((sum, row) => sum + row.product, 0).toLocaleString();
    const totalBreakdown = data.reduce((sum, row) => sum + row.Breakdown, 0).toLocaleString();

    const chartData = {
        labels: data.map(row => row.shortArea),
        datasets: [
            {
                label: 'เป้าหมาย (ฟอง)',
                data: data.map(row => row.Cap),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'ยอดผลิต (ฟอง)',
                data: data.map(row => row.product),
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

                    if (context.dataset.label === 'เป้าหมาย (ฟอง)') {
                        return `${value.toLocaleString()} ฟอง`; // มูลค่า Target
                    }

                    // แสดงค่าของ Production พร้อมกับตรวจสอบว่า farm มี Breakdown Hours หรือไม่
                    const breakdownText = farmData.Breakdown > 0
                        ? `\nBreakdown: ${farmData.Breakdown} mins` // แสดง Breakdown Hours
                        : '';
                    
                    return `${value.toLocaleString()} ฟอง${breakdownText}`;
                },
                textAlign: 'center',
                color: (context) => {
                    return context.dataset.label === 'ยอดผลิต (ฟอง)' && data[context.dataIndex].Breakdown > 0 ? 'red' : 'black'; // สีแดงถ้ามี Breakdown
                },
                font: {
                    weight: (context) => {
                        return context.dataset.label === 'ยอดผลิต (ฟอง)' && data[context.dataIndex].Breakdown > 0 ? 'bold' : 'normal'; // ตัวหนาถ้ามี Breakdown
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
                    text: 'ฟอง'
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
            <h3 className="text-center">ภาพรวมประสิทธิภาพเครื่องคัด</h3>

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
                <p style={{ margin: 0 }}>ยอดผลิตทั้งหมด: {totalProduct} ฟอง</p>
                <p style={{ margin: 0 }}>เป้าหมายทั้งหมด: {totalMachineCap} ฟอง</p>
                <p style={{ margin: 0 }}>เวลาหยุดทำงานทั้งหมด: {totalBreakdown} นาที</p>
            </div>
            
            {data.length > 0 ? (
                <Bar data={chartData} options={options} />
            ) : (
                <p className="text-center">ไม่มีข้อมูลการคัดไข่</p>
            )}
        </div>
    );
}
