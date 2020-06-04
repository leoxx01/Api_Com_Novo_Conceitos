import express from "express"
import {promises} from "fs"
import winston from "winston"
import routes from "./routes/accounts.js"
import cors from "cors"

const app = express()
app.use(cors()) //liberando cors para todos

//const routes = require("./routes/accounts.js")//Importando routes

const acc = "accounts.json"

//logs
const {combine,timestamp,level,label,printf} = winston.format
const myformat = printf(({level,message,label,timestamp})=>{ //Definindo o formato
    return `${timestamp} [${label}] ${level}: ${message}`
})
global.logger = winston.createLogger({ //Uma variavel literalmente global uso ela em accounts tmb
    level:"silly",
    transports:[
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename: "my-bank.log"})
    ],
    format: combine(
        label({label: "my-bank-api"}),  // Definindo a label
        timestamp(), //Pegando Time stanp 
        myformat //passando o formato desejado 
    )
})

app.use(express.json())//Informando que iremos utilizar objetos json para tratar as reqs
app.use("/account", routes)

//Outra forma de fazer de forma assincrona 

     app.listen(3000,async()=>{
        try{
            await promises.readFile(acc,"utf8")
            logger.info("Online") 
        }catch(err){
            const initialJson = {
                nextid: 1,
                accounts:[]
            }
            promises.writeFile(acc, JSON.stringify(initialJson)).catch(err=>console.log(err))
        }
    })  

//Promisse 

/* app.listen(3000,()=>{
    //Criando a estruta json para quando não tivermos a file accounts.json, para cria-lo de acordo com oque foi estipulado 
        //catch para pegar o erro // e then para pegar algo que retone e tratar
        fs.readFile(acc,"utf8").catch(err =>{
            const initialJson = {
                nextid: 1,
                accounts:[]
            }
            fs.writeFile(acc, JSON.stringify(initialJson)).catch(err=>console.log(err))
        })
        console.log("Online2") 
        //Aula 08 tem a forma de callback
})  */