const token = localStorage.getItem("token");
if(!token){
    window.location.href = "auth.html";
}


// USER DATA
// ======================

const savedUser =
JSON.parse(localStorage.getItem("teenFashionUser"));


// ======================
// LOAD USER
// ======================

if(savedUser){

    // NAME

    document.getElementById("userName")
    .innerText = savedUser.name;


    // EMAIL

    document.getElementById("userEmail")
    .innerText = savedUser.email || "No Email";


    // INITIALS

    const initials = savedUser.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .substring(0,2)
    .toUpperCase();

    document.getElementById("userAvatar")
    .innerText = initials;

}



// ======================
// SECTION SWITCHING
// ======================

const buttons =
document.querySelectorAll(".menu-btn");

const sections =
document.querySelectorAll(".section");


buttons.forEach(btn => {

    btn.addEventListener("click", () => {

        // REMOVE ACTIVE

        buttons.forEach(b =>
            b.classList.remove("active")
        );

        sections.forEach(sec =>
            sec.classList.remove("active-section")
        );

        // ADD ACTIVE

        btn.classList.add("active");

        const target =
        btn.dataset.section;

        document.getElementById(target)
        .classList.add("active-section");

    });

});





// ======================
// LOAD ORDERS
// ======================

async function loadOrders(){

    const container =
    document.getElementById("ordersContainer");

    if(!container) return;


    const token = localStorage.getItem("token");
    const response = await fetch("http://127.0.0.1:5000/orders", {
    headers: { "Authorization": "Bearer " + token }
    });
    const data = await response.json();
   
   const orders = Array.isArray(data) ? data : (data.orders || []);



    // EMPTY

    if(orders.length === 0){

        container.innerHTML = `

        <div class="empty-box">

            <h3>No Orders Yet 📦</h3>

            <p>Your placed orders will appear here</p>

        </div>

        `;

        return;
    }



    container.innerHTML = "";



    // LATEST FIRST

    [...orders].reverse().forEach(order => {


        /* =========================
        TRACKING SYSTEM
        ========================= */

        const status = order.status;


        const orderedActive =
        ["Ordered","Packed","Shipped",
        "Out For Delivery","Delivered"]
        .includes(status);

        const packedActive =
        ["Packed","Shipped",
        "Out For Delivery","Delivered"]
        .includes(status);

        const shippedActive =
        ["Shipped",
        "Out For Delivery","Delivered"]
        .includes(status);

        const outActive =
        ["Out For Delivery","Delivered"]
        .includes(status);

        const deliveredActive =
        ["Delivered"]
        .includes(status);



        const trackingHTML = `

        <div class="tracking">

            <div class="track-step">

                <div class="track-dot
                ${orderedActive ? "active-dot" : ""}">
                </div>

                <p>Ordered</p>

            </div>


            <div class="track-line
            ${packedActive ? "active-line" : ""}">
            </div>


            <div class="track-step">

                <div class="track-dot
                ${packedActive ? "active-dot" : ""}">
                </div>

                <p>Packed</p>

            </div>


            <div class="track-line
            ${shippedActive ? "active-line" : ""}">
            </div>


            <div class="track-step">

                <div class="track-dot
                ${shippedActive ? "active-dot" : ""}">
                </div>

                <p>Shipped</p>

            </div>


            <div class="track-line
            ${outActive ? "active-line" : ""}">
            </div>


            <div class="track-step">

                <div class="track-dot
                ${outActive ? "active-dot" : ""}">
                </div>

                <p>Out For Delivery</p>

            </div>


            <div class="track-line
            ${deliveredActive ? "active-line" : ""}">
            </div>


            <div class="track-step">

                <div class="track-dot
                ${deliveredActive ? "active-dot" : ""}">
                </div>

                <p>Delivered</p>

            </div>

        </div>

        `;
         
        container.innerHTML += `
<div class="order-card">
    <div class="order-image">
        <img src="${order.product_image}">
    </div>
    <div class="order-info">
        <h3>${order.product_name}</h3>
        <p class="order-id">Order ID : ${order.order_id}</p>
        <p class="delivery-date">Delivery By : ${order.delivery_date || "Coming Soon"}</p>
        <div class="order-price">₹${order.price}</div>
        <div class="order-meta">
            Size : ${order.size || "S"}
            <br>Quantity : ${order.quantity}
            <br>Payment : ${order.payment_method}
        </div>
        <span class="order-status ${order.status === "Delivered" ? "delivered" : "processing"}">
            ${order.status}
        </span>
        ${trackingHTML}
    </div>
</div>
`;

    });

}




// ======================
// LOAD WISHLIST
// ======================

async function loadWishlist(){

    const container = document.getElementById("wishlistContainer");
    if(!container) return;

    const token = localStorage.getItem("token");
    if(!token){
        container.innerHTML = `<div class="empty-box"><h3>Please login ❤️</h3></div>`;
        return;
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if(wishlist.length === 0){
        container.innerHTML = `
        <div class="empty-box">
            <h3>Your wishlist is empty ❤️</h3>
            <p>Add products to wishlist</p>
        </div>
        `;
        return;
    }

    container.innerHTML = "";

    wishlist.forEach((product, index) => {
        container.innerHTML += `
        <div class="wishlist-card">
            <img src="${product.image}">
            <div class="wishlist-details">
                <h3>${product.name}</h3>
                <p>${product.price}</p>
                <div class="wishlist-actions">
                    <button class="move-cart-btn" data-index="${index}">Add To Cart</button>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </div>
            </div>
        </div>
        `;
    });

    document.querySelectorAll(".remove-btn")
    .forEach(btn => {
        btn.addEventListener("click", () => {
            wishlist.splice(btn.dataset.index, 1);
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
            loadWishlist();
        });
    });

    document.querySelectorAll(".move-cart-btn")
    .forEach(btn => {
        btn.addEventListener("click", () => {
            const product = wishlist[btn.dataset.index];
            let cart = JSON.parse(localStorage.getItem("teenFashionCart")) || [];
            const existing = cart.find(item => item.title === product.name);
            if(existing){
                existing.quantity++;
            } else {
                cart.push({
                    title: product.name,
                    price: Number(String(product.price).replace(/[^0-9]/g,"")),
                    image: product.image,
                    quantity: 1,
                    size: "S"
                });
            }
            localStorage.setItem("teenFashionCart", JSON.stringify(cart));
            alert("Added To Cart ✔");
        });
    });
}

// ======================
// LOGOUT
// ======================

document.getElementById("logoutBtn")
.addEventListener("click", () => {

    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/logout", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token }
    });

    localStorage.removeItem("teenFashionUser");
    localStorage.removeItem("token");
    localStorage.removeItem("teenFashionCart");
    localStorage.removeItem("wishlist");
    localStorage.removeItem("userAddress");
    localStorage.removeItem("teenFashionOrders");

    window.location.href = "auth.html";

});

// ======================
// INITIAL LOAD
// ======================



 loadOrders();

loadWishlist();