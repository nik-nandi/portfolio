from query_scr import research
from save_scr import save_search_to_chroma
from utils.chroma import ChromaManager

from fastapi import FastAPI, HTTPException, Body # type: ignore
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel # type: ignore

def search(query: str, api_key: str) -> None:
    try:
        print("Start research")
        research(query, api_key)
        print("Research completed")
    except Exception as e:
        print(e)
    
    try:
        print("Start saving to chroma")
        save_search_to_chroma(query, api_key)
        print("Saving to chroma completed")
    except Exception as e:
        HTTPException(status_code=400, detail=str(e))

def grab_results(query: str):
    db = ChromaManager(
        collection_name="query_data",
        persist_directory="./db"
    )
    
    results = db.query(query, n_results=30)
    docs = results["documents"][0]
    meta = results["metadatas"][0]
    
    return docs, meta

class QueryItem(BaseModel):
    query: str
    api_key: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"API": "Active"}

@app.post("/research/")
async def research_fast_api(queryObj:QueryItem):
    search(queryObj.query, queryObj.api_key)
    return f"Completed search on query: [{queryObj.query}]" 