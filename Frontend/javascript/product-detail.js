const product =
JSON.parse(localStorage.getItem("selectedProduct"));


// PRODUCT NAME

document.getElementById("productName").innerText =
product.name;


// PRICE

document.getElementById("productPrice").innerHTML =
product.price;


// RATING

document.getElementById("productRating").innerText =
`(${product.rating} Reviews)`;


// DESCRIPTION

document.getElementById("productDescription").innerText =
product.description;


// IMAGE

document.getElementById("mainProductImage").src =
product.image;



// DISCOUNT TAG

const discountTag =
document.getElementById("discount-tag");

if(product.discount){
    discountTag.innerText =
    product.discount + "% OFF";

}else{
    discountTag.style.display =
    "none";

}




/* QUANTITY */

let qty = 1;

const qtyText =
document.getElementById("qty");
document.getElementById("plus")
.addEventListener("click", () => {
    qty++;
    qtyText.innerText = qty;

});

document.getElementById("minus")
.addEventListener("click", () => {
    if(qty > 1){
        qty--;
        qtyText.innerText = qty;

    }

});



/* SIZE ACTIVE */

const sizes =
document.querySelectorAll(".sizes button");

sizes.forEach(btn => {

    btn.addEventListener("click", () => {
        
        sizes.forEach(b =>
            b.classList.remove("active")
        );
        btn.classList.add("active");
    });

});


/* ======================
PRODUCT DETAIL WISHLIST
====================== */

const wishlistBtn =
document.querySelector(".detail-wishlist");

if(wishlistBtn){

    // CHECK IF ALREADY WISHLISTED

     const token = localStorage.getItem("token");

    if(token){
        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const exists = wishlist.some(item => item.name === product.name);
        if(exists) wishlistBtn.classList.add("active");
    }


    // CLICK EVENT

    wishlistBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    const token = localStorage.getItem("token");

    if(!token){
        alert("Please login to use wishlist");
        window.location.href = "auth.html";
        return;
    }

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const existingIndex = wishlist.findIndex(item => item.name === product.name);

    if(existingIndex > -1){
        wishlist.splice(existingIndex, 1);
        wishlistBtn.classList.remove("active");
    }
    else{
        wishlist.push({
            name: product.name,
            price: product.price,
            image: product.image
        });
        wishlistBtn.classList.add("active");
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
});
}

// ======================
// ADD TO CART
// ======================

const addToCartBtn =
document.getElementById("addToCartBtn");

if(addToCartBtn){

    addToCartBtn.addEventListener("click", () => {

        // GET CART
        let cart =
        JSON.parse(
            localStorage.getItem("teenFashionCart")
        ) || [];



        // ACTIVE SIZE
        const activeSize =
        document.querySelector(".sizes .active");

        const selectedSize =
        activeSize
        ? activeSize.innerText
        : "S";



        // PRODUCT OBJECT
        const cartProduct = {

            title: product.name,

            price: Number(
                product.price.toString().replace(/[^0-9]/g,"")
            ),

            image: product.image,

            size: selectedSize,

            quantity: qty

        };



        // CHECK EXISTING PRODUCT
        const existing =
        cart.find(item =>

            item.title === cartProduct.title &&
            item.size === cartProduct.size

        );



        // UPDATE QUANTITY
        if(existing){

            existing.quantity += qty;

        }

        // ADD NEW
        else{

            cart.push(cartProduct);

        }



        // SAVE
        localStorage.setItem(
            "teenFashionCart",
            JSON.stringify(cart)
        );



        // BUTTON EFFECT
        addToCartBtn.innerText =
        "Added ✔";

        setTimeout(() => {

            addToCartBtn.innerText =
            "Add To Cart";

        },1500);

    });

}



const buyNowBtn =
document.getElementById("buyNowBtn");

if(buyNowBtn){

    buyNowBtn.addEventListener("click", () => {

        // ACTIVE SIZE
        const activeSize =
        document.querySelector(".sizes .active");

        const selectedSize =
        activeSize
        ? activeSize.innerText
        : "S";



        // PRODUCT OBJECT
        const buyProduct = {

            name: product.name,

            price: product.price,

            image: product.image,

            size: selectedSize,

            quantity: qty,

            discount: product.discount || "",

            oldPrice: product.oldPrice || ""

        };



        // SAVE BUY PRODUCT
        localStorage.setItem(
            "buyProduct",
            JSON.stringify(buyProduct)
        );



        // SAVE TYPE
        localStorage.setItem(
            "checkoutType",
            "buyNow"
        );



        // REDIRECT
        window.location.href =
        "review-order.html";

    });

}