//const { exec } = require('node:child_process')
import { exec } from "child_process";
import express from "express";
import fortics from "./forticsRoutes.js";
import provedores from "./provedorRoutes.js";
const routes = (app) => {
    app.route('/').get((req,res) => {
        res.status(200).send({
            titulo:"INTEGRACAO UPCHAT by Gabriel C",
            versao:"1.0"
    })
    })
    app.route('/updatesis').get((req, res) => {
        exec('git pull', (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao executar o comando: ${error}`);
                return res.status(500).send(`Erro ao executar o comando: ${error}`);
            }

            console.log(`Saída do comando: ${stdout}`);
            res.status(200).send({
                mensagem: `Git pull realizado com sucesso. ${stdout}`
            });
        });
    });
    app.use(
        express.json(),
        fortics,
        provedores
    )
}

export default routes