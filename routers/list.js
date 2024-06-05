const express = require('express');
const listar = express.Router();  //Este objeto es que vamos a exportar


const url = require('url');
const connection = require('../database.js');


 //Página para presentar los datos del perfil según su ID
 listar.get('/perfil', (req, res)=> {
  const parametro = url.parse(req.url, true);
  const idusuario = parametro.query.ID_usuario;
  const query = 'SELECT * FROM usuarios WHERE `ID_usuario`="' + idusuario + '"';
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los registros de la tabla "usuarios": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.render('perfilindividual', { perfil: results });
    }
  });
});

 //Página para presentar las conversaciones del usuario según su ID
 listar.get('/chats', (req, res) => {
  const idUsuario = req.query.Usuario1;

  // Consulta SQL para obtener conversaciones únicas del usuario
  const query = `
    SELECT DISTINCT 
      c.ID_conversacion, 
      c.Usuario1, 
      u1.Nombre AS NombreUsuario1, 
      c.Usuario2, 
      u2.Nombre AS NombreUsuario2 
    FROM conversacion c
    JOIN usuarios u1 ON c.Usuario1 = u1.ID_usuario
    JOIN usuarios u2 ON c.Usuario2 = u2.ID_usuario
    WHERE c.Usuario1 = ? OR c.Usuario2 = ?`;

  connection.query(query, [idUsuario, idUsuario], (error, results) => {
    if (error) {
      console.error('Error al obtener los registros de la tabla "conversacion": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.render('listaconversaciones', { conversaciones: results });
    }
  });
});

module.exports = listar;
