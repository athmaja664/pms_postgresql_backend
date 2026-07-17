require('dotenv').config()
const { Client } = require('pg')

const con = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1'
        ? false
        : { rejectUnauthorized: false }
})

con.connect()
.then(() => console.log("connected"))
.catch(err => console.log(err))

module.exports = con