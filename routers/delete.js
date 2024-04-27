const express = require('express');

const eliminar = express.Router();  //Este objeto es que vamos a exportar
const url = require('url');
const connection = require('../database.js');


//Página para presentar datos para eliminar los usuarios
eliminar.get('/users', (req, res)=> {
    const parametro = url.parse(req.url, true);
    const idu = parametro.query.idu;
    const query = 'SELECT * FROM usuarios WHERE ID_usuario="' + idu + '"';
    connection.query(query, (error, results) => { 
      if (error) {
        console.error('Error al obtener los registros de la tabla "usuarios": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.render('deleteUsuarios', { users: results });
      }
     });
  })
  
  // Página de eliminación de usuarios
                                  ////////////// CUIDADO ////////////////////
  /////////// Si todavía tengo registros en otras tablas dependientes de usuarios no se eliminarán ///////////////
  eliminar.post('/users', (req, res) => {
    const {idu} = req.body;
    const query = 'DELETE FROM usuarios WHERE ID_usuario = ?';
    connection.query(query, [idu], (error, result) => {
      if (error) {
        console.error('Error al eliminar registro en la tabla "usuarios": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.redirect('../list/users');
      }
    });
  });
  
  
  //Página para presentar datos para eliminar los grupos
  eliminar.get('/groups', (req, res)=> {
    const parametro = url.parse(req.url, true);
    const idg = parametro.query.idg;
    const query = 'SELECT * FROM grupos WHERE ID_grupo="' + idg + '"';
    connection.query(query, (error, results) => { 
      if (error) {
        console.error('Error al obtener los registros de la tabla "grupos": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.render('deleteGrupos', { groups: results });
      }
     });
  })
  
  // Página de eliminación de grupos
  eliminar.post('/groups', (req, res) => {
    const {idg} = req.body;
    const query = 'DELETE FROM grupos WHERE ID_grupo = ?';
    connection.query(query, [idg], (error, result) => {
      if (error) {
        console.error('Error al eliminar registro en la tabla "grupos": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.redirect('../list/groups');
      }
    });
  });
  
  
  //Página para presentar datos para eliminar los miembros
  eliminar.get('/members', (req, res)=> {
    const parametro = url.parse(req.url, true);
    const idm = parametro.query.idm;
    const query = 'SELECT miembros.ID_miembro, usuarios.Nombre AS username, grupos.Nombre_grupo AS groupname, miembros.Fecha_ingreso FROM miembros, usuarios, grupos WHERE miembros.ID_usuario = usuarios.ID_usuario AND miembros.ID_grupo = grupos.ID_grupo AND miembros.ID_miembro="' + idm + '"';
    connection.query(query, (error, results) => { 
      if (error) {
        console.error('Error al obtener los registros de la tabla "miembros": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.render('deleteMiembros', { members: results });
      }
     });
  })
  
  // Página de eliminación de miembros
  eliminar.post('/members', (req, res) => {
    const {idm} = req.body;
    const query = 'DELETE FROM miembros WHERE ID_miembro = ?';
    connection.query(query, [idm], (error, result) => {
      if (error) {
        console.error('Error al eliminar registro en la tabla "members": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.redirect('../list/members');
      }
    });
  });

module.exports = eliminar;