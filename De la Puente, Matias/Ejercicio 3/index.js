import express from "express";

const app = express();
const puerto = 3000;

app.use(express.json());

let tareas = [];
let siguienteId = 0;

function validarTarea(nombre, completada, res) {
  if (nombre === undefined || completada === undefined) {
    res
      .status(400)
      .json({ success: false, mensaje: "Debe enviar nombre y completada" });
    return false;
  }

  if (typeof nombre !== "string" || nombre.trim() === "") {
    res
      .status(400)
      .json({
        success: false,
        mensaje: "El nombre debe ser texto y no puede estar vacío",
      });
    return false;
  }

  if (typeof completada !== "boolean") {
    res
      .status(400)
      .json({
        success: false,
        mensaje: "El campo completada debe ser true o false",
      });
    return false;
  }

  return true;
}

function validarIndice(indice, res) {
  if (isNaN(indice) || indice < 0 || indice >= tareas.length) {
    res.status(404).json({ success: false, mensaje: "Índice no encontrado" });
    return false;
  }
  return true;
}

function existeNombre(nombre, idExcluir = null) {
  return tareas.some(
    (tarea) =>
      tarea.nombre.toLowerCase() === nombre.toLowerCase() &&
      tarea.id !== idExcluir
  );
}

app.get("/tareas", (req, res) => {
  let resultado = [...tareas];

  const filtroEstado = req.query.completada;
  if (filtroEstado !== undefined) {
    if (filtroEstado === "true")
      resultado = resultado.filter((t) => t.completada === true);
    else if (filtroEstado === "false")
      resultado = resultado.filter((t) => t.completada === false);
    else
      return res
        .status(400)
        .json({
          success: false,
          mensaje: "El parámetro completada debe ser 'true' o 'false'",
        });
  }

  res.json({ success: true, data: resultado });
});

app.get("/tareas/:indice", (req, res) => {
  const indice = Number(req.params.indice);
  if (!validarIndice(indice, res)) return;

  res.json({ success: true, data: tareas[indice] });
});

app.post("/tareas", (req, res) => {
  const { nombre, completada } = req.body;

  if (!validarTarea(nombre, completada, res)) return;

  if (existeNombre(nombre)) {
    return res
      .status(400)
      .json({ success: false, mensaje: "Ya existe una tarea con ese nombre" });
  }

  const nuevaTarea = { id: siguienteId++, nombre: nombre.trim(), completada };
  tareas.push(nuevaTarea);

  res.status(201).json({ success: true, data: nuevaTarea });
});

app.put("/tareas/:indice", (req, res) => {
  const indice = Number(req.params.indice);
  if (!validarIndice(indice, res)) return;

  const { nombre, completada } = req.body;
  if (!validarTarea(nombre, completada, res)) return;

  if (existeNombre(nombre, tareas[indice].id)) {
    return res
      .status(400)
      .json({ success: false, mensaje: "Ya existe otra tarea con ese nombre" });
  }

  tareas[indice] = { id: tareas[indice].id, nombre: nombre.trim(), completada };
  res.json({ success: true, data: tareas[indice] });
});

app.put("/tareas/:indice/estado", (req, res) => {
  const indice = Number(req.params.indice);
  if (!validarIndice(indice, res)) return;

  const { completada } = req.body;
  if (typeof completada !== "boolean")
    return res
      .status(400)
      .json({
        success: false,
        mensaje: "El campo completada debe ser true o false",
      });

  tareas[indice].completada = completada;
  res.json({ success: true, data: tareas[indice] });
});

// Eliminar tarea por índice
app.delete("/tareas/:indice", (req, res) => {
  const indice = Number(req.params.indice);
  if (!validarIndice(indice, res)) return;

  const eliminada = tareas.splice(indice, 1)[0];
  res.json({ success: true, data: eliminada });
});

// Eliminar todas las tareas completadas
app.delete("/tareas/completadas", (req, res) => {
  const completadas = tareas.filter((t) => t.completada === true);
  tareas = tareas.filter((t) => t.completada === false);

  res.json({
    success: true,
    mensaje: `Se eliminaron ${completadas.length} tareas completadas`,
    data: completadas,
  });
});

app.listen(puerto, () => {
  console.log(`Servidor de tareas funcionando en el puerto ${puerto}`);
});
