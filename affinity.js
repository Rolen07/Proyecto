const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const path = require('path');


const app = express();
const port = 3000;

const connection = require('./database.js');

app.use(express.static(path.join(__dirname, 'public')));    // Donde voya a colocar mis ficheros de imagen, css, javascript


// Configurar middleware para analizar el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');


///////////////////////////   VOLVER AL MENÚ DESDE CUALQUIER PÁGINA /////////////////////////////////
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


///////////////////////////   LISTAR REGISTROS /////////////////////////////////
const listar = require('./routers/list.js');
app.use('/list', listar);


///////////////////////////   ELIMINAR REGISTROS /////////////////////////////////
const eliminar = require('./routers/delete.js');
app.use('/delete', eliminar);

///////////////////////////   ACTUALIZAR REGISTROS /////////////////////////////////
const actualizar = require('./routers/update.js');
app.use('/modif', actualizar);

///////////////////////////   INICIAR EL  SERVIDOR /////////////////////////////////
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});