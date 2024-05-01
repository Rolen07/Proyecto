const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const path = require('path');


const app = express();
const port = 3000;

const connection = require('./database.js');

app.use(express.static(path.join(__dirname, 'public')));    // Donde voya a colocar mis ficheros de imagen, css, javascript


// Configurar middleware para analizar el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');


// Ruta de registro de Usuarios
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

// Ruta de registro de usuario
app.post('/signup', (req, res) => {
  const cuenta = {
    Nombre: req.body.Nombre,
    Mail: req.body.Mail,
    Contrasena: req.body.Contrasena,
    Ubicación: req.body.Ubicación,
    Miembro: req.body.Miembro
  };
  // Insertar nuevo usuario en la base de datos
  connection.query('INSERT INTO Usuarios SET ?', cuenta, (error, results) => {
    if (error) throw error;
    //res.send('Usuario registrado exitosamente');
    res.sendFile(__dirname + '/aficiones.html');
  });
});

// Obtención de la página aficiones
app.get('/aficiones', (req, res) => {
  res.sendFile(__dirname + '/aficiones.html');
});

// Ruta de registro de aficiones

app.post('/aficiones', (req, res) => {
  const aficioncuenta = {
    ID_usuario: req.body.ID_usuario,
    ID_aficion: req.body.ID_aficion,
  };
  // Insertar nuevo usuario en la base de datos
  connection.query('INSERT INTO usuario_aficion SET ?', aficioncuenta, (error, results) => {
    if (error) throw error;
    //res.send('Usuario registrado exitosamente');
    res.sendFile(__dirname + '/login.html');
  });
});


// Ruta de inicio de sesión
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Ruta de validación de inicio de sesión
app.post('/login', (req, res) => {
  const mail = req.body.Mail;
  const contrasena = req.body.Contrasena;
  // Realizar consulta a la base de datos para verificar el inicio de sesión
  connection.query('SELECT * FROM Usuarios WHERE Mail = ? AND Contrasena = ?', [mail, contrasena], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
     // res.send('Inicio de sesión exitoso');
      res.sendFile(__dirname + '/index.html');
    } else {
      res.redirect('/erroracceso');
    }
  });
});


///////////////////////////   LISTAR REGISTROS /////////////////////////////////
const listar = require('./routers/list.js');
app.use('/list', listar);


///////////////////////////   ELIMINAR REGISTROS /////////////////////////////////
const eliminar = require('./routers/delete.js');
app.use('/delete', eliminar);

///////////////////////////   ACTUALIZAR REGISTROS /////////////////////////////////
const actualizar = require('./routers/update.js');
app.use('/modif', actualizar);

///////////////////////////   INICIAR EL  SERVIDOR /////////////////////////////////
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});




////////////////////// CODIGO DE AFICIONES ////////////////////////////////
connection.connect((err) => {
  if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return;
  }
  console.log('Conectado a la base de datos MySQL.');
});

app.get('/datos', (req, res) => {
  connection.query("SELECT ID_aficion,Nombre_aficion FROM aficiones", (err, rows) => {
      if (err) {
          console.error('Error al ejecutar la consulta:', err);
          res.status(500).send('Error interno del servidor');
          return;
      }
      res.json(rows);
  });
});