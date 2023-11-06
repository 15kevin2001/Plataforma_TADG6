const express = require("express");
const approvedSchema = require("../models/approvedPosition.js");
const projectSchema = require("../models/projects.js");


const router = express.Router();

//post para registrar a un puesto aprobado
router.post('/approvedPosition', async(req, res) => {
    try {
        const { _codigo_proyecto, _codigo_puesto, _correo } = req.body;

        // Verifica que los campos obligatorios estén presentes
        if (!_codigo_proyecto || _codigo_proyecto.trim() === '' || !_codigo_puesto || _codigo_puesto.trim() === '' || !_correo || _correo.trim() === '') {
            return res.status(400).json({ error: 'Los campos codigo_proyecto, codigo_puesto y correo son obligatorios y no deben estar vacíos.' });
        }
        // Verifica si el proyecto existe
        const project = await projectSchema.findOne({ _id: _codigo_proyecto });
        if (!project) {
            return res.status(400).json({ error: `No se encontró el proyecto con código ${_codigo_proyecto}` });
        }

        // Verifica si el puesto existe en el proyecto
        const position = project._puestos.find(p => p._id === _codigo_puesto);
        if (!position) {
            return res.status(400).json({ error: `No se encontró el puesto con código ${_codigo_puesto} dentro del proyecto ${project._titulo}` });
        }

        // Verifica si _cantidad del puesto es mayor a 0
        if (position._cantidad <= 0) {
            return res.status(400).json({ error: `El puesto ${position._nombre} no tiene vacantes disponibles` });
        }

        // Si las validaciones pasaron, puedes crear el registro de request
        const nuevoApproved = new approvedSchema(req.body);

        // Guardar el request en la base de datos
        const approvedGuardado = await nuevoApproved.save();

        // Envía una respuesta exitosa
        res.json({ message: `Registro exitoso al puesto ${position._nombre} del proyecto ${project._titulo}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//
router.get('/approvedPosition_byEmail', async(req, res) => {
    const { email } = req.query;
    try {
        // Verifica si hay puestos aprobados con el email
        const approved = await approvedSchema.find({ _correo: email });
        if (!approved) {
            return res.status(400).json({ error: `No se encontró puestos aprobados` });
        }

        res.json(approved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//
router.get('/approvedPosition_byProject', async(req, res) => {
    const { id } = req.query;
    try {
        // Verifica si hay puestos aprobados con el email
        const approved = await approvedSchema.find({ _codigo_proyecto: id });
        if (!approved) {
            return res.status(400).json({ error: `No se encontró puestos aprobados` });
        }

        res.json(approved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


//
router.get('/approvedProject_byEmail', async(req, res) => {
    const { email } = req.query;
    var busqueda = [];
    try {
        // Verifica si hay puestos aprobados con el email
        const approved = await approvedSchema.find({ _correo: email });
        if (approved) {
            approved.map((item, index) => {
                busqueda.push(item["_codigo_proyecto"]);
            })
            const projects = await projectSchema.find({ "_id": { $in: busqueda } });
            res.json(projects);
        } else {
            return res.status(400).json({ error: `No se encontró puestos aprobados` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



//obtener todos las solicitud de postulación para un proyecto y puesto en específico
/*router.get('/request_byPosition', async(req, res) => {
    try {
        const { id_project, id_position } = req.query;

        // Verifica si el proyecto existe
        const project = await projectSchema.findOne({ _id: id_project });
        if (!project) {
            return res.status(400).json({ error: `No se encontró el proyecto con código ${id_project}` });
        }

        // Verifica si el puesto existe en el proyecto
        const position = project._puestos.find(p => p._id === id_position);
        if (!position) {
            return res.status(400).json({ error: `No se encontró el puesto con código ${id_position} dentro del proyecto ${project._titulo}` });
        }

        // Busca las solicitudes para el proyecto y el puesto especificados
        const request = await requestSchema.find({
            "_codigo_proyecto": id_project,
            "_codigo_puesto": id_position,
        });

        res.json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});*/







module.exports = router;