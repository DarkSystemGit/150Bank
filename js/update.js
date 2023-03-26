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