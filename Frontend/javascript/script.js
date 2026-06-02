// Navbar Scroll

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");

  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Mobile Menu

const hamburger = document.querySelector(".hamburger");

const navlist = document.querySelector(".navlist");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navlist.classList.toggle("active");
  });
}

//  Hero button

document.addEventListener("DOMContentLoaded", () => {
  const shopBtn = document.getElementById("shopNowBtn");

  if (shopBtn) {
    shopBtn.addEventListener("click", () => {
      window.location.href = "products.html";
    });
  }
});

// AUTO CLOSE MENU AFTER CLICKING LINK

const navLinks = document.querySelectorAll(".navlist .link");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navlist.classList.remove("active");
  });
});

/* SEARCH OVERLAY */

const searchBtn = document.querySelector(".search-btn");
const searchOverlay = document.querySelector(".search-overlay");
const closeSearch = document.querySelector(".close-search");
const searchInput = document.getElementById("searchInput");

/* OPEN SEARCH */

if (searchBtn && searchOverlay) {
  searchBtn.addEventListener("click", () => {
    searchOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
  });
}

/* CLOSE SEARCH */

if (closeSearch && searchOverlay) {
  closeSearch.addEventListener("click", () => {
    searchOverlay.classList.remove("active");

    document.body.style.overflow = "auto";
  });
}

/* OUTSIDE CLICK */

if (searchOverlay) {
  searchOverlay.addEventListener("click", (e) => {
    if (e.target === searchOverlay) {
      searchOverlay.classList.remove("active");

      document.body.style.overflow = "auto";
    }
  });
}

// SEARCH INPUT
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query === "") return;

      // SAVE RECENT
      let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
      if (!recent.includes(query)) {
        recent.unshift(query);
        recent = recent.slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(recent));
      }

      // REDIRECT
      localStorage.setItem("searchQuery", query);
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  });
}

// SEARCH TAGS CLICK
document.querySelectorAll(".search-tags span").forEach((tag) => {
  tag.addEventListener("click", () => {
    const query = tag.innerText.trim();
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  });
});

// CATEGORY CARDS CLICK
document.querySelectorAll(".fashion-card").forEach((card) => {
  card.addEventListener("click", () => {
    const text = card.querySelector(".fashion-overlay").innerText;
    const category = text
      .replace(/[^a-zA-Z]/g, "")
      .trim()
      .toLowerCase();
    window.location.href = `products.html?category=${category}`;
  });
});

function goToCategory(category) {
  window.location.href = `products.html?category=${category}`;
}

// ======================
// GLOBAL WISHLIST SYSTEM
// ======================

document.addEventListener("DOMContentLoaded", () => {
  // GET ALL WISHLIST BUTTONS

  const wishlistButtons = document.querySelectorAll(".wishlist");

  // SAFETY CHECK

  if (wishlistButtons.length === 0) {
    return;
  }

  // LOAD SAVED WISHLIST

  const token = localStorage.getItem("token");
  let wishlist = token
    ? JSON.parse(localStorage.getItem("wishlist")) || []
    : [];

  // LOOP ALL BUTTONS

  wishlistButtons.forEach((btn) => {
    const card = btn.closest(".product-card");

    if (!card) return;

    // PRODUCT DATA

    const name = card.querySelector("h4")?.innerText;

    const image = card.querySelector("img")?.src;

    const price =
      card.querySelector(".new-price")?.innerText ||
      card.querySelector(".price")?.innerText;

    // ALREADY EXISTS

    const alreadyAdded = wishlist.some((item) => item.name === name);

    // ACTIVE HEART

    if (alreadyAdded) {
      btn.classList.add("active");
    }

    // CLICK EVENT

    btn.addEventListener("click", () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to add to wishlist");
        window.location.href = "auth.html";
        return;
      }

      btn.classList.toggle("active");

      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      // REMOVE

      if (btn.classList.contains("active") === false) {
        wishlist = wishlist.filter((item) => item.name !== name);
      }

      // ADD
      else {
        const exists = wishlist.some((item) => item.name === name);

        if (!exists) {
          wishlist.push({
            name: name,

            price: price,

            image: image,
          });
        }
      }

      // SAVE

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    });
  });
});

