const express = require("express");
const userSchema = require("../models/userIntern.js");

const router = express.Router();

//crear usuario
router.post("/usersIntern", (req, res) => {
    const user = userSchema(req.body);
    user.save()
        .then((data) => res.json(data))
        .catch((err) => res.json({ message: err }));
    //res.send("create user");
});

//obtener usuarios
router.get("/usersIntern", (req, res) => {
    userSchema.find()
        .then((data) => res.json(data))
        .catch((err) => res.json({ message: err }));
    //res.send("create user");
})

//validar existencia de cuenta
router.get("/checkEmail_usersIntern", async(req, res) => {
    const { email } = req.query;

    try {
        const existingUser = await userSchema.findOne({ "_Correo": email });

        if (existingUser) {
            res.json({ "encontrado": true });
        } else {
            res.json({ "encontrado": false });
        }
    } catch (error) {
        res.json({ "message": error });
    }
});

//obtener usuario con correo específico
router.get("/usersIntern_byEmail", async(req, res) => {
    const { email } = req.query;

    try {
        const user = await userSchema.findOne({ _Correo: email });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ "message": "Usuario no encontrado" });
        }
    } catch (error) {
        res.json({ "message": error });
    }
});

//eliminar un usuario
router.delete("/usersIntern_delete", async(req, res) => {
    const { email } = req.query;

    try {
        const deletedUser = await userSchema.findOneAndDelete({ "_Correo": email });

        if (deletedUser) {
            res.json({ "message": "Usuario eliminado correctamente" });
        } else {
            res.status(404).json({ "message": "Usuario no encontrado" });
        }
    } catch (error) {
        res.json({ "message": error });
    }
});

//actualizar un usuario interno
router.put("/usersIntern_update", async(req, res) => {
    const { email } = req.query;
    const newData = req.body; // Suponemos que los nuevos datos se enviarán en el cuerpo de la solicitud

    try {
        const updatedUser = await userSchema.findOneAndUpdate({ "_Correo": email }, newData, { new: true });

        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.json({ message: error });
    }
});

// Verificar credenciales y obtener usuario por correo y contraseña
router.post("/usersIntern_login", async(req, res) => {
    console.log("peticion de login");
    const { _Correo, _Contraseña } = req.body;
    console.log(_Correo);
    console.log(_Contraseña);
    try {
        const user = await userSchema.findOne({ "_Correo": _Correo, "_Contraseña": _Contraseña });
        if (user) {
            res.json({ message: "Credenciales válidas: Usuario existe." });
        } else {
            res.json({ message: "Credenciales inválidas: Usuario no encontrado o contraseña incorrecta." });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;