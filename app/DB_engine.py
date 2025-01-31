from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timezone
from app import config


class MongoDBEngine:
    def __init__(self, uri=config.URI, db_name=config.DB_NAME):
        """
        Initialize MongoDB connection.
        """
        self.client = MongoClient(uri)
        self.db = self.client[db_name]

    def save(self, collection_name, data):
        """
        Save an object to the database.
        If the data contains an '_id', it updates the existing document.
        Otherwise, it inserts a new document.
        """
        collection = self.db[collection_name]
        data['updated_at'] = datetime.now(timezone.utc)  # Set/update timestamp
        if '_id' in data and data['_id']:
            # Update existing document
            result = collection.update_one({'_id': ObjectId(data['_id'])}, {'$set': data}, upsert=True)
            return result.upserted_id or data['_id']
        else:
            # Insert new document
            data['created_at'] = datetime.now(timezone.utc)  # Set created_at timestamp
            result = collection.insert_one(data)
            return result.inserted_id

    def delete(self, collection_name, object_id):
        """
        Delete an object from the database by its ObjectId.
        """
        collection = self.db[collection_name]
        result = collection.delete_one({'_id': ObjectId(object_id)})
        return result.deleted_count > 0

    def find_one(self, collection_name, query):
        """
        Find a single object in the collection based on a query.
        """
        collection = self.db[collection_name]
        return collection.find_one(query)

    def find_all(self, collection_name, query=None):
        """
        Find all objects in a collection matching a query.
        If no query is provided, it returns all documents.
        """
        collection = self.db[collection_name]
        return list(collection.find(query or {}))
