import express from "express";
import provedorController from "../controllers/provedorController.js";

const router = express.Router();

router
    .get("/provedores", provedorController.listarprovedores)
    .post("/provedores", provedorController.cadastrarProvedor)

export default router;