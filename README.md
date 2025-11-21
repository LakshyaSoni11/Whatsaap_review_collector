#  WhatsApp Product Review Collector

A tiny project that collects product reviews through **WhatsApp** (Twilio) and exposes them to a simple React dashboard.  

---

<div style="display:flex;gap:12px;align-items:center">
  <div style="padding:10px;border-radius:8px;background:#eef9f3;border:1px solid #d1f1df;font-weight:700;color:#017a47">WA</div>
  <div>
    <h2 style="margin:0">WhatsApp Product Review Collector</h2>
    <p style="margin:2px 0 0;color:#555">FastAPI + Twilio WhatsApp • React viewer • PostgreSQL/SQLite</p>
  </div>
</div>

---

## Quick features
- Multi-step WhatsApp conversation (product → name → review)  
- Saves reviews to a SQL database (Postgres recommended)  
- `GET /api/reviews` returns collected reviews as JSON  
- Local testing via **ngrok** for Twilio sandbox

---

## ▶ Quick start

<details>
<summary><strong>Local (dev) — 1 minute</strong></summary>

1. Install dependencies (backend):
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# mac / linux
source venv/bin/activate

pip install -r requirements.txt
Create .env:

ini
Copy code
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
DATABASE_URL=postgresql://user:pass@host/dbname
Start backend:

bash
Copy code
uvicorn main:app --reload --port 8000
Expose with ngrok:

bash
Copy code
ngrok http 8000
In Twilio Console → WhatsApp Sandbox, paste:

arduino
Copy code
https://<your-ngrok-id>.ngrok-free.app/webhook/whatsapp
On your phone: message the sandbox number with:

bash
Copy code
join <your-code>
then send Hi to start the bot.

</details>
📦 API (example)
GET /api/reviews
Response:

json
Copy code
{
  "reviews": [
    {
      "id": 1,
      "contact_number": "+91xxxx",
      "product_name": "Shoes",
      "user_name": "Anil",
      "product_review": "Very comfortable!",
      "created_at": "2025-01-01T12:00:00"
    }
  ]
}
DB schema (Postgres / SQLAlchemy compatible)
sql
Copy code
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  contact_number TEXT,
  product_name TEXT,
  user_name TEXT,
  product_review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
Example React fetch (paste into useEffect)
js
Copy code
useEffect(() => {
  fetch("https://your-ngrok-url.ngrok-free.app/api/reviews")
    .then(res => res.json())
    .then(data => setReviews(data.reviews || []))
    .catch(err => {
      console.error(err);
      setError("Unable to fetch reviews");
    })
    .finally(() => setLoading(false))
}, [])
Interactive helpers
<details> <summary><strong>Useful commands (click to expand)</strong></summary>
Start dev server

bash
Copy code
uvicorn main:app --reload --port 8000
Start ngrok

bash
Copy code
ngrok http 8000
Create DB table (psql)

sql
Copy code
-- run in psql or your DB GUI
CREATE TABLE reviews (...);  -- use the schema above
</details>