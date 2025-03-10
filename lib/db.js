import mysql from 'serverless-mysql';

const db = mysql({
  config: {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    database: 'biogas',
    user: '4FhPAGirqkUT5YD.root',
    password: 'JlhNqfrpo0YSE18N',
    ssl: {
      rejectUnauthorized: true,
    },
    connectTimeout: 15000 // ตั้งเวลา 15 วินาที (ปรับเปลี่ยนได้ตามความเหมาะสม)
  },
});

// Query function
export const query = async (queryString, values = []) => {
  try {
    // Execute the query with the provided values
    const results = await db.query(queryString, values);
    return results;
  } catch (error) {
    console.error('Database Query Error:', error.message);
    throw new Error('Database Query Failed');
  }
  // ไม่ต้องเรียก db.end() ที่นี่ เพราะจะปิด connection pool ทุกครั้ง
};

// Utility function to close the connection gracefully เมื่อไม่ต้องการใช้งาน pool อีกต่อไป
export const closeConnection = async () => {
  try {
    await db.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};

export default db;
