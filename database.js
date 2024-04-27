const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'affinity'
  });
  
  // Establecer conexión a la base de datos
  connection.connect((err) => {
    if (err) throw err;
    console.log('Conexión exitosa a la base de datos');
  });

  module.exports = connection;