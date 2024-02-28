import mongoose from "mongoose";
import {dbinterno} from "../config/dbConnect.js"

const provedorSchema = new mongoose.Schema(
    {
        Provedor: {type:String},
        DataTeste: {type:String},
        StatusTeste: {type:String}
      }
)

const historicoTestes = dbinterno.model("historicoTestes",provedorSchema)

export default historicoTestes