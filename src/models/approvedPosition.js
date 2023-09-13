const mongoose = require("mongoose");

const approvedPositionSchema = mongoose.Schema({
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

module.exports = mongoose.model("PuestoAprobado", approvedPositionSchema);