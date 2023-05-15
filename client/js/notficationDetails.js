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
        noteObj.content =`<h4 style="margin-top:0.5%;">Price: <span>${noteObj.price}</span></h4>`
        var image = JSON.parse(await connection({type: 'getProductData',name:noteObj.product}, `${location.hostname}:5002`)).image
        noteObj.image = image
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
    const keys=urlParams.keys()
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
    for(var counter =0; counter<item.keys().length;counter++){
      var template = `<h4>${item.keys()[counter]}: ${item[item.keys()[counter]]}<h4>`
      if(item.keys()[counter]=="name"){
        document.getElementById('notficationName').innerHTML= item[item.keys()[counter]].name
      }else if(item.keys()[counter]=="image"){
        document.getElementById('notficationImage').src='/../images/Companies/'+item[item.keys()[counter]].image
      }else if(item.keys()[counter]=="content"){
        continue
      }else{
        appendChild(document.getElementById('display'),template)
      }
    }
  }
  (async ()=>{
    var notfication = await getNotfication()
    renderNotficationData(notfication)
  })()