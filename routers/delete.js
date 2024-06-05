const express = require('express');

const eliminar = express.Router();  //Este objeto es que vamos a exportar
const url = require('url');
const connection = require('../database.js');

  //Página para presentar datos para eliminar los usuarios
eliminar.get('/borcuenta', (req, res)=> {
  const parametro = url.parse(req.url, true);
  const iduser = parametro.query.ID_usuario;
  const query = 'SELECT * FROM usuarios WHERE ID_usuario= ?';
  connection.query(query, [iduser], (error, results) => {
    if (error) {
      console.error('Error al obtener los registros de la tabla "usuarios": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.render('updatePerfil', { perfil: results[0], userID: iduser });
    }
  });
});

// Página de eliminación de usuarios
                                ////////////// CUIDADO ////////////////////
/////////// Si todavía tengo registros en otras tablas dependientes de usuarios no se eliminarán ///////////////
eliminar.post('/borcuenta', (req, res) => {
  const {iduser} = req.body;
  const query = 'DELETE FROM usuarios WHERE ID_usuario = ?';
  connection.query(query, [iduser], (error, result) => {
    if (error) {
      console.error('Error al eliminar registro en la tabla "usuarios": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.redirect('/');
    }
  });
});
module.exports = eliminar;