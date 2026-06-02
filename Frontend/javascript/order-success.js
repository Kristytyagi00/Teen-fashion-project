/* =========================
   ORDER ID
========================= */

const orderId =
localStorage.getItem("latestOrderId");

document.getElementById("orderId")
.innerText = orderId;



/* =========================
   DELIVERY DATE
========================= */

const savedDate =
localStorage.getItem("latestDeliveryDate");

document.getElementById("deliveryDate")
.innerText = savedDate;



/* =========================
   CONTINUE SHOPPING
========================= */

document.querySelector(".continue-btn")
.addEventListener("click", () => {

   window.location.href =
   "../html/homepage.html";

});
