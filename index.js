const express = require("express");
const connection = require("./db");
const path = require("path");
const cors = require("cors"); //Importa el paquete de cors

const app = express();
//Habilita cors para todas las solicitudes - Se debe instalar el corse
//app.use(cors()); // esto permite todas la solicitudes cors 

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/api/prueba", (req,res)=>{
    res.send("Api Funcionando Correctamente");
}); 

app.get("/api/prueba1", (req, res)=>{
    res.status(200).json ({
        message: "LA API RESPONDE CORRECTAMENTE",
        port: PORT,
        status: "success"
    });
});

// Puerto de Conexion del Servidor
const PORT = 3000;
app.listen(PORT, () =>{
    console.log("Servidor Corriendo");
});
