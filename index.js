const express = require('express');
const connection = require('./db');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); // Solo se necesita una vez

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Corriendo en puerto ${PORT}`);
});

// Rutas de prueba
app.get('/api/prueba', (req, res) => {
    res.send('Api funcionando de manera correcta');
});

app.get('/api/prueba1', (req, res) => {
    res.status(200).json({
        message: 'LA API RESPONDE CORRECTAMENTE',
        port: PORT,
        status: 'success'
    });
});
// Crear registro (en base de datos local)
app.post('/api/guardar', (req, res) => {
    const { nombre, apellido1, apellido2, dni } = req.body;
    const query = 'INSERT INTO persona (nombre, apellido1, apellido2, dni) VALUES ($1, $2, $3, $4)';
    const values = [nombre, apellido1, apellido2, dni];

    connection.query(query, values, (error, result) => {
        if (error) {
            res.status(500).json({ message: 'Error al guardar la persona', error });
        } else {
            res.status(201).json({ nombre, apellido1, apellido2, dni });
        }
    });
});


// Supabase config
const supabaseUrl = 'https://xmuewcwnhnquajxtjnkn.supabase.co/rest/v1/persona';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdWV3Y3duaG5xdWFqeHRqbmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODkyMDgsImV4cCI6MjA1OTk2NTIwOH0.QmMUPwwzGzv3ccbqK0GSU0MPakT_6cxKh4pLXJnWwFs';

// Obtener registros desde Supabase
app.get('/api/obtener', (req, res) => {
    const query = 'SELECT * FROM persona';

    connection.query(query, (error, result) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: 'Error al recuperar los datos',
                details: error.message
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Datos obtenidos correctamente',
                data: result.rows
            });
        }
    });
});


// Eliminar registro
app.delete('/api/eliminar/:dni', (req, res) => {
    const { dni } = req.params;

    const query = 'DELETE FROM persona WHERE dni = $1 RETURNING *';
    const values = [dni];

    connection.query(query, values, (error, result) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el registro',
                details: error.message
            });
        } else if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: `No existe el registro con DNI ${dni}`
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Registro eliminado exitosamente',
                deleted: result.rows[0]
            });
        }
    });
});

// Actualizar registro
app.put('/api/actualizar/:dni', (req, res) => {
    const { dni } = req.params;
    const { nombre, apellido1, apellido2, marca, modelo, caballos } = req.body;
  
    const queryPersona = `
      UPDATE persona 
      SET nombre = $1, apellido1 = $2, apellido2 = $3 
      WHERE dni = $4 
      RETURNING *;
    `;
    const valuesPersona = [nombre, apellido1, apellido2, dni];
  
    connection.query(queryPersona, valuesPersona, (errorPersona, resultPersona) => {
      if (errorPersona) {
        return res.status(500).json({
          success: false,
          message: 'Error al actualizar persona',
          error: errorPersona
        });
      }
  
      if (resultPersona.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: `No se encontró ninguna persona con el DNI ${dni}`
        });
      }
  
      const queryCoche = `
        UPDATE coche 
        SET marca = $1, modelo = $2, caballos = $3
        WHERE persona_id = $4 
        RETURNING *;
      `;
      const valuesCoche = [marca, modelo, caballos, dni];
  
      connection.query(queryCoche, valuesCoche, (errorCoche, resultCoche) => {
        if (errorCoche) {
          return res.status(500).json({
            success: false,
            message: 'Error al actualizar coche',
            error: errorCoche
          });
        }
  
        res.status(200).json({
          success: true,
          message: 'Persona y coche actualizados correctamente',
          persona: resultPersona.rows[0],
          coche: resultCoche.rows[0]
        });
      });
    });
  });
  
  