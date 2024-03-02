import express from "express";


import forticsAcoesController from "../controllers/Acoes.js";
import fluxoController from "../controllers/fluxoController.js";
import provedores from "../models/Provedor.js";
import testesController from "../controllers/testesController.js";
const router = express.Router();

async function obterDadosProvedor(nomeProvedor) {
  // Lógica para obter dados do provedor
  const listaProvedor = await provedores.findOne({ Provedor: nomeProvedor }).exec();
  return listaProvedor;
}


router.post('/whatsapp', async (req, res) => {
 // const provedor = req.body.webhook.app
    const dadosAtend = req.body
    const instancia = req.body.instance
    const evento = req.body.event
    const tipomsg = req.body.data.messageType
    console.log(dadosAtend)
    let mensagemRecebida
    try{
if (evento=='messages.upsert' && dadosAtend.data.key.fromMe==false){
console.log('MENSAGEM RECEBIDA')
console.log('---------------')
console.log('Numero: '+dadosAtend.data.key.remoteJid)


if(tipomsg=='conversation'){
   mensagemRecebida = dadosAtend.data.message.conversation
}else if(tipomsg=='extendedTextMessage'){
   mensagemRecebida = dadosAtend.data.message.extendedTextMessage.text
}else if(tipomsg=='contactMessage'){
  mensagemRecebida = undefined
  
}else if(tipomsg=='buttonsMessage'){
  mensagemRecebida = dadosAtend.data.message.buttonsMessage.contentText
}else if(tipomsg=='listMessage'){
  mensagemRecebida = dadosAtend.data.message.listMessage.description
}else{
  console.log('Tipo novo de mensagem recebido:' + tipomsg)
}
console.log('Mensagem: '+mensagemRecebida)
const numeroProvedor = dadosAtend.data.key.remoteJid

if (mensagemRecebida.includes("TESTE OK")){
  const nomeprovedor = await forticsAcoesController.consultaProvedor(numeroProvedor)
  const enviamsg = await testesController.cadastrarTeste(nomeprovedor)
  console.log(enviamsg)
}else {
  const nomeprovedor = await forticsAcoesController.consultaProvedor(numeroProvedor)
  console.log('Provedor: '+nomeprovedor)
  const mensagemretornar = await forticsAcoesController.consultaMensagemReponder(nomeprovedor,mensagemRecebida)
  
  if(!mensagemretornar){
    console.log('mensagem inesperada, necessário cadastrar')
    console.log('Provedor: '+nomeprovedor)
    console.log('Mensagem: '+mensagemRecebida)
    const cadastrofluxo = await fluxoController.cadastrarFluxo2(nomeprovedor,mensagemRecebida)
  }
  
  const enviaresposta = await forticsAcoesController.enviarMensagemResposta(numeroProvedor,mensagemretornar)
  
  console.log(enviaresposta)
}
}
    }catch (err){
      console.log(err)
    }
    
  //  const varsAtend = req.body.vars
//const consultarMensagens = await forticsAcoesController.analisarMensagens(provedor,dadosAtend)
//console.log(consultarMensagens)
res.sendStatus(200)
}
);

export default router;