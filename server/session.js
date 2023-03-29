const WebSocketServer = require(`ws`);
const path = require('path')
const fs = require(`fs`)
const wss = new WebSocketServer.Server({ port: 5003 });
var users = {};
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log(data)
        data = JSON.parse(data)
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        if (data.type === 'login') {
            var user = [data.id, database.Users[data.name]]
            users[data.id] = user
            console.log(user)
        } else if (data.type === 'createComp') {
            var user = users[data.id]
            user[1].Companies.push(data.name)
            user[1].Stocks[data.name] = 100
            database.Users[user[1].Username] = user[1]
            console.log(user)
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            ws.send('done')
        } else if (data.type === 'buyStock') {
            console.log(JSON.stringify(data))
            console.log(users)
            var user = users[data.id][1]
            var compName = data.name
            user.Stocks[compName] = 100 * (data.amount * [database.Companies[data.name].worth / database.Companies[data.name].stocks]) / database.Companies[data.name].worth
            database.Companies[data.name].stocks += data.amount
            user.Balance -= data.amount * (database.Companies[data.name].worth / database.Companies[data.name].stocks)
            if (user.Stocks[compName] < 50) {
                user.Companies.push(data.name)
            } else if (user.Companies.includes(data.name) && user.Stocks[compName] >= 50) {
                user.Companies.splice(user.Companies.indexOf(data.name), 1)
            }
            database.Users[user.Username] = user
            console.log(user)
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            ws.send('done')
        } else if (data.type === 'sellStock') {
            var user = users[data.id][1]
            var compName = data.name
            user.Stocks[compName] -= 100 * (data.amount * [database.Companies[data.name].worth / database.Companies[data.name].stocks]) / database.Companies[data.name].worth
            database.Companies[data.name].stocks -= data.amount
            user.Balance += data.amount * (database.Companies[data.name].worth / database.Companies[data.name].stocks)
            if (user.Stocks[compName] < 50) {
                user.Companies.push(data.name)
            } else if (user.Companies.includes(data.name) && user.Stocks[compName] >= 50) {
                user.Companies.splice(user.Companies.indexOf(data.name), 1)
            }
            database.Users[user.Username] = user
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            ws.send('done')
        } else if (data.type === 'createProduct') {
            var user = users[data.id][1]
            var products = database.Companies[data.company].products
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
            var image ={fileName:`${data.name}PrdtImg.${imageType}`,data:data.image.replace(`data:image/${imageType};base64,`,'')}
            fs.writeFileSync(`${__dirname.replace('/server','')}/images/Companies/${image.fileName}`, image.data, 'base64');
            if (user.Companies.includes(data.company)){
                products[data.name]={
                    'name':data.name,
                    'image':image.fileName,
                    'description':data.description, 
                    'price':data.price
                }
            }
            database.Users[user.Username] = user
            console.log(user)
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            ws.send('done')


        }else if (data.type === 'orderProduct') {
            function createUuid() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
                });
              }
            console.log(JSON.stringify(data))
            console.log(users)
            var user = users[data.id][1]
            var compName = data.name
            //user.Stocks[compName] = 100 * (data.amount * [database.Companies[data.name].worth / database.Companies[data.name].stocks]) / database.Companies[data.name].worth
            //database.Companies[data.name].stocks += data.amount
            user.Balance -= data.amount * database.Companies[data.name].products[data.product].price
            var orderId = createUuid()
            user.orders[data.name].push({product:data.product,id:orderId})
            database.Companies[data.name].orders[orderId]={
                'amount':data.amount,
                'price':data.amount * database.Companies[data.name].products[data.product].price,
                'user':user.Username,
                'product':data.product,
                'status':'ordered'
            }
            var owner = database.Users[database.Companies[data.name].owner]
            var notifications = owner.Notifications.Companies[compName]
            notifications.push({
                'type':'buyProduct',
            'user':user.Username,'product':data.product,
            'amount':data.amount,
            'cost':data.amount * database.Companies[data.name].products[data.product].price
        })
            database.Users[user.Username] = user
            console.log(user)
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            ws.send(JSON.stringify({order:orderId,status:'ordered'}))
        }else if(data.type==='buyProduct'){
            console.log(JSON.stringify(data))
            console.log(users)
            var user = users[data.id][1]
            var compName = data.name
            
            database.Users[user.Username] = user
            console.log(user)
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            ws.send(JSON.stringify({order:orderId,status:'delivered'}))
        } 
    });


});