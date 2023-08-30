const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userIntern.js");

dotenv.config();


const app = express();

const port = process.env.PORT || 9000;

//middleware
app.use(express.json());
app.use("/api",userRoutes);


//routes
app.get("/",(req,res)=>{
    res.send("bienvenido a la api");
});

//creando la conexión con mongo db
mongoose.connect(
    process.env.MONGODB_URI
)
.then(()=>console.log("Contectado a la base de datos mongoDB"))
.catch((err)=>{console.error(err)});

app.listen(port, ()=>{
    console.log("server escuchando en el puerto ", port)
});