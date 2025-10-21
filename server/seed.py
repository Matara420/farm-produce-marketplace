from models import db
from models import User, Product, Order, Rating
from datetime import datetime
from app import app
import random

def seed_data():
    with app.app_context():
        # Clear existing tables
        db.drop_all()
        db.create_all()

        # --- USERS ---
        print("seeding users...")
        farmer_names = [
            'John Mwangi', 'Grace Njeri', 'Peter Kamau', 'Mary Wanjiku', 'Joseph Otieno',
            'Sarah Kiptoo', 'David Mutua', 'Jane Achieng', 'George Njoroge', 'Anne Wairimu'
        ]
        buyer_names = [
            'Brian Otieno', 'Alice Wambui', 'Kevin Kiprono', 'Linda Moraa', 'Dennis Njenga',
            'Faith Naliaka', 'Sammy Kimani', 'Rose Nduku', 'Victor Cheruiyot', 'Mercy Atieno'
        ]

        farmers = [
            User(name=name, email=f"{name.split()[0].lower()}@gmail.com", password='hashed123', role='farmer')
            for name in farmer_names
        ]
        buyers = [
            User(name=name, email=f"{name.split()[0].lower()}@gmail.com", password='hashed123', role='buyer')
            for name in buyer_names
        ]

        db.session.add_all(farmers + buyers)
        db.session.commit()

        # --- PRODUCTS ---
        print("seeding products...")
        categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Livestock']
        product_samples = [
            ('Tomatoes', 150.0, 'Organic red tomatoes'),
            ('Kale', 100.0, 'Fresh sukuma wiki'),
            ('Spinach', 120.0, 'Fresh green spinach leaves'),
            ('Maize (10kg)', 500.0, 'Dry maize grains'),
            ('Beans (5kg)', 450.0, 'High-protein beans'),
            ('Carrots', 130.0, 'Crunchy and sweet carrots'),
            ('Cabbages', 140.0, 'Fresh cabbages from the farm'),
            ('Bananas', 200.0, 'Sweet ripe bananas'),
            ('Milk (1L)', 80.0, 'Pure cow milk'),
            ('Eggs (tray)', 450.0, 'Fresh eggs from free-range hens')
        ]

        products = []
        for i in range(30):  # 30 products
            name, price, desc = random.choice(product_samples)
            farmer = random.choice(farmers)
            category = random.choice(categories)
            stock = random.randint(20, 300)
            image = f"{name.lower().replace(' ', '_')}.jpg"

            product = Product(
                name=name,
                description=desc,
                price=price,
                image=image,
                category=category,
                stock=stock,
                farmer_id=farmer.id
            )
            products.append(product)

        db.session.add_all(products)
        db.session.commit()

        # --- ORDERS ---
        print("Seeding orders...")
        orders = []
        for i in range(15):  # 15 orders
            buyer = random.choice(buyers)
            order_products = random.sample(products, k=random.randint(2, 4))
            total = sum(p.price for p in order_products)
            status = random.choice(['pending', 'confirmed', 'delivered', 'cancelled'])
            order = Order(
                buyer_id=buyer.id,
                status=status,
                total_amount=total
            )
            order.products.extend(order_products)
            orders.append(order)

        db.session.add_all(orders)
        db.session.commit()

        # --- RATINGS ---
        print("seeding ratings ...")
        comments = [
            'Very fresh and tasty!',
            'Good quality produce.',
            'Delivery was late but the items were fine.',
            'Highly recommended farmer!',
            'Will definitely buy again.',
            'Average quality, could be better.',
            'Superb packaging and freshness.',
            'Friendly seller and timely delivery.'
        ]

        ratings = []
        for i in range(25):
            buyer = random.choice(buyers)
            product = random.choice(products)
            farmer = next(f for f in farmers if f.id == product.farmer_id)
            score = random.randint(6, 10)
            comment = random.choice(comments)
            rating = Rating(
                buyer_id=buyer.id,
                farmer_id=farmer.id,
                product_id=product.id,
                score=score,
                comment=comment
            )
            ratings.append(rating)

        db.session.add_all(ratings)
        db.session.commit()

        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
