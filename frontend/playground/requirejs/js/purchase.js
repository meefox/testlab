// function purchaseProduct(){
//   console.log("Function : purchaseProduct");

//   var credits = getCredits();
//   if(credits > 0){
//     reserveProduct();
//     return true;
//   }
//   return false;
// }

define(["credits","products"], function(credits,products) {

  console.log("Function : purchaseProduct");

  return {
    purchaseProduct: function() {

      var credit = credits.getCredits();
      if(credit > 0){
        products.reserveProduct();
        return true;
      }
      return false;
    }
  };
});