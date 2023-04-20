function cartResults() {
    //console.log(items)
    var cart = JSON.parse(sessionStorage.getItem('cart'))
    console.log(cart)
    var list = document.createElement('div')
    list.innerHTML = `<ul id="cartResults" class="uk-list uk-list-divider">
      
    </ul>`
    if(cart.length ==0){
      list.innerHTML = `<ul id="cartResults" class="uk-list uk-list-divider">
      Nothing Found
    </ul>`
    }
    document.getElementById('main').innerHTML = ""
    document.getElementById('main').appendChild(list)
    console.log(cart)
    for (var counter = 0; counter < cart.length; counter++) {
      console.log(cart)
      var result = document.createElement('li')
      
      var cartResult = `
          <img src="./../images/Companies/${cart[counter].image}" style="width:14%;height:14%;"  alt="">                
                  <div style="display: block;margin-left: 1%;">
                      <h1 style="margin: 0;">${cart[counter].name}</h1>
                      <h4 style="margin: 0;">$${cart[counter].price}</h3>
                      <div style="margin-top:2.5%;width: 1px;height: 1px;"></div>
                      <p style="margin: 0;">${cart[counter].description}</p>
                  </div>
          `
      var resHtml = document.createElement('div')
      resHtml.style.display = 'flex'
      resHtml.innerHTML = cartResult
      result.appendChild(resHtml)
      document.getElementById('cartResults').appendChild(result)
    }
  }
  //set cart
  sessionStorage.setItem('cart',(JSON.stringify([{name:"test",price:0,description:"test",image:"pencil.png"},{name:"tesk",price:1,description:"tesp",image:"pencil.png"}])))
  console.log(sessionStorage.getItem('cart'))
  //render cart
  cartResults()