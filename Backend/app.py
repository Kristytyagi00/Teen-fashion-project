from flask import Flask, request, jsonify
from flask_cors import CORS

import mysql.connector
import bcrypt
import datetime
import random
import string
import re
from functools import wraps
from config import DB_CONFIG
import os
from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError
import jwt

import stripe
load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')







# =====================
# VALIDATION FUNCTION
# =====================
def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False
    
blacklisted_tokens = set()
app = Flask(__name__)


try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day"])
    _limiter_available = True
except ImportError:
    _limiter_available = False
    limiter = None

CORS(app, resources={
    r"/*": {
        "origins": [
            "http://127.0.0.1:5500",
            "http://localhost:5500"
            ,"http://127.0.0.1:3000", 
             "http://localhost:3000" 
        ],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


@app.route('/config', methods=['GET'])
def stripe_config():
    return jsonify({'stripe_key': os.getenv('STRIPE_PUBLISHABLE_KEY', '')})



# =====================
# JWT AUTH HELPER FUNCTION
# Extract user email from Authorization token
# =====================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            token = token.split(" ")[1]
            if token in blacklisted_tokens:
                return jsonify({'error': 'Token expired, please login again'}), 401
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

# =====================
# DATABASE CONNECTION
# =====================

def get_db():
    return mysql.connector.connect(**DB_CONFIG)


# =====================
# HELPER FUNCTIONS
# =====================

def generate_order_id():
    return 'ORD' + ''.join(random.choices(string.digits, k=6))

def get_delivery_date():
    days = random.randint(3, 7)
    delivery = datetime.datetime.now() + datetime.timedelta(days=days)
    return delivery.strftime("%A, %d %B")


# ai route 


@app.route('/analyze-style', methods=['POST'])
@token_required
def analyze_style(current_user_id):
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        image_file = request.files['image']
        image_data = image_file.read()

        import numpy as np
        import cv2
        from PIL import Image
        import io
        import math
        import mediapipe as mp

        pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')
        img_rgb   = np.array(pil_image)
        img_bgr   = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        height, width = img_bgr.shape[:2]

        mp_face_mesh = mp.solutions.face_mesh
        mp_pose      = mp.solutions.pose
        face_landmarks_data = None
        pose_landmarks_data = None

        with mp_face_mesh.FaceMesh(
            static_image_mode=True, max_num_faces=1,
            refine_landmarks=True, min_detection_confidence=0.3
        ) as face_mesh:
            res = face_mesh.process(img_rgb)
            if res.multi_face_landmarks:
                face_landmarks_data = res.multi_face_landmarks[0]

        with mp_pose.Pose(
            static_image_mode=True, min_detection_confidence=0.3
        ) as pose:
            res = pose.process(img_rgb)
            if res.pose_landmarks:
                pose_landmarks_data = res.pose_landmarks

        # ============================================================
        # 1. SKIN TONE
        # - Takes 10x10 patch at each landmark point
        # - Filters through YCrCb skin range (removes background/clothing)
        # - Only real skin pixels go into ITA average
        # ============================================================
        def detect_skin_tone_ml(image, face_lm):
                h, w = image.shape[:2]
                skin_pixels = []

                if face_lm:
                    for idx in [10, 67, 297, 234, 454, 50, 280]:
                        lm = face_lm.landmark[idx]
                        px = int(lm.x * w)
                        py = int(lm.y * h)
                        x1, x2 = max(0, px - 8), min(w, px + 8)
                        y1, y2 = max(0, py - 8), min(h, py + 8)
                        patch = image[y1:y2, x1:x2]
                        if patch.size == 0:
                            continue

                        ycrcb = cv2.cvtColor(patch, cv2.COLOR_BGR2YCrCb)

                           # WIDE skin range — covers Fair all the way to Very Dark
                        mask = cv2.inRange(ycrcb,
                               np.array([0,   85,  50], dtype=np.uint8),   # lower — was [0,133,77]
                               np.array([255, 195, 155], dtype=np.uint8))   # upper — was [255,173,127]

                        sp = patch[mask > 0]
                        if len(sp) > 0:
                               skin_pixels.extend(sp.tolist())

                # fallback — use raw landmark pixels (no filter)
                if not skin_pixels:
                    if face_lm:
                           for idx in [10, 67, 297, 234, 454, 50, 280]:
                               lm = face_lm.landmark[idx]
                               px = max(0, min(int(lm.x * w), w - 1))
                               py = max(0, min(int(lm.y * h), h - 1))
                               skin_pixels.append(image[py, px].tolist())
                    else:
                        region = image[h // 4:3 * h // 4, w // 3:2 * w // 3]
                        skin_pixels = region.reshape(-1, 3).tolist()

                avg   = np.array(skin_pixels, dtype=float).mean(axis=0)
                avg_pixel = np.array([[avg]], dtype=np.uint8)          # shape (1,1,3) BGR
                lab_pixel = cv2.cvtColor(avg_pixel, cv2.COLOR_BGR2Lab)
                L_val  = float(lab_pixel[0, 0, 0]) * (100.0 / 255.0)  # scale 0-255 → 0-100
                # b_star = float(lab_pixel[0, 0, 2]) - 128.0   
                

                # REPLACE WITH — drop atan2, use simple L_val directly:
                # L_val is 0-100 (CIELab lightness). This is the most reliable skin classifier.
                if   L_val > 70:  return "Fair"
                elif L_val > 62:  return "Light"
                elif L_val > 52:  return "Medium"
                elif L_val > 42:  return "Olive"
                elif L_val > 30:  return "Brown"
                else:             return "Dark"

        skin_tone = detect_skin_tone_ml(img_bgr, face_landmarks_data)       

        # ============================================================
        # 2. FACE SHAPE — 4 landmark distances, lighting-independent
        # ============================================================
        def detect_face_shape_ml(face_lm, img_w, img_h):
            if not face_lm:
                return "Oval"
            lm = face_lm.landmark

            def gp(idx): return (lm[idx].x * img_w, lm[idx].y * img_h)

            cheek_width    = abs(gp(454)[0] - gp(234)[0])
            face_height    = abs(gp(152)[1] - gp(10)[1])
            forehead_width = abs(gp(332)[0] - gp(103)[0])
            jaw_width      = abs(gp(397)[0] - gp(172)[0])

            wh_ratio   = cheek_width    / face_height if face_height > 0 else 0.7
            jaw_cheek  = jaw_width      / cheek_width if cheek_width > 0 else 0.8
            fore_cheek = forehead_width / cheek_width if cheek_width > 0 else 0.8

            if wh_ratio > 0.88:
                return "Round"
            elif wh_ratio > 0.78:
                if jaw_cheek > 0.85 and fore_cheek > 0.85: return "Square"
                elif fore_cheek > jaw_cheek + 0.1:         return "Heart"
                else:                                       return "Round"
            elif wh_ratio > 0.68:
                if jaw_cheek < 0.72 and fore_cheek > 0.78:   return "Heart"
                elif jaw_cheek > 0.85:                        return "Square"
                elif fore_cheek < 0.72 and jaw_cheek < 0.72: return "Diamond"
                else:                                         return "Oval"
            else:
                if fore_cheek < 0.7 and jaw_cheek < 0.7: return "Diamond"
                else:                                      return "Oval"

        face_shape = detect_face_shape_ml(face_landmarks_data, width, height)

        # ============================================================
        # 3. BODY TYPE — MediaPipe Pose keypoints
        # ============================================================
        def detect_body_type_ml(pose_lm, img_w, img_h):
            if not pose_lm:
                return "Slim"
            lm = pose_lm.landmark

            def gp(idx): return (lm[idx].x * img_w, lm[idx].y * img_h)
            def dist(a, b): return math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)

            try:
                l_sh, r_sh   = gp(11), gp(12)
                l_hip, r_hip = gp(23), gp(24)
                shoulder_w = dist(l_sh, r_sh)
                hip_w      = dist(l_hip, r_hip)
                torso_h    = abs(l_hip[1] - l_sh[1])

                sh_hip     = shoulder_w / hip_w    if hip_w   > 0 else 1.0
                hip_torso  = hip_w      / torso_h  if torso_h > 0 else 0.5
                body_ratio = max(shoulder_w, hip_w) / img_w

                if body_ratio < 0.25: return "Petite"
                elif sh_hip > 1.2:    return "Athletic"
                elif sh_hip < 0.82:   return "Curvy"
                elif hip_torso > 0.7: return "Plus"
                else:                 return "Slim"
            except Exception:
                return "Slim"

        body_type = detect_body_type_ml(pose_landmarks_data, width, height)

        # ============================================================
        # 4. RECOMMENDATION ENGINE
        # Each body type, skin tone, and face shape gives DIFFERENT
        # styles, colors, and tips. Nothing is shared between users.
        # ============================================================

        # body → 4 unique styles + shop categories + body tip
        body_style_map = {
            "Petite": {
                "styles":     ["High Waist Outfits", "Mini Dresses", "Crop Tops", "Vertical Stripes"],
                "categories": ["dresses", "tops"],
                "tip":        "High-waisted and vertical patterns will beautifully elongate your petite frame."
            },
            "Slim": {
                "styles":     ["Flared Dresses", "Co-ord Sets", "Peplum Tops", "Layered Outfits"],
                "categories": ["dresses", "tops"],
                "tip":        "Flared and layered styles add gorgeous volume to your slim silhouette."
            },
            "Athletic": {
                "styles":     ["Wrap Dresses", "Ruffled Tops", "Fit & Flare", "Flowy Maxi"],
                "categories": ["dresses", "casual"],
                "tip":        "Wrap styles and ruffled details create beautiful feminine curves on your athletic frame."
            },
            "Curvy": {
                "styles":     ["Wrap Dresses", "A-line Skirts", "Empire Waist Tops", "Floral Kurtas"],
                "categories": ["dresses", "traditional"],
                "tip":        "A-line silhouettes and wrap styles celebrate and flatter your beautiful curves."
            },
            "Plus": {
                "styles":     ["Maxi Dresses", "Empire Waist Kurtas", "Structured Blazers", "Dark Monochromes"],
                "categories": ["dresses", "traditional"],
                "tip":        "Empire waist and structured styles create a stunning, elongated look for you."
            }
        }

        # skin tone → 3 specific colors + 2 unique extra styles
        skin_color_map = {
            "Fair": {
                "colors":       ["Pastel Rose", "Soft Lavender", "Ice Blue"],
                "extra_styles": ["Floral Sundresses", "Pastel Co-ords"]
            },
           "Light": {
               "colors":       ["Peach", "Sage Green", "Butter Yellow"],
               "extra_styles": ["Boho Maxi Dresses", "Tie-Dye Prints"]
           },
           "Medium": {
               "colors":       ["Terracotta", "Mustard Yellow", "Teal Green"],
               "extra_styles": ["Geometric Prints", "Ethnic Fusion Wear"]
           },
           "Olive": {
               "colors":       ["Burnt Rust", "Olive Green", "Off White"],
               "extra_styles": ["Earthy Kurtas", "Boho Layered Sets"]
           },
           "Brown": {
               "colors":       ["Rich Gold", "Crimson Red", "Cobalt Blue"],
               "extra_styles": ["Heavy Embroidery", "Bandhani Prints"]
           },
           "Dark": {
               # Bold, saturated, high-contrast colors that look stunning on dark skin
               "colors":       ["Bright White", "Hot Fuchsia", "Electric Yellow"],
               "extra_styles": ["Bold Monochromes", "High-Contrast Prints"]
           }
        }

        # face shape → neckline tip + 1 unique accent color
        face_data_map = {
            "Oval":    {
                "tip":   "Your oval face suits every neckline — from deep V-necks to boat necks, everything looks stunning.",
                "color": None
            },
            "Round":   {
                "tip":   "Deep V-necks and long pendant necklaces will beautifully elongate your round face.",
                "color": "Deep Midnight Blue"
            },
            "Square":  {
                "tip":   "Scoop necks, off-shoulders, and soft cowl necklines perfectly soften your defined jawline.",
                "color": "Dusty Mauve"
            },
            "Heart":   {
                "tip":   "Sweetheart and V-necks balance your beautiful heart shape — pair with wide-leg bottoms.",
                "color": "Warm Sand"
            },
            "Diamond": {
                "tip":   "Off-shoulder and halter necklines highlight your stunning cheekbones perfectly.",
                "color": "Emerald Green"
            },
            "Oblong":  {
                "tip":   "Boat necks and turtlenecks add beautiful width and balance to your long face.",
                "color": "Bright Coral"
            }
        }

        body_data = body_style_map.get(body_type,  body_style_map["Slim"])
        skin_data = skin_color_map.get(skin_tone,  skin_color_map["Medium"])
        face_data = face_data_map.get(face_shape,  {"tip": "Wear what makes you feel most confident!", "color": None})

        # styles: first 2 from body (silhouette-specific) +
        #         first 2 from skin (color/print-specific)
        # → always 4, always different per person
        combined_styles = list(dict.fromkeys(
            body_data["styles"][:2] + skin_data["extra_styles"][:2]
        ))[:4]

       
        # → palette unique to skin+face combo
        color_hex_map = {
            "Pastel Rose": "#FF9EAF",
            "Soft Lavender": "#D8B4FE",
            "Ice Blue": "#BFEFFF",
            "Deep Midnight Blue": "#1a1a4e",
            "Peach": "#FFCBA4",
            "Sage Green": "#87AE73",
            "Butter Yellow": "#FFF1A8",
            "Terracotta": "#C45C3A",
            "Mustard Yellow": "#FFDB58",
            "Teal Green": "#009688",
            "Burnt Rust": "#B7410E",
            "Olive Green": "#808000",
            "Off White": "#FAF9F6",
            "Rich Gold": "#FFD700",
            "Crimson Red": "#DC143C",
            "Cobalt Blue": "#0047AB",
            "Bright White": "#F0F0F0",
            "Hot Fuchsia": "#FF00FF",
            "Electric Yellow": "#FFFF00",
            "Dusty Mauve": "#C4A0A0",
            "Warm Sand": "#F5DEB3",
            "Emerald Green": "#50C878",
            "Bright Coral": "#FF6B6B"
        }

         # colors: 3 from skin tone + 1 face-shape accent
        base_colors = skin_data["colors"][:3]
        accent      = face_data["color"]
        recommended_colors = (
            (base_colors + [accent])[:4]
            if accent and accent not in base_colors
            else base_colors
        )
         
        recommended_hex = [color_hex_map.get(c, "#dddddd") for c in recommended_colors] 

        # tip: face neckline tip + body silhouette tip
        combined_tip = f"{face_data['tip']} Also, {body_data['tip'].lower()}"

        return jsonify({
            "skin_tone":              skin_tone,
            "face_shape":             face_shape,
            "body_type":              body_type,
            "recommended_styles":     combined_styles,
            "recommended_colors":     recommended_colors,
            "recommended_color_hex":  recommended_hex,
            "recommended_categories": body_data["categories"],
            "style_tip":              combined_tip
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# ==================
# AUTH ROUTES
# ==================
#==================



@app.route('/register', methods=['POST'])
@limiter.limit("10 per minute")
def register():
    try:
        data = request.json

        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        # Empty fields check
        if not name or not email or not password:
            return jsonify({'error': 'All fields required'}), 400

        # Name validation
        if len(name) < 3:
            return jsonify({'error': 'Name must be at least 3 characters'}), 400

        # Email validation
        email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'

        if not re.match(email_pattern, email):
            return jsonify({'error': 'Invalid email format'}), 400

        # Password validation
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            cursor.close()
            db.close()
            return jsonify({'error': 'Email already registered'}), 409

        hashed = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed)
        )

        db.commit()

        user_id = cursor.lastrowid

        cursor.close()
        db.close()

        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({
            'message': 'Account created successfully',
            'token': token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email
            }
        }), 201

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500




#====================
#   LOGIN ROUTE
#====================

@app.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        data = request.json

        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        # Empty fields
        if not email or not password:
            return jsonify({
                'error': 'Email and password required'
            }), 400

        # Email format validation
        email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(email_pattern, email):
            return jsonify({
                'error': 'Invalid email format'
            }), 400

        # Password length check
        if len(password) < 6:
            return jsonify({
                'error': 'Password must be at least 6 characters'
            }), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()
        db.close()

        # User not found
        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404

        # Wrong password
        stored_password = user['password']

        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')
         
        

        if not bcrypt.checkpw(
            password.encode('utf-8'),
            stored_password
        ):
            return jsonify({'error': 'Wrong password'}), 401

        

        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email']
            }
        }), 200

    except Exception as e:
        
        return jsonify({
            'error': str(e)
        }), 500
        
       
