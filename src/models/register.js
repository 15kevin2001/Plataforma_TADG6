const mongoose = require("mongoose");

const registerSchema = mongoose.Schema({
    "_codigo_proyecto": {
        type: String
    },
    "_codigo_puesto": {
        type: String
    },
    "_correo": {
        type: String
    },
    "_link_perfil": {
        type: String
    },
    "_mensaje": {
        type: String
    },
})

module.exports = mongoose.model("Registro",registerSchema);

