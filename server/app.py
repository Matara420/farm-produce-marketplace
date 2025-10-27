from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql import func
from models import db, User, Product, Order, Rating, order_product
import os
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

# Routes
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

@app.route('/products/<int:id>', methods=['POST'])
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
        product = Product.query.get_or_404(id)
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

@app.route('/orders/<int:id>', methods=['POST'])
@jwt_required()
def create_order(id):
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
        
        # Create order
        order = Order(
            buyer_id=user_id,
            total_amount=total_amount,
            status='pending'
        )
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Add products to order and update stock
        for product, quantity in products_to_order:
            # Add to order_product table
            stmt = order_product.insert().values(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity
            )
            db.session.execute(stmt)
            
            # Update product stock
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
            # Get orders that contain products from this farmer
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
        
        # Check if user is the farmer of any product in this order
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

@app.route('/ratings', methods=['POST'])
@jwt_required()
def create_rating():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'buyer':
            return jsonify({'message': 'Only buyers can submit ratings'}), 403
        
        data = request.get_json()
        if not all(k in data for k in ['farmer_id', 'product_id', 'score']):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Check if buyer has purchased this product
        order = Order.query.join(order_product).filter(
            Order.buyer_id == user_id,
            Order.status == 'delivered',
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
            func.count(Order.id.distinct()).label('order_count')
        ).join(Rating, Rating.farmer_id == User.id) \
         .outerjoin(Product, Product.farmer_id == User.id) \
         .outerjoin(Order.order_products) \
         .filter(User.role == 'farmer') \
         .group_by(User.id) \
         .order_by(func.avg(Rating.score).desc(), func.count(Order.id.distinct()).desc()) \
         .all()
        
        result = []
        for row in leaderboard:
            result.append({
                'farmer_id': row.farmer_id,
                'name': row.name,
                'avg_rating': round(float(row.avg_rating or 0) / 2, 1),  # Convert 1-10 to 1-5
                'order_count': row.order_count or 0
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

@app.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
