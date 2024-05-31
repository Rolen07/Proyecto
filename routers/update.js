const express = require('express');
const actualizar = express.Router(); // Este objeto es el que vamos a exportar
const connection = require('../database.js');

// Página para presentar datos para actualizar el perfil del usuario
actualizar.get('/actdatos', (req, res) => {
  const iduser = req.query.ID_usuario;
  const query = 'SELECT * FROM usuarios WHERE ID_usuario = ?';
  connection.query(query, [iduser], (error, results) => {
    if (error) {
      console.error('Error al obtener los registros de la tabla "usuarios": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.render('updatePerfil', { perfil: results[0], userID: iduser });
    }
  });
});

// Página de actualización del perfil del usuario
actualizar.post('/actdatos', (req, res) => {
  const { name, mail, ubicacion, contrasena, iduser } = req.body;
  const query = 'UPDATE usuarios SET Nombre = ?, Mail = ?, Ubicación = ?, Contrasena = ? WHERE ID_usuario = ?';
  connection.query(query, [name, mail, ubicacion, contrasena, iduser], (error, result) => {
    if (error) {
      console.error('Error al actualizar el registro en la tabla "usuarios": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.redirect('/principal');
    }
  });
});

// Página de actualización del perfil del usuario
actualizar.post('/actmembresia', (req, res) => {
  const { userID } = req.body;
  const query = 'UPDATE usuarios SET Miembro = "SI" WHERE ID_usuario = ?';
  connection.query(query, [userID], (error, result) => {
    if (error) {
      console.error('Error al actualizar el registro en la tabla "usuarios": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.redirect('/principal');
    }
  });
});

module.exports = actualizar;