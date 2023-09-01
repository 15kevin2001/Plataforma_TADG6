const express = require("express");
const projectSchema = require("../models/projects.js");

const router = express.Router();

//crear usuario
router.post("/project",(req,res)=>{
    const projects = projectSchema(req.body);
    projects.save()
    .then((data)=> res.json(data))
    .catch((err) => res.json({message: err}));
});

//obtener usuarios
/*router.get("/usersIntern",(req,res)=>{
    userSchema.find()
    .then((data)=> res.json(data))
    .catch((err) => res.json({message: err}));
    //res.send("create user");
})

//validar existencia de cuenta
router.get("/checkEmail_usersIntern", async (req, res) => {
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
});*/

//obtener projectos con correo de creador en específico
router.get("/project_byEmailAdmin", async (req, res) => {
    const { email } = req.query;

    try {
        const projects = await projectSchema.find({ "_administrador": email });

        if (projects) {
            res.json(projects);
        } else {
            res.status(404).json({ "message": `ningún proyecto creado por ${email} fue encontrado` });
        }
    } catch (error) {
        res.json({ "message": error });
    }
});


//obtener projecto por id
router.get("/project_byId", async (req, res) => {
    const { id } = req.query;

    try {
        const projects = await projectSchema.findOne({ "_id": id });

        if (projects) {
            res.json(projects);
        } else {
            res.status(404).json({ "message": `ningún proyecto con id ${id} fue encontrado` });
        }
    } catch (error) {
        res.json({ "message": error });
    }
});

//luego de inscribir a una persona, se actualizan los puestos disponibles
router.put("/project_updatePosition", async (req, res) => {
    const { projectCode, positionCode } = req.body;

    try {
        const project = await projectSchema.findOne({ "_id": projectCode });
        if (!project) {
            return res.status(404).json({ "message": `Proyecto no encontrado` });
        }

        const position = project._puestos.find(p => p._id === positionCode);
        if (!position) {
            return res.status(404).json({ "message": `Puesto no encontrado en este proyecto` });
        }

        if (position._cantidad > 1) {
            console.log("cantidad > 1");
            // Actualizar cantidad y estado
            await projectSchema.findOneAndUpdate(
                { "_id": projectCode, "_puestos._id": positionCode },
                {
                    $inc: { "_puestos.$._cantidad": -1 },
                    $set: { "_puestos.$._estado": true }
                }
            );
        } else if (position._cantidad === 1) {
            console.log("cantidad == 1");
            // Actualizar cantidad a 0 y estado a false
            await projectSchema.findOneAndUpdate(
                { "_id": projectCode, "_puestos._id": positionCode },
                {
                    $set: { "_puestos.$._cantidad": 0, "_puestos.$._estado": false }
                }
            );
        }
        res.status(200).json({ "message": "Actualización exitosa" });
    } catch (error) {
        res.status(500).json({ "message": "Error interno del servidor" });
    }
});


router.get("/project_availablePositions", async (req, res) => {
    const { id } = req.query;

    try {
        const project = await projectSchema.findOne({ "_id": id });

        if (!project) {
            return res.status(404).json({ "message": `Proyecto no encontrado` });
        }

        const availablePositions = project._puestos.filter(position => position._estado === true);

        res.status(200).json(availablePositions);
    } catch (error) {
        res.status(500).json({ "message": "Error interno del servidor" });
    }
});

router.get("/project_notAvailablePositions", async (req, res) => {
    const { id } = req.query;

    try {
        const project = await projectSchema.findOne({ "_id": id });

        if (!project) {
            return res.status(404).json({ "message": `Proyecto no encontrado` });
        }

        const notAvailablePositions = project._puestos.filter(position => position._estado === false);

        res.status(200).json(notAvailablePositions);
    } catch (error) {
        res.status(500).json({ "message": "Error interno del servidor" });
    }
});

/*
//eliminar un usuario
router.delete("/usersIntern_delete", async (req, res) => {
    const { email } = req.query;

    try {
        const deletedUser = await projectSchema.findOneAndDelete({ "_Correo": email });

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
router.put("/usersIntern_update", async (req, res) => {
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
});*/

module.exports = router;