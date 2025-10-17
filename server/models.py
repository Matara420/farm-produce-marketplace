from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_brcypt import Bcrypt

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

class User:
    __tableName__ = 'users'

    id = db.Column()
    name = db.Column()
    email = db.Column()
    password = db.Column()
    role = db.Column()
    phone = db.Column()