#==================
# PROFILE
#==================


@app.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, created_at FROM users WHERE id = %s", (current_user_id,))
        user = cursor.fetchone()
        return jsonify(user), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()


# ==================
# PRODUCTS ROUTES
# ==================

@app.route('/products', methods=['GET'])
def get_products():
    db = None
    cursor = None
    try:
        category = request.args.get('category')
        price_range = request.args.get('price')
        size = request.args.get('size')
        featured = request.args.get('featured')
        page = int(request.args.get('page', 1))
        per_page = 12
        offset = (page - 1) * per_page

        db = get_db()
        cursor = db.cursor(dictionary=True)

        query = "SELECT * FROM products WHERE 1=1"
        params = []

        if category:
            query += " AND category = %s"
            params.append(category)

        if featured:
            query += " AND is_featured = 1"

        if price_range:
            if price_range == 'under999':
                query += " AND price < 999"
            elif price_range == '1000-1499':
                query += " AND price BETWEEN 1000 AND 1499"
            elif price_range == '1500-1999':
                query += " AND price BETWEEN 1500 AND 1999"
            elif price_range == 'above2000':
                query += " AND price > 2000"

        if size:
            query += " AND JSON_CONTAINS(sizes, %s, '$')"
            params.append(f'"{size}"')

        query += " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])

        cursor.execute(query, params)
        products = cursor.fetchall()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()

