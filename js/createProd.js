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
(async()=>{
    var companies = JSON.parse(await connection(JSON.stringify({ type: "viewUser" ,id:sessionStorage.getItem('sessionId')}), '192.168.0.16:5003')).Companies
    companies.forEach((value) => {
  const optionElement = document.createElement("option");
  optionElement.value = value;
  optionElement.text = value;
  document.getElementById('company-select').appendChild(optionElement);
});
})()
document.getElementById('product-form').addEventListener('submit', async function (e) {

    e.preventDefault()
    async function processImage(id) {
        const fileSelector = document.getElementById(id);
        var file = document.getElementById(id).files[0]

        async function readFile(file) {
            return new Promise((resolve, reject) => {
                var reader = new FileReader();
                reader.loadend = function () {}
                reader.onload = function (e) {
                    var rawData = e.target.result;
                    console.log(rawData);
                    resolve(rawData)
                }
                reader.readAsDataURL(file);
            })
        }
        var res = await readFile(file)
        return res
    }
    
    async function getFields() {
        var name = document.getElementById('name-field').value
        var dis = document.getElementById('dis-field').value
        var price = document.getElementById('price-field').value
        var company = document.getElementById('company-select').value
        var fields = {
            type: "createProduct",
            name,
            "description": dis,
            "image": await processImage('fileUpload'),
            price,
            company,
            id: sessionStorage.getItem("sessionId")
        }
        return fields
    }
    var url //= location.hostname
    url = "192.168.0.16:5003"
    var res = await getFields()
    var upload = await connection(JSON.stringify(res), `${url}`)
    console.log(`${location.host}/html/stocks.html`)

    if (upload === 'complete') {

        window.location.replace(`http://${location.hostname}:${location.port}/html/dashboard.html`)
    }
})