const express = require('express');
const listar = express.Router();  //Este objeto es que vamos a exportar


const url = require('url');
const connection = require('../database.js');



// Ruta para obtener todos los registros de la tabla "usuarios"
  listar.get('/users', (req, res) => {
    const userID = sessionStorage.getItem('userID');
    const query = 'SELECT * FROM usuarios WHERE ID_usuario IN (SELECT ID_usuario FROM usuario_aficion WHERE ID_aficion IN (SELECT ID_aficion FROM usuario_aficion WHERE ID_usuario = ${userID})) ORDER BY RAND() LIMIT 1';
  
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error al obtener los registros de la tabla "usuarios": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.render('usuarios', { users: results });
      }
    });
});


  
// Ruta para obtener todos los registros de la tabla "grupos"
listar.get('/groups', (req, res) => {
  const query = 'SELECT * FROM grupos';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los registros de la tabla "grupos": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.render('grupos', {groups: results });
    }
  });
});

// Ruta para obtener todos los registros de la tabla "miembros"
listar.get('/members', (req, res) => {
  const query = 'SELECT miembros.ID_miembro, usuarios.Nombre AS username, grupos.Nombre_grupo AS groupname, miembros.Fecha_ingreso FROM miembros, usuarios, grupos WHERE miembros.ID_usuario = usuarios.ID_usuario AND miembros.ID_grupo = grupos.ID_grupo ORDER BY miembros.ID_miembro ASC';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los registros de la tabla "miembros": ', error);
      res.status(500).send('Error del servidor');
    } else {
      res.render('miembros', { members: results });
    }
  });
});
  


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
  const query = 'SELECT DISTINCT ID_conversacion, Usuario1, Usuario2 FROM conversacion WHERE Usuario1 = ? OR Usuario2 = ?';

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