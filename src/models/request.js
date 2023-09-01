const mongoose = require("mongoose");

const requestSchema = mongoose.Schema({
    "_codigo_proyecto": {
        type: String
    },
    "_codigo_puesto": {
        type: String
    },
    "_correo": {
        type: String
    },
})

module.exports = mongoose.model("Solicitud",requestSchema);