//  Sale tag

document.querySelectorAll(".tag.sale").forEach((tag) => {
  tag.addEventListener("click", () => {
    const discount = parseFloat(tag.dataset.discount);

    const card = tag.closest(".product-card");

    const newPriceEl = card.querySelector(".new-price");
    const oldPriceEl = card.querySelector(".old-price");

    // CLEAN VALUE FUNCTION (IMPORTANT FIX)
    const getPrice = (text) => {
      return parseFloat(text.replace(/[^0-9]/g, ""));
    };

    let originalPrice;

    // If old price exists → use it
    if (oldPriceEl && oldPriceEl.innerText.trim() !== "") {
      originalPrice = getPrice(oldPriceEl.innerText);
    } else {
      originalPrice = getPrice(newPriceEl.innerText);
    }

    // SAFETY CHECK
    if (isNaN(originalPrice)) {
      console.error("Price reading failed");
      return;
    }

    const discountedPrice = Math.floor(
      originalPrice - (originalPrice * discount) / 100,
    );

    // UPDATE UI
    newPriceEl.innerText = "₹" + discountedPrice;

    // ADD OLD PRICE IF NOT EXISTS
    if (!oldPriceEl) {
      const span = document.createElement("span");
      span.classList.add("old-price");
      span.innerText = "₹" + originalPrice;
      newPriceEl.after(span);
    } else {
      oldPriceEl.innerText = "₹" + originalPrice;
    }

    // UPDATE TAG
    tag.innerText = discount + "% OFF";

    // PREVENT MULTIPLE CLICKS
    tag.style.pointerEvents = "none";
  });
});

//  category,trendy cards
const reveal = document.querySelectorAll(".category-card, .trend-card");

window.addEventListener("scroll", () => {
  reveal.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }
  });
});

