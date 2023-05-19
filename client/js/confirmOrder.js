async function connection(message, url) {
    return new Promise((resolve, reject) => {
        var socket = new WebSocket(`ws://${url}`);
        socket.onopen = () => {
            socket.send(JSON.stringify(message));
        };
        socket.onmessage = (event) => {
            resolve(event.data);
        };
        socket.onerror = (error) => {
            reject(error);
        };
    });
  }
  function getOrderData(){
    return document.getElementById('orderInput').value
  }
  function getUrlPrams(){
    const urlParams = new URLSearchParams(window.location.search);
    const keys=[]
    for(var key of urlParams.keys()) { 
      keys.push(key)
    }
    var prams ={}
    keys.forEach((key)=>{
        prams[key]=urlParams.get(key)
    })
    return prams
  }
  (async ()=>{
    document.getElementById('orderInput').addEventListener('submit',async(e)=>{
        e.preventDefault()
        var id =getOrderData()
        var company = getUrlPrams().company
        var res = await connection({
            type: 'buyProduct',
            orderId:id,
            name:company,
            id:sessionStorage.getItem('sessionId')
          }, `${location.hostname}:5003`)
          if(!(res==='error')){
            document.getElementById('main').innerHTML = `<img src="./../images/check-circle.svg" style="height: 15%;width: 15%;"alt="">
            <h1 style="font-size: 3em;">Thanks fo confirming your order! You should recive your money soon.</h1>`
          }
    })
  })()