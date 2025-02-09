import chromadb
from typing import List, Optional, Dict, Any
import os
from sentence_transformers import SentenceTransformer

class ChromaManager:
    def __init__(
        self,
        collection_name: str = "default_collection",
        persist_directory: str = "./chroma_db",
        embedding_model: str = "all-MiniLM-L6-v2"
    ):
        """
        Initialize ChromaDB manager.
        
        Args:
            collection_name (str): Name of the collection
            persist_directory (str): Directory to store the database
            embedding_model (str): Name of the embedding model to use
        """
        # Create persist directory if it doesn't exist
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialize the embedding model
        self.model = SentenceTransformer(embedding_model)
        
        # Create proper embedding function class
        class EmbeddingFunction:
            def __init__(self, model):
                self.model = model
                
            def __call__(self, input):
                return self.model.encode(input).tolist()
        
        # Initialize client with persistence
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Create the embedding function instance
        self.embedding_function = EmbeddingFunction(self.model)
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embedding_function
        )

    def add_documents(
        self,
        documents: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None
    ) -> None:
        """
        Add documents to the collection.
        
        Args:
            documents (List[str]): List of text documents to add
            metadatas (List[Dict]): Optional metadata for each document
            ids (List[str]): Optional unique IDs for each document
        """
        if ids is None:
            # Generate IDs based on current count
            current_count = self.collection.count()
            ids = [f"doc_{current_count + i}" for i in range(len(documents))]
            
        if metadatas is None:
            metadatas = [{} for _ in documents]
            
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def query(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict] = None
    ) -> Dict:
        """
        Query the collection.
        
        Args:
            query_text (str): Text to search for
            n_results (int): Number of results to return
            where (Dict): Optional filter conditions
            
        Returns:
            Dict: Query results
        """
        return self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where
        )

    def get_collection_stats(self) -> Dict:
        """Get basic statistics about the collection."""
        return {
            "count": self.collection.count(),
            "name": self.collection.name
        }
    
    def count_documents(self) -> int:
        """Count the number of documents in the collection."""
        return self.collection.count()
    
    def get_all_documents(self) -> List[Dict]:
        """Get all documents in the collection."""
        return self.collection.get(include=["metadatas", "documents", "embeddings"])

