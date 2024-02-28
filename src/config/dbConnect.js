import mongoose from "mongoose";

//const db = mongoose.createConnection("mongodb+srv://gabuncle12:qpLn0IhpqzdLPJwI@cluster0.vcpu5si.mongodb.net/upcall");
const dbinterno = mongoose.createConnection("mongodb://192.168.210.230:27017/TestesFluxo");
export default dbinterno;
export {dbinterno}
//export {db}