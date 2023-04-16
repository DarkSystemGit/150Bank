
function fuzeSearch(query, items,itemList) {
  
  function fuzzySearch(data, searchValue, threshold) {
    // Define a threshold for the similarity score
    const similarityThreshold = threshold || 0.3;
  
    // Define an array to hold the results
    const results = [];
  
    // Loop through each item in the data array
    data.forEach(item => {
      // Calculate the Levenshtein distance between the searchValue and the item's name property
      const distance = levenshteinDistance(searchValue.toLowerCase(), item.name.toLowerCase());
  
      // Calculate the similarity score between 0 and 1 based on the distance
      const similarity = 1 - distance / Math.max(searchValue.length, item.name.length);
  
      // If the similarity score is above the threshold, add the item to the results array
      if (similarity >= similarityThreshold) {
        results.push(item);
      }
    });
  
    // Return the results array
    return results;
  }
  
  // A helper function to calculate the Levenshtein distance between two strings
  function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
  
    const matrix = [];
  
    // Initialize the matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
  
    // Fill in the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
  
    // Return the Levenshtein distance
    return matrix[b.length][a.length];
  }
  
  function fuzzyMatch(query, dictionary) {
    console.log(dictionary)
    var results=fuzzySearch(dictionary,query,0.4) 
    return results
  }
  console.log(fuzzyMatch(query,items,itemList))
  return fuzzyMatch(query,items,itemList)  
}

function searchResults(query, items, itemList) {
  console.log(items)
  var search = fuzeSearch(query, items,itemList)
  console.log(search)
  var list = document.createElement('div')
  list.innerHTML = `<ul id="searchResults" class="uk-list uk-list-divider">
    Nothing Found
  </ul>`
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
    var resHtml = document.createElement('div')
    resHtml.style.display = 'flex'
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
      console.log(location.hostname)
      let data = JSON.parse(await connection({
        type: 'getProductData',
        name: product
      }, `${location.hostname}:5002`))
      products.push(data)
    })
    return {products, productList}
  }
  (async function () {
  var searchBar = document.getElementById('searchBar')
  console.log(searchBar)
  document.getElementById('search').addEventListener('submit',async(e)=>{
    e.preventDefault()
    var products = await compileProductData()
    console.log(products)

    searchResults(searchBar.value,products.products,products.productList)
  })
  })()