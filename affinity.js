const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;

const connection = require('./database.js');
app.use(express.static(path.join(__dirname, 'public')));  // Donde vas a colocar tus ficheros de imagen, css, javascript

// Configurar middleware para analizar el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar el motor de vistas EJS
app.set('view engine', 'ejs');

// Configurar middleware de sesión
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));

// Página de presentación
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/presentacion.html');
});

// Ruta de registro de usuarios
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

// Ruta de registro de usuario y creación de sesión
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
    if (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).send('Error interno del servidor al registrar el usuario');
      return;
    }

    // Crear la sesión de usuario con el ID del usuario recién insertado
    req.session.ID_usuario = results.insertId;
    req.session.Mail = req.body.Mail;

    res.sendFile(__dirname + '/aficiones.html');
  });
});

// Fichero de página de inicio
app.get('/inicio', (req, res) => {
  const query = `
    SELECT u.ID_usuario, u.Nombre, u.Mail, u.Ubicación, a.Nombre_aficion
    FROM usuarios u
    LEFT JOIN usuario_aficion ua ON u.ID_usuario = ua.ID_usuario
    LEFT JOIN aficiones a ON ua.ID_aficion = a.ID_aficion
    ORDER BY RAND() LIMIT 1;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener el usuario y sus aficiones:', error);
      res.status(500).send('Error interno del servidor al obtener el usuario y sus aficiones');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('No se encontraron usuarios');
      return;
    }

    // Agrupar aficiones del usuario seleccionado
    const usuario = {
      ID_usuario: results[0].ID_usuario,
      Nombre: results[0].Nombre,
      Mail: results[0].Mail,
      Ubicación: results[0].Ubicación,
      Aficiones: results.map(row => row.Nombre_aficion).filter(aficion => aficion !== null)
    };

    // Renderizar la vista y pasar el usuario
    res.render('index', { user: usuario });
  });
});

// Ruta de inicio de sesión
app.post('/inicio', (req, res) => {
  const mail = req.body.Mail;
  const contrasena = req.body.Contrasena;

  // Realizar consulta a la base de datos para verificar el inicio de sesión
  connection.query('SELECT * FROM usuarios WHERE Mail = ? AND Contrasena = ?', [mail, contrasena], (error, results) => {
    if (error) {
      console.error('Error al verificar las credenciales de inicio de sesión:', error);
      res.status(500).send('Error interno del servidor al verificar las credenciales de inicio de sesión');
      return;
    }

    if (results.length > 0) {
      // Crear la sesión de usuario
      req.session.ID_usuario = results[0].ID_usuario;
      req.session.Mail = mail;
      
      // Realizar otra consulta para obtener un usuario aleatorio con sus aficiones
      const query = `
        SELECT u.ID_usuario, u.Nombre, u.Mail, u.Ubicación, a.Nombre_aficion
        FROM usuarios u
        LEFT JOIN usuario_aficion ua ON u.ID_usuario = ua.ID_usuario
        LEFT JOIN aficiones a ON ua.ID_aficion = a.ID_aficion
        ORDER BY RAND() LIMIT 1;
      `;

      connection.query(query, (error, results) => {
        if (error) {
          console.error('Error al obtener el usuario:', error);
          res.status(500).send('Error interno del servidor al obtener el usuario');
          return;
        }

        if (results.length === 0) {
          res.status(404).send('No se encontraron usuarios');
          return;
        }

        // Agrupar aficiones del usuario seleccionado
        const usuario = {
          ID_usuario: results[0].ID_usuario,
          Nombre: results[0].Nombre,
          Mail: results[0].Mail,
          Ubicación: results[0].Ubicación,
          Aficiones: results.map(row => row.Nombre_aficion).filter(aficion => aficion !== null)
        };

        // Renderizar la vista y pasar el usuario
        res.render('index', { user: usuario });
      });
    } else {
      res.redirect('/erroracceso');
    }
  });
});

// Obtención de la página aficiones
app.get('/aficiones', (req, res) => {
  res.render('aficiones');
});

// Ruta de registro de aficiones
app.post('/aficiones', (req, res) => {
  const ID_usuario = req.session.ID_usuario;
  const aficionesSeleccionadas = req.body.ID_aficion;

  const datosAficiones = aficionesSeleccionadas.map(ID_aficion => [ID_usuario, ID_aficion]);

  connection.query('INSERT INTO usuario_aficion (ID_usuario, ID_aficion) VALUES ?', [datosAficiones], (error, results) => {
    if (error) {
      console.error('Error al registrar las aficiones:', error);
      res.status(500).send('Error interno del servidor al registrar las aficiones');
      return;
    }
    res.render('index');
  });
});

// Ruta para obtener datos de aficiones
app.get('/datos', (req, res) => {
  connection.query("SELECT ID_aficion, Nombre_aficion FROM aficiones", (err, rows) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }
    res.json(rows);
  });
});

// Ruta de inicio de sesión
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Ruta para obtener el ID del usuario
app.get('/obtenerIdUsuario', (req, res) => {
  const mail = req.query.Mail;

  connection.query('SELECT ID_usuario FROM Usuarios WHERE Mail = ?', [mail], (error, results) => {
    if (error) {
      console.error('Error al obtener el ID del usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener el ID del usuario' });
      return;
    }

    if (results.length > 0) {
      res.json({ ID_usuario: results[0].ID_usuario });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

// Rutas para listar, eliminar y actualizar registros
const listar = require('./routers/list.js');
app.use('/list', listar);

const eliminar = require('./routers/delete.js');
app.use('/delete', eliminar);

const actualizar = require('./routers/update.js');
app.use('/modif', actualizar);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
