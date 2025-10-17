from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_brcypt import Bcrypt
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

class User(db.Model, SerializerMixin):
    __tableName__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='buyer')

    #serialisation rules
    serialize_rules = ("-password_hash", "-orders", "-reviews", "-products")

    # password methods
    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)
    
    @validates('email')
    def validate_email(self, key, email):
        if '@' not in email:
            raise ValueError('Invalid email address')
        return email
    
    @validates('role')
    def validate_role(self, key, role):
        if role not in ['buyer', 'seller']:
            raise ValueError('Invalid role')
        return role
    
    @validates('username')
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError('Name must be at least 3 characters long')
        return name
    
    @validates('password_hash')
    def validate_password(self, key, password_hash):
        if len(password_hash) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return password_hash
    
    #relationships
    products = db.relationship("Product", back_populates="seller", cascade="all, delete-orphan")
    orders = db.relationship("Order", back_populates="buyer", cascade="all, delete-orphan")
    reviews = db.relationship("Review", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.username}>'
    
class Product(db.Mddel, SerializerMixin):
    __tableName__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(50), nullable=False, default='available') 
    image_url = db.Column(db.Text(500), nullable=False)
    seller_id = db.Columnd(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # serialization rules
    serialize_rules = (
        "-seller.password_hash",
        "-order_items",
        "-reviews",
        "-reviews.user.password_hash",
        "-seller.products",
        "-reviews.product",
    )
    @validates('status')
    def validate_status(self, key, status):
        if status not in ['available', 'sold']:
            raise ValueError('Invalid status')
        return status
    # relationships
    seller = db.relationship("User", back_populates="products")
    orders = db.relationship("Order", back_populates="product", cascade="all, delete-orphan")
    reviews = db.relationship("Review", back_populates="product", cascade="all, delete-orphan")
    def __repr__(self):
        return f'<Product {self.name}>'
        
class Reviews(db.MOdel, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)

    # serializer rules
    serialize_rules = (
        "-user.password_hash",
        "-user.reviews",
        "-product.reviews",
        "-product.seller.products",
    )

    # validates
    @validates("rating")
    def validate_rating(self, key, rating):
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        return rating
    
    # relationship
    user = db.relationship("User", back_populates="reviews")
    product = db.relationship("Product", back_populates="reviews")