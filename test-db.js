const { Client } = require('pg')

const client = new Client({
  host: 'your-rds-endpoint.region.rds.amazonaws.com', // Get this from your RDS instance dashboard
  user: 'postgres',  // The master username you set up
  password: 'your-password', // The password you created
  database: 'routopia',
  port: 5432,
})

async function testConnection() {
  try {
    await client.connect()
    console.log('Successfully connected to the database!')
    await client.end()
  } catch (error) {
    console.error('Error connecting to the database:', error.message)
  }
}

testConnection()
