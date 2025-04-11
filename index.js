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
    const { cedula, nombre, edad, profesion } = req.body;
    const query = 'INSERT INTO persona (cedula, nombre, edad, profesion) VALUES ($1, $2, $3, $4)';
    const values = [cedula, nombre, edad, profesion];

    connection.query(query, values, (error, result) => {
        if (error) {
            res.status(500).json({ message: 'LA API FALLO', error });
        } else {
            res.status(201).json({ cedula, nombre, edad, profesion });
        }
    });
});

// Supabase config
const supabaseUrl = 'https://uasthgdodkwddiekcyjw.supabase.co/rest/v1/persona';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhc3RoZ2RvZGt3ZGRpZWtjeWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTU2MjksImV4cCI6MjA1OTc5MTYyOX0.JIV51Ahb8szUZ5GIlg-Q9zN9_pw2NwMqQgCAgM9vZog';

// Obtener registros desde Supabase
app.get('/api/obtener', async (req, res) => {
    try {
        const response = await axios.get(supabaseUrl, {
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`
            }
        });

        res.status(200).json({
            success: true,
            message: 'Datos obtenidos correctamente',
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al recuperar los datos',
            details: error.message
        });
    }
});

// Eliminar registro
app.delete('/api/eliminar/:cedula', async (req, res) => {
    const { cedula } = req.params;

    try {
        const response = await axios.delete(`${supabaseUrl}?cedula=eq.${cedula}`, {
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: 'return=representation'
            }
        });

        if (response.data.length === 0) {
            res.status(404).json({
                success: false,
                message: `No existe el registro con cédula ${cedula}`
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Registro eliminado exitosamente',
                deleted: response.data
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el registro',
            details: error.message
        });
    }
});

// Actualizar registro
app.put('/api/actualizar/:cedula', async (req, res) => {
    const { cedula } = req.params;
    const { nombre, edad, profesion } = req.body;

    console.log("Body recibido:", req.body); // <-- VERIFICAR EL BODY

    try {
        const response = await axios.patch(`${supabaseUrl}?cedula=eq.${cedula}`,
            { nombre, edad, profesion },
            {
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                    Prefer: 'return=representation'
                }
            }
        );

        if (response.data.length === 0) {
            res.status(404).json({
                success: false,
                message: `No existe ningún registro con la cédula ${cedula}`
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Registro actualizado exitosamente',
                updated: response.data
            });
        }
    } catch (error) {
        console.error("Error de Supabase:", error.response?.data || error.message); // <-- VER DETALLES
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el registro',
            details: error.response?.data || error.message
        });
    }
});
