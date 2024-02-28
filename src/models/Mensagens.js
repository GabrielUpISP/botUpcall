import mongoose from "mongoose";
import {dbinterno} from "../config/dbConnect.js"

const mensagemSchema = new mongoose.Schema(
    {
        id:{type:String},
        Provedor: {type:String},
        idmensagem:{type:String},
        session_id:{type:String},
        channel_id:{type:String},
        message_ref:{type:String},
        platform_id:{type:String},
        mensagem:{type:String},
        tipo_msg:{type:String},
        statusBaseUp:{type:String}
      }
)

const mensagens = dbinterno.model("mensagens",mensagemSchema)

export default mensagens