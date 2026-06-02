
// TAB SWITCHING

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginTab.addEventListener("click", () => {

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    loginForm.classList.add("active-form");
    signupForm.classList.remove("active-form");
});

signupTab.addEventListener("click", () => {

    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    signupForm.classList.add("active-form");
    loginForm.classList.remove("active-form");
});


// SHOW MESSAGE FUNCTION

function showMessage(text){

    const message = document.createElement("div");

    message.className = "custom-message";

    message.innerText = text;

    document.body.appendChild(message);

    setTimeout(() => {
        message.classList.add("show");
    },100);

    setTimeout(() => {

        message.classList.remove("show");

        setTimeout(() => {
            message.remove();
        },300);

    },2500);
}


// FORGOT PASSWORD

const forgotPassword = document.getElementById("forgotPassword");

forgotPassword.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Please contact support at teenfashion@gmail.com to reset your password.");
});


// SOCIAL BUTTONS

// GOOGLE LOGIN
document.getElementById("googleLogin")
.addEventListener("click", () => {
    alert("Google login coming soon!");
});


// FACEBOOK LOGIN

document.getElementById("facebookLogin")
.addEventListener("click", () => {

    alert("Facebook login coming soon!");
});


// APPLE LOGIN

document.getElementById("appleLogin")
.addEventListener("click", () => {
    alert("Apple login coming soon!");
});

// LOGIN FORM

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {

        if(data.token){
    localStorage.setItem("token", data.token);

    // ✅ USER SAVE KARO (IMPORTANT)
    localStorage.setItem("teenFashionUser", JSON.stringify({
        email: data.user.email,
        name: data.user.name ,
        loggedIn: true
    }));

    showMessage("Login successful");

    setTimeout(() => {
        window.location.href = "homepage.html";
    },1200);

} else {
    showMessage("Login Failed");
}
    })
    .catch(err => {
        console.log(err);
        showMessage("Server Error");
    });

});



// SIGNUP FORM

signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: fullName,
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
    if(data.token){
        showMessage("Account created successfully");
        setTimeout(() => {
            loginTab.click();
        },1200);
    } else {
        showMessage(data.error || "Signup Failed");
    }
})
    .catch(err => {
        console.log(err);
        showMessage("Signup Failed");
    });

});