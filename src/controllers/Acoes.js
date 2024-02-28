import axios from 'axios';
import provedores from '../models/Provedor.js';
import fluxos from '../models/Fluxos.js';
import historicoTestes from '../models/HistoricoTestes.js'
async function obterDadosProvedor(nomeProvedor) {
  // Lógica para obter dados do provedor
  const listaProvedor = await provedores.findOne({ Provedor: nomeProvedor }).exec();
  return listaProvedor;
}
async function atualizarProvedor(idprovedor,dados) {
  try{
      const id = idprovedor;
     await provedores.findOneAndUpdate({"Provedor":idprovedor}, {$set: dados});
  }catch(err){
      res.status(500).send({message:`${err} falha ao atualizar Provedor`});
  }
}

async function atualizarMensagem(idMensagem,Provedor,dados) {
  try{
      const id = idMensagem;
      const atualizaMsg = await mensagens.findOneAndUpdate({"idmensagem":idMensagem,"Provedor":Provedor}, {$set: dados});
  return(atualizaMsg)
    }catch(err){
      res.status(500).send({message:`${err} falha ao atualizar Mensagem`});
  }
}
async function buscaMensagem(idMensagem,Provedor) {
  try{
      const id = idMensagem;
      const mensagensEncontradas =await mensagens.findOne({"idmensagem":idMensagem,"Provedor":Provedor});
      return(mensagensEncontradas)
  }catch(err){
      res.status(500).send({message:`${err} falha ao atualizar Mensagem`});
  }
}
async function cadastrarTeste(dados) {
  try {
      let provedor = new historicoTestes(dados);
      await provedor.save();
      return("Teste cadastrada com sucesso")
  } catch (error) {
      console.error(error)
  }
}
async function obterCanalProvedor(provedor) {
  // Lógica para obter dados do provedor
  const listaProvedor = await provedores.findOne({ Provedor: provedor }).exec();
  return listaProvedor;
}


