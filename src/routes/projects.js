const express = require("express");
const projectSchema = require("../models/projects.js");

const router = express.Router();

//crear proyecto
// Ruta para registrar un nuevo proyecto
router.post("/project", async(req, res) => {
    try {
        const { _descripcion, _objetivo, _titulo, _puestos } = req.body;

        // Verificar si se proporcionaron los campos obligatorios
        if (!_descripcion.trim() || !_objetivo.trim() || !_titulo.trim()) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        // Verificar si el número de puestos es menor o igual a 0
        if (_puestos.length <= 0) {
            return res.status(400).json({ error: "El número de puestos debe ser mayor a 0" });
        }

        // Verificar que todos los campos "_cantidad" sean mayores a 0
        if (_puestos.some((puesto) => puesto._cantidad <= 0)) {
            return res.status(400).json({ error: "Todas las cantidades de los puestos debe ser mayor a 0" });
        }

        // Crear el nuevo proyecto
        const nuevoProyecto = new projectSchema(req.body);

        // Guardar el proyecto en la base de datos
        const proyectoGuardado = await nuevoProyecto.save();

        return res.status(201).json({ mensaje: "Proyecto registrado exitosamente", proyecto: proyectoGuardado });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//obtener projectos con correo de creador en específico
router.get("/project_byEmailAdmin", async(req, res) => {
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
router.get("/project_byId", async(req, res) => {
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
router.put("/project_updatePosition", async(req, res) => {
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
            await projectSchema.findOneAndUpdate({ "_id": projectCode, "_puestos._id": positionCode }, {
                $inc: { "_puestos.$._cantidad": -1 },
                $set: { "_puestos.$._estado": true }
            });
        } else if (position._cantidad === 1) {
            console.log("cantidad == 1");
            // Actualizar cantidad a 0 y estado a false
            await projectSchema.findOneAndUpdate({ "_id": projectCode, "_puestos._id": positionCode }, {
                $set: { "_puestos.$._cantidad": 0, "_puestos.$._estado": false }
            });
        }
        res.status(200).json({ "message": "Actualización exitosa" });
    } catch (error) {
        res.status(500).json({ "message": "Error interno del servidor" });
    }
});


router.get("/project_availablePositions", async(req, res) => {
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

router.get("/project_notAvailablePositions", async(req, res) => {
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

module.exports = router;