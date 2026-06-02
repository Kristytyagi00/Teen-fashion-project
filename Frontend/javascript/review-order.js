const checkoutType = localStorage.getItem("checkoutType");

let product = null;
let cart = []; 

//    LOAD DATA

if (checkoutType === "cart") {

    cart = JSON.parse(
        localStorage.getItem("teenOrder")
    ) || [];

}

else {

    product = JSON.parse(
        localStorage.getItem("buyProduct")
    );

}


//    BUY NOW RENDER

function renderBuyNow() {

    if (!product) return;

    const container =
    document.getElementById("reviewProductsContainer");

    container.innerHTML = `

        <div class="product-card">

            <img src="${product.image}">

            <div class="product-details">

                <h3>${product.name}</h3>

                <div class="price-line">

                    <div class="review-price">

                        ${
                            product.oldPrice &&
                            product.discount

                            ?

                            `

                            <span class="new-price">
                                ${product.price}
                            </span>

                            <span class="old-price">
                                ${product.oldPrice}
                            </span>

                            <span class="off">
                                ${product.discount}
                            </span>

                            `

                            :

                            `

                            <span class="new-price">
                                ${product.price}
                            </span>

                            `
                        }

                    </div>

                </div>

                <p>
                    Only wrong/defect item returns
                </p>

                <div class="size-qty">

                    Size:
                    ${product.size}

                    •

                    Qty:
                    ${product.quantity}

                </div>

            </div>

        </div>

    `;



    /* OFFER */

    const offerBox =
    document.getElementById("offerBox");

    if (
        product.discount &&
        product.discount !== ""
    ) {

        offerBox.innerText =
        `${product.discount}% OFF on this order`;

    }

    else {

        offerBox.style.display = "none";

    }



    /* PRICE */

    document.getElementById("bottomPrice")
    .innerHTML = product.price;

    document.getElementById("finalPrice")
    .innerHTML = product.price;



    /* BOTTOM OFFER */

    const bottomOffer =
    document.getElementById("bottomOffer");

    if (
        product.discount &&
        product.discount !== ""
    ) {

        bottomOffer.innerText =
        `${product.discount}% OFF`;

    }

    else {

        bottomOffer.style.display = "none";

    }

}


//    CART RENDER

function renderCart() {

    if (cart.length === 0) {

        alert("Cart is empty");

        window.location.href = "cart.html";

        return;
    }

    const container =
    document.getElementById("reviewProductsContainer");

    container.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

            const cleanPrice = Number(
            item.price.toString().replace(/[^0-9]/g, "")
            );

            total += cleanPrice * item.quantity;

        container.innerHTML += `

            <div class="product-card">

                <img src="${item.image}">

                <div class="product-details">

                    <h3>${item.title}</h3>

                    <div class="price-line">

                        <div class="review-price">

                            <span class="new-price">
                                ₹${item.price}
                            </span>

                        </div>

                    </div>

                    <p>
                        Only wrong/defect item returns
                    </p>

                    <div class="size-qty">

                        Size:${item.size}

                        •

                        Qty:
                        ${item.quantity}

                    </div>

                </div>

            </div>

        `;

    });



    /* TOTAL PRICE */

    document.getElementById("bottomPrice")
    .innerHTML = `₹${total}`;

    document.getElementById("finalPrice")
    .innerHTML = `₹${total}`;


    /* HIDE OFFERS */

    document.getElementById("offerBox")
    .style.display = "none";

    document.getElementById("bottomOffer")
    .style.display = "none";

}


//    INITIAL RENDER

if (checkoutType === "cart") {

    renderCart();

}

else {

    renderBuyNow();

}


//    BACK BUTTON

document.querySelector(".back")
.addEventListener("click", () => {

    history.back();

});

//    ADDRESS SYSTEM

