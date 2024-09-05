import mysql from 'serverless-mysql';

const db = mysql({
  config: {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    database: 'biogas',
    user: '4FhPAGirqkUT5YD.root',
    password: 'JlhNqfrpo0YSE18N',
    ssl: {
      rejectUnauthorized: true
    }
  }
});

export const query = async (queryString, values) => {
  try {
    const results = await db.query(queryString, values);
    await db.end();
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw new Error(error.message);
  }
};
