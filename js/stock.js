function generateCompanyCardBack(name, image, worth, stocks, description, button, cardPos) {

    var elm = document.getElementById('cards')
    var card = `<div style="grid-column:${cardPos[0]};grid-row:${cardPos[1]};margin:2%;" id="${name}Card" class="uk-card uk-card-default" >
    <div class="uk-card-header">
        <div class="uk-grid-small uk-flex-middle uk-grid" >
            <div class="uk-width-auto">
                <img class="uk-border-circle" width="40" height="40" src="/images/Companies/${image}" alt="Company Logo">
            </div>
            <div>
                <h3 class="uk-card-title uk-margin-remove-bottom">${name}</h3>

            </div>
        </div>
    </div>
    <div style="margin-left:15%;" id="${name}CardEditable">
        <script>
        async function connection(message, url) {
            return new Promise((resolve, reject) => {
                var socket = new WebSocket("ws://" + url + " ");
                socket.onopen = () => {
                    socket.send(message);
                };
                socket.onmessage = (event) => {
                    resolve(event.data);
                };
                socket.onerror = (error) => {
                    reject(error);
                };
            });
        }
        
        setInterval(async function() {
            var elm = document.getElementById("${name}Editible")
            var prices = await connection(JSON.stringify({ type: "pricesList", name: "" }), "192.168.0.16:5002")
            elm.innerHTML = " <h4> Worth: </h4> $" + prices[0] + " <h4> Average Stock Price: </h4> $" + prices[1]
        }, 40)
        </script>
        <p id="${name}Editable">
            <h4>Description:</h4>${description}
            <h4>Worth:</h4> $${worth}
            <h4>Average Stock Price:</h4> $${worth/stocks}
        </p>

    </div>
    <div class="uk-card-footer">
        <a class="uk-button uk-button-text" id="${name}Button">Buy Now</a>
    </div>
</div>`

    elm.innerHTML = `${elm.innerHTML}${card}`

    document.getElementById(`${name}Button`).addEventListener('click', button)

}
async function connection(message, url) {
    return new Promise((resolve, reject) => {
        var socket = new WebSocket(`ws://${url}`);
        socket.onopen = () => {
            socket.send(message);
        };
        socket.onmessage = (event) => {
            resolve(event.data);
        };
        socket.onerror = (error) => {
            reject(error);
        };
    });
}

async function generateCompanyCard(name, button, cardPos, times) {
    console.log(cardPos)
    var companyData = await connection(JSON.stringify({ type: "stocks", name }), '192.168.0.16:5002')
    companyData = JSON.parse(companyData)

    generateCompanyCardBack(companyData.name, companyData.image, companyData.worth, companyData.stocks, companyData.description, button, cardPos)
}
(async function() {
    function multiple(num1, num2){
        var remainder = num1/num2
        remainder=Math.ceil(remainder)
        return remainder
    }
    var companies = await connection(JSON.stringify({ type: "companyList" }), '192.168.0.16:5002')
    companies = JSON.parse(companies)
    var createCompany = document.getElementsByClassName('createStock')[0]
    createCompany.addEventListener('click', async function() {window.location.replace(`http://${location.host}/html/CreateCompany.html`)})
    var heightCounter=0
    for (var counter = 0; counter <= companies.length - 1; counter++) {
        console.log(counter+1)
        if(([counter+1]*100) % 4 ===0){
            console.log('change')
            heightCounter =0
        }
        //console.log(heightCounter)
        await generateCompanyCard(companies[counter], async function() {
            console.log('click');
            await connection(JSON.stringify({ type: "buyShare", name: companies[counter], id:sessionStorage.getItem('sessionId') }), '192.168.0.16:5002')
        }, [heightCounter, multiple(counter+1,4)])
        heightCounter++
    }

})()