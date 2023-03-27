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
      user[1].Stocks[data.name]=100
      database.Users[user[1].Username] = user[1]
      console.log(user)
      fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
      ws.send('done')
    }else if(data.type ==='buyStock'){
      console.log(JSON.stringify(data))
      console.log(users)
      var user = users[data.id][1]
      var compName = data.name
      user.Stocks[compName]= 100*(data.amount*[database.Companies[data.name].worth/database.Companies[data.name].stocks])/database.Companies[data.name].worth
      database.Companies[data.name].stocks+=data.amount
      user.Balance-=data.amount*(database.Companies[data.name].worth/database.Companies[data.name].stocks)
      if(user.Stocks[compName]<50){
        user.Companies.push(data.name)
      }else if(user.Companies.includes(data.name)&&user.Stocks[compName]>=50){
        user.Companies.splice(user.Companies.indexOf(data.name),1)
      }
      database.Users[user.Username]=user
      console.log(user)
      fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
      ws.send('done')
    }else if(data.type==='sellStock'){
      var user = users[data.id][1]
      var compName = data.name
      user.Stocks[compName]-= 100*(data.amount*[database.Companies[data.name].worth/database.Companies[data.name].stocks])/database.Companies[data.name].worth
      database.Companies[data.name].stocks-=data.amount
      user.Balance+=data.amount*(database.Companies[data.name].worth/database.Companies[data.name].stocks)
      if(user.Stocks[compName]<50){
        user.Companies.push(data.name)
      }else if(user.Companies.includes(data.name)&&user.Stocks[compName]>=50){
        user.Companies.splice(user.Companies.indexOf(data.name),1)
      }
      database.Users[user.Username]=user
      fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
      ws.send('done')
    }
  });

  
});