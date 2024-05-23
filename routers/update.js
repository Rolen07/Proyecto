const express = require('express');
const actualizar = express.Router(); // Este objeto es que vamos a exportar
const connection = require('../database.js');

// Página para presentar datos para actualizar el perfil del usuario
actualizar.get('/actdatos', (req, res) => {
  const iduser = parametro.query.ID_usuario;
  const query = 'SELECT * FROM usuarios WHERE `ID_usuario`="' + iduser + '"';
  connection.query(query, [userID], (error, results) => {
    if (error) {
      console.error('Error al obtener los registros de la tabla "usuarios": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.render('updatePerfil', { perfil: results[0], userID: userID });
    }
  });
});

// Página de actualización del perfil del usuario
actualizar.post('/actdatos', (req, res) => {
  const { name, mail, ubicacion, iduser } = req.body;
  const query = 'UPDATE usuarios SET Nombre = ?, Mail = ?, Ubicación = ? WHERE ID_usuario = ?';
  connection.query(query, [name, mail, ubicacion, iduser], (error, result) => {
    if (error) {
      console.error('Error al actualizar el registro en la tabla "usuarios": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.redirect('/principal');
    }
  });
});

module.exports = actualizar;
