document.getElementById('company-form-submit').addEventListener('click', async function() {
    async function processImage(id){

        const fileSelector = document.getElementById(id);
        var file = document.getElementById(id).files[0]
    
        async function readFile(file) {
            return new Promise((resolve, reject) => {
                try{
                var reader = new FileReader();
                reader.loadend = function () {}
                reader.onload = function (e) {
                    var rawData = e.target.result;
                    console.log(rawData);
                    resolve(rawData)
                }
                reader.readAsDataURL(file);
            }catch{
                return;
            }
            })
        }
        var res = await readFile(file)
        return res
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
    async function getFields(){
        var name= document.getElementById('name-field').value
        var dic= document.getElementById('dic-field').value
        var fields = {type:"editCompany",name,"description":dic,
        "image":await processImage('fileUpload'),id:sessionStorage.getItem("sessionId")}
        return fields
    }
    var url //= location.host
    url = `${location.hostname}:5002`
    var res = await getFields()
    var upload = await connection(JSON.stringify(res), `${url}`)
    console.log(`${location.host}/html/stocks.html`)
   
    if(upload==='complete'){
        
        window.location.replace(`http://${location.host}/html/stocks.html`)
}})