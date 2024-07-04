const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    "_Contraseña": {
        type: String
    },
    "_Correo": {
        type: String
    },
    "_Apellido": {
        type: String
    },
    "_Nombre": {
        type: String
    },
    "_Carrera": {
        type: String
    },
    "_Facultad": {
        type: String
    },
    "_Gustos": {
        type: mongoose.Schema.Types.Array
    },
    "_Universidad": {
        type: String
    },
    "_Enlace_Portafolio": {
        type: String
    },
    "_Enlace_Presentacion": {
        type: String
    },
    "_Foto_Perfil": {
        type: mongoose.Schema.Types.Buffer
    },
    "_Enlace_Linkedln": {
        type: String
    }
})

module.exports = mongoose.model("Usuario Interno", userSchema);