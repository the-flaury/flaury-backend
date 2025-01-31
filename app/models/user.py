from app.models.base_model import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash

class User(BaseModel):
    """
    User model inheriting from BaseModel.
    """

    def __init__(self, data=None):
        super().__init__(data)
        self.user_name = data.get('user_name') if data else None
        self.first_name = data.get('first_name') if data else None
        self.last_name = data.get('last_name') if data else None
        self.email = data.get('email') if data else None
        self.password = self.hash_password(data.get('password')) if data else None
        self.type_of_service = data.get('type_of_service') if data else None
        self.role = data.get('role', 'client') if data else 'client'

    def hash_password(self, password):
        """Hash password before storing."""
        return generate_password_hash(password) if password else None

    def check_password(self, password):
        """Verify password."""
        return check_password_hash(self.password, password)

    def to_dict(self):
        """
        Extend BaseModel's `to_dict` to include User-specific fields.
        """
        base_dict = super().to_dict()
        base_dict.update({
            'user_name': self.user_name,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'password': self.password,
            'type_of_service': self.type_of_service,
            'role': self.role,
        })
        return base_dict
