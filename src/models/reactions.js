const mongoose = require("mongoose");

const reactionSchema = mongoose.Schema({
    "_id": {
        type: String
    },
    "_likes": {
        type: mongoose.Schema.Types.Array
    },
    "_dislikes": {
        type: mongoose.Schema.Types.Array
    },
})

module.exports = mongoose.model("reaccione", reactionSchema);