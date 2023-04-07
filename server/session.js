const WebSocketServer = require(`ws`);
const path = require('path')
const fs = require(`fs`)
const wss = new WebSocketServer.Server({
    port: 5003
});
var users = {};
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        
        data = JSON.parse(data)
        console.log(data)
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        try {
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
                if (parseFloat(data.amount) * (parseFloat(database.Companies[data.name].worth) / parseFloat(database.Companies[data.name].stocks)) >= parseFloat(database.Companies[data.name].worth)) {
                    ws.send('too many')

                } else {
                    var user = users[data.id][1]

                    var compName = data.name
                    data.amount = parseFloat(data.amount)
                    user.Stocks[compName] = 100 * (data.amount * [database.Companies[data.name].worth / database.Companies[data.name].stocks]) / database.Companies[data.name].worth
                    database.Companies[data.name].stocks -= data.amount
                    database.Companies[data.name].soldStocks += data.amount
                    database.Companies[data.name].worth += data.amount * (database.Companies[data.name].worth / database.Companies[data.name].stocks)
                    user.Balance -= data.amount * (database.Companies[data.name].worth / database.Companies[data.name].stocks)

                    console.log(database.Companies[data.name])
                    if (user.Stocks[compName] > 50) {
                        user.Companies.push(data.name)
                    } else if (user.Companies.includes(data.name) && user.Stocks[compName] <= 50) {
                        user.Companies.splice(user.Companies.indexOf(data.name), 1)
                    }
                    database.Users[user.Username] = user
                    console.log(user)
                    fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
                    ws.send('done')
                }

            } else if (data.type === 'sellStock') {
                var user = users[data.id][1]
                var compName = data.name
                data.amount = parseFloat(data.amount)
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
                console.log('prdct')
                var user = users[data.id][1]
                var products = database.Companies[data.company].products
                var imageType;
                if (data.image.includes('png')) {
                    imageType = 'png'
                } else if (data.image.includes('jpeg')) {
                    imageType = 'jpeg'
                } else if (data.image.includes('jpg')) {
                    imageType = 'jpg'
                } else {
                    ws.send(JSON.stringify({message:'error'}))
                }
                var image = {
                    fileName: `${data.name}PrdtImg.${imageType}`,
                    data: data.image.replace(`data:image/${imageType};base64,`, '')
                }
                fs.writeFileSync(`${__dirname.replace('/server','')}/images/Companies/${image.fileName}`, image.data, 'base64');
                if (user.Companies.includes(data.company)) {
                    products[data.name] = {
                        'name': data.name,
                        'image': image.fileName,
                        'description': data.description,
                        'price': data.price
                    }
                }
                console.log(products[data.name])
                database.Users[user.Username] = user
                console.log(user)
                fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
                ws.send('done')


            } else if (data.type === 'orderProduct') {
                function createUuid() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0,
                            v = c == 'x' ? r : (r & 0x3 | 0x8);
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
                user.orders[data.name].push({
                    product: data.product,
                    id: orderId,
                    company: data.name,
                    price: data.amount * database.Companies[data.name].products[data.product].price
                })
                database.Companies[data.name].orders[orderId] = {
                    'amount': data.amount,
                    'price': data.amount * database.Companies[data.name].products[data.product].price,
                    'user': user.Username,
                    'product': data.product,
                    'status': 'ordered'
                }
                var owner = database.Users[database.Companies[data.name].owner]
                var notifications = owner.Notifications.Companies[compName]
                notifications.push({
                    'type': 'buyProduct',
                    'user': user.Username,
                    'product': data.product,
                    'amount': data.amount,
                    'cost': data.amount * database.Companies[data.name].products[data.product].price
                })
                database.Users[user.Username] = user
                console.log(user)
                fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
                ws.send(JSON.stringify({
                    order: orderId,
                    status: 'ordered'
                }))
            } else if (data.type === 'buyProduct') {
                console.log(JSON.stringify(data))
                console.log(users)
                var user = users[data.id][1]
                var compName = data.name
                var order = database.Companies[user.name].orders[data.orderId]
                order.status = 'delivered'
                var owner = database.Users[database.Companies[data.name].owner]
                owner.Balance += order.cost
                database.Users[user.Username] = user
                console.log(user)
                fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
                ws.send(JSON.stringify({
                    order: orderId,
                    status: 'delivered'
                }))
            }else if (data.type === 'emitStock') {
                var user = users[data.id][1]
                if(user.Companies.includes(data.name)){
                    database.Companies.stocks += data.amount
                }else{ws.send('incorrect user')}
            }else if (data.type === 'viewBalance'){
                var user = users[data.id][1]
                ws.send(JSON.stringify(user.Balance))
            }else if (data.type === 'addBalance'){
                var user = users[data.id][1]
                user.Balance += parseFloat(data.amount)
                ws.send('done')
            }else if (data.type === 'subtractBalance'){
                var user = users[data.id][1]
                user.Balance -= parseFloat(data.amount)
                ws.send('done')
            }else if (data.type === 'viewUser'){
                console.log(data)
                ws.send(JSON.stringify(users[data.id][1]))
            }else if (data.type === 'editUser'){
                users[data.id][1] = data.user
                database.Users[user.Username] = data.user
                console.log(user)
                fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            }   

        } catch(e) {
            console.log('err: '+e.message)
            ws.send(JSON.stringify({message:'error'}))
        }
    });


});