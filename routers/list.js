const express = require('express');
const listar = express.Router();  //Este objeto es que vamos a exportar


const url = require('url');
const connection = require('../database.js');



// Ruta para obtener todos los registros de la tabla "usuarios"
  listar.get('/users', (req, res) => {
    const query = 'SELECT * FROM usuarios';
  
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
  


module.exports = listar;