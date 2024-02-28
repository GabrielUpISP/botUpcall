import mongoose from "mongoose";
import {dbinterno} from "../config/dbConnect.js"

const provedorSchema = new mongoose.Schema(
    {
        id:{type:String},
        Provedor: {type:String},
        urlbase: {type:String},
        usuarioAtend: {type:String},
        idSup247: {type:String},
        tokenFixoProv: {type:String},
        ultimaatualizacao: {type:String},
        senhaAtend: {type:String},
        tokenBearer: {type:String}
      }
)

const provedores = dbinterno.model("provedores",provedorSchema)

export default provedores