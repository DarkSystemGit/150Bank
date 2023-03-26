const WebSocketServer = require(`ws`);
const path = require('path')
const fs = require(`fs`)
const wss = new WebSocketServer.Server({ port: 5003 });
var users={};
wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log(data)
    data = JSON.parse(data)
    var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
    if(data.type==='login'){
      var user =[data.id,database.Users[data.name]]
      users[data.id]=user
      console.log(user)
    }else if(data.type ==='createComp'){
      var user = users[data.id]
      user[1].Companies.push(data.name)
      database.Users[user[1].Username] = user[1]
      console.log(user)
      fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
      ws.send('done')
    }else if(data.type ==='buyStock'){
      var user = users[data.id][1]
      var compName = data.name
      user.Stocks[compName]= 100*(data.amount*[database.Companies[data.name].worth/database.Companies[data.name].stocks])/database.Companies[data.name].worth
      database.Companies[data.name].stocks+user.Stocks[compName]
    }
  });

  
});