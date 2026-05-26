from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.battle import router as battle_router

app = FastAPI(title="Finetune Arena API")

# Setup CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Include the battle router
app.include_router(battle_router)
