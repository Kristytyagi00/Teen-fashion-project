// STRIPE SETUP
let stripe = null;
let elements = null;
let cardElement = null;
let cardMounted = false;

// FETCH STRIPE KEY FROM BACKEND
async function initStripe(){
    const res = await fetch("http://127.0.0.1:5000/config");
    const data = await res.json();
    stripe = Stripe(data.stripe_key);
    elements = stripe.elements();
}

initStripe();

const checkoutType = localStorage.getItem("checkoutType");
let product = null;
let cart = [];

if(checkoutType === "cart"){
    cart = JSON.parse(localStorage.getItem("teenOrder")) || [];
} else {
    product = JSON.parse(localStorage.getItem("buyProduct"));
}

/* PRICE EXTRACTOR */
function extractPrice(priceText){
    if(!priceText) return 0;
    const temp = document.createElement("div");
    temp.innerHTML = priceText;
    const newPrice = temp.querySelector(".new-price");
    if(newPrice) return Number(newPrice.innerText.replace(/[^0-9]/g,""));
    return Number(temp.innerText.replace(/[^0-9]/g,""));
}

// FINAL PRICE
let originalPrice = 0;
let finalPrice = 0;

if(checkoutType === "buyNow" && product){
    originalPrice = product.oldPrice ? extractPrice(product.oldPrice) : extractPrice(product.price);
    finalPrice = extractPrice(product.price);
} else if(checkoutType === "cart"){
    cart.forEach(item => {
        let itemPrice = item.price;
        if(typeof itemPrice === "string") itemPrice = Number(itemPrice.replace(/[^0-9]/g,""));
        if(isNaN(itemPrice)) itemPrice = 0;
        finalPrice += itemPrice * item.quantity;
    });
    originalPrice = finalPrice;
}

// DISCOUNTS
const qrDiscount = 20;
const stripeDiscount = 15;
const qrPrice = finalPrice - qrDiscount;
const stripePrice = finalPrice - stripeDiscount;

// OFFER BOX
const offerBox = document.getElementById("offerBox");
offerBox.style.display = "none";

// INITIAL PRICE UI
document.getElementById("codPrice").innerText = `₹${finalPrice}`;
document.getElementById("qrOldPrice").innerText = `₹${finalPrice}`;
document.getElementById("qrPrice").innerText = `₹${qrPrice}`;
document.getElementById("qrSave").innerText = `${qrDiscount}%`;
document.getElementById("onlineOldPrice").innerText = `₹${finalPrice}`;
document.getElementById("onlinePrice").innerText = `₹${stripePrice}`;
document.getElementById("onlineSave").innerText = `${stripeDiscount}%`;
document.getElementById("finalPrice").innerText = `₹${finalPrice}`;
document.getElementById("detailOriginalPrice").innerText = `₹${originalPrice}`;
document.getElementById("detailDiscount").innerText = `0% OFF`;
document.getElementById("detailFinalPrice").innerText = `₹${finalPrice}`;

// QR CODE
const upiId = "rudrakshityagi5@oksbi";
document.getElementById("upiQR").src =
`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${upiId}&pn=Shop&am=${qrPrice}&cu=INR`;

// BACK BUTTON
document.querySelector(".back").addEventListener("click", () => {
    window.location.href = "../html/review-order.html";
});

// PAYMENT SYSTEM
const paymentCards = document.querySelectorAll(".payment-card");
const placeOrderBtn = document.querySelector(".place-order-btn");
const stripeCardSection = document.getElementById("stripe-card-section");

let selectedMethod = "";

// PAYMENT CARD CLICK
paymentCards.forEach((card, index) => {
    card.addEventListener("click", () => {

        paymentCards.forEach(item => item.classList.remove("active"));
        card.classList.add("active");
        stripeCardSection.classList.remove("show");

        // COD
        if(index === 0){
            selectedMethod = "COD";
            offerBox.style.display = "none";
            document.getElementById("qr-confirm-section").style.display = "none";
            document.getElementById("finalPrice").innerText = `₹${finalPrice}`;
            document.getElementById("detailOriginalPrice").innerText = `₹${originalPrice}`;
            document.getElementById("detailDiscount").innerText = `0% OFF`;
            document.getElementById("detailFinalPrice").innerText = `₹${finalPrice}`;
        }

        // QR
        else if(index === 1){
            selectedMethod = "QR";
            document.getElementById("qr-confirm-section").style.display = "block";
            offerBox.style.display = "block";
            offerBox.innerText = `${qrDiscount}% OFF on Scan & Pay`;
            document.getElementById("finalPrice").innerText = `₹${qrPrice}`;
            document.getElementById("detailOriginalPrice").innerText = `₹${originalPrice}`;
            document.getElementById("detailDiscount").innerText = `${qrDiscount}% OFF`;
            document.getElementById("detailFinalPrice").innerText = `₹${qrPrice}`;
        }

        // STRIPE
        else if(index === 2){
            selectedMethod = "STRIPE";
            document.getElementById("qr-confirm-section").style.display = "none";
            stripeCardSection.classList.add("show");

            if(!cardMounted){
                cardElement = elements.create('card', {
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#111',
                            fontFamily: 'Poppins, sans-serif',
                            '::placeholder': { color: '#aaa' }
                        },
                        invalid: { color: '#e24b4a' }
                    }
                });
                cardElement.mount("#card-element");
                cardMounted = true;

                cardElement.on('change', (event) => {
                    const errorDiv = document.getElementById("card-errors");
                    errorDiv.innerText = event.error ? event.error.message : "";
                });
            }

            offerBox.style.display = "block";
            offerBox.innerText = `${stripeDiscount}% OFF on Card Payment`;
            document.getElementById("finalPrice").innerText = `₹${stripePrice}`;
            document.getElementById("detailOriginalPrice").innerText = `₹${originalPrice}`;
            document.getElementById("detailDiscount").innerText = `${stripeDiscount}% OFF`;
            document.getElementById("detailFinalPrice").innerText = `₹${stripePrice}`;
        }
    });
});