// UPLOAD BUTTON

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const modal = document.getElementById("uploadModal");
  const closeBtn = document.getElementById("closeUpload");

  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const chooseFile = document.getElementById("chooseFile");

  const previewBox = document.getElementById("previewBox");
  const previewImage = document.getElementById("previewImage");
  const removeImage = document.getElementById("removeImage");
  const placeholder = document.getElementById("placeholder");

  const analyzeBtn = document.querySelector(".analyze-btn");
  const resultModal = document.getElementById("resultModal");
  const resultImage = document.getElementById("resultImage");
  const closeResult = document.getElementById("closeResult");

  // OPEN MODAL
  if (uploadBtn) {
    uploadBtn.addEventListener("click", (e) => {
      e.preventDefault();

      modal.classList.add("active");

      // PREVENT BACKGROUND SCROLL
      document.body.classList.add("modal-open");

      // CLOSE MOBILE NAVBAR AUTOMATICALLY
      if (navlist) {
        navlist.classList.remove("active");
      }
    });
  }

  // CLOSE MODAL
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");
    });
  }

  // CLOSE ON OUTSIDE CLICK
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
      }
    });
  }

  // CLOSE RESULT MODAL
  closeResult.addEventListener("click", () => {
    resultModal.classList.remove("active");

    document.body.classList.remove("modal-open");
  });

  // FILE BUTTON
  chooseFile.addEventListener("click", (e) => {
    // e.preventDefault();
    e.stopPropagation();
    // fileInput.value="";
    fileInput.click();
  });

  // CLICK UPLOAD AREA
  uploadArea.addEventListener("click", () => {
    fileInput.click();
  });

  /* FILE SELECT */
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    showPreview(file);
  });

  /* DRAG & DROP */
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
    uploadArea.style.background = "#ffe3ec";
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    showPreview(file);
  });

  /* SHOW PREVIEW */
  function showPreview(file) {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        previewImage.src = reader.result;
        previewBox.style.display = "flex";
        placeholder.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  }

  /* REMOVE IMAGE */
  removeImage.addEventListener("click", () => {
    previewBox.style.display = "none";
    placeholder.style.display = "flex";
    fileInput.value = "";
  });

  // analyze button click
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
      if (!fileInput.files.length) {
        alert("Please upload an image first!");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first to use AI style analysis!");
        return;
      }

      analyzeBtn.innerText = "Analyzing... ✨";
      analyzeBtn.disabled = true;

      try {
        // PREPARE IMAGE
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);

        // CALL FLASK API
        const response = await fetch("http://127.0.0.1:5000/analyze-style", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: formData,
        });

        const data = await response.json();

        if (data.error) {
          alert("Analysis failed: " + data.error);
          analyzeBtn.innerText = "Analyze Style";
          analyzeBtn.disabled = false;
          return;
        }

        // SAVE IMAGE SRC BEFORE CLEARING
        const imageSrc = previewImage.src;

        // RESET UPLOAD FIRST
        previewBox.style.display = "none";
        placeholder.style.display = "flex";
        previewImage.src = "";
        fileInput.value = "";
        modal.classList.remove("active");

        // THEN SHOW RESULT
        resultModal.classList.add("active");
        resultImage.src = imageSrc;
        document.body.classList.add("modal-open");

        // FILL RESULTS
        document.getElementById("skinTone").innerText = data.skin_tone;
        document.getElementById("faceShape").innerText = data.face_shape;
        if (document.getElementById("bodyType")) {
          document.getElementById("bodyType").innerText = data.body_type;
        }

        // STYLE TAGS
        const styleTags = document.getElementById("styleTags");
        styleTags.innerHTML = "";
        data.recommended_styles.forEach((style) => {
          styleTags.innerHTML += `<span style="font-size:12px;padding:4px 10px;border-radius:20px;background:#FBEAF0;color:#993556">${style}</span>`;
        });

        // COLOR DOTS
        const colorMap = {
          "Pastel Pink": "#FFB6C1",
          "Baby Blue": "#89CFF0",
          Lavender: "#E6E6FA",
          Peach: "#FFCBA4",
          "Mint Green": "#98FF98",
          White: "#F5F5F5",
          Coral: "#FF7F50",
          Mustard: "#FFDB58",
          Teal: "#008080",
          "Olive Green": "#808000",
          Rust: "#B7410E",
          Cream: "#FFFDD0",
          Gold: "#FFD700",
          "Deep Red": "#8B0000",
          "Royal Blue": "#4169E1",
          Yellow: "#FFFF00",
          Orange: "#FFA500",
        };

        const colorDots = document.getElementById("colorDots");
        colorDots.innerHTML = "";
        if (data.recommended_colors) {
          data.recommended_colors.forEach((color, i) => {
            const hex =
              data.recommended_color_hex && data.recommended_color_hex[i]
                ? data.recommended_color_hex[i]
                : "#dddddd";
            colorDots.innerHTML += `
        <div style="
            width:28px;
            height:28px;
            border-radius:50%;
            background:${hex};
            border:2px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
            flex-shrink:0;
            cursor:pointer;
        " title="${color}"></div>`;
          });
          colorDots.innerHTML += `
    <span style="font-size:11px;color:#888;margin-left:8px;flex:1;line-height:1.4">
        ${data.recommended_colors.join(" · ")}
    </span>`;
        }

        // TIP
        if (data.style_tip) {
          document.getElementById("styleTip").innerText =
            "💡 " + data.style_tip;
        }

        const shopContainer = document.getElementById("shopBtnContainer");
        shopContainer.innerHTML = "";
        if (
          data.recommended_categories &&
          data.recommended_categories.length > 0
        ) {
          const categoryLabels = {
            dresses: "party dresses",
            tops: "trendy tops",
            casual: "casual outfits",
            traditional: "ethnic wear",
          };

          shopContainer.innerHTML = "";
          data.recommended_categories.slice(0, 2).forEach((category) => {
            const label = categoryLabels[category] || category;
            // BUILD FILTERED URL WITH BODY TYPE HINT
            const filterUrl = `products.html?category=${category}&body=${encodeURIComponent(data.body_type)}&skin=${encodeURIComponent(data.skin_tone)}`;

            shopContainer.innerHTML += `
            <button onclick="window.location.href='${filterUrl}'"
               
                style="
                    width:100%;
                    padding:10px;
                    margin-bottom:6px;
                    background:linear-gradient(135deg,#ff4f8b,#ff7aa2);
                    color:white;
                    border:none;
                    border-radius:12px;
                    font-size:13px;
                    font-weight:600;
                    cursor:pointer
                ">
                    Shop ${label} for you →
                </button>`;
          });
        }
      } catch (err) {
        console.error(err);
        alert("Server error. Please try again.");
      }

      analyzeBtn.innerText = "Analyze Style";
      analyzeBtn.disabled = false;
    });
  }

  //CLOSE RESULT MODAL
  closeResult.addEventListener("click", () => {
    resultModal.classList.remove("active");
  });

  previewImage.src = "";
  previewBox.style.display = "none";
  placeholder.style.display = "flex";
  fileInput.value = "";
});

