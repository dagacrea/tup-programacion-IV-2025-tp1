import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

let datosMedidas = [];
let nextId = 0;

function agregarTipo(figura) {
  return {
    ...figura,
    tipo: figura.base === figura.altura ? "cuadrado" : "rectángulo",
  };
}

function validarIndice(index, res) {
  if (isNaN(index) || index < 0 || index >= datosMedidas.length) {
    res.status(404).json({ success: false, message: "Índice no encontrado" });
    return false;
  }
  return true;
}

function validarDatosFigura(base, altura, res, permitirCuadrados = true) {
  if (base === undefined || altura === undefined) {
    res
      .status(400)
      .json({ success: false, message: "Debe enviar base y altura" });
    return false;
  }

  if (typeof base !== "number" || typeof altura !== "number") {
    res
      .status(400)
      .json({ success: false, message: "Base y altura deben ser números" });
    return false;
  }

  if (base <= 0 || altura <= 0) {
    res
      .status(400)
      .json({ success: false, message: "Base y altura deben ser mayores a 0" });
    return false;
  }

  if (!permitirCuadrados && base === altura) {
    res.status(400).json({
      success: false,
      message: "Base y altura no pueden ser iguales para un rectángulo",
    });
    return false;
  }

  return true;
}

function calcularMedidas(base, altura) {
  return {
    perimetro: 2 * (base + altura),
    area: base * altura,
  };
}

app.get("/datosMedidas", (req, res) => {
  let resultados = [...datosMedidas];

  const minArea = req.query.minArea;
  if (minArea) {
    const valor = Number(minArea);
    if (isNaN(valor))
      return res
        .status(400)
        .json({ success: false, message: "minArea inválido" });
    resultados = resultados.filter((f) => f.area >= valor);
  }

  const maxPerimetro = req.query.maxPerimetro;
  if (maxPerimetro) {
    const valor = Number(maxPerimetro);
    if (isNaN(valor))
      return res
        .status(400)
        .json({ success: false, message: "maxPerimetro inválido" });
    resultados = resultados.filter((f) => f.perimetro <= valor);
  }

  const resultadosConTipo = resultados.map(agregarTipo);
  res.json({ success: true, data: resultadosConTipo });
});

app.get("/datosMedidas/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!validarIndice(index, res)) return;

  const figuraConTipo = agregarTipo(datosMedidas[index]);
  res.json({ success: true, data: figuraConTipo });
});

app.get("/datosMedidas/:index/tipo", (req, res) => {
  const index = Number(req.params.index);
  if (!validarIndice(index, res)) return;

  const figura = datosMedidas[index];
  const tipo = figura.base === figura.altura ? "cuadrado" : "rectángulo";

  res.json({
    success: true,
    data: {
      id: figura.id,
      tipo: tipo,
    },
  });
});

app.get("/cuadrados", (req, res) => {
  const cuadrados = datosMedidas
    .filter((figura) => figura.base === figura.altura)
    .map(agregarTipo);

  res.json({ success: true, data: cuadrados });
});

app.get("/rectangulos", (req, res) => {
  const rectangulos = datosMedidas
    .filter((figura) => figura.base !== figura.altura)
    .map(agregarTipo);

  res.json({ success: true, data: rectangulos });
});

app.post("/datosMedidas", (req, res) => {
  const { base, altura } = req.body;

  if (!validarDatosFigura(base, altura, res)) return;

  const { perimetro, area } = calcularMedidas(base, altura);
  const nuevaFigura = { id: nextId++, base, altura, perimetro, area };

  datosMedidas.push(nuevaFigura);

  const figuraConTipo = agregarTipo(nuevaFigura);
  res.status(201).json({ success: true, data: figuraConTipo });
});

app.put("/datosMedidas/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!validarIndice(index, res)) return;

  const { base, altura } = req.body;
  if (!validarDatosFigura(base, altura, res)) return;

  const { perimetro, area } = calcularMedidas(base, altura);

  datosMedidas[index] = {
    id: datosMedidas[index].id,
    base,
    altura,
    perimetro,
    area,
  };

  const figuraConTipo = agregarTipo(datosMedidas[index]);
  res.json({ success: true, data: figuraConTipo });
});

app.put("/cuadrados/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!validarIndice(index, res)) return;

  if (datosMedidas[index].base !== datosMedidas[index].altura) {
    return res.status(400).json({
      success: false,
      message: "El elemento en este índice no es un cuadrado",
    });
  }

  const { lado } = req.body;

  if (lado === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Debe enviar el lado del cuadrado" });
  }

  if (typeof lado !== "number") {
    return res
      .status(400)
      .json({ success: false, message: "El lado debe ser un número" });
  }

  if (lado <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "El lado debe ser mayor a 0" });
  }

  const perimetro = 4 * lado;
  const area = lado * lado;

  datosMedidas[index] = {
    id: datosMedidas[index].id,
    base: lado,
    altura: lado,
    perimetro,
    area,
  };

  const figuraConTipo = agregarTipo(datosMedidas[index]);
  res.json({ success: true, data: figuraConTipo });
});

app.put("/rectangulos/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!validarIndice(index, res)) return;

  if (datosMedidas[index].base === datosMedidas[index].altura) {
    return res.status(400).json({
      success: false,
      message: "El elemento en este índice no es un rectángulo",
    });
  }

  const { base, altura } = req.body;
  if (!validarDatosFigura(base, altura, res, false)) return;

  const { perimetro, area } = calcularMedidas(base, altura);

  datosMedidas[index] = {
    id: datosMedidas[index].id,
    base,
    altura,
    perimetro,
    area,
  };

  const figuraConTipo = agregarTipo(datosMedidas[index]);
  res.json({ success: true, data: figuraConTipo });
});

app.delete("/datosMedidas/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!validarIndice(index, res)) return;

  const eliminado = datosMedidas.splice(index, 1)[0];
  const eliminadoConTipo = agregarTipo(eliminado);
  res.json({ success: true, data: eliminadoConTipo });
});

app.delete("/cuadrados/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!validarIndice(index, res)) return;

  if (datosMedidas[index].base !== datosMedidas[index].altura) {
    return res.status(400).json({
      success: false,
      message: "El elemento en este índice no es un cuadrado",
    });
  }

  const eliminado = datosMedidas.splice(index, 1)[0];
  const eliminadoConTipo = agregarTipo(eliminado);
  res.json({ success: true, data: eliminadoConTipo });
});

app.delete("/rectangulos/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!validarIndice(index, res)) return;

  if (datosMedidas[index].base === datosMedidas[index].altura) {
    return res.status(400).json({
      success: false,
      message: "El elemento en este índice no es un rectángulo",
    });
  }

  const eliminado = datosMedidas.splice(index, 1)[0];
  const eliminadoConTipo = agregarTipo(eliminado);
  res.json({ success: true, data: eliminadoConTipo });
});

app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`);
});
