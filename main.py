from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import openai

app = FastAPI()
client = openai.OpenAI(
    api_key = os.environ.get("OPENAI_API_KEY")
)

# Add CORS middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your Next.js app to access the API
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Temporary in-memory storage
last_question = ""

class QuestionRequest(BaseModel):
    topic: str

class AnswerRequest(BaseModel):
    answer: str

@app.post("/generate_question/")
async def generate_question(request: QuestionRequest):
    global last_question 

    response = client.responses.create(
        model="gpt-4o-mini",
        input=f"Generate one technical interview question on {request.topic}.",
        max_output_tokens=250
    )
    
    last_question = response.output_text
    return {"question": last_question}

@app.post("/evaluate_answer/")
async def evaluate_answer(request: AnswerRequest):
    global last_question

    if not last_question:
        return {"error": "No question found. Please generate a question first."}

    prompt = f"""
    Interview Question: {last_question}
    Candidate Answer: {request.answer}
    
    Provide a score (0-10), feedback, and areas of improvement.
    """
    
    response = client.responses.create(
        model="gpt-4o-mini",
        input=prompt,
        max_output_tokens=500
    )
    
    feedback = response.output_text
    return {
        "question": last_question,
        "evaluation": feedback
    }
