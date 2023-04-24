const path = require('path')
const fs = require(`fs`)
const WebSocket = require(`ws`);
const wss = new WebSocket.Server({
    port: 5002
})
async function connection(message, url) {
    return new Promise((resolve, reject) => {
        var socket = new WebSocket(`ws://${url}`);
        socket.on('open', () => {
            socket.send(message);
        });
        socket.on('message', (event) => {
            resolve(event.data);
        });
        socket.on('error', (error) => {
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
    ws.onerror = function () {
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
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            var uuid = createUuid()
            var password = database.Users[data.username]
            password = password.Password
            if (data.password === password) {
                readWs.on('open', function open() {
                    readWs.send(JSON.stringify({
                        type: 'login',
                        name: data.username,
                        id: uuid
                    }));
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
    } else if (data.type === "createCompany") {
        try {
            var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
            var imageType;
            if (data.image.includes('png')) {
                imageType = 'png'
            } else if (data.image.includes('jpeg')) {
                imageType = 'jpeg'
            } else if (data.image.includes('jpg')) {
                imageType = 'jpg'
            } else {
                ws.send('error')
            }
            var image = {
                fileName: `${data.name}.${imageType}`,
                data: data.image.replace(`data:image/${imageType};base64,`, '')
            }
            fs.writeFileSync(`${__dirname.replace('/server','')}/images/Companies/${image.fileName}`, image.data, 'base64');
            var company = {
                'description': data.description,
                'name': data.name,
                'image': image.fileName,
                'products': {},
                'worth': 0,
                'stocks': 0,
                'soldStocks': 0,
                
            }
            console.log(company)
            database.Companies[data.name] = company
            fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(database))
            var res = await connection(JSON.stringify({
                type: 'createComp',
                name: data.name,
                id: data.id
            }), "127.0.0.1:5003")
            if (res === 'done') {
                ws.send('complete')
            }
        } catch {
            ws.send('error')
        }

    } else if (data.type === "buyStock") {
        await connection(JSON.stringify({
            type: 'buyStock',
            name: data.name,
            amount: data.amount,
            id: data.id
        }), "127.0.0.1:5003")
    } else if (data.type === "sellStock") {
        await connection(JSON.stringify({
            type: 'sellStock',
            name: data.name,
            amount: data.amount,
            id: data.id
        }), "127.0.0.1:5003")
    } else if (data.type === 'listProducts') {

        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        var products = []
        var comps = Object.keys(database.Companies)

        for (var counter=0; counter < comps.length; counter++) {
            console.log(Object.keys(database.Companies[comps[counter]].products))
            products.push(...Object.keys(database.Companies[comps[counter]].products))
        }


        ws.send(JSON.stringify(products))
    } else if (data.type === 'getCompany') {
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        ws.send(database.Companies[data.name])
    } else if (data.type == 'getProductData') {
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`))
        var product;
        var comps = Object.keys(database.Companies)
        console.log(data)
        for (var counter=0; counter < comps.length; counter++) {
            console.log(Object.keys(database.Companies[comps[counter]].products))
            if (Object.keys(database.Companies[comps[counter]].products).includes(data.name)) {
                product = database.Companies[comps[counter]].products[data.name]
                product.company = comps[counter]
                console.log(product)
            }

        }
        if (product == null) {
            ws.send('error')
        } else {
            ws.send(JSON.stringify(product))
           
        }
    } else if(data.type === "searchProducts"){
        //returns a list of products based off the value of data.name
        var database = JSON.parse(fs.readFileSync(`${__dirname}/data/data.json`)) 
        function fuzzySearch(data, searchValue, threshold) {
            // Define a threshold for the similarity score
            const similarityThreshold = threshold || 0.3;
          
            // Define an array to hold the results
            const results = [];
          
            // Loop through each item in the data array
            data.forEach(item => {
              // Calculate the Levenshtein distance between the searchValue and the item's name property
              const distance = levenshteinDistance(searchValue.toLowerCase(), item.name.toLowerCase());
          
              // Calculate the similarity score between 0 and 1 based on the distance
              const similarity = 1 - distance / Math.max(searchValue.length, item.name.length);
          
              // If the similarity score is above the threshold, add the item to the results array
              if (similarity >= similarityThreshold) {
                results.push(item);
              }
            });
          
            // Return the results array
            return results;
          }
          
          // A helper function to calculate the Levenshtein distance between two strings
          function levenshteinDistance(a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;
          
            const matrix = [];
          
            // Initialize the matrix
            for (let i = 0; i <= b.length; i++) {
              matrix[i] = [i];
            }
            for (let j = 0; j <= a.length; j++) {
              matrix[0][j] = j;
            }
          
            // Fill in the matrix
            for (let i = 1; i <= b.length; i++) {
              for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                  matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                  matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1,
                  );
                }
              }
            }
          
            // Return the Levenshtein distance
            return matrix[b.length][a.length];
          }
          function compileProductData(){
            var products = []
            var comps = Object.keys(database.Companies)
            //console.log(comps)
            for(var counter=0;counter<comps.length;counter++){
                var companyProducts = database.Companies[comps[counter]].products
                //console.log('comp '+JSON.stringify(companyProducts))
                //console.log(Object.keys(companyProducts))
                for(var i =0;Object.keys(companyProducts).length>i;i++){
                    //console.log(companyProducts[Object.keys(companyProducts)[i]])
                    products.push(companyProducts[Object.keys(companyProducts)[i]])
                }
                
            }
           //console.log(products)
            return products
          }
          //console.log(data.name)
          console.log(fuzzySearch(compileProductData(),data.name,0.3))
          ws.send(JSON.stringify({res:fuzzySearch(compileProductData(),data.name,0.3)}))
    }
}