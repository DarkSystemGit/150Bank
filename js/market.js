function createProduct(name, image,cost,description){
    var productCard = `<div class="uk-card uk-card-default uk-width-1-4" style="margin:1%;">
    <div class="uk-card-media-top">
        <img src="./../images/Companies${image}" style="width:100%;height:50%;"  alt="">
    </div>
    <div class="uk-card-body">
        <h1 class="uk-card-title" style="text-align: center;">${name}</h3>
          <h5 style="text-align: center;">${description}</h5>
        <h4 style="text-align: center;">$${cost}</h4>
    </div>
    <div class="uk-card-media-bottom">
      <img src="./../images/Buy Now.png" style="width:100%;height:50%;" alt="">
  </div>
</div>`
}