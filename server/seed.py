from app import app, db
from models import User, Product, Order, Rating, order_product
from werkzeug.security import generate_password_hash
from datetime import datetime

def seed_database():
    with app.app_context():
        # Clear existing data
        print("🗑️  Clearing existing data...")
        db.drop_all()
        db.create_all()

        # Create users
        print("👥 Creating users...")
        users = [
            User(
                name="John Farmer",
                email="farmer@example.com",
                password=generate_password_hash("password123"),
                role="farmer",
                phone_number="+254712345678",
                profile_picture="https://via.placeholder.com/150/4CAF50/FFFFFF?text=JF"
            ),
            User(
                name="Sarah Buyer",
                email="buyer@example.com",
                password=generate_password_hash("password123"),
                role="buyer",
                phone_number="+254798765432",
                profile_picture="https://via.placeholder.com/150/2196F3/FFFFFF?text=SB"
            ),
            User(
                name="Green Valley Farm",
                email="greenvalley@example.com",
                password=generate_password_hash("password123"),
                role="farmer",
                phone_number="+254723456789",
                profile_picture="https://via.placeholder.com/150/4CAF50/FFFFFF?text=GV"
            ),
            User(
                name="Organic Harvest Co.",
                email="organicharvest@example.com",
                password=generate_password_hash("password123"),
                role="farmer",
                phone_number="+254734567890",
                profile_picture="https://via.placeholder.com/150/8BC34A/FFFFFF?text=OH"
            )
        ]
        
        for user in users:
            db.session.add(user)
        db.session.commit()

        # Create products
        print("🛍️ Creating products...")
        products = [
            Product(
                name="Organic Tomatoes",
                price=150.00,
                category="Vegetables",
                stock=50,
                description="Fresh, vine-ripened organic tomatoes grown without pesticides",
                image="https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Tomatoes",
                farmer_id=1
            ),
            Product(
                name="Free-Range Eggs",
                price=450.00,
                category="Dairy",
                stock=24,
                description="Farm-fresh eggs from free-range chickens raised naturally",
                image="https://via.placeholder.com/300/FECA57/000000?text=Eggs",
                farmer_id=1
            ),
            Product(
                name="Pure Honey",
                price=1200.00,
                category="Other",
                stock=15,
                description="Raw, unfiltered honey from local bee colonies",
                image="https://via.placeholder.com/300/FFEAA7/000000?text=Honey",
                farmer_id=3
            ),
            Product(
                name="Fresh Apples",
                price=80.00,
                category="Fruits", 
                stock=100,
                description="Crisp, juicy apples picked fresh from our orchard",
                image="https://via.placeholder.com/300/FF7675/FFFFFF?text=Apples",
                farmer_id=3
            ),
            Product(
                name="Organic Carrots",
                price=60.00,
                category="Vegetables",
                stock=75,
                description="Sweet, crunchy carrots grown in rich organic soil",
                image="https://via.placeholder.com/300/E17055/FFFFFF?text=Carrots", 
                farmer_id=4
            ),
            Product(
                name="Fresh Strawberries",
                price=300.00,
                category="Fruits",
                stock=30,
                description="Sweet, seasonal strawberries perfect for desserts",
                image="https://via.placeholder.com/300/FD79A8/FFFFFF?text=Strawberries",
                farmer_id=4
            ),
            Product(
                name="Organic Potatoes",
                price=120.00,
                category="Vegetables",
                stock=60,
                description="Hearty potatoes grown using sustainable farming methods",
                image="https://via.placeholder.com/300/795548/FFFFFF?text=Potatoes",
                farmer_id=1
            ),
            Product(
                name="Fresh Milk",
                price=180.00,
                category="Dairy", 
                stock=20,
                description="Fresh milk from grass-fed cows, pasteurized daily",
                image="https://via.placeholder.com/300/FFFFFF/000000?text=Milk",
                farmer_id=3
            )
        ]
        
        for product in products:
            db.session.add(product)
        db.session.commit()

        # Create some orders
        print("📦 Creating orders...")
        orders = [
            Order(buyer_id=2, total_amount=600.00, status="delivered"),
            Order(buyer_id=2, total_amount=450.00, status="confirmed"),
            Order(buyer_id=2, total_amount=300.00, status="pending")
        ]
        
        for order in orders:
            db.session.add(order)
        db.session.flush()  # Get order IDs
        
        # Add products to orders
        order_products_data = [
            (1, 1, 2),  # Order 1: 2x Tomatoes
            (1, 2, 1),  # Order 1: 1x Eggs
            (2, 3, 1),  # Order 2: 1x Honey  
            (3, 6, 1),  # Order 3: 1x Strawberries
        ]
        
        for order_id, product_id, quantity in order_products_data:
            stmt = order_product.insert().values(
                order_id=order_id,
                product_id=product_id, 
                quantity=quantity
            )
            db.session.execute(stmt)

        # Create ratings
        print("⭐ Creating ratings...")
        ratings = [
            Rating(
                buyer_id=2,
                farmer_id=1,
                product_id=1,
                score=9,  # 4.5/5 stars
                comment="Excellent tomatoes! Very fresh and flavorful."
            ),
            Rating(
                buyer_id=2, 
                farmer_id=1,
                product_id=2,
                score=8,  # 4/5 stars
                comment="Good quality eggs, will order again."
            ),
            Rating(
                buyer_id=2,
                farmer_id=3, 
                product_id=3,
                score=10,  # 5/5 stars
                comment="Amazing honey! So pure and delicious."
            )
        ]
        
        for rating in ratings:
            db.session.add(rating)

        db.session.commit()
        print("✅ Database seeded successfully!")
        print("\n📋 Sample Data Created:")
        print(f"   👥 Users: {len(users)} (2 farmers, 1 buyer)")
        print(f"   🛍️  Products: {len(products)}")
        print(f"   📦 Orders: {len(orders)}")
        print(f"   ⭐ Ratings: {len(ratings)}")
        print(f"\n🔑 Test Credentials:")
        print(f"   Farmer: farmer@example.com / password123")
        print(f"   Buyer:  buyer@example.com / password123")

if __name__ == '__main__':
    seed_database()