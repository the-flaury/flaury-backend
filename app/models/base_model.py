import uuid
from datetime import datetime, timezone
from flask_login import current_user

class BaseModel:
    """
    A base class for MongoDB models that includes common fields:
    - id: UUID string (automatically generated)
    - created_at: Timestamp when the document is created (UTC timezone-aware)
    - updated_at: Timestamp when the document is last updated (UTC timezone-aware)
    - created_by: The user who created the document
    - updated_by: The user who last updated the document
    """

    def __init__(self, data=None):
        """
        Initialize a BaseModel instance. Optionally, pass `data` to populate fields.
        """
        now = datetime.now(timezone.utc)  # Use timezone-aware datetime objects
        self.id = str(uuid.uuid4())
        self.created_at = now
        self.updated_at = now
        self.created_by = None
        self.updated_by = None

        if data:
            self.id = data.get('id', self.id)
            self.created_at = data.get('created_at', self.created_at)
            self.updated_at = data.get('updated_at', self.updated_at)
            self.created_by = data.get('created_by', self.created_by)
            self.updated_by = data.get('updated_by', self.updated_by)

    def to_dict(self):
        """
        Convert the object to a dictionary for storing in MongoDB.
        """
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),  # Serialize to ISO 8601
            'updated_at': self.updated_at.isoformat(),  # Serialize to ISO 8601
            'created_by': self.created_by,
            'updated_by': self.updated_by,
        }

    def save(self, collection, data):
        """
        Insert or update the document in the MongoDB collection.
        """
        self.updated_at = datetime.now(timezone.utc)  # Update timestamp
        if current_user and hasattr(current_user, 'id'):
            self.updated_by = current_user.id

        if not self.created_by and current_user and hasattr(current_user, 'id'):
            self.created_by = current_user.id

        data.update(self.to_dict())
        if collection.find_one({'id': self.id}):
            # Update the document
            collection.update_one({'id': self.id}, {'$set': data})
        else:
            # Insert a new document
            collection.insert_one(data)
