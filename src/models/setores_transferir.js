import mongoose from "mongoose";
import {dbinterno} from "../config/dbConnect.js"

const setoresSchema = new mongoose.Schema(
    {
        Provedor: {type:String},
        idComercial: {type:String},
        idContratar: {type:String},
        idAgendamento: {type:String},
        idAuditoria: {type:String},
        idCancelamento: {type:String},
        idFinanceiro: {type:String},
        idSuporteProvedor: {type:String},
      }
)

const setores = dbinterno.model("setores_transferir",setoresSchema)

export default setores