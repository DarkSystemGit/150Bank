function getParameter(pram) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(pram)
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
        var name = getParameter('name')
        console.log(name)
        if (!(name === null)) {
            var productData = JSON.parse(await connection({
                type: 'getProductData',
                name
            }, `${location.hostname}:5002`))
            var product = {
                name: document.getElementById('productName'),
                image: document.getElementById('productImage'),
                price: document.getElementById('productPrice'),
                category: document.getElementById('productCategory'),
                description: document.getElementById('productDiscription')
            }
            product.name.innerHTML = productData.name
            product.price.innerHTML = productData.price
            product.image.src = '/../images/Companies/'+productData.image
            product.category.innerHTML ='Category: '+ productData.category
            product.description.innerHTML = productData.description
            document.getElementById('buy').addEventListener('click',async(e)=>{
                e.preventDefault()
                var cart =JSON.parse(sessionStorage.getItem('cart'))
                if(typeof cart == "undefined"){
                    cart =[]
                }
                productData.amount =parseInt(document.getElementById('productAmount').value)
                cart.push(productData)
                sessionStorage.setItem('cart',JSON.stringify(cart))
                window.location.replace(`http://${location.host}/html/cart.html`)
            })
            
            //window.location.replace(`http://${location.host}/html/market.html`)
        }
    })()