// PLACE ORDER
placeOrderBtn.addEventListener("click", async () => {

    if(selectedMethod === ""){
        alert("Please Select Payment Method");
        return;
    }
    
    if(selectedMethod === "QR"){
        const utr = document.getElementById("utrInput").value.trim();
        if(utr === ""){
            document.getElementById("utr-error").innerText = "Please enter UTR / Transaction ID after payment";
            document.getElementById("utrInput").focus();
            return;
        }
        if(utr.length < 6){
            document.getElementById("utr-error").innerText = "Please enter a valid UTR number";
            return;
        }
        localStorage.setItem("paymentUTR", utr);
    }

    const token = localStorage.getItem("token");
    if(!token){
        alert("Please login first");
        window.location.href = "auth.html";
        return;
    }

    try {

        // STRIPE PAYMENT
        if(selectedMethod === "STRIPE"){

            if(!cardMounted || !cardElement){
                alert("Please enter card details");
                return;
            }

            placeOrderBtn.innerText = "Processing...";
            placeOrderBtn.disabled = true;

            const totalText = document.getElementById("finalPrice").innerText;
            const amount = parseInt(totalText.replace(/[^0-9]/g,""));

            // CREATE PAYMENT INTENT
            const intentRes = await fetch("http://127.0.0.1:5000/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ amount: amount })
            });

            const intentData = await intentRes.json();

            if(intentData.error){
                alert("Payment setup failed: " + intentData.error);
                placeOrderBtn.innerText = "Place Order";
                placeOrderBtn.disabled = false;
                return;
            }

            // CONFIRM CARD PAYMENT
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                intentData.client_secret,
                { payment_method: { card: cardElement } }
            );

            if(error){
                document.getElementById("card-errors").innerText = error.message;
                placeOrderBtn.innerText = "Place Order";
                placeOrderBtn.disabled = false;
                return;
            }

            if(paymentIntent.status !== "succeeded"){
                alert("Payment failed. Please try again.");
                placeOrderBtn.innerText = "Place Order";
                placeOrderBtn.disabled = false;
                return;
            }

            selectedMethod = "STRIPE_PAID";
        }

        // PLACE ORDER IN DATABASE
        if(checkoutType === "buyNow" && product){

            const response = await fetch("http://127.0.0.1:5000/order/place", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    product_name: product.name,
                    product_image: product.image,
                    price: extractPrice(product.price),
                    size: product.size,
                    quantity: product.quantity,
                    payment_method: selectedMethod
                })
            });

            const data = await response.json();
            if(!response.ok){
                alert("Order failed: " + data.error);
                return;
            }

            localStorage.setItem("latestOrderId", data.order_id);
            localStorage.setItem("latestDeliveryDate", data.delivery_date);
        }

        else if(checkoutType === "cart"){
            for(const item of cart){
                const response = await fetch("http://127.0.0.1:5000/order/place", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({
                        product_name: item.title || item.name,
                        product_image: item.image,
                        price: item.price,
                        size: item.size || "S",
                        quantity: item.quantity,
                        payment_method: selectedMethod
                    })
                });

                const data = await response.json();
                if(!response.ok){
                    alert("Order failed: " + data.error);
                    return;
                }

                localStorage.setItem("latestOrderId", data.order_id);
                localStorage.setItem("latestDeliveryDate", data.delivery_date);
            }

            localStorage.removeItem("teenFashionCart");
            localStorage.removeItem("teenOrder");
        }

        localStorage.removeItem("checkoutType");
        localStorage.removeItem("buyProduct");
        window.location.href = "../html/order-success.html";

    } catch(error) {
        console.error("Order error:", error);
        alert("Server error. Please try again.");
        placeOrderBtn.innerText = "Place Order";
        placeOrderBtn.disabled = false;
    }
});

// PRICE DETAILS DROPDOWN
document.querySelector(".price-toggle").addEventListener("click",()=>{
    document.querySelector(".price-details-dropdown").classList.toggle("show");
    document.querySelector(".price-arrow").classList.toggle("rotate");
});

// RESELLING DROPDOWN
document.querySelector(".resale-toggle").addEventListener("click",()=>{
    document.querySelector(".resale-dropdown").classList.toggle("show");
    document.querySelector(".resale-arrow").classList.toggle("rotate");
});