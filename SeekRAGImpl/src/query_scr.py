from models.mods import prompts_to_query
from utils.mtrd_scraper import export_scraper, get_first_google_links
from urllib.parse import urlparse
from typing import List

def validate_urls(urls: List[str]) -> List[str]:
    """
    Validates a list of URLs without making HTTP requests.
    
    Args:
        urls (List[str]): List of URLs to validate
        
    Returns:
        List[str]: List containing only valid URLs
    """
    valid_urls = []
    
    for url in urls:
        try:
            result = urlparse(url)
            if all([result.scheme in ('http', 'https'), result.netloc]):
                valid_urls.append(url)
        except Exception:
            continue
            
    return valid_urls

def research(query:str, api_key:str):
    response = prompts_to_query(query, api_key)
    sites = []
    for i in response["query"]:
        sites += get_first_google_links(i['search_query_prompt'], res = 2)
    
    sites = validate_urls(sites)
    workers = 15
    if len(sites) < 15:
        workers = len(sites)
    
    export_scraper(sites, workers, quiet=True)