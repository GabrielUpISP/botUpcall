import axios from 'axios';
import provedores from '../models/Provedor.js';
import canais from '../models/canais.js';
import setores from '../models/setores_transferir.js'
import mensagens from '../models/Mensagens.js';

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
async function cadastrarMensagem(dados) {
  try {
      let provedor = new mensagens(dados);
      await provedor.save();
      return("Mensagem cadastrada com sucesso")
  } catch (error) {
      console.error(error)
  }
}
async function obterProvedorporCanal(canalgenerico) {
  // Lógica para obter dados do provedor
  const listaProvedor = await canais.findOne({ idCanalGenerico: canalgenerico }).exec();
  return listaProvedor;
}

async function obterCanalGenericoporProvedor(canalProvedor) {
  // Lógica para obter dados do provedor
  const listaProvedor = await canais.findOne({ idCanalProvedor: canalProvedor }).exec();
  return listaProvedor;
}
async function obterSetoresTransf(provedor) {
  // Lógica para obter dados do provedor
  const listaProvedor = await setores.findOne({ Provedor: provedor }).exec();
  return listaProvedor;
}
async function obterSetorTransfDestino(idsetor,provedor) {
  const listaProvedor = await setores.findOne({ Provedor: provedor }).exec();
  let setorDestino;
         if (idsetor === '6577059fb49fc1b83e09459f') {
    setorDestino = listaProvedor.idComercial;
  } else if (idsetor === '6577059e90dc0550910781c7') {
    setorDestino = listaProvedor.idAgendamento;
  } else if (idsetor === '6577059e675f4b85470d28eb') {
    setorDestino = listaProvedor.idAuditoria;
  }else if (idsetor === '6577059eabfc962c7101bf18') {
    setorDestino = listaProvedor.idCancelamento;
  }else if (idsetor === '6577059f9c763a33ae0e7bca') {
    setorDestino = listaProvedor.idContratar;
  }else if (idsetor === '6577059f323ffc9d21078809') {
    setorDestino = listaProvedor.idFinanceiro;
  }else if (idsetor === '657705a1e61637d63e092217') {
    setorDestino = listaProvedor.idSuporteProvedor;
  }else {
    setorDestino = null
  }
  return setorDestino;
}
class forticsAcoesController {
  //Autenticar Fortics
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
  static aceitarAtendimento = async (provedor,idsessao) => {
    let options;
    try {
    console.log(provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    console.log(dadosbanco)
    const url = 'https://'+dadosbanco.urlbase +'api/v4/attendances/accept';
    
    const tokenapi = dadosbanco.tokenBearer;
    //const url = dadosbanco.urlbase +'api/v4/attendances/accept';

    const options = {
        method: 'POST',
        url,
        headers: {Authorization:'Bearer '+tokenapi},
        data: {
          session_id: idsessao      
      },
      };

      const response = await axios(options);
      console.log(response.data)
    //const provedorId = provedor
   // console.log(provedorId)
      return response.data;
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
  static enviarMsgFortics = async (provedor,dataMsg,varsMsg) => {
    try {
    console.log('ENVIANDO MENSAGEM PARA A BASE UP :'+provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    const dadoscanalgenerico = await obterCanalGenericoporProvedor(dataMsg.channel_id)
    console.log(dadosbanco)
    console.log(dataMsg)
    console.log('--------')
    console.log(varsMsg)
    console.log('--------')
    console.log(dadoscanalgenerico)
    
    const url = 'https://upchat.upchatbot.com.br/api/v4/generic/messages/send';
    const tokengenerico = dadoscanalgenerico.tokenCanalGenerico;
    //const sessao = dataMsg.session_id;
    if (dataMsg.content.type=='text') {
    const options = {
        method: 'POST',
        url,
        headers: {'API-KEY':tokengenerico},
        data: {
    "contacts": [
        {
            "profile": {
                "name": varsMsg.name || dataMsg.content.platform_id
            },
            "platform_id": dataMsg.content.platform_id
        }
    ],
    "messages": [
        {
            "from": dataMsg.content.platform_id,
            "id": dataMsg.content.message_id,
            "timestamp": "1518694235",
            "text": {
                "body": dataMsg.content.message
            },
            "type": dataMsg.content.type
            }]},};

            const response = await axios(options);
            return response.data;
      console.log(response.data)
    } else if (dataMsg.content.type=='images'){
      const urlimagem = "https://"+dadosbanco.urlbase+"config/storage/view/"+dataMsg.content.storage_id;
      const options = {
        method: 'POST',
        url,
        headers: {'API-KEY':tokengenerico},
        data: {
        "contacts": [
            {
                "profile": {
                    "name": varsMsg.name || dataMsg.content.platform_id
                },
                "platform_id": dataMsg.content.platform_id
            }
        ],
        "messages": [
            {
                "from": dataMsg.content.platform_id,
                "id": dataMsg.content.message_id,
                "timestamp": "1518694235",
                "image": {
                    "url": urlimagem,
                    "mime_type": dataMsg.content.mime_type
                },
                "type": "image"
            }
        ]
    },};

      const response = await axios(options);
      return response.data;
      console.log(response.data)
    } else if (dataMsg.content.type=='sounds'){
      const urlimagem = "https://"+dadosbanco.urlbase+"config/storage/view/"+dataMsg.content.storage_id;
      const options = {
        method: 'POST',
        url,
        headers: {'API-KEY':tokengenerico},
        data: {
        "contacts": [
            {
                "profile": {
                    "name": varsMsg.name || dataMsg.content.platform_id
                },
                "platform_id": dataMsg.content.platform_id
            }
        ],
        "messages": [
            {
                "from": dataMsg.content.platform_id,
                "id": dataMsg.content.message_id,
                "timestamp": "1518694235",
                "audio": {
                    "url": urlimagem,
                    "mime_type": dataMsg.content.mime_type
                },
                "type": "audio"
            }
        ]
    },};

      const response = await axios(options);
      return response.data;
      console.log(response.data)
    } else if (dataMsg.content.type=='files'){
      const urlimagem = "https://"+dadosbanco.urlbase+"config/storage/view/"+dataMsg.content.storage_id;
      const options = {
        method: 'POST',
        url,
        headers: {'API-KEY':tokengenerico},
        data: {
        "contacts": [
            {
                "profile": {
                    "name": varsMsg.name || dataMsg.content.platform_id
                },
                "platform_id": dataMsg.content.platform_id
            }
        ],
        "messages": [
            {
                "from": dataMsg.content.platform_id,
                "id": dataMsg.content.message_id,
                "timestamp": "1518694235",
                "document": {
                    "url": urlimagem,
                    "mime_type": dataMsg.content.mime_type,
                    "filename":dataMsg.content.filename
                },
                "type": "document"
            }
        ]
    },};

      const response = await axios(options);
      return response.data;
      console.log(response.data)
    } else if (dataMsg.content.type=='videos'){
      const urlimagem = "https://"+dadosbanco.urlbase+"config/storage/view/"+dataMsg.content.storage_id;
      const options = {
        method: 'POST',
        url,
        headers: {'API-KEY':tokengenerico},
        data: {
        "contacts": [
            {
                "profile": {
                    "name": varsMsg.name || dataMsg.content.platform_id
                },
                "platform_id": dataMsg.content.platform_id
            }
        ],
        "messages": [
            {
                "from": dataMsg.content.platform_id,
                "id": dataMsg.content.message_id,
                "timestamp": "1518694235",
                "video": {
                    "url": urlimagem,
                    "mime_type": dataMsg.content.mime_type
                   
                },
                "type": "video"
            }
        ]
    },};

    const response = await axios(options);
    return response.data;
      console.log(response.data)
    }
      
      
    } catch (err) {
      console.error(err);
      return(err);
    }
  };
  static enviarMsgBase = async (dataMsg) => {
    
    let options;
    try {
    const dadosprovedor = await obterProvedorporCanal(dataMsg.channel_id)
    const provedor = dadosprovedor.Provedor
    console.log('Nova mensagem canal genérico provedor: '+provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    console.log(dadosbanco)
    
    
    
    //const tokenapi = dadosbanco.tokenBearer;
    //const url = dadosbanco.urlbase +'api/v4/attendances/accept';
    const channel_id = dadosprovedor.idCanalProvedor
    const numerocliente = dataMsg.to
    
    console.log('recebido envio de nova mensagem')
    console.log(dataMsg.type)
    if (dataMsg.type =='text'){
    const url = 'https://'+dadosbanco.urlbase +'api/v4/message/send';
    const tokenfixo = dadosbanco.tokenFixoProv
    const mensagemcliente = dataMsg.text.body
    const optionstexto = {
        method: 'GET',
        url,
        headers: {},
        data: {
          "platform_id": numerocliente,
          "channel_id": channel_id,
          "type": "text",
          "message": mensagemcliente,
          "token": tokenfixo
      },
      };

      const response = await axios(optionstexto);
      return response.data;
    } else if (dataMsg.type =='audio'){
      console.log('mensagem do tipo audio')
      const url = "https://n8n.upcall.com.br/webhook/envioarquivo-szchat22";
      const tokenfixo = dadosbanco.tokenFixoProv
      const optionstexto = {
        method: 'POST',
        url,
        headers: {},
        data: {
          "platform_id": numerocliente,
          "channel_id": channel_id,
          "type": "media",
          "file": dataMsg.audio.url,
          "token": tokenfixo,
          "tokennovo":dadosbanco.tokenBearer,
          "urlsz":'https://'+dadosbanco.urlbase +'api/v4/message/send'
      },
      };

      const response = await axios(optionstexto);
      return response.data;
      console.log(response.data)
    }else if (dataMsg.type =='document'){
      console.log('mensagem do tipo documento')
      const url = "https://n8n.upcall.com.br/webhook/envioarquivo-szchat22";
      const tokenfixo = dadosbanco.tokenFixoProv
      const optionstexto = {
        method: 'POST',
        url,
        headers: {},
        data: {
          "platform_id": numerocliente,
          "channel_id": channel_id,
          "type": "media",
          "file": dataMsg.document.url,
          "token": tokenfixo,
          "tokennovo":dadosbanco.tokenBearer,
          "urlsz":'https://'+dadosbanco.urlbase +'api/v4/message/send'
      },
      };

      const response = await axios(optionstexto);
      console.log(response.data)
      return response.data;
    }else if (dataMsg.type =='image'){
      console.log('mensagem do tipo audio')
      const url = "https://n8n.upcall.com.br/webhook/envioarquivo-szchat22";
      const tokenfixo = dadosbanco.tokenFixoProv
      const optionstexto = {
        method: 'POST',
        url,
        headers: {},
        data: {
          "platform_id": numerocliente,
          "channel_id": channel_id,
          "type": "media",
          "file": dataMsg.image.url,
          "token": tokenfixo,
          "tokennovo":dadosbanco.tokenBearer,
          "urlsz":'https://'+dadosbanco.urlbase +'api/v4/message/send'
      },
      };

      const response = await axios(optionstexto);
      console.log(response.data)
      return response.data;
    }else {
      console.log('tipo de texto não reconhecido')
    }
    console.log(response.data)
    const provedorId = provedor
    console.log(provedorId)
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Erro de autenticação. Tentando reautenticar...");
  
        // Chame sua função de reautenticação aqui
        await forticsAcoesController.autenticarAtendente(provedor);
        
        // Agora tente novamente após reautenticar
        const responseRetry = await axios(options);
        console.log( responseRetry.data);
      }else if(err.response && err.response.status === 404) {
        console.error(err.response)
      }
    
      //console.log(err);
      //return err;
    }
  };
  static enviarMsgForticsFake = async (provedor,dataMsg) => {
    try {
    console.log('ENVIANDO MENSAGEM PARA A BASE UP :'+provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    const dadoscanalgenerico = await obterCanalGenericoporProvedor(dataMsg.channel_id)
    console.log(dadosbanco)
    console.log(dataMsg)
    console.log('--------')
    console.log(dadoscanalgenerico)
    
    const url = 'https://upchat.upchatbot.com.br/api/v4/generic/messages/send';
    const tokengenerico = dadoscanalgenerico.tokenCanalGenerico;
    //const sessao = dataMsg.session_id;
    
    const options = {
      method: 'POST',
      url,
      headers: {'API-KEY':tokengenerico},
      data: {
  "contacts": [
      {
          "profile": {
              "name": dataMsg.name 
          },
          "platform_id": dataMsg.platform_id
      }
  ],
  "messages": [
      {
          "from": dataMsg.platform_id,
          "id": '1111111',
          "timestamp": "1518694235",
          "text": {
              "body": 'ATENDIMENTO INICIADO NOVO'
          },
          "type": 'text'
          }]},};

          const response = await axios(options);
          return response.data;
    console.log(response.data)
      
    } catch (err) {
      console.error(err);
      return(err);
    }
  };
  static obteridSetorTransf = async (provedor,idSetorTransf) => {
    try {
    console.log(provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    console.log(dadosbanco)
    const setoresTransf = await obterSetoresTransf(provedor)
    console.log(setoresTransf)
    //return setoresTransf.idComercial
    if (idSetorTransf=='6577059fb49fc1b83e09459f'){
      return setoresTransf.idComercial
    } else if (idSetorTransf=='6577059e90dc0550910781c7'){
      return setoresTransf.idAgendamento
    }else if (idSetorTransf=='6577059e675f4b85470d28eb'){
      return setoresTransf.idAuditoria
    }else if (idSetorTransf=='6577059eabfc962c7101bf18'){
      return setoresTransf.idCancelamento
    }else if (idSetorTransf=='6577059f9c763a33ae0e7bca'){
      return setoresTransf.idContratar
    }else if (idSetorTransf=='6577059f323ffc9d21078809'){
      return setoresTransf.idSuporteProvedor
    }else if (idSetorTransf=='657705a1e61637d63e092217'){
      return setoresTransf.idFinanceiro
    }
     // return response.data;
    } catch (err) {
      console.error(err);
      return(err);
    }
  };
  static finalizarAtendimento = async (provedor,idsessao) => {
    let options;
    try {
    console.log(provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    console.log(dadosbanco)
    const url = 'https://'+dadosbanco.urlbase +'api/v4/attendances/finish';
    const tokenapi = dadosbanco.tokenBearer;
    const options = {
        method: 'POST',
        url,
        headers: {Authorization:'Bearer '+tokenapi},
        data: {
          session_id: idsessao      
      },
      };

      const response = await axios(options);
      console.log(response.data)
    //const provedorId = provedor
    console.log(provedorId)
      return response.data;
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
  static consultarAtendimento = async (provedor,platform_id) => {
    let options;
    try {
    
    
    const dadosbanco = await obterDadosProvedor(provedor)
    console.log(dadosbanco)
    const url = 'https://'+dadosbanco.urlbase +'api/v4/attendances/';
    
    const tokenapi = dadosbanco.tokenBearer;

    const options = {
        method: 'GET',
        url,
        headers: {Authorization:'Bearer '+tokenapi},
        data: {
          platform_id: platform_id      
      },
      };

      const response = await axios(options);
      console.log(response.data)
      return response.data;
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
  static consultarAtendimentoemAndamento = async (provedor,platform_id) => {
    let options;
    try {
    
    
    const dadosbanco = await obterDadosProvedor(provedor)
    console.log(dadosbanco)
    const url = 'https://'+dadosbanco.urlbase +'api/v4/attendances/';
    
    const tokenapi = dadosbanco.tokenBearer;

    const options = {
        method: 'GET',
        url,
        headers: {Authorization:'Bearer '+tokenapi},
        data: {
          platform_id: platform_id,
          status:"attendance"      
      },
      };

      const response = await axios(options);
      console.log(response.data)
      return response.data;
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
  static transferirAtendimento = async (dadosMSG) => {
    let options;
    try {
    
    const dadosprovedor = await obterProvedorporCanal(dadosMSG.channel_id)
    console.log(dadosprovedor)
    const provedor = dadosprovedor.Provedor
    const setoresTransf = await obterSetoresTransf(provedor)
    const dadosbanco = await obterDadosProvedor(provedor)
    console.log(dadosbanco)
    
    
    const tokenapi = dadosbanco.tokenBearer;
    console.log('obtendo dados do atendimento')
    const dadosAtendimento = await this.consultarAtendimento(provedor,dadosMSG.platform_id)
    console.log("retornando dados sobre o atendimento")
    console.log(dadosAtendimento.data)
    const idsessao = dadosAtendimento.data[0]._id
    const setordestino = await this.obteridSetorTransf(provedor,dadosMSG.campaign_id)
    console.log(setordestino)
    const url = 'https://'+dadosbanco.urlbase +'api/v4/attendances/transfer';
    const options = {
        method: 'POST',
        url:url,
        headers: {Authorization:'Bearer '+tokenapi},
        data: {
          session_id: idsessao,
          attendance_id: setordestino,
          type: 'attendance' 
      },
      };
      console.log(options)
      const response = await axios(options);
      console.log(response.data)
      
      return response.data;
    
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
  static buscaFinalizaAtendimento = async (dadosMSG) => {
    let options;
    try {
    
    const dadosprovedor = await obterProvedorporCanal(dadosMSG.channel_id)
    console.log(dadosprovedor)
    const provedor = dadosprovedor.Provedor
    const dadosbanco = await obterDadosProvedor(provedor)
    console.log(dadosbanco)
    
    
    const tokenapi = dadosbanco.tokenBearer;
    console.log('obtendo dados do atendimento')
    const dadosAtendimento = await this.consultarAtendimento(provedor,dadosMSG.platform_id)
    console.log("retornando dados sobre o atendimento")
    console.log(dadosAtendimento.data)
    const dadosBuscados = dadosAtendimento.data[0]
    if (dadosBuscados.status=='attendance') {
      console.log('Atendimento a ser finalizado')
      console.log(dadosBuscados)
      console.log('---------------')
      const idsessao = dadosAtendimento.data[0]._id
      const url = 'https://'+dadosbanco.urlbase +'api/v4/attendances/finish';
    const options = {
        method: 'POST',
        url:url,
       headers: {Authorization:'Bearer '+tokenapi},
       data: {
          session_id: idsessao
      },
      };
      console.log(options)
      const response = await axios(options);
      console.log(response.data)
    return(response.data)
    } else {
      console.log('Atendimento do provedor '+provedor+' do cliente '+dadosBuscados.platform_id+' não finalizado pois o status do mesmo era '+dadosBuscados.status)
      return 'não finalizado'
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
}

export default forticsAcoesController
