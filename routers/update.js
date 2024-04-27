const express = require('express');

const actualizar = express.Router();  //Este objeto es que vamos a exportar

const url = require('url');
const connection = require('../database.js');



  //Página para presentar datos para actualizar los grupos
  actualizar.get('/groups', (req, res)=> {
    const parametro = url.parse(req.url, true);
    const idg = parametro.query.idg;
    const query = 'SELECT * FROM grupos WHERE ID_grupo="' + idg + '"';
    connection.query(query, (error, results) => { 
      if (error) {
        console.error('Error al obtener los registros de la tabla "grupos": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.render('updateGrupos', { groups: results });
      }
     });
  })
  
  // Página de actualización de grupos
  actualizar.post('/groups', (req, res) => {
    const { name, desc, idg} = req.body;
    const query = 'UPDATE grupos SET Nombre_grupo = ?, Descripcion = ? WHERE ID_grupo =?';
    connection.query(query, [name, desc, idg], (error, result) => {
      if (error) {
        console.error('Error al insertar el nuevo registro en la tabla "grupos": ', error);
        res.status(500).send('Error del servidor');
      } else {
        res.redirect('../list/groups');
      }
    });
  });

  module.exports = actualizar;