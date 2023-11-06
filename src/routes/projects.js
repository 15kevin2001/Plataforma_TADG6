const express = require("express");
const projectSchema = require("../models/projects.js");
const positionSchema = require("../models/approvedPosition.js");
const reactionSchema = require("../models/reactions.js");

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

//puestos disponibles en un proyecto
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

//puestos ocupados en un proyecto
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

//proyectos por descubrir
router.get("/project_discover", async(req, res) => {
    const { email } = req.query;
    try {
        const projects = await projectSchema.find({ "_administrador": { $ne: email } });

        if (projects) {
            const filteredProjects = await Promise.all(projects.map(async(project) => {
                const cod = project._id;
                const position = await positionSchema.findOne({ "_codigo_proyecto": cod, "_correo": email });
                return position === null;
            }));

            const resultProjects = projects.filter((project, index) => filteredProjects[index]);
            //console.log(resultProjects);
            res.json(resultProjects);
        } else {
            res.status(404).json({ "message": `ningún proyecto por explorar para el email: ${email} fue encontrado` });
        }
    } catch (error) {
        res.json({ "message": error });
    }
});


//reaccionar (modificar la cantidad de likes dentro del proyecto)
router.put("/project_reactions", async(req, res) => {
    const { projectId, likes, dislikes } = req.body;

    try {
        // Encuentra el proyecto por su código y utiliza $inc para incrementar los likes
        const updatedProject = await projectSchema.findOneAndUpdate({ "_id": projectId }, { $inc: { "_likes": likes } }, { $inc: { "_dislikes": dislikes } }, { new: true } // Opcional: devuelve el proyecto actualizado
        );

        if (updatedProject) {
            res.json({ "message": "proyecto actualizado" });
        } else {
            res.status(404).json({ "message": `El proyecto con código ${projectCode} no se encontró.` });
        }
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});

//reacciones (modificar las reacciones relacionadas a cada usuario)
router.put("/reaction_user", async(req, res) => {
    //console.log(req.body);
    const { projectId: projectId, email: email, aux: reaction } = req.body;
    try {
        let reaction1 = await reactionSchema.findOne({ "_id": email });
        if (!reaction1) {
            // Si no existe una reacción para el usuario, crea una nueva
            reaction1 = new reactionSchema({ "_id": email, "_likes": [], "_dislikes": [] });
        }

        if (reaction === 'like') {
            // Elimina el código del proyecto de _dislikes si está presente
            reaction1._dislikes = reaction1._dislikes.filter(code => code !== projectId);
            // Agrega el código del proyecto a _likes si no está presente
            if (!reaction1._likes.includes(projectId)) {
                reaction1._likes.push(projectId);
            }
        } else if (reaction === 'dislike') {
            // Elimina el código del proyecto de _likes si está presente
            reaction1._likes = reaction1._likes.filter(code => code !== projectId);
            // Agrega el código del proyecto a _dislikes si no está presente
            if (!reaction1._dislikes.includes(projectId)) {
                reaction1._dislikes.push(projectId);
            }
        } else {
            reaction1._likes = reaction1._likes.filter(code => code !== projectId);
            reaction1._dislikes = reaction1._dislikes.filter(code => code !== projectId);
        }

        //console.log(reaction1)

        // Guarda la reacción actualizada en la base de datos
        reaction1.save();
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }

})

//reacciones (modificar las reacciones relacionadas a cada usuario)
router.get("/reaction_byUser", async(req, res) => {
    const { email } = req.query;
    try {
        const reactions = await reactionSchema.findOne({ "_id": email });

        if (reactions) {
            res.json(reactions);
        } else {
            res.status(404).json({ "message": `el email: ${email} no fue encontrado` });
        }
    } catch (error) {
        res.json({ "message": error });
    }
})



reactionSchema
module.exports = router;