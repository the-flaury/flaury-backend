from flask import Flask, redirect
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from app import config
from app.routes.user_management_route import user_routes
from app import db_engine  # Import the initialized database engine

# Initialize Flask app
app = Flask(__name__)

# Set secret key from config.py
app.config["SECRET_KEY"] = config.SECRET_KEY
app.config["JWT_SECRET_KEY"] = config.SECRET_KEY  # Use the same key for JWT

# Swagger UI Configuration
swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Flury API",
        "description": "API documentation with ReDoc",
        "version": "1.0.0"
    },
    "host": "127.0.0.1:5000",  # Change this for production
    "schemes": ["http", "https"],
}

swagger = Swagger(app, template=swagger_template)

# Initialize JWT Manager
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(user_routes, url_prefix="/api/users")

# Redirect root URL `/` to ReDoc documentation
@app.route("/")
def redoc():
    return redirect("/apidocs/?doc_expansion=none")

if __name__ == "__main__":
    app.run(debug=True)  # Set to False in production