@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
        product = cursor.fetchone()

        if not product:
            return jsonify({'error': 'Product not found'}), 404

        return jsonify(product), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()

# ==================
# CART ADD ROUTES
# ==================

@app.route('/cart/add', methods=['POST'])
@token_required
def add_to_cart(current_user_id):
    db = None
    cursor = None
    try:
        data = request.json
        product_id = data.get('product_id')
        size = data.get('size', 'S')
        quantity = data.get('quantity', 1)

        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM cart WHERE user_id = %s AND product_id = %s AND size = %s",
            (current_user_id, product_id, size)
        )
        existing = cursor.fetchone()

        if existing:
            cursor.execute(
                "UPDATE cart SET quantity = quantity + %s WHERE id = %s",
                (quantity, existing['id'])
            )
        else:
            cursor.execute(
                "INSERT INTO cart (user_id, product_id, size, quantity) VALUES (%s, %s, %s, %s)",
                (current_user_id, product_id, size, quantity)
            )

        db.commit()
        return jsonify({'message': 'Added to cart'}), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()

@app.route('/cart', methods=['GET'])
@token_required
def get_cart(current_user_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.id, c.quantity, c.size,
                p.name, p.price, p.image, p.old_price, p.discount
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = %s
        """, (current_user_id,))
        items = cursor.fetchall()
        return jsonify(items), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()

@app.route('/cart/remove/<int:cart_id>', methods=['DELETE'])
@token_required
def remove_from_cart(current_user_id, cart_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "DELETE FROM cart WHERE id = %s AND user_id = %s",
            (cart_id, current_user_id)
        )
        db.commit()
        return jsonify({'message': 'Removed from cart'}), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()

# ==================
# ADDRESS ROUTES
# ==================

@app.route('/address/save', methods=['POST'])
@token_required
def save_address(current_user_id):
    db = None
    cursor = None
    try:
        data = request.json
        name = data.get('name')
        phone = data.get('phone')
        pincode = data.get('pincode')
        address = data.get('address')

        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT id FROM addresses WHERE user_id = %s", (current_user_id,))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE addresses SET name=%s, phone=%s, pincode=%s, address=%s
                WHERE user_id=%s
            """, (name, phone, pincode, address, current_user_id))
        else:
            cursor.execute("""
                INSERT INTO addresses (user_id, name, phone, pincode, address)
                VALUES (%s, %s, %s, %s, %s)
            """, (current_user_id, name, phone, pincode, address))

        db.commit()
        return jsonify({'message': 'Address saved'}), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()

