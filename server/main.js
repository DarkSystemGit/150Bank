const path = require('path')
const fs = require(`fs`)
const WebSocket = require(`ws`);
const wss = new WebSocket.Server({ port: 5002 })
async function connection(message, url) {
    return new Promise((resolve, reject) => {
        var socket = new WebSocket(`ws://${url}`);
        socket.on('open',()=> {
            socket.send(message);
        });
        socket.on('message',(event) => {
            resolve(event.data);
        });
        socket.on('error',(error) => {
            reject(error);
        });
    });
}
wss.on("connection", ws => {

    ws.on("message", async data => {
        console.log(data)
        await main(ws, data)
    });
    // handling client connection error
    ws.onerror = function() {
        console.log("Some Error occurred")
    }
});

async function main(ws, data) {
    console.log(__dirname)
    data = JSON.parse(data)
    console.log(data)
    if (data.type === `signUp`) {
        var user = {
            Name: data.name,
            Username: data.username,
            Password: data.password,
            Email: data.email,
            Companies: [],
            Stocks: {},
            Balance: 0
        }
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        database.Users[data.username] = user
        fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
        ws.send('SignUp')
        console.log(user)
    } else if (data.type === "login") {
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        var readWs = new WebSocket('ws://127.0.0.1:5003')
        try {
            
            function createUuid() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
                });
              }
            var uuid = createUuid()
            var password = database.Users[data.username]
            password = password.Password
            if (data.password === password) {
                readWs.on('open', function open() {
                    readWs.send(JSON.stringify({type:'login',name:data.username,id:uuid}));
                  });
                ws.send(uuid)
            } else {
                ws.send('BadPassword')
            }
        } catch (e) {
            ws.send('WrongUserName')
        }
    } else if (data.type === "stocks") {
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        var company = database.Companies[data.name]
        console.log(database.Companies)
        console.log(res)
        ws.send(JSON.stringify(company))

    } else if (data.type === "companyList") {
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        var res = Object.keys(database.Companies)
        console.log(res)
        ws.send(JSON.stringify(res))
    }else if (data.type === "createCompany") {
        try{
            var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))       
            var imageType;
            if(data.image.includes('png')){
                imageType='png'
            }else if(data.image.includes('jpeg')){
                imageType='jpeg'
            }else if(data.image.includes('jpg')){
                imageType='jpg'
            }else{
                ws.send('error')
            }
            var image ={fileName:`${data.name}.${imageType}`,data:data.image.replace(`data:image/${imageType};base64,`,'')}
            fs.writeFileSync(`${__dirname.replace('/server','')}/images/Companies/${image.fileName}`, image.data, 'base64');
            var company = {
                'description':data.description,
                'name':data.name,
                'image':image.fileName,
                'worth':0,
                'stocks':0
            }   
            console.log(company)
            database.Companies[data.name] = company
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            var res=await connection(JSON.stringify({type:'createComp',name:data.name,id:data.id}),"192.168.0.16:5003")   
            if( res === 'done') {       
            ws.send('complete')}
        }catch{
            ws.send('error')
        }
       
    }else if (data.type === "buyStock"){
        await connection(JSON.stringify({type:'buyStock',name:data.name,amount:data.amount,id:data.id}),"192.168.0.16:5003")
    }else if (data.type === "sellStock"){
        await connection(JSON.stringify({type:'sellStock',name:data.name,amount:data.amount,id:data.id}),"192.168.0.16:5003")
    }
}