import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TestConnection() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/api/testConnection');
        setData(response.data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="container mt-5">
      <h1>ทดสอบการเชื่อมต่อฐานข้อมูล</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>farmShort</th>
            <th>farmName</th>
            {/* เพิ่มคอลัมน์อื่นๆตามที่มีในตาราง biogas.farm */}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.farmShort}</td>
              <td>{item.farmName}</td>
              {/* เพิ่มคอลัมน์อื่นๆตามที่มีในตาราง biogas.farm */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
