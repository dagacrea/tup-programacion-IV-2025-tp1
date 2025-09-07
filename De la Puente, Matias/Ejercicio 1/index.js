import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

let datosMedidas = [];

// GET → Consultar cálculos
app.get("/datosMedidas", (req, res) => {
  const tipoDeFigura = datosMedidas.map((d) => {
    const tipo = d.base === d.altura ? "cuadrado" : "rectangulo";
    return { ...d, tipo }; // acá agregamos "tipo" solo al responder
  });
  res.json({ cantidad: tipoDeFigura.length, figuras: tipoDeFigura });
});

// POST → Guardar un cálculo
app.post("/datosMedidas", (req, res) => {
  const base = req.body.base;
  const altura = req.body.altura;

  if (!base || !altura) {
    return res.status(400).json({ error: "enviar base y altura" });
  }

  const perimetro = 2 * (base + altura);
  const area = base * altura;

  // guardamos sin "tipo"
  const figura = { base, altura, perimetro, area };
  datosMedidas.push(figura);

  res.json({ mensaje: "datos guardados", figura });
});

app.listen(port, () => {
  console.log(`La aplicación está funcionando ${port}`);
});
