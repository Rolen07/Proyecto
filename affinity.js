const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const ejs = require('ejs');
const path = require('path');


const app = express();
const port = 3000;

const connection = require('./database.js');

app.use(express.static(path.join(__dirname, 'public')));    // Donde voya a colocar mis ficheros de imagen, css, javascript

// Sesión de express-session

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));

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

app.post('/signup', (req, res) => {
  // Verificar las credenciales del usuario
  if (usuarioValido) {
      // Crear una sesión de usuario
      req.session.ID_usuario = usuario.ID_usuario;
      req.session.Mail = usuario.Mail;
      res.send('Iniciaste sesión correctamente');
  } else {
      res.send('Credenciales incorrectas');
  }
});





app.post('/login', (req, res) => {
  // Verificar las credenciales del usuario
  if (usuarioValido) {
      // Crear una sesión de usuario
      req.session.usuarioId = usuario.id;
      req.session.username = usuario.username;
      res.send('Iniciaste sesión correctamente');
  } else {
      res.send('Credenciales incorrectas');
  }
});



// Obtención de la página aficiones
app.get('/aficiones', (req, res) => {
  res.sendFile(__dirname + '/aficiones.html');
});

// Ruta de registro de aficiones

app.post('/aficiones', (req, res) => {
  // Obtener el ID del usuario de la sesión
  const ID_usuario = req.session.ID_usuario; // Suponiendo que has guardado el ID del usuario en la sesión durante el inicio de sesión
  
  // Crear el objeto con los datos de la afición
  const aficioncuenta = {
    ID_usuario: ID_usuario, // Usar el ID del usuario de la sesión
    ID_aficion: req.body.ID_aficion,
  };

  // Insertar el registro en la base de datos
  connection.query('INSERT INTO usuario_aficion SET ?', aficioncuenta, (error, results) => {
    if (error) {
      console.error('Error al registrar la afición:', error);
      res.status(500).send('Error interno del servidor al registrar la afición');
      return;
    }
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