// GLOBAL CART SYSTEM

document.addEventListener("DOMContentLoaded", () => {
  // LOCAL STORAGE CART

  const token = localStorage.getItem("token");
  let cart = token
    ? JSON.parse(localStorage.getItem("teenFashionCart")) || []
    : [];

  // SAVE CART

  function saveCart() {
    localStorage.setItem("teenFashionCart", JSON.stringify(cart));

    updateNavbarCount();
  }

  const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");

  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");

      if (!card) {
        console.error("Card not found");
        return;
      }

      const title = card.querySelector("h4")?.innerText;

      const image = card.querySelector("img")?.src;

      /* PRICE */

      let priceText =
        card.querySelector(".new-price")?.innerText ||
        card.querySelector(".price")?.innerText;

      if (!title || !priceText || !image) {
        console.error("Product data missing", {
          title,
          priceText,
          image,
        });

        return;
      }

      const price = parseInt(priceText.replace(/[^0-9]/g, ""));

      /* SIZE SYSTEM */

      let size = "S";

      const activeSize = document.querySelector(".sizes .active");

      if (activeSize) {
        size = activeSize.innerText;
      }

      /* CHECK EXISTING */

      const existing = cart.find(
        (item) => item.title === title && item.size === size,
      );

      /* UPDATE */

      if (existing) {
        existing.quantity++;
      } else {
        cart.push({
          title,
          price,
          image,
          size,
          quantity: 1,
        });
      }

      /* SAVE */

      saveCart();

      /* BUTTON EFFECT */

      btn.innerText = "Added ✔";

      setTimeout(() => {
        btn.innerText = "Add to Cart";
      }, 1500);
    });
  });

  // UPDATE NAVBAR COUNT

  function updateNavbarCount() {
    const cartCount = document.querySelector(".cart-count");

    if (!cartCount) return;

    const token = localStorage.getItem("token");

    if (!token) {
      cartCount.innerText = 0;
      return;
    }

    let total = 0;

    cart.forEach((item) => {
      total += item.quantity;
    });

    cartCount.innerText = total;
  }


  updateNavbarCount();


  // CART PAGE

  const cartLeft = document.querySelector(".cart-left");

  if (cartLeft) {
    renderCart();
  }

  // RENDER CART

  function renderCart() {
    if (!cartLeft) return;

    cartLeft.innerHTML = "";

    // EMPTY CART

    if (cart.length === 0) {
      cartLeft.innerHTML = `

                <div class="empty-cart">

                    <span class="material-icons">
                        shopping_cart
                    </span>

                    <h2>Your Cart is Empty</h2>

                    <p>Add trendy outfits now ✨</p>

                    <button class="shop-btn">
                        Shop Now
                    </button>

                </div>

            `;

      document
        .querySelector(".shop-btn")

        .addEventListener("click", () => {
          window.location.href = "products.html";
        });

      updateSummary();

      return;
    }

    // CREATE ITEMS

    cart.forEach((item, index) => {
      cartLeft.innerHTML += `

            <div class="cart-item">

                <div class="cart-check">
                    <input type="checkbox">
                </div>

                <div class="cart-image">
                    <img src="${item.image}">
                </div>

                <div class="cart-info">

                    <h3>${item.title}</h3>

                    <p>Trendy Fashion Item</p>

                    <div class="price-box">
                        <span class="new-price">
                        ${
                          typeof item.price === "number"
                            ? `₹${item.price}`
                            : item.price
                        }
                        </span>
                    </div>

                </div>

                <div class="quantity-box">

                    <button class="qty-btn minus"
                    data-index="${index}">
                        -
                    </button>

                    <span class="qty-value">
                        ${item.quantity}
                    </span>

                    <button class="qty-btn plus"
                    data-index="${index}">
                        +
                    </button>

                </div>

                <button class="delete-btn"
                data-index="${index}">

                    <i class="ri-delete-bin-6-line"></i>

                </button>

            </div>

            `;
    });

    // ACTION BUTTONS

    cartLeft.innerHTML += `

        <div class="cart-actions">

            <button class="remove-selected">

                <i class="ri-delete-bin-line"></i>

                Remove Selected

            </button>

            <button class="wishlist-btn">

                <i class="ri-heart-line"></i>

                Move to Wishlist

            </button>

        </div>

        `;

    updateSummary();

    attachCartEvents();
  }

  // UPDATE SUMMARY

  function updateSummary() {
    const summaryRows = document.querySelectorAll(".summary-row");

    const subtotalElement = summaryRows[0].querySelector("span:last-child");

    const shippingElement = summaryRows[2].querySelector("span:last-child");

    const totalElement = document.querySelector(".summary-total h3");

    let subtotal = 0;

    cart.forEach((item) => {
      const cleanPrice = Number(item.price.toString().replace(/[^0-9]/g, ""));
      subtotal += cleanPrice * item.quantity;
      // subtotal += item.price * item.quantity;
    });

    // SHIPPING LOGIC
    let shipping = 0;

    if (subtotal < 999) {
      shipping = 70;
    } else {
      shipping = 0;
    }

    let total = subtotal + shipping;

    subtotalElement.innerText = "₹" + subtotal;
    shippingElement.innerText = shipping === 0 ? "FREE" : "₹" + shipping;
    totalElement.innerText = "₹" + total;

    updateNavbarCount();
  }

  // CART EVENTS

  function attachCartEvents() {
    // PLUS

    document.querySelectorAll(".plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;

        cart[index].quantity++;

        saveCart();

        renderCart();
      });
    });

    // MINUS

    document.querySelectorAll(".minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;

        if (cart[index].quantity > 1) {
          cart[index].quantity--;
        }

        saveCart();

        renderCart();
      });
    });

    // DELETE

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;

        cart.splice(index, 1);

        saveCart();

        renderCart();
      });
    });

    // REMOVE SELECTED

    const removeSelectedBtn = document.querySelector(".remove-selected");

    if (removeSelectedBtn) {
      removeSelectedBtn.addEventListener("click", () => {
        const items = document.querySelectorAll(".cart-item");

        items.forEach((item, index) => {
          const checked = item.querySelector('input[type="checkbox"]');

          if (checked.checked) {
            cart[index] = null;
          }
        });

        cart = cart.filter((item) => item !== null);

        saveCart();

        renderCart();
      });
    }

    // ======================
    // MOVE TO WISHLIST
    // ======================

    const wishlistBtn = document.querySelector(".wishlist-btn");

    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        const token = localStorage.getItem("token");
        let wishlist = token
          ? JSON.parse(localStorage.getItem("wishlist")) || []
          : [];

        cart.forEach((item) => {
          const exists = wishlist.some(
            (product) => product.name === item.title,
          );

          if (!exists) {
            wishlist.push({
              name: item.title,

              price: `₹${item.price}`,

              image: item.image,
            });
          }
        });

        if (!token) {
          alert("Please login to add to wishlist");
          return;
        }
        localStorage.setItem("wishlist", JSON.stringify(wishlist));

        alert("Items moved to wishlist ❤️");
      });
    }
  }

  // CHECKOUT

  const checkoutBtn = document.querySelector(".checkout-btn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Cart is empty!");
        return;
      }

      // SAVE FINAL ORDER
      localStorage.setItem("checkoutType", "cart");
      localStorage.setItem("teenOrder", JSON.stringify(cart));
      // GO TO PAYMENT PAGE
      window.location.href = "review-order.html";
    });
  }

  // CONTINUE SHOPPING

  const continueBtn = document.querySelector(".continue-btn");

  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      window.location.href = "products.html";
    });
  }

  // INITIAL

  updateNavbarCount();
});

