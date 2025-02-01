# Use official Python image as a base
FROM python:3.9-slim

# Set the working directory
WORKDIR /flaury-backend

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Expose the Flask app's port
EXPOSE 5000

# Command to run the Flask app
CMD ["python", "run.py"]
