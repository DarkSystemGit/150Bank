function createProduct(name, image, cost, description, category) {
  var productCard = `
    <div class="uk-card-media-top">
        <img src="./../images/Companies/${image}" style="width:100%;height:50%;"  alt="">
    </div>
    <div class="uk-card-body">
        <h1 class="uk-card-title" style="text-align: center;">${name}</h3>
          <h5 style="text-align: center;">${description}</h5>
        <h4 style="text-align: center;">$${cost}</h4>
    </div>
    <div class="uk-card-media-bottom">
      <img id="${name}Button" src="./../images/Buy Now.png" style="width:100%;height:50%;" alt="">
      <script>
      var elm = document.getElementById("${name}Button");
      console.log('run')
      elm.addEventListener('click',async function(){
        window.location.replace('${location.host}/html/signup.html')
      })
      <script>
  </div>`
  var elm = document.createElement('div')
  elm.classList.add('uk-card', 'uk-card-default', 'uk-width-1-4')
  elm.style.margin = "1%"
  elm.innerHTML = productCard
  console.log(category)
  document.getElementById(category.toLowerCase()).appendChild(elm)

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
  (async () => {
    function multiple(num1, num2) {
      var remainder = num1 / num2
      remainder = Math.ceil(remainder)
      return remainder
    }
    var productsList = JSON.parse(await connection({
      type: 'listProducts'
    }, `${location.hostname}:5002`))
    
    for (var counter=0; productsList.length < counter; counter++) {
      let product = JSON.parse(await connection({
        type: 'getProductData',
        name: productsList[counter]
      }, `${location.hostname}:5002`))
      products[product.catagory][product.name] == product
    }

    for (var counter=0; Object.keys(products).length < counter; counter++) {
      let category =products[Object.keys(products)[counter]]
      
      for(var categoryCounter=0;categoryCounter<Object.keys(category).length;categoryCounter++) {
        if(!categoryCounter==3){
          let product = category[Object.keys(category)[categorCounter]]
          createProduct(product.name,product.image,product.price,product.description,product.category)
        }
      };
    }

  })()