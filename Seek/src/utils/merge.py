import os
import re
import shutil
from bs4 import BeautifulSoup, Comment  # Ensure this package is installed

def sanitize_filename(name: str) -> str:
    # Replace Windows illegal filename characters with an underscore.
    return re.sub(r'[\\/*?:"<>|]', "_", name)

def collect_sites_data() -> tuple[list[str], list[str]]:
    """
    Collects and cleans HTML content and URLs from all scraped sites.
    Removes scripts, styles, and other non-content elements.
    
    Returns:
        tuple[list[str], list[str]]: A tuple containing two lists:
            - List of cleaned HTML contents as strings
            - List of corresponding URLs as strings
    """
    base_dir = 'scraped_sites'
    html_contents = []
    urls = []
    
    # Check if base directory exists
    if not os.path.exists(base_dir):
        return html_contents, urls
        
    for site_dir in os.listdir(base_dir):
        site_path = os.path.join(base_dir, site_dir)
        
        if not os.path.isdir(site_path):
            continue
            
        index_path = os.path.join(site_path, 'index.html')
        url_path = os.path.join(site_path, 'url.txt')
        
        if not (os.path.exists(index_path) and os.path.exists(url_path)):
            continue
            
        try:
            # Read and clean HTML content
            with open(index_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
                
                # Remove unwanted elements
                for element in soup(['script', 'style', 'head', 'nav', 'footer', 
                                  'iframe', 'noscript', '[document]', 'header']):
                    element.decompose()
                
                # Remove comments
                for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
                    comment.extract()
                
                # Get clean text
                text = ' '.join(soup.stripped_strings)
                # Remove extra whitespace
                text = ' '.join(text.split())
                html_contents.append(text)
                
            # Read URL
            with open(url_path, 'r', encoding='utf-8') as f:
                urls.append(f.read().strip())
                
        except Exception as e:
            print(f"Error processing {site_dir}: {str(e)}")
            continue
    
    return html_contents, urls