const saveBtn     = document.getElementById("saveAddressBtn");
const addressForm = document.querySelector(".address-form");
const changeBtn   = document.getElementById("changeAddressBtn");
const token       = localStorage.getItem("token");

/* SHOW SAVED ADDRESS */
function showSavedAddress(data) {
    document.getElementById("savedUserName").innerText    = data.name + " • " + data.phone;
    document.getElementById("savedUserAddress").innerText = data.address + ", " + data.pincode;
}

/* FILL FORM FOR EDITING */
function fillForm(data) {
    document.getElementById("userName").value    = data.name    || "";
    document.getElementById("userPhone").value   = data.phone   || "";
    document.getElementById("userPincode").value = data.pincode || "";
    document.getElementById("userAddress").value = data.address || "";
}

/* LOAD ADDRESS FROM DATABASE */
async function loadAddress() {
    if (!token) {
        addressForm.style.display = "flex";
        changeBtn.style.display   = "none";
        return;
    }
    try {
        const res = await fetch("http://127.0.0.1:5000/address", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            const data = await res.json();
            showSavedAddress(data);
            addressForm.style.display = "none";
            changeBtn.style.display   = "block";
        } else {
            addressForm.style.display = "flex";
            changeBtn.style.display   = "none";
        }
    } catch (err) {
        addressForm.style.display = "flex";
        changeBtn.style.display   = "none";
    }
}

loadAddress();

/* SAVE ADDRESS TO DATABASE */
if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
        const name    = document.getElementById("userName").value.trim();
        const phone   = document.getElementById("userPhone").value.trim();
        const pincode = document.getElementById("userPincode").value.trim();
        const address = document.getElementById("userAddress").value.trim();

        if (!name || !phone || !pincode || !address) {
            alert("Please fill all details");
            return;
        }
        if (!token) {
            alert("Please login first");
            window.location.href = "auth.html";
            return;
        }

        saveBtn.innerText = "Saving...";
        saveBtn.disabled  = true;

        try {
            const res = await fetch("http://127.0.0.1:5000/address/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ name, phone, pincode, address })
            });
            if (res.ok) {
                showSavedAddress({ name, phone, pincode, address });
                addressForm.style.display = "none";
                changeBtn.style.display   = "block";
                alert("Address Saved Successfully");
            } else {
                alert("Failed to save address. Try again.");
            }
        } catch (err) {
            alert("Server error. Try again.");
        }

        saveBtn.innerText = "Save Address";
        saveBtn.disabled  = false;
    });
}

/* CHANGE ADDRESS */
changeBtn.addEventListener("click", async () => {
    addressForm.style.display = "flex";
    changeBtn.style.display   = "none";

    if (!token) return;

    try {
        const res = await fetch("http://127.0.0.1:5000/address", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            const data = await res.json();
            fillForm(data);
        }
    } catch (err) {
        console.log("Could not load address for editing");
    }
});

//    DELIVERY DATE

const deliveryElement =
document.getElementById("deliveryDate");

const today = new Date();


/* RANDOM DAYS */

const randomDays =
Math.floor(Math.random() * 5) + 3;


/* ADD DAYS */

today.setDate(
    today.getDate() + randomDays
);


const options = {

    weekday: "long",
    day: "numeric",
    month: "long"

};


const finalDate =
today.toLocaleDateString(
    "en-IN",
    options
);


/* SHOW DATE */

deliveryElement.innerText =
`Estimated Delivery by ${finalDate}`;


/* SAVE DATE */

localStorage.setItem(
    "deliveryDate",
    finalDate
);


//    CONTINUE BUTTON

document.querySelector(".continue-btn")
.addEventListener("click", async () => {

    if (!token) {
        alert("Please login first");
        window.location.href = "auth.html";
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/address", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) {
            alert("Please save your address first");
            return;
        }
    } catch (err) {
        alert("Could not verify address. Try again.");
        return;
    }

    if (checkoutType === "cart" && cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    window.location.href = "payment.html";
});