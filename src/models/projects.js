const mongoose = require("mongoose");

const positionSchema = mongoose.Schema({
    "_id": {
        type: String
    },
    "_nombre": {
        type: String
    },
    "_descripcion": {
        type: String
    },
    "_habilidades": {
        type: mongoose.Schema.Types.Array
    },
    "_estado": {
        type: mongoose.Schema.Types.Boolean
    },
    "_cantidad": {
        type: mongoose.Schema.Types.Number
    }
})

const projectSchema = mongoose.Schema({
    "_id": {
        type: String
    },
    "_administrador": {
        type: String
    },
    "_descripcion": {
        type: String
    },
    "_objetivo": {
        type: String
    },
    "_titulo": {
        type: String
    },
    "_tags": {
        type: mongoose.Schema.Types.Array
    },
    "_estado": {
        type: String
    },
    "_puestos": [positionSchema],
})


module.exports = mongoose.model("Proyecto",projectSchema);