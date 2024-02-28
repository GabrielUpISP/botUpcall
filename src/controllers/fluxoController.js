import fluxos from "../models/Fluxos.js"

class fluxoController {

        static listarprovedores = async (req,res) => {
            try {
                const provedoresResultado = await fluxos.find();
                res.status(200).json(provedoresResultado)
            } catch (err) {
                res.status(500).json(err);
            }
        }
        static listarprovedoresPorId = async (req,res) => {
            try {
            const id = req.params.id
            const provedoresFiltrados = await fluxos.findById(id);
            res.status(200).json(provedoresFiltrados)
            
            } catch (err) {
                res.status(400).json(err.message);
            }


        }
        static cadastrarFluxo = async (req, res) => {
            try {
                let provedor = new fluxos(req.body);
                await provedor.save();
                res.status(201).send(provedor.toJSON());
            } catch (error) {
                res.status(501).send({message: `${error.message} - erro ao cadastrar Provedor`})
            }
        }
        static cadastrarFluxo2 = async (provedor, mensagemrecebida) => {
            try {
                let provedor2 = new fluxos({Provedor: provedor,mensagemProvedor:mensagemrecebida});
                await provedor2.save();
                return(provedor2.toJSON());
            } catch (error) {
                return(error)
            }
        }
        static atualizarProvedor = async (req, res) =>{
            try{
                const id = req.params.id;
               await fluxos.findByIdAndUpdate(id, {$set: req.body});
                res.status(201).send({message:`Provedor com o id: ${id} foi atualizado com sucesso`});
            }catch(err){
                res.status(500).send({message:`${err} falha ao atualizar Provedor`});
            }
        }
        static excluirProvedor = async (req,res) =>{
            try{
                const id = req.params.id;
                await fluxos.findByIdAndDelete(id)
                res.status(200).send(`Provedor ${id} deletado com sucesso`)
            } catch {
                res.status(500).send(err.message)
            }
        }
    }


export default fluxoController