// USER LOGIN NAVBAR SYSTEM

document.addEventListener("DOMContentLoaded", () => {
  const savedUser = JSON.parse(localStorage.getItem("teenFashionUser"));

  const profileMenu = document.getElementById("profileMenu");

  if (profileMenu) {
    // USER LOGGED IN
    if (savedUser && savedUser.loggedIn) {
      // GET USER INITIALS

      const initials = savedUser.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      profileMenu.innerHTML = `

                <div class="user-profile">

                    <button class="profile-btn">

                        <div class="profile-initials">
                            ${initials}
                        </div>

                    </button>

                    <div class="profile-dropdown">

                        <div class="profile-top">

                            <div class="big-avatar">
                                ${initials}
                            </div>

                            <div class="profile-user">
                                <h3>${savedUser.name}</h3>
                                <p>${savedUser.email}</p>
                            </div>

                        </div>

                        <div class="profile-links">

                            <a href="dashboard.html">

                                <span class="material-icons">
                                    shopping_bag
                                </span>

                                Orders

                            </a>

                            <a href="dashboard.html">

                                <span class="material-icons">
                                    favorite
                                </span>

                                Wishlist

                            </a>

                            <a href="dashboard.html">

                                <span class="material-icons">
                                    person
                                </span>

                                My Account

                            </a>
                        
                        </div>    

                        <button class="logout-btn" id="logoutBtn">
                            

                            Logout

                        </button>

                    </div>

                </div>

                `;

      // DROPDOWN OPEN

      const profileBtn = document.querySelector(".profile-btn");

      if (profileBtn) {
        profileBtn.addEventListener("click", () => {
          profileMenu.classList.toggle("active");
        });
      }

      // OUTSIDE CLICK

      document.addEventListener("click", (e) => {
        if (!profileMenu.contains(e.target)) {
          profileMenu.classList.remove("active");
        }
      });

      // LOGOUT

      const logoutBtn = document.getElementById("logoutBtn");

      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          const token = localStorage.getItem("token");

          try {
            await fetch("http://127.0.0.1:5000/logout", {
              method: "POST",
              headers: { Authorization: "Bearer " + token },
            });
          } catch (e) {
            console.log("Logout API error", e);
          }

          localStorage.removeItem("teenFashionUser");
          localStorage.removeItem("token");
          localStorage.removeItem("wishlist");
          localStorage.removeItem("teenFashionCart");
          localStorage.removeItem("userAddress");
          alert("Logged out successfully");

          window.location.reload();
        });
      }
    }

    // USER NOT LOGGED IN
    else {
      profileMenu.innerHTML = `

            <a href="auth.html" class="profile-login">

                <span class="material-icons icon">
                    person
                </span>

            </a>

            `;
    }
  }
});

