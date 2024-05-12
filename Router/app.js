import express from "express";
import { readFile } from "../service/readFile.js";
import cors from "cors";
import { serviceRouter } from "./service-router.js";
import { ServiceModel } from "../Model/product.js";
const produts = readFile("../src/mocks/products.json");
const app = express();

const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.disable("x-powered-by");

app.use("/", serviceRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
