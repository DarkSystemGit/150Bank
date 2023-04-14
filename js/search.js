
function fuzeSearch(query, items) {
  const fuse = new Fuse(items, {
    keys: ["name", "description"],
    threshold: 0.4
  });
  if (!query) {
    return [];
  }
  console.log(fuse.search(query))
  return fuse.search(query).map((result) => result.item);
}

function searchResults(query, items) {
  var search = fuzeSearch(query, items)
  
  var list = document.createElement('div')
  list.innerHTML = `<ul id="searchResults" class="uk-list uk-list-divider"></ul>`
  document.getElementById('main').innerHTML = ""
  document.getElementById('main').appendChild(list)
  console.log(search)
  for (var counter = 0; counter < search.length; counter++) {
    var result = document.createElement('li')
    result.addEventListener('click',function(){})
    var searchResult = `
        <img src="./../images/Companies/${search[counter].image}" style="width:14%;height:14%;"  alt="">                
                <div style="display: block;margin-left: 1%;">
                    <h1 style="margin: 0;">${search[counter].name}</h1>
                    <h4 style="margin: 0;">$${search[counter].price}</h3>
                    <div style="margin-top:2.5%;width: 1px;height: 1px;"></div>
                    <p style="margin: 0;">${search[counter].description}</p>
                </div>
        `
    var resHtml = document.createElement('div').style.display = 'flex'
    resHtml.innerHTML = searchResult
    result.appendChild(resHtml)
    document.getElementById('searchResults').appendChild(result)
  }
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
async function compileProductData() {
    var products = []
    var productList = JSON.parse(await connection({
      type: 'listProducts'
    }, `${location.hostname}:5002`))
    productList.forEach(async (product) => {
      products.push(JSON.parse(await connection({
        type: 'getProductData',
        name: product
      }, `${location.hostname}:5002`)))
    })
    return products
  }
  (async function () {
  var searchBar = document.getElementById('searchBar')
  console.log(searchBar)
  document.getElementById('search').addEventListener('submit',async(e)=>{
    e.preventDefault()
    var products = await compileProductData()
    console.log(searchBar.value)
    searchResults(searchBar.value,products)
  })
  })()