//==================
//      CONTACT
//==================

const contactForm = document.querySelector("#contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Basic frontend validation
    if (!name || !email || !message) {
      showContactMsg("Please fill in all fields", "red");
      return;
    }

    const btn = contactForm.querySelector(".btn");
    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
      const response = await fetch("http://127.0.0.1:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (!response.ok) {
        showContactMsg(data.error || "Something went wrong", "red");
      } else {
        showContactMsg("✅ " + data.message, "green");
        contactForm.reset();
      }

    } catch (err) {
      showContactMsg("Server connection error. Please try again.", "red");
    }

    btn.innerText = "Send Message";
    btn.disabled = false;
  });
}

function showContactMsg(text, color) {
  let msg = document.getElementById("contactMsg");
  if (!msg) {
    msg = document.createElement("p");
    msg.id = "contactMsg";
    msg.style.cssText = "margin-top:10px; font-size:14px; font-weight:500;";
    document.querySelector(".contact-form").appendChild(msg);
  }
  msg.innerText = text;
  msg.style.color = color;
}

//=====================
//      SUBSCRIPTION
//=====================

async function subscribeEmail() {
  let email = document.getElementById("email").value;
  let message = document.getElementById("message");

  if (email === "") {
    message.innerHTML = "Please enter your email";
    message.style.color = "red";
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/subscribe", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: email,
      }),
    });

    const data = await response.json();

    message.innerHTML = data.message;
    message.style.color = "lightgreen";
  } catch (error) {
    console.log(error);

    message.innerHTML = "Server connection error";
    message.style.color = "red";
  }
}

