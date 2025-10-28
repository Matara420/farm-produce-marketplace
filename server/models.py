from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
import werkzeug.security as security

db = SQLAlchemy()

# Many-to-Many relationship table for orders and products
order_product = db.Table('order_product',
    db.Column('order_id', db.Integer, db.ForeignKey('orders.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('products.id'), primary_key=True),
    db.Column('quantity', db.Integer, nullable=False, default=1)
)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'farmer' or 'buyer'
    profile_picture = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='farmer', lazy=True)
    orders = db.relationship('Order', backref='buyer', lazy=True)
    ratings_given = db.relationship('Rating', foreign_keys='Rating.buyer_id', backref='buyer', lazy=True)
    ratings_received = db.relationship('Rating', foreign_keys='Rating.farmer_id', backref='rated_farmer', lazy=True)
    
    serialize_rules = ('-password', '-products.farmer', '-orders.buyer', '-ratings_given.buyer', '-ratings_received.rated_farmer')

    def set_password(self, password):
        self.password = security.generate_password_hash(password)

    def check_password(self, password):
        return security.check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Product(db.Model, SerializerMixin):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200))
    category = db.Column(db.String(50))
    stock = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Many-to-Many with Order
    orders = db.relationship('Order', secondary=order_product, backref=db.backref('order_products', lazy=True))
    ratings = db.relationship('Rating', backref='product', lazy=True)
    
    serialize_rules = ('-farmer.products', '-orders.products', '-ratings.product')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'image': self.image,
            'category': self.category,
            'stock': self.stock,
            'description': self.description,
            'farmer_id': self.farmer_id,
            'farmer': self.farmer.name if self.farmer else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Order(db.Model, SerializerMixin):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, delivered
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    serialize_rules = ('-buyer.orders', '-products.orders')

    def to_dict(self):
        return {
            'id': self.id,
            'buyer_id': self.buyer_id,
            'status': self.status,
            'total_amount': self.total_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'products': [{
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': self.get_product_quantity(product.id)
            } for product in self.order_products]
        }

    def get_product_quantity(self, product_id):
        # Helper method to get quantity for a specific product in this order
        from sqlalchemy import select
        stmt = select(order_product.c.quantity).where(
            order_product.c.order_id == self.id,
            order_product.c.product_id == product_id
        )
        result = db.session.execute(stmt).fetchone()
        return result[0] if result else 0

class Rating(db.Model, SerializerMixin):
    __tablename__ = 'ratings'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # 1-10
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    serialize_rules = ('-buyer.ratings_given', '-rated_farmer.ratings_received', '-product.ratings')

    def to_dict(self):
        return {
            'id': self.id,
            'buyer_id': self.buyer_id,
            'farmer_id': self.farmer_id,
            'product_id': self.product_id,
            'score': self.score,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'buyer_name': self.buyer.name if self.buyer else None
        }