const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;

const connection = require('./database.js');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/presentacion.html');
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

app.post('/signup', (req, res) => {
  const cuenta = {
    Nombre: req.body.Nombre,
    Mail: req.body.Mail,
    Contrasena: req.body.Contrasena,
    Ubicación: req.body.Ubicación,
    Miembro: req.body.Miembro
  };

  connection.query('INSERT INTO Usuarios SET ?', cuenta, (error, results) => {
    if (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).send('Error interno del servidor al registrar el usuario');
      return;
    }

    req.session.ID_usuario = results.insertId;
    req.session.Mail = req.body.Mail;

    res.redirect('/aficiones');
  });
});

// Se ha cambiado el nombre de 'inicio' a 'principal' en app.get y app.post

app.get('/principal', (req, res) => {
  const queryUsuario = `
    SELECT ID_usuario, Nombre, Mail, Ubicación
    FROM usuarios
    ORDER BY RAND() LIMIT 1;
  `;

  connection.query(queryUsuario, (errorUsuario, resultsUsuario) => {
    if (errorUsuario) {
      console.error('Error al obtener el usuario:', errorUsuario);
      res.status(500).send('Error interno del servidor al obtener el usuario');
      return;
    }

    if (resultsUsuario.length === 0) {
      res.status(404).send('No se encontraron usuarios');
      return;
    }

    const userID = resultsUsuario[0].ID_usuario;

    const queryAficiones = `
      SELECT a.Nombre_aficion
      FROM usuario_aficion ua
      INNER JOIN aficiones a ON ua.ID_aficion = a.ID_aficion
      WHERE ua.ID_usuario = ?
    `;

    connection.query(queryAficiones, [userID], (errorAficiones, resultsAficiones) => {
      if (errorAficiones) {
        console.error('Error al obtener las aficiones del usuario:', errorAficiones);
        res.status(500).send('Error interno del servidor al obtener las aficiones del usuario');
        return;
      }

      const usuario = {
        ID_usuario: resultsUsuario[0].ID_usuario,
        Nombre: resultsUsuario[0].Nombre,
        Mail: resultsUsuario[0].Mail,
        Ubicación: resultsUsuario[0].Ubicación,
        Aficiones: resultsAficiones.map(row => row.Nombre_aficion)
      };

      res.render('index', { user: usuario });
    });
  });
});

app.post('/principal', (req, res) => {
  const mail = req.body.Mail;
  const contrasena = req.body.Contrasena;

  connection.query('SELECT * FROM usuarios WHERE Mail = ? AND Contrasena = ?', [mail, contrasena], (error, results) => {
    if (error) {
      console.error('Error al verificar las credenciales de inicio de sesión:', error);
      res.status(500).send('Error interno del servidor al verificar las credenciales de inicio de sesión');
      return;
    }

    if (results.length > 0) {
      req.session.ID_usuario = results[0].ID_usuario;
      req.session.Mail = mail;

      const script = `
        <script>
          sessionStorage.setItem('userID', '${results[0].ID_usuario}');
          window.location.href = '/principal';
        </script>
      `;

      res.send(script);
    } else {
      res.redirect('/erroracceso');
    }
  });
});

// Esto soluciona el mapa de la dirección de aficiones cuando se crea el usuario

app.get('/aficiones', (req, res) => {
  res.sendFile(__dirname + '/aficiones.html');
});

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
    res.redirect('/login');
  });
});

app.get('/membresia', (req, res) => {
  res.render('membresia');
});

// Ruta para obtener una conversación

app.get('/chat', (req, res) => {
  const ID_conversacion = req.query.ID_conversacion;
  res.render('chat', { ID_conversacion });
});

// Ruta para establecer una conversación
app.post('/chat/conversacion', (req, res) => {
  const { Usuario1, Usuario2 } = req.body;

  const queryConversacion = `
    SELECT ID_conversacion FROM conversacion
    WHERE (Usuario1 = ? AND Usuario2 = ?) OR (Usuario1 = ? AND Usuario2 = ?)
  `;

  connection.query(queryConversacion, [Usuario1, Usuario2, Usuario2, Usuario1], (error, results) => {
    if (error) {
      console.error('Error al obtener la conversación:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener la conversación' });
      return;
    }

    if (results.length > 0) {
      // La conversación ya existe
      res.json({ ID_conversacion: results[0].ID_conversacion });
    } else {
      // Crear una nueva conversación
      const insertConversacion = `
        INSERT INTO conversacion (Usuario1, Usuario2)
        VALUES (?, ?)
      `;

      connection.query(insertConversacion, [Usuario1, Usuario2], (error, results) => {
        if (error) {
          console.error('Error al crear la conversación:', error);
          res.status(500).json({ error: 'Error interno del servidor al crear la conversación' });
          return;
        }

        const nuevaIDConversacion = results.insertId;
        res.json({ ID_conversacion: nuevaIDConversacion });
      });
    }
  });
});

// Ruta para enviar un mensaje
app.post('/chat/mensaje', (req, res) => {
  const { ID_conversacion, Emisor, Texto } = req.body;

  const insertMensaje = `
    INSERT INTO mensaje (ID_conversacion, Emisor, Texto) VALUES (?, ?, ?)
  `;

  connection.query(insertMensaje, [ID_conversacion, Emisor, Texto], (error, results) => {
    if (error) {
      console.error('Error al enviar el mensaje:', error);
      res.status(500).json({ error: 'Error interno del servidor al enviar el mensaje' });
      return;
    }

    res.json({ success: true });
  });
});

// Ruta para obtener mensajes de una conversación
app.get('/chat/mensaje/:ID_conversacion', (req, res) => {
  const { ID_conversacion } = req.params;

  const queryMensaje = `
    SELECT m.*, u.Nombre as EmisorNombre
    FROM mensaje m
    JOIN usuarios u ON m.Emisor = u.ID_usuario
    WHERE ID_conversacion = ?
    ORDER BY m.Fecha DESC
  `;

  connection.query(queryMensaje, [ID_conversacion], (error, results) => {
    if (error) {
      console.error('Error al obtener los mensajes:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener los mensajes' });
      return;
    }

    res.json(results);
  });
});

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

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

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
      res.status(404).json({ error: 'Error de usuario' });
    }
  });
});

// Página del perfil de usuario individual
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

const listar = require('./routers/list.js');
app.use('/list', listar);

const eliminar = require('./routers/delete.js');
app.use('/delete', eliminar);

const actualizar = require('./routers/update.js');
app.use('/modif', actualizar);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