@app.route('/address', methods=['GET'])
@token_required
def get_address(current_user_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM addresses WHERE user_id = %s", (current_user_id,))
        address = cursor.fetchone()

        if not address:
            return jsonify({'message': 'No address found'}), 404

        return jsonify(address), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()


# ==================
# ORDER ROUTES
# ==================

@app.route('/order/place', methods=['POST'])
@token_required
def place_order(current_user_id):
    db = None
    cursor = None
    try:
        data = request.json
        product_name = data.get('product_name')
        product_image = data.get('product_image')
        price = data.get('price')
        size = data.get('size')
        quantity = data.get('quantity', 1)
        payment_method = data.get('payment_method')

        order_id = generate_order_id()
        delivery_date = get_delivery_date()

        db = get_db()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO orders
            (order_id, user_id, product_name, product_image, price,
            size, quantity, payment_method, delivery_date, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (order_id, current_user_id, product_name, product_image,
            price, size, quantity, payment_method, delivery_date, 'Ordered'))

        db.commit()
    

        return jsonify({
            'message': 'Order placed successfully',
            'order_id': order_id,
            'delivery_date': delivery_date
        }), 201
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()
    
    


@app.route('/orders', methods=['GET'])
@token_required
def get_orders(current_user_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC",
            (current_user_id,)
        )
        orders = cursor.fetchall()
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()
    

#===================
    #ORDER PLACE
#===================

@app.route('/order/<string:order_id>', methods=['GET'])
@token_required
def get_order(current_user_id, order_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM orders WHERE order_id = %s AND user_id = %s",
            (order_id, current_user_id)
        )
        order = cursor.fetchone()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        return jsonify({
            "success": True,
            "order": order
        }), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()

# ==================
# WISHLIST ROUTES
# ==================

@app.route('/wishlist/add', methods=['POST'])
@token_required
def add_wishlist(current_user_id):
    db = None
    cursor = None
    try:
        data = request.json
        product_id = data.get('product_id')

        if not product_id:
            return jsonify({'error': 'product_id required'}), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT * FROM wishlist WHERE user_id=%s AND product_id=%s",
            (current_user_id, product_id)
        )
        existing = cursor.fetchone()

        if existing:
            return jsonify({'message': 'Already in wishlist'}), 200

        cursor.execute(
            "INSERT INTO wishlist (user_id, product_id) VALUES (%s, %s)",
            (current_user_id, product_id)
        )
        db.commit()
        return jsonify({'message': 'Added to wishlist'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()


# ==================
# GET WISHLIST
# ==================

@app.route('/wishlist', methods=['GET'])
@token_required
def get_wishlist(current_user_id):
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT w.id, p.name, p.price, p.image
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = %s
        """, (current_user_id,))

        items = cursor.fetchall()

        return jsonify(items), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()
        
# ==================
# REMOVE WISHLIST
# ==================

@app.route('/wishlist/remove/<int:product_id>', methods=['DELETE'])
@token_required
def remove_wishlist(current_user_id, product_id):
    db = None
    cursor = None

    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM wishlist WHERE user_id = %s AND product_id = %s",
            (current_user_id, product_id)
        )

        db.commit()
        cursor.close()
        db.close()

        return jsonify({'message': 'Removed from wishlist'}), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()


# =======================
#  SUBSCRIPTION ROUTE
# =======================


@app.route("/subscribe", methods=["POST"])
def subscribe():
    try:
        data = request.json
        email = data.get("email")

        if not email:
            return jsonify({"message": "Email required"}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM subscribers WHERE email=%s", (email,))
        existing = cursor.fetchone()

        if existing:
            return jsonify({"message": "Email already subscribed"}), 409

        cursor.execute("INSERT INTO subscribers (email) VALUES (%s)", (email,))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Thankyou for Subscribing"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


    #  Contact Us Route
@app.route('/contact', methods=['POST'])
def contact():
    db = None
    cursor = None
    try:
        data = request.json
        name    = data.get('name', '').strip()
        email   = data.get('email', '').strip()
        message = data.get('message', '').strip()

        if not name or not email or not message:
            return jsonify({'error': 'All fields are required'}), 400

        if len(name) < 2:
            return jsonify({'error': 'Name must be at least 2 characters'}), 400

        if not is_valid_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        if len(message) < 10:
            return jsonify({'error': 'Message must be at least 10 characters'}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO contacts (name, email, message) VALUES (%s, %s, %s)",
            (name, email, message)
        )
        db.commit()
        return jsonify({'message': 'Message sent successfully!'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db and db.is_connected(): db.close()
        
           
#=============
# LOGOUT
#============
@app.route('/logout', methods=['POST'])
@token_required
def logout(current_user_id):
    try:
        token = request.headers.get('Authorization').split(" ")[1]
        blacklisted_tokens.add(token)
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Logout failed'}), 500
    



@app.route('/create-payment-intent', methods=['POST'])
@token_required
def create_payment_intent(current_user_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT SUM(p.price * c.quantity) AS total
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = %s
        """, (current_user_id,))

        result = cursor.fetchone()

        total_amount = result['total'] if result['total'] else 0

        if total_amount <= 0:
            return jsonify({
                'error': 'Cart is empty'
            }), 400

        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),
            currency='inr',
            metadata={
                'user_id': current_user_id
            }
        )

        return jsonify({
            'client_secret': intent.client_secret
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()

# ==================
#       RUN
# ==================
if __name__ == '__main__':
    app.run(debug=False, port=5000)