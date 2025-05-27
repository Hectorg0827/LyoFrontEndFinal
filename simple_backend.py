#!/usr/bin/env python3
"""
Simple backend server for Lyo frontend development
"""
import json
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Create FastAPI app
app = FastAPI(title="Lyo Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for development
users_db = {}
courses_db = {}
posts_db = {}

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class User(BaseModel):
    id: str
    name: str
    email: str
    avatar: str = ""

class AuthResponse(BaseModel):
    token: str
    user: User

# Create admin user for testing
admin_user = {
    "id": "admin-123",
    "name": "Admin User",
    "email": "admin@lyo.ai",
    "password": "admin123",
    "avatar": "https://avatars.githubusercontent.com/u/1?v=4"
}
users_db["admin@lyo.ai"] = admin_user

# Health endpoint
@app.get("/api/v1/health")
async def health():
    return {
        "status": "healthy",
        "message": "Lyo Backend is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Authentication endpoints
@app.post("/api/v1/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    user = users_db.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate a simple token
    token = f"token-{uuid.uuid4()}"
    
    return AuthResponse(
        token=token,
        user=User(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            avatar=user["avatar"]
        )
    )

@app.post("/api/v1/auth/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    if request.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": request.name,
        "email": request.email,
        "password": request.password,
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={request.name}"
    }
    users_db[request.email] = user
    
    # Generate a simple token
    token = f"token-{uuid.uuid4()}"
    
    return AuthResponse(
        token=token,
        user=User(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            avatar=user["avatar"]
        )
    )

@app.post("/api/v1/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

# User endpoints
@app.get("/api/v1/user/profile")
async def get_profile():
    # For now, return the admin user profile
    return User(
        id=admin_user["id"],
        name=admin_user["name"],
        email=admin_user["email"],
        avatar=admin_user["avatar"]
    )

# Feed endpoints
@app.get("/api/v1/feed")
async def get_feed():
    return {
        "posts": [
            {
                "id": "post-1",
                "title": "Welcome to Lyo!",
                "content": "This is your first post in the Lyo learning platform.",
                "author": "Lyo Team",
                "timestamp": datetime.now().isoformat(),
                "likes": 42,
                "comments": 5
            },
            {
                "id": "post-2",
                "title": "AI-Powered Learning",
                "content": "Discover how AI can enhance your learning experience.",
                "author": "Dr. Sarah Johnson",
                "timestamp": datetime.now().isoformat(),
                "likes": 28,
                "comments": 8
            }
        ],
        "total": 2,
        "page": 1
    }

# Course endpoints
@app.get("/api/v1/courses")
async def get_courses():
    return {
        "courses": [
            {
                "id": "course-1",
                "title": "Introduction to AI",
                "description": "Learn the basics of artificial intelligence",
                "instructor": "Prof. Alex Chen",
                "duration": "4 weeks",
                "level": "beginner",
                "image": "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=AI+Course"
            },
            {
                "id": "course-2",
                "title": "Machine Learning Fundamentals",
                "description": "Master the fundamentals of machine learning",
                "instructor": "Dr. Maria Rodriguez",
                "duration": "6 weeks",
                "level": "intermediate",
                "image": "https://via.placeholder.com/300x200/50C878/FFFFFF?text=ML+Course"
            }
        ],
        "total": 2
    }

# Avatar endpoints
@app.get("/api/v1/avatar/conversation")
async def get_avatar_conversation():
    return {
        "messages": [
            {
                "id": "msg-1",
                "text": "Hello! I'm your AI learning assistant. How can I help you today?",
                "sender": "avatar",
                "timestamp": datetime.now().isoformat()
            }
        ]
    }

@app.post("/api/v1/avatar/message")
async def send_avatar_message(message: dict):
    user_message = message.get("text", "")
    
    # Simple AI response logic
    if "hello" in user_message.lower():
        response = "Hello! Nice to meet you. What would you like to learn today?"
    elif "help" in user_message.lower():
        response = "I'm here to help you learn! You can ask me about courses, concepts, or study tips."
    elif "course" in user_message.lower():
        response = "We have great courses available! Check out our AI and Machine Learning courses."
    else:
        response = f"That's interesting! Tell me more about {user_message.lower()}."
    
    return {
        "id": str(uuid.uuid4()),
        "text": response,
        "sender": "avatar",
        "timestamp": datetime.now().isoformat()
    }

# API documentation
@app.get("/api/v1/openapi.json")
async def get_openapi():
    return app.openapi()

if __name__ == "__main__":
    print("🚀 Starting Lyo Backend Server...")
    print("📍 Health endpoint: http://localhost:8000/api/v1/health")
    print("📚 API docs: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
