import mongoose from "mongoose";
import {dbinterno} from "../config/dbConnect.js"

const canaisSchema = new mongoose.Schema(
    {
        Provedor: {type:String},
        idCanalGenerico: {type:String},
        NomeCanalGenerico: {type:String},
        tokenCanalGenerico: {type:String},
        idCanalProvedor: {type:String}
      }
)

const canais = dbinterno.model("canais",canaisSchema)

export default canais