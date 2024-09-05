import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: '4FhPAGirqkUT5YD.root', // เปลี่ยนให้ตรงกับค่าจาก TiDB Cloud
    password: 'JlhNqfrpo0YSE18N',
    database: 'biogas',
    port: 4000,
    ssl: {
        rejectUnauthorized: true
    }
});

export { pool };
