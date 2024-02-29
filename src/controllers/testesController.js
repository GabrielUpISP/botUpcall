import historicoTestes from "../models/HistoricoTestes.js"
class testesController {

     
        static cadastrarFluxo = async (req, res) => {
            try {
                let provedor = new fluxos(req.body);
                await provedor.save();
                res.status(201).send(provedor.toJSON());
            } catch (error) {
                res.status(501).send({message: `${error.message} - erro ao cadastrar Provedor`})
            }
        }
        static cadastrarTeste = async (provedor) => {
            try {
                var data = new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
                let provedor2 = new historicoTestes({
                    Provedor: provedor,
                    DataTeste: data,
                    StatusTeste: 'TESTE OK'
                  });
                await provedor2.save();
                return(provedor2.toJSON());
            } catch (error) {
                return(error)
            }
        }
        
    }


export default testesController