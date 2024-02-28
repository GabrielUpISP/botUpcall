import express from "express";
import db from "./config/dbConnect.js";
import dbinterno from "./config/dbConnect.js"
import routes from "./routes/index.js";
//db.on("error", console.log.bind(console, 'Erro de Conexão'))
//db.once("open", () => {
//  console.log("Conexão Cloud realizada com sucesso")
//})


dbinterno.on("error", console.log.bind(console, 'Erro de Conexão'))
dbinterno.once("open", () => {
  console.log("Conexão Interna realizada com sucesso")
})
const app = express();

app.use(express.json())

routes(app)

export default app