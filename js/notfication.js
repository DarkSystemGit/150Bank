function renderNotfication(noteObj,onclick){
    var html = `      
    
    <a style="text-decoration: none; color: black">
      <div style="display: flex">
        <img src="./../images/Companies/${noteObj.image}" class="uk-border-rounded"style="margin-right: 1%;height:9vw;width:9vw" alt="" />
        <div>
          <h2>${noteObj.name}</h2>
          <h4 style="margin-top:2%;">Type: <span>${noteObj.type}</span></h4>
          <button class="uk-button uk-button-primary" id="${noteObj.name}InfoButton" style="margin-top: 10%;border-radius: 15px;">
              Order Information
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