class forticsAcoesController {
  //Autenticar Fortics
  /** 
  static autenticarAtendente = async (provedor) => {
    try {
    console.log(provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    //console.log(dadosbanco)
    const url = 'https://'+dadosbanco.urlbase +'api/v4/auth/login';
    const usuarioAuth = dadosbanco.usuarioAtend;
    const senhaAuth = dadosbanco.senhaAtend;


    const options = {
        method: 'POST',
        url,
        headers: {},
        data: {

          email: usuarioAuth,
          password: senhaAuth
      
      },
      };
      console.log(options)
      const response = await axios(options);
      
      console.log(response.data)
    const provedorId = provedor
    
   
    const dadosatualizar = {"tokenBearer":response.data.token,"ultimaatualizacao":response.data.user.updated_at}
    console.log(dadosatualizar);
    console.log(provedorId)
     atualizarProvedor(provedorId,dadosatualizar)
      return response.data;
    } catch (err) {
      console.error(err);
      return(err);
    }
  };
  static analisarAtendimento = async (provedor,dadosAtend) => {
    let options;
    try {
    //console.log("ANALISE DE ATENDIMENTO, RECEBIDO DO PROVEDOR "+provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    //console.log(dadosbanco)
    const url = 'https://'+dadosbanco.urlbase +'api/v4/attendances/show';
    
    const tokenapi = dadosbanco.tokenBearer;
    const sessionid = dadosAtend.session_id;
   

    const options = {
        method: 'POST',
        url,
        headers: {Authorization:'Bearer '+tokenapi},
        data: 
          {
            "session_id": sessionid
        },
      };

      const response = await axios(options);
      
    if (response.data.campaign_id==dadosbanco.idSup247) {
      const dadosMSG = {
        Provedor: provedor,
        idmensagem:dadosAtend.content.message_id,
        session_id:dadosAtend.session_id,
        channel_id:dadosAtend.channel_id,
        message_ref:dadosAtend.content.message_ref,
        platform_id:dadosAtend.content.platform_id,
        mensagem:dadosAtend.content.message,
        tipo_msg:dadosAtend.content.type,
        statusBaseUp:"PENDENTE"
      }
      console.log(response.data)
      const salvamsgbanco = await cadastrarMensagem(dadosMSG)
      console.log(salvamsgbanco)
      console.log("Mensagem recebida no setor NOSSO")
      return response.data;
    }else {
      return undefined
    }

      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log("Erro de autenticação. Tentando reautenticar...");
  
        // Chame sua função de reautenticação aqui
        await forticsAcoesController.autenticarAtendente(provedor);
        
        // Agora tente novamente após reautenticar
        const responseRetry = await axios(options);
        console.log( responseRetry.data);
      }else if(err.response && err.response.status === 404) {
        console.log("Atendimento inexistente nesse provedor")
      }
    
      //console.log(err);
      //return err;
    }
  };
  static analisarMensagens = async (provedor,dadosAtend) => {
    let options;
    try {
    console.log("ANALISE DA lista de mensagens, RECEBIDO DO PROVEDOR "+provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    //console.log(dadosbanco)
    const url = 'https://'+dadosbanco.urlbase +'api/v4/attendances/show';
    
    const tokenapi = dadosbanco.tokenBearer;
    const sessionid = dadosAtend.session_id;
    
    

    const options = {
        method: 'POST',
        url,
        headers: {Authorization:'Bearer '+tokenapi},
        data: 
          {
            "session_id": sessionid
        },
      };

      const response = await axios(options);
      console.log(response.data)
    if (response.data.campaign_id==dadosbanco.idSup247) {
      console.log(response.data)
      console.log("Mensagem recebida no setor NOSSO")
      const talks = response.data.talks
      //console.log(talks)
      const mensagensconversa = await Promise.all(talks.map(async(resposta) => {
        
        const {blocked,created_at,message,message_id,message_ref,origin,type } = resposta;
        try{ 
          if(origin=='channel') {
            //MENSAGEM FOI ORIGINADA PELO CLIENTE
            const dadoscanalgenerico = await obterCanalGenericoporProvedor(dadosAtend.channel_id)
            const tokengenerico = dadoscanalgenerico.tokenCanalGenerico;
            const mensagembusca = await buscaMensagem(message_id,provedor)
            console.log(mensagembusca)
            
            if (mensagembusca === null || mensagembusca === undefined) {
              // Lógica para cadastrar a mensagem
              console.log("mensagem id: "+message_id +" não existia, necessario cadastrar")
              
              
              console.log('Mensagem não encontrada, cadastrando...');

              const dadosMSG = {
                Provedor: provedor,
                idmensagem:message_id,
                session_id:dadosAtend.session_id,
                channel_id:dadosAtend.channel_id,
                message_ref:message_ref,
                platform_id:dadosAtend.content.platform_id,
                mensagem:message,
                statusBaseUp:"ROTINA"
              }
              const salvamsgbanco = await cadastrarMensagem(dadosMSG)
              if (dadosAtend.content.type=='text') {
                const urlReenvio = 'https://upchat.upchatbot.com.br/api/v4/generic/messages/send';
                const optionsReenvio = {
                    method: 'POST',
                    url: urlReenvio,
                    headers: {'API-KEY':tokengenerico},
                    data: {
                "contacts": [
                    {
                        "profile": {
                            "name": dadosAtend.content.platform_id
                        },
                        "platform_id": dadosAtend.content.platform_id
                    }
                ],
                "messages": [
                    {
                        "from": dadosAtend.content.platform_id,
                        "id": message_id,
                        "timestamp": "1518694235",
                        "text": {
                            "body": message
                        },
                        "type": dadosAtend.content.type
                        }]},};
                        console.log("agora vai enviar para fortics a mensagem ")
                        //console.log(optionsReenvio)
                        const responsereenvio = await axios(optionsReenvio);
                        console.log(responsereenvio.data)
                        if (responsereenvio.data.status=="true"||responsereenvio.data.status==true) {
                          const novosdados = {statusBaseUp:"ENVIADO"}
                          const statusbd = await atualizarMensagem(message_id,provedor,novosdados)
                        }
                        return responsereenvio.data;
                  
                }
            
                }else {
                  console.log("mensagem id: "+message_id +" já existia")
                }
          }
        //return { };
      } catch (err) {
        
      }
      }))
      return response.data;
    }else {
      return undefined
    }

      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log("Erro de autenticação. Tentando reautenticar...");
  
        // Chame sua função de reautenticação aqui
        await forticsAcoesController.autenticarAtendente(provedor);
        
        // Agora tente novamente após reautenticar
        const responseRetry = await axios(options);
        console.log( responseRetry.data);
      }else if(err.response && err.response.status === 404) {
        console.log("Atendimento inexistente nesse provedor")
      }
    
      //console.log(err);
      //return err;
    }
  };
  static atualizarStatusMensagem = async (provedor,dadosAtend) => {
    const idmensagem = dadosAtend.content.message_id
    const novosdados = {statusBaseUp:"ENVIADO"}
    const statusbd = await atualizarMensagem(idmensagem,provedor,novosdados)
    //console.log(statusbd)
    return("atualizado")
  };
*/
}

export default forticsAcoesController
