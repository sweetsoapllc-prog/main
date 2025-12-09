from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Quiet Housekeeper System Prompt
QUIET_HOUSEKEEPER_PROMPT = """You are Quiet Housekeeper, a gentle, supportive mental-load manager for women who carry too much of the invisible work of life. Your job is to help them feel lighter, calmer, and more guided. You never overwhelm them, never guilt-trip them, and never speak in productivity language.

Your tone is warm, soft, and quietly competent. You validate feelings and simplify tasks.

CORE RULES:
- Never list more than 3 essential tasks at a time.
- Always offer options, not pressure.
- Avoid words like "should," "must," or "you need to."
- Treat the user with deep compassion.
- Normalize overwhelm: "It makes sense this feels heavy."
- Keep everything small, doable, and supportive.

Whenever you output tasks, structure them into:
- Today (1–3 calm steps)
- This Week (gentle, flexible)
- Later (parked but not forgotten)

When the user's energy is low, automatically simplify or reduce tasks.

You are here to be the user's soft second brain."""

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: str

class OnboardingProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tone_preference: str = "gentle"
    day_type: str = ""
    responsibilities: List[str] = []
    bills_reminders: bool = True
    emotional_support: str = ""
    energy_checkins: str = "daily"
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OnboardingProfileCreate(BaseModel):
    name: str
    tone_preference: str = "gentle"
    day_type: str = ""
    responsibilities: List[str] = []
    bills_reminders: bool = True
    emotional_support: str = ""
    energy_checkins: str = "daily"

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: Optional[str] = None
    category: str = "today"  # today, this_week, later
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None
    category: str = "today"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None

