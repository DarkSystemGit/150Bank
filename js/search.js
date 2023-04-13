

function search(query,items) {
    const fuse = new Fuse(items,{keys: ["name", "description"]});  
  if (!query) {
    return [];
  }

  return fuse.search(query).map((result) => result.item);
}
function searchResults(query,items){
    var search = search(query,items)
    var list = document.createElement('div')
    list.innerHTML = `<ul id="searchResults" class="uk-list uk-list-divider"></ul>`
    document.getElementById('main').innerHTML=""
    document.getElementById('main').appendChild(list)
    for(var counter=0;counter<search.length;counter++){
        var result = document.createElement('li')
        result.addEventListener('click')
        var searchResult =`
        <img src="./../images/Companies/${search[counter].image}" style="width:14%;height:14%;"  alt="">                
                <div style="display: block;margin-left: 1%;">
                    <h1 style="margin: 0;">${search[counter].name}</h1>
                    <h4 style="margin: 0;">$${search[counter].price}</h3>
                    <div style="margin-top:2.5%;width: 1px;height: 1px;"></div>
                    <p style="margin: 0;">${search[counter].description}</p>
                </div>
        `
        var resHtml = document.createElement('div').style.display ='flex'
        resHtml.innerHTML = searchResult
        result.appendChild(resHtml)
        document.getElementById('searchResults').appendChild(result)
    }
}
(async function(){
    
})()