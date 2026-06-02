const API = "http://127.0.0.1:5000";
document.addEventListener("DOMContentLoaded", () => {
  const productCards = document.querySelectorAll(".product-card");
  const applyBtn = document.querySelector(".filter-btn");
  const resetBtn = document.querySelector(".reset-btn");
  const sortSelect = document.querySelector(".sort-box select");
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromURL = urlParams.get("category");
  const searchFromURL = urlParams.get("search");
  const bodyFromURL = urlParams.get("body");
  const skinFromURL = urlParams.get("skin");

  let selectedCategories = [];

  if (categoryFromURL) {
    selectedCategories = [categoryFromURL.toLowerCase()];

    productCards.forEach((card) => {
      const category = (card.dataset.category || "").trim().toLowerCase();

      if (selectedCategories.includes(category)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  if (searchFromURL) {
    const query = searchFromURL.toLowerCase();
    let found = 0;
    productCards.forEach((card) => {
      const name = (card.dataset.name || "").toLowerCase();
      const category = (card.dataset.category || "").toLowerCase();
      const description = (card.dataset.description || "").toLowerCase();

      if (
        name.includes(query) ||
        category.includes(query) ||
        description.includes(query)
      ) {
        card.style.display = "block";
        found++;
      } else {
        card.style.display = "none";
      }
    });

    // SHOW QUERY IN SEARCH BOX
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = searchFromURL;

    if (found === 0) {
      const grid = document.querySelector(".products-grid");
      if (grid) {
        grid.innerHTML += `
            <div style="text-align:center; padding:3rem; width:100%">
                <h3 style="color:#888">No results found for "${searchFromURL}"</h3>
                <p style="color:#aaa">Try searching on other pages or use filters</p>
            </div>`;
      }
    }
  }

  // SHOW AI RECOMMENDATION BANNER
  if (categoryFromURL && bodyFromURL) {
    const topbar = document.querySelector(".products-topbar");
    if (topbar) {
      topbar.innerHTML += `
        <div style="
            background:linear-gradient(135deg,#ff4f8b,#ff7aa2);
            color:white;
            padding:10px 16px;
            border-radius:12px;
            font-size:13px;
            font-weight:600;
            margin-top:10px;
            width:100%;
        ">
            ✨ Showing ${categoryFromURL} picks for ${bodyFromURL} body type
            ${skinFromURL ? `with ${skinFromURL} skin tone` : ""}
        </div>`;
    }
  }

  /* ======================
    CATEGORY FIX (IMPORTANT)
    ====================== */

  const categoryInputs = document.querySelectorAll(
    ".filter-sidebar input[type='checkbox']",
  );

  categoryInputs.forEach((input) => {
    input.addEventListener("change", () => {
      selectedCategories = Array.from(categoryInputs)
        .filter((i) => i.checked)
        .map((i) => i.value.trim().toLowerCase());
    });
  });

  /* ======================
    APPLY FILTER
    ====================== */
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      productCards.forEach((card) => {
        let show = true;

        const category = (card.dataset.category || "").trim().toLowerCase();

        const price = Number(
          (card.dataset.price || "0").replace("₹", "").replace(/,/g, ""),
        );

        /* CATEGORY FILTER */
        if (selectedCategories.length > 0) {
          if (!selectedCategories.includes(category)) {
            show = false;
          }
        }

        /* PRICE FILTER */
        const selectedPrice = document.querySelector(
          'input[name="price"]:checked',
        );

        if (selectedPrice) {
          const text = selectedPrice.parentElement.innerText.toLowerCase();

          if (text.includes("under") && price >= 1000) show = false;

          if (text.includes("1000") && (price < 1000 || price > 1499))
            show = false;

          if (text.includes("1500") && (price < 1500 || price > 1999))
            show = false;

          if (text.includes("above") && price <= 2000) show = false;
        }

        card.style.display = show ? "block" : "none";
      });
    });
  }

  /* RESET */
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      selectedCategories = [];

      document.querySelectorAll("input").forEach((i) => (i.checked = false));

      productCards.forEach((card) => (card.style.display = "block"));
    });
  }

  /* ======================
GLOBAL WISHLIST
====================== */

  /* ======================
PRODUCT DETAIL WISHLIST
====================== */

  // Product Detail Page
});
function openProduct(card) {
  // PRICE HTML
  const priceHTML = card.querySelector(".price").innerHTML;

  // SALE TAG
  const saleTag = card.querySelector(".tag.sale");

  // DISCOUNT VALUE
  const discount = saleTag ? saleTag.dataset.discount : null;

  // PRODUCT DATA
  const product = {
    id: card.dataset.id,
    name: card.dataset.name,
    price: priceHTML,
    rating: card.dataset.rating,
    image: card.dataset.image,
    description: card.dataset.description,
    discount: discount,
  };

  // SAVE RECENTLY VIEWED
  let recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
  const alreadyExists = recentlyViewed.find((p) => p.id === product.id);
  if (!alreadyExists) {
    recentlyViewed.unshift(product);
    recentlyViewed = recentlyViewed.slice(0, 10);
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  }

  // SAVE
  localStorage.setItem("selectedProduct", JSON.stringify(product));

  // REDIRECT
  window.location.href = "product-detail.html";
}

// Add to Cart Function
window.addToCart = function (el) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  const card = el.closest(".product-card");
  const productId = card.dataset.id;

  fetch(`${API}/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      product_id: productId,
      size: "M",
      quantity: 1,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const btn = el;
      btn.innerText = "Added ✔";
      setTimeout(() => (btn.innerText = "Add to Cart"), 1500);
    })
    .catch((err) => console.log(err));
};

// Add to Wishlist function
function addToWishlist(el, event) {
  event.stopPropagation();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  const card = el.closest(".product-card");
  const productId = parseInt(card.dataset.id);

  // REMOVE
  if (el.classList.contains("active")) {
    fetch(`${API}/wishlist/remove/${productId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then(() => {
        el.classList.remove("active");
        alert("Removed from wishlist❤️");
      })
      .catch((err) => console.log(err));
  }

  // ADD
  else {
    fetch(`${API}/wishlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then((res) => res.json())
      .then(() => {
        el.classList.add("active");
        alert("Added to wishlist❤️");
      })
      .catch((err) => console.log(err));
  }
}