class Routine(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    time_of_day: str  # morning, evening, weekly
    items: List[str]
    completed_today: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RoutineCreate(BaseModel):
    user_id: str
    name: str
    time_of_day: str
    items: List[str]

class Bill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    amount: float
    due_date: str
    paid: bool = False
    recurring: bool = False
    autopay: bool = False
    frequency: str = "Monthly"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BillCreate(BaseModel):
    user_id: str
    name: str
    amount: float
    due_date: str
    recurring: bool = False
    autopay: bool = False
    frequency: str = "Monthly"

class EnergyCheckIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    energy_level: int  # 1-5
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EnergyCheckInCreate(BaseModel):
    user_id: str
    energy_level: int
    notes: Optional[str] = None

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    role: str  # user or assistant
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str

class ChatResponse(BaseModel):
    message: str
    created_at: datetime

# Routes
@api_router.get("/")
async def root():
    return {"message": "MindAttic API"}

# User routes
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    user_obj = User(**user.model_dump())
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return user

# Onboarding routes
@api_router.post("/onboarding", response_model=OnboardingProfile)
async def save_onboarding_profile(profile: OnboardingProfileCreate):
    profile_obj = OnboardingProfile(**profile.model_dump())
    doc = profile_obj.model_dump()
    doc['completed_at'] = doc['completed_at'].isoformat()
    
    # Check if profile already exists for this user
    existing = await db.onboarding_profiles.find_one({"user_id": profile_obj.user_id})
    if existing:
        # Update existing profile
        await db.onboarding_profiles.update_one(
            {"user_id": profile_obj.user_id}, 
            {"$set": doc}
        )
    else:
        # Insert new profile
        await db.onboarding_profiles.insert_one(doc)
    
    return profile_obj

@api_router.get("/onboarding/{user_id}", response_model=OnboardingProfile)
async def get_onboarding_profile(user_id: str):
    profile = await db.onboarding_profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Onboarding profile not found")
    if isinstance(profile['completed_at'], str):
        profile['completed_at'] = datetime.fromisoformat(profile['completed_at'])
    return profile

# Task routes
@api_router.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    task_obj = Task(**task.model_dump())
    doc = task_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.tasks.insert_one(doc)
    return task_obj

@api_router.get("/tasks/{user_id}", response_model=List[Task])
async def get_tasks(user_id: str, category: Optional[str] = None):
    query = {"user_id": user_id}
    if category:
        query["category"] = category
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    for task in tasks:
        if isinstance(task['created_at'], str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
    return tasks

@api_router.patch("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, update: TaskUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if isinstance(task['created_at'], str):
        task['created_at'] = datetime.fromisoformat(task['created_at'])
    return task

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# Routine routes
@api_router.post("/routines", response_model=Routine)
async def create_routine(routine: RoutineCreate):
    routine_obj = Routine(**routine.model_dump())
    doc = routine_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.routines.insert_one(doc)
    return routine_obj

@api_router.get("/routines/{user_id}", response_model=List[Routine])
async def get_routines(user_id: str):
    routines = await db.routines.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    for routine in routines:
        if isinstance(routine['created_at'], str):
            routine['created_at'] = datetime.fromisoformat(routine['created_at'])
    return routines

@api_router.patch("/routines/{routine_id}/complete")
async def complete_routine(routine_id: str):
    await db.routines.update_one({"id": routine_id}, {"$set": {"completed_today": True}})
    return {"message": "Routine marked complete"}

# Bill routes
@api_router.post("/bills", response_model=Bill)
async def create_bill(bill: BillCreate):
    bill_obj = Bill(**bill.model_dump())
    doc = bill_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.bills.insert_one(doc)
    return bill_obj

@api_router.get("/bills/{user_id}", response_model=List[Bill])
async def get_bills(user_id: str):
    bills = await db.bills.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    for bill in bills:
        if isinstance(bill['created_at'], str):
            bill['created_at'] = datetime.fromisoformat(bill['created_at'])
    return bills

@api_router.patch("/bills/{bill_id}/pay")
async def pay_bill(bill_id: str):
    await db.bills.update_one({"id": bill_id}, {"$set": {"paid": True}})
    return {"message": "Bill marked as paid"}

# Energy check-in routes
@api_router.post("/energy", response_model=EnergyCheckIn)
async def create_energy_checkin(checkin: EnergyCheckInCreate):
    checkin_obj = EnergyCheckIn(**checkin.model_dump())
    doc = checkin_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.energy_checkins.insert_one(doc)
    return checkin_obj

@api_router.get("/energy/{user_id}", response_model=List[EnergyCheckIn])
async def get_energy_checkins(user_id: str):
    checkins = await db.energy_checkins.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(30).to_list(30)
    for checkin in checkins:
        if isinstance(checkin['created_at'], str):
            checkin['created_at'] = datetime.fromisoformat(checkin['created_at'])
    return checkins

# Chat routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Save user message
    user_msg = ChatMessage(
        user_id=request.user_id,
        session_id=request.session_id,
        role="user",
        content=request.message
    )
    user_doc = user_msg.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    await db.chat_messages.insert_one(user_doc)
    
    # Get chat history
    history = await db.chat_messages.find(
        {"user_id": request.user_id, "session_id": request.session_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    # Get user context (tasks, energy level, etc.)
    tasks = await db.tasks.find({"user_id": request.user_id, "completed": False}, {"_id": 0}).to_list(100)
    recent_energy = await db.energy_checkins.find({"user_id": request.user_id}, {"_id": 0}).sort("created_at", -1).limit(1).to_list(1)
    
    # Build context
    context = f"""Current context:
- User has {len([t for t in tasks if t['category'] == 'today'])} tasks for today
- User has {len([t for t in tasks if t['category'] == 'this_week'])} tasks this week
"""
    if recent_energy:
        context += f"- User's recent energy level: {recent_energy[0]['energy_level']}/5\n"
    
    full_message = f"{context}\n\nUser message: {request.message}"
    
    # Call AI
    try:
        chat_client = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=request.session_id,
            system_message=QUIET_HOUSEKEEPER_PROMPT
        ).with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(text=full_message)
        response = await chat_client.send_message(user_message)
        
        # Save assistant message
        assistant_msg = ChatMessage(
            user_id=request.user_id,
            session_id=request.session_id,
            role="assistant",
            content=response
        )
        assistant_doc = assistant_msg.model_dump()
        assistant_doc['created_at'] = assistant_doc['created_at'].isoformat()
        await db.chat_messages.insert_one(assistant_doc)
        
        return ChatResponse(message=response, created_at=assistant_msg.created_at)
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@api_router.get("/chat/history/{user_id}/{session_id}", response_model=List[ChatMessage])
async def get_chat_history(user_id: str, session_id: str):
    messages = await db.chat_messages.find(
        {"user_id": user_id, "session_id": session_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    for msg in messages:
        if isinstance(msg['created_at'], str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    return messages

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()