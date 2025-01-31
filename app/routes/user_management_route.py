from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flasgger import swag_from
from app import db_engine
from app.models.user import User
from bson.objectid import ObjectId

user_routes = Blueprint("user_routes", __name__)

# User Registration
@user_routes.route("/register", methods=["POST"])
@swag_from({
    "tags": ["User Authentication"],
    "summary": "Register a new user",
    "description": "Registers a new user in the system.",
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "example": {
                    "user_name": "john_doe",
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john@example.com",
                    "password": "secure123",
                    "type_of_service": "basic",
                    "role": "client"
                }
            }
        }
    ],
    "responses": {
        "201": {"description": "User registered successfully"},
        "400": {"description": "Email already registered"}
    }
})
def register():
    data = request.json

    # Check if user exists
    if db_engine.find_one("users", {"email": data.get("email")}):
        return jsonify({"error": "Email already registered"}), 400

    user = User(data)
    user_id = db_engine.save("users", user.to_dict())

    return jsonify({"message": "User registered successfully", "user_id": str(user_id)}), 201


# User Login
@user_routes.route("/login", methods=["POST"])
@swag_from({
    "tags": ["User Authentication"],
    "summary": "User login",
    "description": "Authenticates a user and returns a JWT token.",
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "example": {
                    "email": "john@example.com",
                    "password": "secure123"
                }
            }
        }
    ],
    "responses": {
        "200": {"description": "Login successful"},
        "401": {"description": "Invalid email or password"}
    }
})
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user_data = db_engine.find_one("users", {"email": email})
    if not user_data:
        return jsonify({"error": "Invalid email or password"}), 401

    user = User(user_data)
    if not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user_data["_id"]))
    return jsonify({"message": "Login successful", "token": access_token}), 200


# User Update
@user_routes.route("/update", methods=["PUT"])
@jwt_required()
@swag_from({
    "tags": ["User Management"],
    "summary": "Update user details",
    "description": "Updates a user's profile.",
    "parameters": [
        {
            "name": "Authorization",
            "in": "header",
            "required": True,
            "type": "string",
            "description": "Bearer token"
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "example": {
                    "first_name": "Johnny",
                    "last_name": "Doe"
                }
            }
        }
    ],
    "responses": {
        "200": {"description": "User updated successfully"},
        "404": {"description": "User not found"}
    }
})
def update_user():
    user_id = get_jwt_identity()
    data = request.json

    existing_user = db_engine.find_one("users", {"_id": ObjectId(user_id)})
    if not existing_user:
        return jsonify({"error": "User not found"}), 404

    updated_data = {key: value for key, value in data.items() if key != "password"}

    if "password" in data:
        updated_data["password"] = User({}).hash_password(data["password"])

    db_engine.save("users", {**existing_user, **updated_data})
    return jsonify({"message": "User updated successfully"}), 200


# Password Reset
@user_routes.route("/reset_password", methods=["POST"])
@swag_from({
    "tags": ["User Management"],
    "summary": "Reset user password",
    "description": "Resets a user's password.",
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "example": {
                    "email": "john@example.com",
                    "new_password": "newSecure123"
                }
            }
        }
    ],
    "responses": {
        "200": {"description": "Password reset successful"},
        "404": {"description": "User not found"}
    }
})
def reset_password():
    data = request.json
    email = data.get("email")
    new_password = data.get("new_password")

    user_data = db_engine.find_one("users", {"email": email})
    if not user_data:
        return jsonify({"error": "User not found"}), 404

    user_data["password"] = User({}).hash_password(new_password)
    db_engine.save("users", user_data)

    return jsonify({"message": "Password reset successful"}), 200


# User Deletion
@user_routes.route("/delete", methods=["DELETE"])
@jwt_required()
@swag_from({
    "tags": ["User Management"],
    "summary": "Delete user",
    "description": "Deletes a user account.",
    "parameters": [
        {
            "name": "Authorization",
            "in": "header",
            "required": True,
            "type": "string",
            "description": "Bearer token"
        }
    ],
    "responses": {
        "200": {"description": "User deleted successfully"},
        "500": {"description": "User deletion failed"}
    }
})
def delete_user():
    user_id = get_jwt_identity()

    if db_engine.delete("users", ObjectId(user_id)):
        return jsonify({"message": "User deleted successfully"}), 200

    return jsonify({"error": "User deletion failed"}), 500
