import express from "express";

const app = express();
const puerto = 3000;

app.use(express.json());

let alumnos = [];
let siguienteId = 0;

function calcularDatos(alumno) {
  const promedio = (alumno.nota1 + alumno.nota2 + alumno.nota3) / 3;
  let estado;

  if (promedio < 6) {
    estado = "reprobado";
  } else if (promedio >= 6 && promedio < 8) {
    estado = "aprobado";
  } else {
    estado = "promocionado";
  }

  return {
    ...alumno,
    promedio: Math.round(promedio * 100) / 100, // 2 decimales
    estado: estado,
  };
}

function existeNombre(nombre, idExcluir = null) {
  return alumnos.some(
    (alumno) =>
      alumno.nombre.toLowerCase() === nombre.toLowerCase() &&
      alumno.id !== idExcluir
  );
}

function validarAlumno(nombre, nota1, nota2, nota3, res) {
  if (
    !nombre ||
    nota1 === undefined ||
    nota2 === undefined ||
    nota3 === undefined
  ) {
    res.status(400).json({
      success: false,
      message: "Debe enviar nombre, nota1, nota2 y nota3",
    });
    return false;
  }

  if (typeof nombre !== "string") {
    res.status(400).json({
      success: false,
      message: "El nombre debe ser texto",
    });
    return false;
  }

  if (
    typeof nota1 !== "number" ||
    typeof nota2 !== "number" ||
    typeof nota3 !== "number"
  ) {
    res.status(400).json({
      success: false,
      message: "Las notas deben ser números",
    });
    return false;
  }

  if (
    nota1 < 0 ||
    nota1 > 10 ||
    nota2 < 0 ||
    nota2 > 10 ||
    nota3 < 0 ||
    nota3 > 10
  ) {
    res.status(400).json({
      success: false,
      message: "Las notas deben estar entre 0 y 10",
    });
    return false;
  }

  return true;
}

function validarIndice(indice, res) {
  if (isNaN(indice) || indice < 0 || indice >= alumnos.length) {
    res.status(404).json({
      success: false,
      message: "Índice no encontrado",
    });
    return false;
  }
  return true;
}

app.get("/alumnos", (req, res) => {
  const alumnosConDatos = alumnos.map(calcularDatos);
  res.json({ success: true, data: alumnosConDatos });
});

app.get("/alumnos/:indice", (req, res) => {
  const indice = Number(req.params.indice);
  if (!validarIndice(indice, res)) return;

  const alumnoConDatos = calcularDatos(alumnos[indice]);
  res.json({ success: true, data: alumnoConDatos });
});

app.get("/reprobados", (req, res) => {
  const reprobados = alumnos
    .map(calcularDatos)
    .filter((alumno) => alumno.estado === "reprobado");

  res.json({ success: true, data: reprobados });
});

app.get("/aprobados", (req, res) => {
  const aprobados = alumnos
    .map(calcularDatos)
    .filter((alumno) => alumno.estado === "aprobado");

  res.json({ success: true, data: aprobados });
});

app.get("/promocionados", (req, res) => {
  const promocionados = alumnos
    .map(calcularDatos)
    .filter((alumno) => alumno.estado === "promocionado");

  res.json({ success: true, data: promocionados });
});

app.post("/alumnos", (req, res) => {
  const { nombre, nota1, nota2, nota3 } = req.body;

  if (!validarAlumno(nombre, nota1, nota2, nota3, res)) return;

  if (existeNombre(nombre)) {
    return res.status(400).json({
      success: false,
      message: "Ya existe un alumno con ese nombre",
    });
  }

  const nuevoAlumno = {
    id: siguienteId++,
    nombre: nombre.trim(),
    nota1,
    nota2,
    nota3,
  };

  alumnos.push(nuevoAlumno);

  const alumnoConDatos = calcularDatos(nuevoAlumno);
  res.status(201).json({ success: true, data: alumnoConDatos });
});

app.put("/alumnos/:indice", (req, res) => {
  const indice = Number(req.params.indice);
  if (!validarIndice(indice, res)) return;

  const { nombre, nota1, nota2, nota3 } = req.body;

  if (!validarAlumno(nombre, nota1, nota2, nota3, res)) return;

  if (existeNombre(nombre, alumnos[indice].id)) {
    return res.status(400).json({
      success: false,
      message: "Ya existe otro alumno con ese nombre",
    });
  }
  alumnos[indice] = {
    id: alumnos[indice].id,
    nombre: nombre.trim(),
    nota1,
    nota2,
    nota3,
  };

  const alumnoConDatos = calcularDatos(alumnos[indice]);
  res.json({ success: true, data: alumnoConDatos });
});

app.delete("/alumnos/:indice", (req, res) => {
  const indice = Number(req.params.indice);
  if (!validarIndice(indice, res)) return;

  const eliminado = alumnos.splice(indice, 1)[0];
  const eliminadoConDatos = calcularDatos(eliminado);
  res.json({ success: true, data: eliminadoConDatos });
});

app.listen(puerto, () => {
  console.log(`Servidor funcionando en el puerto ${puerto}`);
});
