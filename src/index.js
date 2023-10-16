const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const requestRoutes = require("./routes/Request.js");
const userRoutes = require("./routes/userIntern.js");
const projectRoutes = require("./routes/projects.js");
const approvedPosition = require("./routes/approvedPosition.js");
const cors = require("cors");

dotenv.config();


const app = express();


const port = process.env.PORT || 9000;

//middleware
app.use(express.json());
app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200 // Agrega esto para que el estado de éxito de las solicitudes OPTIONS sea 200
})); // Habilita CORS para todas las rutas
app.options("*", cors());
app.use("/api", userRoutes);
app.use("/api", requestRoutes);
app.use("/api", projectRoutes);
app.use("/api", approvedPosition);

//routes
app.get("/", (req, res) => {
    res.send("bienvenido a la api");
});

//creando la conexión con mongo db
mongoose.connect(
        process.env.MONGODB_URI
    )
    .then(() => console.log("Contectado a la base de datos mongoDB"))
    .catch((err) => { console.error(err) });

app.listen(port, () => {
    console.log("server escuchando en el puerto ", port)
});