// FEATURED FOR YOU — RECENTLY VIEWED + DEFAULTS
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".product-container");
  if (!container) return;

  const recentlyViewed =
    JSON.parse(localStorage.getItem("recentlyViewed")) || [];

  // IF NO RECENTLY VIEWED — keep default cards as is
  // if (recentlyViewed.length === 0) return;

  // DEFAULT PRODUCTS (fallback pool)
  const defaults = [
    {
      id: "1",
      name: "Floral Summer Dress",
      price: "₹999",
      image: "../images/product9.jpg",
    },
    {
      id: "2",
      name: "Casual College Outfit",
      price: "₹999",
      image: "../images/product8.jpg",
    },
    {
      id: "3",
      name: "Straight fit kurta Set",
      price: "₹1299",
      image: "../images/product12.jpg",
    },
    {
      id: "4",
      name: "Contrast Co-rd Set",
      price: "₹1299",
      image: "../images/product3.jpg",
    },
    {
      id: "5",
      name: "Sharara Weeding Outfit",
      price: "₹1499",
      image: "../images/product14.jpg",
    },
    {
      id: "6",
      name: "Yellow Summer Outfit",
      price: "₹999",
      image: "../images/product5.jpg",
    },
    {
      id: "7",
      name: "Neck Tank Top",
      price: "₹399",
      image: "../images/product7.jpg",
    },
    {
      id: "8",
      name: "Floral Summer Dress Vol 2",
      price: "₹1499",
      image: "../images/product15.jpg",
    },
    {
      id: "9",
      name: "Indo Western Dress",
      price: "₹2000",
      image: "../images/product13.jpg",
    },
    {
      id: "10",
      name: "Prom Dress",
      price: "₹1441",
      image: "../images/product16.jpg",
    },
  ];

  const seenIds = new Set();
  const uniqueRecent = recentlyViewed.filter((p) => {
    const key = String(p.id);
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });
 
  // Fill remaining slots with defaults that aren't already in uniqueRecent
  const recentIds = uniqueRecent.map((p) => String(p.id));
  const remainingDefaults = defaults.filter(
    (p) => !recentIds.includes(String(p.id))
  );
 
  // COMBINE — recently viewed first, then fill up to 10 with defaults
  const combined = [...uniqueRecent, ...remainingDefaults].slice(0, 10);
 
  // CLEAR static HTML cards — always rebuild to avoid duplicates
  container.innerHTML = "";
 
  // Load saved wishlist to restore heart states
  const token = localStorage.getItem("token");
  const wishlist = token
    ? JSON.parse(localStorage.getItem("wishlist")) || []
    : [];
 
  // RENDER
  combined.forEach((product, index) => {
    const isRecent = index < uniqueRecent.length;
 
    const priceHTML =
      typeof product.price === "string" && product.price.includes("span")
        ? product.price
        : `${product.price}`;
 
    // Check if this product is already in wishlist
    const inWishlist = wishlist.some(
      (w) => w.name === product.name || String(w.id) === String(product.id)
    );
 
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;
    card.dataset.name = product.name;
    card.innerHTML = `
        <div class="product-image" onclick="window.location.href='products.html'">
            <img src="${product.image}" alt="${product.name}">
            <span class="wishlist${inWishlist ? " active" : ""}">❤</span>
            ${isRecent ? '<span class="tag Trendy">Viewed</span>' : ""}
        </div>
        <div class="product-info">
            <h4>${product.name}</h4>
            <p class="price">${priceHTML}</p>
            <div class="rating">★★★★☆</div>
            <button class="btn add-to-cart-btn">Add to Cart</button>
        </div>
    `;
 
    // Attach wishlist click handler directly (not via inline onclick)
    // so it works on dynamically created cards
    const wishlistBtn = card.querySelector(".wishlist");
    wishlistBtn.addEventListener("click", (e) => {
      e.stopPropagation();
 
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        alert("Please login to add to wishlist");
        window.location.href = "auth.html";
        return;
      }
 
      wishlistBtn.classList.toggle("active");
      let currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const productName = card.querySelector("h4").innerText;
      const productImage = card.querySelector("img").src;
      const productPrice =
        card.querySelector(".new-price")?.innerText ||
        card.querySelector(".price")?.innerText;
 
      if (!wishlistBtn.classList.contains("active")) {
        // Remove
        currentWishlist = currentWishlist.filter((item) => item.name !== productName);
      } else {
        // Add — avoid duplicates
        const exists = currentWishlist.some((item) => item.name === productName);
        if (!exists) {
          currentWishlist.push({
            id: product.id,
            name: productName,
            price: productPrice,
            image: productImage,
          });
        }
      }
      localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
    });
 
    // Attach add-to-cart handler directly too
    const cartBtn = card.querySelector(".add-to-cart-btn");
    cartBtn.addEventListener("click", () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        alert("Please login first");
        return;
      }
      const productName = card.querySelector("h4").innerText;
      const productImage = card.querySelector("img").src;
      const priceText =
        card.querySelector(".new-price")?.innerText ||
        card.querySelector(".price")?.innerText;
      const price = parseInt((priceText || "0").replace(/[^0-9]/g, ""));
 
      let cart = JSON.parse(localStorage.getItem("teenFashionCart")) || [];
      const existing = cart.find(
        (item) => item.title === productName && item.size === "S"
      );
      if (existing) {
        existing.quantity++;
      } else {
        cart.push({ title: productName, price, image: productImage, size: "S", quantity: 1 });
      }
      localStorage.setItem("teenFashionCart", JSON.stringify(cart));
 
      // Update navbar count
      const cartCount = document.querySelector(".cart-count");
      if (cartCount) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = total;
      }
 
      cartBtn.innerText = "Added ✔";
      setTimeout(() => (cartBtn.innerText = "Add to Cart"), 1500);
    });
 
    container.appendChild(card);
  });
});
 