function renderNotfication(noteObj,onclick,content){
  if (noteObj.content == null) {
    var content = ""
  }else{
    var content = noteObj.content
  }
  if (noteObj.type == null) {
    var optinalType
  }else{
    var optinalType = `<h4 style="margin-top:2%;">Type: <span>${noteObj.type}</span></h4>`
  
  }
    var html = `      
    
    <a style="text-decoration: none; color: black">
      <div style="display: flex">
        <img src="./../images/Companies/${noteObj.image}" class="uk-border-rounded"style="margin-right: 1%;height:9vw;width:9vw" alt="" />
        <div>
          <h2>${noteObj.name}</h2>
          ${optinalType}
          ${content}
          <button class="uk-button uk-button-primary" id="${noteObj.name}InfoButton" style="margin-top: 10%;border-radius: 15px;">
              Details
          </button>
        </div>
        

      </div>
    </a>
  `
  var item=document.createElement('li')
  item.innerHTML = html
  item.querySelector('#'+noteObj.name+'InfoButton').addEventListener('click',onclick)
  return item
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
async function getUserNotfications(){
  var userData = JSON.parse(await connection({
    type: 'viewUser',
    id:sessionStorage.getItem('sessionId')
  }, `${location.hostname}:5003`))
  var notfications = []
  Object.keys(userData.orders).forEach(key => {
    let rawOrders = userData.orders[key]
    let orders = rawOrders.map(order => {
      order.type = 'order'
      return order
    })
    notfications.push(...orders)
  })
  notfications.push(...userData.Notfications)
  return notfications
}
async function patchNotfication(){
  var notfications = await getUserNotfications()
  var res=notfications.map(noteObj => {
    if(noteObj.type == 'soldProduct'){
      noteObj.type='Product Sale'
    }else if(noteObj.type== 'order'){
      noteObj.type='Order'
    }else if(noteObj.type== 'sellStock'){
      noteObj.type='Stock Sale'
    }else if(noteObj.type== 'buyStock'){
      noteObj.type='Stock Order'
    }
    return noteObj
  })
  return res
}
async function renderNotfications(){
  var notfications = await patchNotfication()
  notfications.forEach(noteObj => {
    if(noteObj.type=='Order'){
      
    }
  })

}