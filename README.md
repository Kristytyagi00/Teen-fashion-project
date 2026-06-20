
# 👗 Teen Fashion Project

A full-stack e-commerce web application for teen fashion, featuring AI-powered style analysis, product browsing, cart management, secure payments, and more.

---

## 🚀 Features

- 🔐 **User Authentication** — Register, login, logout with JWT tokens
- 👤 **User Profile** — View and manage your account
- 🛍️ **Product Browsing** — Browse and filter fashion products
- 🛒 **Shopping Cart** — Add, view, and remove items
- ❤️ **Wishlist** — Save favourite products
- 📦 **Order Management** — Place orders and track order history
- 📍 **Address Management** — Save and retrieve delivery addresses
- 💳 **Stripe Payments** — Secure online payment integration
- 🤖 **AI Style Analyzer** — Upload your photo and get style recommendations using MediaPipe face & pose detection (OpenCV + MediaPipe)
- 📧 **Newsletter Subscription** — Subscribe for updates
- 📬 **Contact Form** — Reach out to the team
- 🔒 **Rate Limiting** — API protection with Flask-Limiter

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| Database | MySQL |
| Authentication | JWT (PyJWT), bcrypt |
| Payments | Stripe |
| AI / ML | MediaPipe, OpenCV, NumPy, Pillow |
| Other | Flask-CORS, Flask-Limiter, python-dotenv |

---

## 📁 Project Structure

```
Teen-Fashion-Project/
├── Backend/
│   ├── app.py               # Main Flask application
│   ├── config.py            # Database configuration
│   ├── requirements.txt     # Python dependencies
│   ├── haarcascade_frontalface_default.xml  # Face detection model
│   └── .env                 # Environment variables (not included)
├── Frontend/
│   ├── html/                # All HTML pages
│   │   ├── homepage.html
│   │   ├── products.html
│   │   ├── product-detail.html
│   │   ├── cart.html
│   │   ├── payment.html
│   │   ├── review-order.html
│   │   ├── order-success.html
│   │   ├── dashboard.html
│   │   ├── auth.html
│   │   ├── contact.html
│   │   └── about-us.html
│   ├── css/                 # Stylesheets
│   └── images/              # Product and UI images
└── database.sql             # MySQL database schema
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.11+
- MySQL
- A Stripe account (for payments)

### 1. Clone the repository

```bash
git clone https://github.com/Rudrakshi171/Teen-Fashion-Project.git
cd Teen-Fashion-Project
```

### 2. Set up the database

Import the SQL schema into MySQL:

```bash
mysql -u your_username -p your_database_name < database.sql
```

### 3. Configure environment variables

Create a `.env` file inside the `Backend/` folder:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
SECRET_KEY=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Install Python dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 5. Run the backend server

```bash
python app.py
```

The API will start at `http://localhost:5000`.

### 6. Open the frontend

Open `Frontend/html/homepage.html` in your browser, or use the **Live Server** extension in VS Code (runs on `http://127.0.0.1:5500`).

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and get JWT token |
| POST | `/logout` | Logout and invalidate token |
| GET | `/profile` | Get user profile |
| GET | `/products` | Get all products |
| GET | `/products/<id>` | Get single product |
| POST | `/cart/add` | Add item to cart |
| GET | `/cart` | View cart |
| DELETE | `/cart/remove/<id>` | Remove item from cart |
| POST | `/wishlist/add` | Add to wishlist |
| GET | `/wishlist` | View wishlist |
| DELETE | `/wishlist/remove/<id>` | Remove from wishlist |
| POST | `/address/save` | Save delivery address |
| GET | `/address` | Get saved address |
| POST | `/order/place` | Place an order |
| GET | `/orders` | Get order history |
| GET | `/order/<id>` | Get single order details |
| POST | `/create-payment-intent` | Initiate Stripe payment |
| POST | `/analyze-style` | AI style analysis from photo |
| POST | `/contact` | Submit contact form |
| POST | `/subscribe` | Subscribe to newsletter |

---

## 🤖 AI Style Analyzer

The `/analyze-style` endpoint accepts a user photo and uses:
- **MediaPipe** — for face mesh (468 landmarks) and body pose (33 keypoints) detection
- **OpenCV** — for image processing
- **Pillow + NumPy** — for image handling

This feature provides personalized style recommendations based on body analysis.

---

## 🔒 Security

- Passwords hashed with **bcrypt**
- Protected routes use **JWT authentication**
- API rate limiting via **Flask-Limiter** (200 requests/day default)
- `.env` file excluded from version control

---

## 📄 License

This project was created as a final academic project.

---

## 👩‍💻 Author
Kristy Tyagi



