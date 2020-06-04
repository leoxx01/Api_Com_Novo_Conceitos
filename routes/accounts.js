import express from "express"
import {promises} from "fs"

let router = express.Router()


const readFile = promises.readFile
const writeFile = promises.writeFile

let acc = "accounts.json"

router.post('/',async (req,res)=>{
    let account = req.body //Pegando tudo que vem no body no caso dois parametros name e balance
    try {
        let data = await readFile(acc,'utf-8')//Lendo o arquivo accounts.json e pegando seu conteudo com o data   
        let datajson = JSON.parse(data) //converto o data para json
        const {name,balance} = account
        account = {id:datajson.nextid,name,balance} //Setando o id e pegando o name e balance e setando em um objeto

        datajson.accounts.push(account)//Colocando esse objeto dentro do array accounts que esta presente no arquivo accounts.json

        datajson.nextid++ //Aumentando o ID

        await writeFile(acc, JSON.stringify(datajson))
        logger.info(`POST/account - A conta ${JSON.stringify(account)} foi criada`)
        res.status(201).send("Conta criada")
    
    } catch (error) {
        logger.error(`POST/account - ${error.message}`)
        res.status(400).send("Erro no parseamento"+error)
    }
})

router.get("/",async(req,res)=>{
    try{
        let data = await readFile(acc,"utf8")
        let datajson = JSON.parse(data)//Atribuindo ao datajson para n modificar o data
        delete datajson.nextid //Removendo o next id
        logger.info(`GET/account/ - Pesquisa all`)
        res.status(200).send(datajson)
    }catch(err){
        logger.error(`GET/account/ - ${err.message}`)
        res.status(400).send({error: err.message})
    }
})

router.get("/:id",async(req,res)=>{
    try{
        let accountFilter = null;
        let data = await readFile(acc,"utf8")
           
        let datajson = JSON.parse(data)     
        accountFilter = datajson.accounts.filter((account)=>{
            return account.id === parseInt(req.params.id)
        })
        logger.info(`GET/account/:id - Pesquisa sobre ${JSON.stringify(accountFilter)} `)
        res.send(accountFilter)
    }catch(err){
        logger.error(`GET/account/:id - ${err.message}`)
        res.status(400).send({error: err.message})
    }
    
})

router.delete("/:id",async(req,res)=>{
    let accountDelete = null;
    try {
        let data = await readFile(acc,"utf8")
        
        let datajson = JSON.parse(data)     
        accountDelete = datajson.accounts.filter(account=> account.id !== parseInt(req.params.id))//filtrando o vetor accounts
        //Porque reatribuir ao data accounts pois se não reatribuir ele perde a estrutura padrão
        datajson.accounts = accountDelete //Reatribuindo o valor ao campo accounts
        await writeFile(acc,JSON.stringify(datajson))
        logger.info(`DELETE/account/:id - Usuario deletado ID:[${req.params.id}]`)
        res.status(200).send("Deletado")   
    } catch (error) {
        logger.error(`DELETE/account/:id - ${error.message}`)
        res.status(400).send({error: error.message})
    }
})

router.put('/',async(req,res)=>{
    let accountReqBody = req.body
    let accountUpdateIndex = null
    try{
        let data = await readFile(acc,"utf-8")
        let datajson = JSON.parse(data)
        accountUpdateIndex = datajson.accounts.findIndex(account=>{
            return account.id === parseInt(accountReqBody.id)
        })
        const {name,balance} = accountReqBody
        datajson.accounts[accountUpdateIndex].name = name
        datajson.accounts[accountUpdateIndex].balance = balance
        await writeFile(acc, JSON.stringify(datajson))
        logger.info(`PUT/account/- Conta atualizada${JSON.stringify(datajson.accounts[accountUpdateIndex])}`)
        res.status('200').send("Atualizado com sucesso")
    }catch (err){
        logger.error(`PUT/account/ - ${err.message}`)
        res.status(400).send({error: err.message})
    }
})

//deposito

router.post('/deposit', async (req,res)=>{
    let accountReqBodyParams = req.body
    let accountIndex = null
    try{
        let data = await readFile(acc,"utf-8")
        let datajson = JSON.parse(data)
        accountIndex = datajson.accounts.findIndex(account=>{
            return account.id === accountReqBodyParams.id
        })
        const {value} = accountReqBodyParams
        datajson.accounts[accountIndex].balance += value
        await writeFile(acc, JSON.stringify(datajson))    
        logger.info(`POST/account/deposit - Deposito para conta ${JSON.stringify(datajson.accounts[accountIndex])}`)   
        res.status(200).send("Deposito efetuado com sucesso")
    }catch (err){
        logger.error(`POST/account/deposit - ${err.message}`)
        res.status(400).send({error: err.message})
    }
})

//Saque

router.post('/saque',async(req,res)=>{
    let accountReqBodyParams = req.body
    let accountIndex = null
    try{
        let data = await readFile(acc,"utf-8")
        let datajson = JSON.parse(data)
        accountIndex = datajson.accounts.findIndex(account=>{
            return account.id === accountReqBodyParams.id
        })
        const {value} = accountReqBodyParams
        let saldo  = datajson.accounts[accountIndex].balance - value
        if(saldo < 0 || value <= 0){
            res.send(`Você não tem saldo o suficiente, seu saldo atual é ${datajson.accounts[accountIndex].balance}`)
        }else{
            datajson.accounts[accountIndex].balance -= value
            res.end()
        }
        await writeFile(acc, JSON.stringify(datajson))
        logger.info(`POST/account/saque - Saque da conta ${JSON.stringify(datajson.accounts[accountIndex])}`)   
        //Poderia retornar o objeto da pessoa no res para ele ver 
        res.status(200).send("Saque Efetuado com sucesso")
            
    }catch (err){
        logger.error(`POST/account/saque - ${err.message}`)
        res.status(400).send({error: err.message})
    }
})

//saldo

router.get('/saldo/:id',async(req,res)=>{
    let param = req.params.id
    let checkSaldo = null
    try{
       let data = await readFile(acc,"utf8")
       let datajson = JSON.parse(data)
        checkSaldo = datajson.accounts.find(account=>{
            return account.id === parseInt(param)
        })
        logger.error(`GET/account/saldo/:id - Foi checado o saldo da conta ${JSON.stringify(checkSaldo)}`)
        res.status(200).send(`O saldo da conte é ${checkSaldo.balance}`)
    }catch(err){
        logger.error(`GET/account/saldo/:id - ${err.message}`)
        res.status(400).send({error: err.message})
    }
})

//Só por diverção fazer tranferencia de dinheiro para outra conta que exista

//module.exports = router //exportando o router Modo antigo de exportação

export default router //Nova forma de exportação