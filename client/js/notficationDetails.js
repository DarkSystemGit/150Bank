async function getUserNotfications(){
    var userData = JSON.parse(await connection({
      type: 'viewUser',
      id:sessionStorage.getItem('sessionId')
    }, `${location.hostname}:5003`))
    console.log(userData)
    var notfications = []
    Object.keys(userData.orders).forEach(key => {
      console.log(key)
      let rawOrders = userData.orders[key]
      let orders = rawOrders.map(order => {
        order.type = 'order'
        return order
      })
      notfications.push(...orders)
    })
    if(!(userData.Notfications == null)){
      notfications.push(...userData.Notfications)
    }
    return notfications
  }
  async function patchNotfication(){
    var notfications = await getUserNotfications()
    var res=await Promise.all(notfications.map(async (noteObj) => {
      if(noteObj.type == 'soldProduct'){
        noteObj.type='Product Sale'
      }else if(noteObj.type== 'order'){
        noteObj.type='Order'
        noteObj.name =noteObj.product
        console.log(noteObj)
        delete noteObj.product
        noteObj.content =`<h4 style="margin-top:0.5%;">Price: <span>${noteObj.price}</span></h4>`
        var image = JSON.parse(await connection({type: 'getProductData',name:noteObj.product}, `${location.hostname}:5002`)).image
        noteObj.image = image
        //noteObj["Order Id"] = noteObj.id
      }else if(noteObj.type== 'sellStock'){
        noteObj.type='Stock Sale'
      }else if(noteObj.type== 'buyStock'){
        noteObj.type='Stock Order'
      }
      return noteObj
    }))
    return res
  }
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
  async function parseNotfications(){
    var rawNotfications = await patchNotfication()
    var notfications = {}
    rawNotfications.forEach((item)=>{
      notfications[item.name]=item
    })
    return notfications
  }
  async function getNotfication(){    
    var notfications = await parseNotfications()
    return notfications[getUrlPrams().name]
  }
  function appendChild(elm, child){
    var childWrapper = document.createElement('div')
    childWrapper.innerHTML =child
    elm.appendChild(childWrapper)
  }
  function renderNotficationData(item){
    for(var counter =0; counter<Object.keys(item).length;counter++){
      var template = `<h4>${toUppercase(Object.keys(item)[counter])}: ${item[Object.keys(item)[counter]]}<h4>`
      if(Object.keys(item)[counter]=="name"){
        console.log(item[Object.keys(item)[counter]])
        document.getElementById('notficationName').innerHTML= toUppercase(item[Object.keys(item)[counter]])
      }else if(Object.keys(item)[counter]=="image"){
        document.getElementById('notficationImage').src='./../images/Companies/'+item[Object.keys(item)[counter]]
      }else if(Object.keys(item)[counter]=="content"){
        continue
      }else{
        appendChild(document.getElementById('details'),template)
      }
    }
  }
  function toUppercase(str){
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  (async ()=>{
    var notfication = await getNotfication()
    renderNotficationData(notfication)
  })()