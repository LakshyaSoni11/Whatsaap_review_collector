from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os
from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import PlainTextResponse
from twilio.rest import Client
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def create_table():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS reviews(
                id SERIAL PRIMARY KEY,
                contact_number TEXT,
                product_name TEXT,
                user_name TEXT,
                product_review TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """))
        conn.commit()

# initializing the fast api app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,  
)

# creating the tabele if not being created
create_table()
print("Created table successfully")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")
print("TWILIO_WHATSAPP_NUMBER =", TWILIO_WHATSAPP_NUMBER)

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

conversation_state = {}
# function to get user data
def get_user_state(phone: str) -> dict:
    if phone not in conversation_state:
        conversation_state[phone] = {
            "step": 0,
            "product_name": None,
            "user_name": None,
            "review": None
        }
    return conversation_state[phone]

def send_message(phone: str, message: str):
    try:
        twilio_client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{phone}",
            body=message
        )
    except Exception as e:
        print(f"Error sending message to {phone}: {e}")
        raise e
#webhook to post the data toi the backend 
@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    form = await request.form()
    incoming_message = form.get("Body", "").strip()
    phone = form.get("From", "").replace("whatsapp:", "")

    state = get_user_state(phone)

    try:
        if state["step"] == 0:
            state["step"] = 1
            send_message(phone, "Hi, which product do you want to review?")

        elif state["step"] == 1:
            state["product_name"] = incoming_message
            state["step"] = 2
            send_message(phone, "Nice! What's your name?")

        elif state["step"] == 2:
            state["user_name"] = incoming_message
            state["step"] = 3
            send_message(phone, f"Great {incoming_message}! Send your review now...")

        elif state["step"] == 3:
            state["review"] = incoming_message
            
            try:
                with engine.connect() as conn:
                    sql_query = text("""
                        INSERT INTO reviews (contact_number, product_name, user_name, product_review, created_at)
                        VALUES(:phone, :product, :name, :review, :created)
                    """)
                    params = {
                        "phone": phone,
                        "product": state["product_name"],
                        "name": state["user_name"],
                        "review": state["review"],
                        "created": datetime.utcnow()
                    }
                    conn.execute(sql_query, params)
                    conn.commit()
                
                send_message(phone, f"Thanks {state['user_name']}! Your review for {state['product_name']} has been saved.")
                conversation_state[phone] = {"step": 0}
                
            except Exception as db_error:
                print(f"DATABASE ERROR: {db_error}")
                print(f"Phone: {phone}, Product: {state['product_name']}, User: {state['user_name']}, Review: {state['review']}")
                send_message(phone, "An unexpected error occurred. Please try starting a new review.")

    except Exception as e:
        print(f"Error during conversation processing: {e}")
        if "twilio" not in str(e).lower():
            send_message(phone, "An unexpected error occurred. Please try starting a new review.")

    return PlainTextResponse("")

#backend url to get the reviews
@app.get("/api/reviews")
def get_reviews():
    rows = []
    try:
        with engine.connect() as conn:
            sql_query = text("SELECT id, contact_number, product_name, user_name, product_review, created_at FROM reviews ORDER BY created_at DESC")
            result = conn.execute(sql_query)
            rows = [dict(row) for row in result.mappings()]
    except Exception as e:
        print(f"Database fetch error: {e}")
        return {"success": False, "reviews": [], "error": "Could not connect or query database."}

    return {"success": True, "reviews": rows}

@app.get("/health")
def health():
    return {"status": "ok"}