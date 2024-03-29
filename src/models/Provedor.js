import mongoose from "mongoose";
import {dbinterno} from "../config/dbConnect.js"

const provedorSchema = new mongoose.Schema(
    {
        Provedor: {type:String},
        numeroTestes: {type:String}
      }
)

const provedores = dbinterno.model("provedores",provedorSchema)

export default provedores