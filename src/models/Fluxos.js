import mongoose from "mongoose";
import {dbinterno} from "../config/dbConnect.js"

const fluxoSchema = new mongoose.Schema(
    {
        Provedor: {type:String},
        mensagemProvedor:{type:String},
        mensagemResposta:{type:String},
        numeroProvedor:{type:String}
      }
)

const fluxos = dbinterno.model("fluxos",fluxoSchema)

export default fluxos