// Get the client
const mysql = require('mysql2');
var dotenv = require("dotenv").config();


// Create the connection to database
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: 'Youtube',
  dateStrings: true,
  port: process.env.PORT
});

module.exports = connection;