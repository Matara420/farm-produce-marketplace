from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql import func
from models import db, User, Product, Order, Rating, Message, order_product
import os
import time
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
db.init_app(app)
migrate = Migrate(app, db)
CORS(app)
jwt = JWTManager(app)

# Ensure uploads directory exists
os.makedirs('uploads', exist_ok=True)

@app.route('/')
def home():
    return jsonify({'message': 'Farm Produce Marketplace API'})

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not all(k in data for k in ['name', 'email', 'password', 'role']):
            return jsonify({'message': 'Missing required fields'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        user = User(
            name=data['name'],
            email=data['email'],
            role=data['role'],
            profile_picture=data.get('profile_picture')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not all(k in data for k in ['email', 'password']):
            return jsonify({'message': 'Missing email or password'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        if user and user.check_password(data['password']):
            token = create_access_token(identity=user.id)
            return jsonify({
                'token': token,
                'user': user.to_dict()
            })
        
        return jsonify({'message': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/products', methods=['GET'])
def get_products():
    try:
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = Product.query
        
        if category and category != 'All':
            query = query.filter_by(category=category)
        
        if search:
            query = query.filter(
                (Product.name.ilike(f'%{search}%')) |
                (Product.description.ilike(f'%{search}%'))
            )
        
        products = query.all()
        return jsonify([product.to_dict() for product in products])
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'farmer':
            return jsonify({'message': 'Only farmers can create products'}), 403
        
        data = request.get_json()
        if not all(k in data for k in ['name', 'price', 'category', 'stock']):
            return jsonify({'message': 'Missing required fields'}), 400
        
        product = Product(
            name=data['name'],
            price=float(data['price']),
            category=data['category'],
            stock=int(data['stock']),
            description=data.get('description', ''),
            image=data.get('image', ''),
            farmer_id=user_id
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify(product.to_dict()), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    try:
        product = Product.query.get(id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        return jsonify(product.to_dict())
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/products/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_product(id):
    try:
        product = Product.query.get_or_404(id)
        user_id = get_jwt_identity()
        
        if product.farmer_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        if request.method == 'PUT':
            data = request.get_json()
            product.name = data.get('name', product.name)
            product.price = float(data.get('price', product.price))
            product.category = data.get('category', product.category)
            product.stock = int(data.get('stock', product.stock))
            product.description = data.get('description', product.description)
            product.image = data.get('image', product.image)
            
            db.session.commit()
            return jsonify(product.to_dict())
        
        elif request.method == 'DELETE':
            db.session.delete(product)
            db.session.commit()
            return jsonify({'message': 'Product deleted successfully'})
            
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user.role != 'buyer':
            return jsonify({'message': 'Only buyers can create orders'}), 403

        data = request.get_json()
        if not all(k in data for k in ['products']):
            return jsonify({'message': 'Missing products'}), 400

        # Calculate total amount and check stock
        total_amount = 0
        products_to_order = []

        for item in data['products']:
            product = Product.query.get(item['id'])
            if not product:
                return jsonify({'message': f'Product {item["id"]} not found'}), 404

            if product.stock < item.get('quantity', 1):
                return jsonify({'message': f'Insufficient stock for {product.name}'}), 400

            total_amount += product.price * item.get('quantity', 1)
            products_to_order.append((product, item.get('quantity', 1)))

        # Create order with 'confirmed' status since payment is successful
        order = Order(
            buyer_id=user_id,
            total_amount=total_amount,
            status='confirmed'
        )
        db.session.add(order)
        db.session.flush()  # Get order ID

        # Add products to order and update stock
        for product, quantity in products_to_order:
            insert_stmt = order_product.insert().values(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity
            )
            db.session.execute(insert_stmt)
            product.stock -= quantity

        db.session.commit()
        return jsonify(order.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@app.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role == 'buyer':
            orders = Order.query.filter_by(buyer_id=user_id).all()
        else:  # farmer
            orders = Order.query.join(order_product).join(Product).filter(
                Product.farmer_id == user_id
            ).distinct().all()
        
        return jsonify([order.to_dict() for order in orders])
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/orders/<int:id>', methods=['PUT'])
@jwt_required()
def update_order(id):
    try:
        order = Order.query.get_or_404(id)
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role == 'farmer':
            farmer_products = any(product.farmer_id == user_id for product in order.order_products)
            if not farmer_products:
                return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        if 'status' in data:
            order.status = data['status']
        
        db.session.commit()
        return jsonify(order.to_dict())
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/ratings', methods=['GET', 'POST'])
@jwt_required()
def manage_ratings():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if request.method == 'GET':
            if user.role == 'buyer':
                ratings = Rating.query.filter_by(buyer_id=user_id).all()
            else:  # farmer
                ratings = Rating.query.filter_by(farmer_id=user_id).all()
            return jsonify([rating.to_dict() for rating in ratings])

        elif request.method == 'POST':
            if user.role != 'buyer':
                return jsonify({'message': 'Only buyers can submit ratings'}), 403

            data = request.get_json()
            if not all(k in data for k in ['farmer_id', 'product_id', 'score']):
                return jsonify({'message': 'Missing required fields'}), 400

            # Check if buyer has purchased this product
            order = Order.query.join(order_product).filter(
                Order.buyer_id == user_id,
                Order.status.in_(['confirmed', 'delivered']),
                order_product.c.product_id == data['product_id']
            ).first()

            if not order:
                return jsonify({'message': 'You can only rate products you have purchased'}), 403

            rating = Rating(
                buyer_id=user_id,
                farmer_id=data['farmer_id'],
                product_id=data['product_id'],
                score=data['score'],
                comment=data.get('comment', '')
            )

            db.session.add(rating)
            db.session.commit()
            return jsonify(rating.to_dict()), 201

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        leaderboard = db.session.query(
            User.id.label('farmer_id'),
            User.name,
            func.avg(Rating.score).label('avg_rating'),
            func.count(Rating.id).label('rating_count')
        ).join(Rating, Rating.farmer_id == User.id) \
         .filter(User.role == 'farmer') \
         .group_by(User.id) \
         .order_by(func.avg(Rating.score).desc()) \
         .all()

        order_counts = db.session.query(
            Product.farmer_id,
            func.count(Order.id.distinct()).label('order_count')
        ).join(order_product, order_product.c.product_id == Product.id) \
         .join(Order, Order.id == order_product.c.order_id) \
         .filter(Order.status == 'delivered') \
         .group_by(Product.farmer_id) \
         .all()

        order_count_dict = {row.farmer_id: row.order_count for row in order_counts}

        result = []
        for row in leaderboard:
            result.append({
                'farmer_id': row.farmer_id,
                'name': row.name,
                'avg_rating': round(float(row.avg_rating or 0) / 2, 1),
                'order_count': order_count_dict.get(row.farmer_id, 0)
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/certificates', methods=['GET'])
@jwt_required()
def get_certificate_eligibility():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'buyer':
            return jsonify({'message': 'Only buyers can get certificates'}), 403
        
        order_count = Order.query.filter_by(buyer_id=user_id, status='delivered').count()
        eligible = order_count >= 5
        
        return jsonify({
            'eligible': eligible,
            'order_count': order_count,
            'required_orders': 5
        })
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/users/profile', methods=['GET', 'PUT'])
@jwt_required()
def manage_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if request.method == 'GET':
            return jsonify(user.to_dict())

        elif request.method == 'PUT':
            if request.content_type and 'multipart/form-data' in request.content_type:
                name = request.form.get('name')
                email = request.form.get('email')
                profile_picture_file = request.files.get('profile_picture')

                if name:
                    user.name = name
                if email:
                    existing_user = User.query.filter_by(email=email).first()
                    if existing_user and existing_user.id != user_id:
                        return jsonify({'message': 'Email already exists'}), 400
                    user.email = email

                if profile_picture_file:
                    filename = f"user_{user_id}_{int(time.time())}.jpg"
                    file_path = os.path.join('uploads', filename)
                    profile_picture_file.save(file_path)
                    user.profile_picture = f"/uploads/{filename}"
            else:
                data = request.get_json()
                if 'name' in data:
                    user.name = data['name']
                if 'email' in data:
                    existing_user = User.query.filter_by(email=data['email']).first()
                    if existing_user and existing_user.id != user_id:
                        return jsonify({'message': 'Email already exists'}), 400
                    user.email = data['email']
                if 'profile_picture' in data:
                    user.profile_picture = data['profile_picture']

            db.session.commit()
            return jsonify(user.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@app.route('/users/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        data = request.get_json()
        if not all(k in data for k in ['current_password', 'new_password']):
            return jsonify({'message': 'Missing required fields'}), 400

        if not user.check_password(data['current_password']):
            return jsonify({'message': 'Current password is incorrect'}), 400

        if len(data['new_password']) < 6:
            return jsonify({'message': 'New password must be at least 6 characters long'}), 400

        user.set_password(data['new_password'])
        db.session.commit()

        return jsonify({'message': 'Password changed successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

@app.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    try:
        sender_id = get_jwt_identity()
        data = request.get_json()

        if not all(k in data for k in ['receiver_id', 'content']):
            return jsonify({'message': 'Missing receiver_id or content'}), 400

        receiver = User.query.get(data['receiver_id'])
        if not receiver:
            return jsonify({'message': 'Receiver not found'}), 404

        if sender_id == data['receiver_id']:
            return jsonify({'message': 'Cannot send message to yourself'}), 400

        message = Message(
            sender_id=sender_id,
            receiver_id=data['receiver_id'],
            content=data['content']
        )

        db.session.add(message)
        db.session.commit()
        return jsonify(message.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@app.route('/messages/<int:user_id>', methods=['GET'])
@jwt_required()
def get_messages(user_id):
    try:
        current_user_id = get_jwt_identity()
        other_user = User.query.get(user_id)
        if not other_user:
            return jsonify({'message': 'User not found'}), 404

        messages = Message.query.filter(
            ((Message.sender_id == current_user_id) & (Message.receiver_id == user_id)) |
            ((Message.sender_id == user_id) & (Message.receiver_id == current_user_id))
        ).order_by(Message.timestamp).all()

        return jsonify([message.to_dict() for message in messages])

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    try:
        user_id = get_jwt_identity()

        sent_messages = db.session.query(Message.receiver_id).filter(Message.sender_id == user_id).distinct()
        received_messages = db.session.query(Message.sender_id).filter(Message.receiver_id == user_id).distinct()

        user_ids = set()
        for msg in sent_messages:
            user_ids.add(msg[0])
        for msg in received_messages:
            user_ids.add(msg[0])

        conversations = []
        for other_id in user_ids:
            other_user = User.query.get(other_id)
            last_message = Message.query.filter(
                ((Message.sender_id == user_id) & (Message.receiver_id == other_id)) |
                ((Message.sender_id == other_id) & (Message.receiver_id == user_id))
            ).order_by(Message.timestamp.desc()).first()

            conversations.append({
                'user': other_user.to_dict(),
                'last_message': last_message.to_dict() if last_message else None
            })

        return jsonify(conversations)

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/users/farmer/<int:farmer_id>', methods=['GET'])
def get_farmer_profile(farmer_id):
    try:
        farmer = User.query.filter_by(id=farmer_id, role='farmer').first()
        if not farmer:
            return jsonify({'message': 'Farmer not found'}), 404

        products = Product.query.filter_by(farmer_id=farmer_id).all()

        products_sold = db.session.query(func.sum(order_product.c.quantity)).join(
            Order, Order.id == order_product.c.order_id
        ).filter(
            Order.status == 'delivered',
            order_product.c.product_id.in_([p.id for p in products])
        ).scalar() or 0

        products_on_market = sum(product.stock for product in products)

        ratings = Rating.query.filter_by(farmer_id=farmer_id).all()
        avg_rating = 0
        if ratings:
            avg_rating = sum(r.score for r in ratings) / len(ratings) / 2

        farmer_products = [{
            'id': p.id,
            'name': p.name,
            'price': p.price,
            'image': p.image,
            'category': p.category,
            'stock': p.stock,
            'description': p.description
        } for p in products]

        farmer_ratings = [{
            'id': r.id,
            'buyer_name': r.buyer.name,
            'score': r.score / 2,
            'comment': r.comment,
            'created_at': r.created_at.isoformat() if r.created_at else None
        } for r in ratings]

        return jsonify({
            'farmer': farmer.to_dict(),
            'stats': {
                'products_sold': int(products_sold),
                'products_on_market': products_on_market,
                'avg_rating': round(avg_rating, 1),
                'total_ratings': len(ratings)
            },
            'products': farmer_products,
            'ratings': farmer_ratings
        })

    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)