import express from "express";

import ixcClientesController from'../controllers/Acoes.js';
import forticsAcoesController from "../controllers/Acoes.js";

import provedores from "../models/Provedor.js";

const router = express.Router();

async function obterDadosProvedor(nomeProvedor) {
  // Lógica para obter dados do provedor
  const listaProvedor = await provedores.findOne({ Provedor: nomeProvedor }).exec();
  return listaProvedor;
}
router.post('/login-fortics', async (req, res) => {
  try {
    const { provedor } = req.body;

  
    // Chama o método apropriado no controlador selecionado
    const clientes = await forticsAcoesController.autenticarAtendente(provedor);

    // Faça o que quiser com a resposta dos clientes (ex: retornar para o frontend)
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.post('/webhook-integracao', async (req, res) => {
  try {
    
    res.status(200).json({msg:'RECEBIDO'});
    //console.log(req.body)
    const provedor = req.body.webhook.app
    const dadosAtend = req.body.data
    const varsAtend = req.body.vars
    if(dadosAtend.event=="messageContact"){
    console.log("Mensagem nova entrante :"+provedor)
    const infoatendimento = await forticsAcoesController.analisarAtendimento(provedor,dadosAtend)
    if (infoatendimento!==undefined){
      console.log(infoatendimento)
      const enviadofortics = await forticsAcoesController.enviarMsgFortics(provedor,dadosAtend,varsAtend)
      console.log(enviadofortics)
      if (enviadofortics.status=="true"||enviadofortics.status==true){
        console.log("mensagem enviada com sucesso")
        const resultadoupdate = await forticsAcoesController.atualizarStatusMensagem(provedor,dadosAtend)
      }else {
        console.log("Erro ao enviar mensagem")
      }
      console.log("-------------- VERIFICANDO MENSAGENS PENDENTES ---------------")
      const verificaPendencias = await forticsAcoesController.analisarMensagens(provedor,dadosAtend,varsAtend)
      
      console.log(verificaPendencias)
    }
  } else if (dadosAtend.event === "autoTransferAdmin" || dadosAtend.event === "waitStart"|| dadosAtend.event.includes("Transfer")){
    //console.log(dadosAtend)
    const dadosbanco = await obterDadosProvedor(provedor)
    if (dadosAtend.campaign_id==dadosbanco.idSup247) {
      console.log("Transferencia recebida setor NOSSO")
      const dadosaceitar = await forticsAcoesController.aceitarAtendimento(provedor,dadosAtend.session_id)
      if (dadosaceitar.message=='Contato aceito!'){
        console.log("Cliente aceito com sucesso, atendimento será iniciado")
        console.log(dadosAtend)
        console.log('-----------')
        const enviafake = await forticsAcoesController.enviarMsgForticsFake(provedor,dadosAtend)
        console.log(enviafake)
      }
    }else {
      console.log("transferencia de outro setor ignorada")
    }
  }
  else {
    //console.log("Outro evento recebido: "+dadosAtend.event)
  }
    } catch (error) {
      console.error(error);
      //res.status(500).json({ error: 'Erro no servidor' });
    }
}
);
router.post('/teste-rotina', async (req, res) => {
  const provedor = req.body.webhook.app
    const dadosAtend = req.body.data
    const varsAtend = req.body.vars
const consultarMensagens = await forticsAcoesController.analisarMensagens(provedor,dadosAtend)
console.log(consultarMensagens)
res.sendStatus(200)
}
);
router.post('/generico', async (req, res) => {
console.log("recebido novo evento canal genérico ")
console.log(req.body)
console.log(req.body.type)
const dadosenvio = await forticsAcoesController.enviarMsgBase(req.body)
console.log(dadosenvio)
//res.sendStatus(200)
if (dadosenvio.message == 'Mensagem enviada com sucesso') {
  res.sendStatus(200)
} else {
  console.log(dadosenvio)
  res.sendStatus(500)
}


}
);
router.post('/eventos-base', async (req, res) => {
console.log('Novo evento recebido Base Mestre')
console.log(req.body)
try {
const dataMsg = req.body.data
if (req.body.data.event.includes("Transfer")){
const dadostransf = await forticsAcoesController.transferirAtendimento(dataMsg)
console.log(dadostransf)
if (dadostransf.message=='Transferência realizada com sucesso!'){
  //res.sendStatus(200)
  console.log(dataMsg)
  const finalizarbase = await forticsAcoesController.finalizarAtendimento('INTERNO',dataMsg._id)
  
}
}else if (req.body.data.event=="humanFinish"){
  console.log('Finalização de contato base mestre')
  //console.log(req.body)
  const dadosAtend = req.body.data
  const dadosFim = await forticsAcoesController.buscaFinalizaAtendimento(dadosAtend)
console.log(dadosFim)
}else {
  console.log('OUTRO EVENTO RECEBIDO')
  console.log('-----------------')
  console.log(req.body)
}
res.sendStatus(200)
}catch (err){
  console.log(err)
}
}
);
export default router;