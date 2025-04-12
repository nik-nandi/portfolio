from models.mods import text_block_analyze

from utils.merge import collect_sites_data

from utils.token_count import split_into_chunks

from utils.chroma import ChromaManager

def save_search_to_chroma(query:str, api_key:str):
    documentsData, metaData = data_unroller(query, api_key)
    
    db = ChromaManager(
        collection_name="query_data",
        persist_directory="./db"
    )
    
    db.add_documents(
        documents=documentsData,
        metadatas=metaData
    )

def data_unroller(query:str, api_key:str):
    merged_content, urls = collect_sites_data()
    text = ""
    
    for x, y in zip(merged_content, urls):
        text += f"Url: {str(y)} Content: {str(x)}"
    
    text = split_into_chunks(text)
    relevance_analysed_text = []
    
    for i in text:
        relevance_analysed_text.append(text_block_analyze(query, i, api_key))
    

    docuemntsData = []
    metaData = []
    
    for blob in relevance_analysed_text:
        blob = blob["output"]
        for scored_text in blob:
            docuemntsData.append(scored_text["text"])
            metaData.append({"relation":scored_text["score"], "url":scored_text["url"]})
        
    return docuemntsData, metaData