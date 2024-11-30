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
  },
});

// Query function
export const query = async (queryString, values = []) => {
  try {
    // Execute the query with the provided values
    const results = await db.query(queryString, values);

    // Always ensure the connection pool is cleared
    await db.end();
    return results;
  } catch (error) {
    console.error('Database Query Error:', error.message);
    throw new Error('Database Query Failed');
  }
};

// Utility function to close the connection gracefully
export const closeConnection = async () => {
  try {
    await db.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};

export default db;
