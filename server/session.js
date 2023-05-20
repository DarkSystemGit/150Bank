const WebSocketServer = require(`ws`);
const path = require('path')
const fs = require(`fs`)
const wss = new WebSocketServer.Server({
    port: 5003
});
var users = {};

function log(data) {

    let date_ob = new Date();
    if (!(typeof data.type == "undefined")) {
        var functionName = data.type
    } else {
        var functionName = "unknownFunction"
    }
    if (!(typeof data == "string")) {
        data = JSON.stringify(data, null, 2)
    }
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    // prints date in YYYY-MM-DD format
    //console.log(year + "-" + month + "-" + date);

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "| Log from method: " + functionName + "():\n" + data);

}
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        //fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
        data = JSON.parse(data)

        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        try {

            try {
                log(`Connection From ${users[data.id][1].Username}`)
            } catch {
                log("Not signed in")
            }
            if (data.type === 'login') {
                var user = [data.id, database.Users[data.name]]
                users[data.id] = user
                log(user)
            } else if (data.type === 'createComp') {
                var user = users[data.id]
                database.Companies[data.name].owner = user.Username
                user[1].Companies.push(data.name)
                user[1].Stocks[data.name] = 100
                database.Users[user[1].Username] = user[1]
                log(user)
                fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
                ws.send('done')
            } else if (data.type === 'buyStock') {
                log(JSON.stringify(data))
                log(users)
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

                    log(database.Companies[data.name])
                    if (user.Stocks[compName] > 50) {
                        user.Companies.push(data.name)
                    } else if (user.Companies.includes(data.name) && user.Stocks[compName] <= 50) {
                        user.Companies.splice(user.Companies.indexOf(data.name), 1)
                    }
                    var owner = database.Users[database.Companies[data.name].owner]
                var notifications = owner.Notifications;
                notifications.push({
                    'type': 'buyStock',
                    'user': user.Username,
                    'amount': data.amount,
                    'cost': data.amount * (database.Companies[data.name].worth / database.Companies[data.name].stocks),
                    'company': compName
                });
                database.Users[owner.Username] = owner
                    database.Users[user.Username] = user
                    log(user)
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
                var owner = database.Users[database.Companies[data.name].owner]
                var notifications = owner.Notifications;
                notifications.push({
                    'type': 'sellStock',
                    'user': user.Username,
                    'amount': data.amount,
                    'cost': data.amount * (database.Companies[data.name].worth / database.Companies[data.name].stocks),
                    'company': compName
                });
                database.Users[user.Username] = user
                database.Users[owner.Username] = owner
                fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
                ws.send('done')
            } else if (data.type === 'createProduct') {
                log('prdct')
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
                    ws.send(JSON.stringify({
                        message: 'error'
                    }))
                }
                var image = {
                    fileName: `${data.name}PrdtImg.${imageType}`,
                    data: data.image.replace(`data:image/${imageType};base64,`, '')
                }
                fs.writeFileSync(`${__dirname.replace('/server','')}/client/images/Companies/${image.fileName}`, image.data, 'base64');
                if (user.Companies.includes(data.company)) {
                    products[data.name] = {
                        'name': data.name,
                        'image': image.fileName,
                        'description': data.description,
                        'price': data.price,
                        'category': data.category,
                        'quantity': data.quantity
                    }
                }
                log(products[data.name])
                database.Users[user.Username] = user
                log(user)
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

                log(JSON.stringify(data));
                log(users);
                var user = users[data.id][1];
                var compName = data.name;
                log(database.Companies[data.name].products[data.product].quantity > 0 && user.Balance >= data.amount * database.Companies[data.name].products[data.product].price)
                if (database.Companies[data.name].products[data.product].quantity > 0 && user.Balance >= data.amount * database.Companies[data.name].products[data.product].price) {
                    // This code handles the purchase of a product.
                    database.Companies[data.name].products[data.product].quantity -= data.amount
                    // First, we need to deduct the cost of the product from the user's balance.
                    user.Balance -= data.amount * database.Companies[data.name].products[data.product].price;

                    // Next, we need to create a new order ID.
                    var orderId = createUuid();

                    // If the user does not have an orders object, we need to create one.
                    if (user.orders == undefined) {
                        user.orders = {};
                    }

                    // If the user does not have an orders object for the company that they are buying from, we need to create one.
                    if (user.orders[data.name] == undefined) {
                        user.orders[data.name] = [];
                    }

                    // We need to add the new order to the user's orders object.
                    user.orders[data.name].push({
                        product: data.product,
                        id: orderId,
                        company: data.name,
                        price: data.amount * database.Companies[data.name].products[data.product].price
                    });

                    // If the company does not have an orders object, we need to create one.
                    if (database.Companies[data.name].orders == undefined) {
                        database.Companies[data.name].orders = {};
                    }

                    // We need to add the new order to the company's orders object.
                    database.Companies[data.name].orders[orderId] = {
                        'amount': data.amount,
                        'price': data.amount * database.Companies[data.name].products[data.product].price,
                        'user': user.Username,
                        'product': data.product,
                        'status': 'ordered'
                    };

                    // We need to get the owner of the company that the user is buying from.
                    var owner = database.Users[database.Companies[data.name].owner];
                    log(owner)
                    // If the owner does not have a notifications object, we need to create one.
                    if (owner.Notifications == undefined) {
                        owner.Notifications = [];
                    }

                    // We need to add a new notification to the owner's notifications object.
                    var notifications = owner.Notifications;
                    notifications.push({
                        'type': 'soldProduct',
                        'user': user.Username,
                        'product': data.product,
                        'amount': data.amount,
                        'cost': data.amount * database.Companies[data.name].products[data.product].price,
                        'company': compName
                    });

                    // We need to update the database with the new order.
                    database.Users[owner.Username] = owner;
                    database.Users[user.Username] = user;

                    // We can log the user object for debugging purposes.
                    log(owner.Notifications);

                    // We need to write the updated database to a file.
                    fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database));

                    // We need to send a message to the websocket server to notify the user that their order has been placed.
                    ws.send(JSON.stringify({
                        order: orderId,
                        status: 'ordered'
                    }));
                } else {
                    // Send an error message to the websocket
                    ws.send('Nothing left');
                }
            } else if (data.type === 'buyProduct') {
                log(JSON.stringify(data))
                log(users)
                var user = users[data.id][1]
                var compName = data.name

                var order = database.Companies[user.name].orders[data.orderId]
                order.status = 'delivered'
                var owner = database.Users[database.Companies[data.name].owner]
                owner.Balance += order.cost
                database.Users[user.Username] = user
                log(user)
                fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
                ws.send(JSON.stringify({
                    order: orderId,
                    status: 'delivered'
                }))
            } else if (data.type === 'emitStock') {
                var user = users[data.id][1]
                if (user.Companies.includes(data.name)) {
                    database.Companies.stocks += data.amount
                } else {
                    ws.send('incorrect user')
                }
            } else if (data.type === 'viewBalance') {
                var user = users[data.id][1]
                ws.send(JSON.stringify(user.Balance))
            } else if (data.type === 'addBalance') {
                var user = users[data.id][1]
                user.Balance += parseFloat(data.amount)
                ws.send('done')
            } else if (data.type === 'subtractBalance') {
                var user = users[data.id][1]
                user.Balance -= parseFloat(data.amount)
                ws.send('done')
            } else if (data.type === 'viewUser') {
                log(JSON.stringify(users[data.id][1]))
                ws.send(JSON.stringify(users[data.id][1]))
            } else if (data.type === 'editUser') {
                users[data.id][1] = data.user
                database.Users[user.Username] = data.user
                log(user)
                fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            }
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
        } catch (e) {
            try {
                log(`Error In Connection From ${users[data.id][1].Username}:\n${e.message}`)
            } catch {
                log("Not signed in")
            }

            ws.send(JSON.stringify({
                message: 'error'
            }))
        }
    });


});