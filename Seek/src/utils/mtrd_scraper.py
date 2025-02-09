import requests
from bs4 import BeautifulSoup
from googlesearch import search
from urllib.parse import urlparse, urljoin
import os
import re
import hashlib
from concurrent.futures import ThreadPoolExecutor
import time

def get_first_google_links(query, res = 3):
    urls = []
    for i in search(query, num_results=res):
        urls.append(i)
    return urls

def sanitize_filename(filename):
    filename = re.sub(r'[\\/*?:"<>|]', '', filename)
    return filename.replace(' ', '_')

def download_image(url, save_dir, quiet=False):
    try:
        response = requests.get(url, stream=True, timeout=0.5)
        if response.status_code == 200:
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path) or f"{hashlib.md5(url.encode()).hexdigest()}.jpg"
            filename = sanitize_filename(filename)
            
            os.makedirs(save_dir, exist_ok=True)
            
            base, ext = os.path.splitext(filename)
            counter = 0
            while os.path.exists(os.path.join(save_dir, filename)):
                counter += 1
                filename = f"{base}_{base}_{counter}{ext}"
            
            with open(os.path.join(save_dir, filename), 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return filename
        return None
    except Exception as e:
        if not quiet:
            print(f"Error downloading {url}: {e}")
        return None

def scrape_site(url, base_dir='scraped_sites', quiet=False):
    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        timestamp = int(time.time())
        save_dir = os.path.join(base_dir, f"{domain}_{timestamp}")
        os.makedirs(save_dir, exist_ok=True)
        
        response = requests.get(url, timeout=2)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        images_dir = os.path.join(save_dir, 'images')
        
        # Process all images in the page.
        for img in soup.find_all('img'):
            if not (src := img.get('src')):
                continue
            
            img_url = urljoin(url, src)
            if filename := download_image(img_url, images_dir, quiet=quiet):
                img['src'] = os.path.join('images', filename)
            else:
                img.decompose()
        
        # Save the modified HTML to index.html.
        index_path = os.path.join(save_dir, 'index.html')
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        
        # Record the URL in a separate file.
        url_path = os.path.join(save_dir, 'url.txt')
        with open(url_path, 'w', encoding='utf-8') as f:
            f.write(url)
        
        if not quiet:
            print(f"Scraped {url} to {save_dir}")
        return True
    except Exception as e:
        if not quiet:
            print(f"Failed to scrape {url}: {e}")
        return False

def export_scraper(urls: list, workers: int = 3, quiet: bool = False):
    """
    Export scraper with multiple workers and optional quiet mode.
    
    Args:
        urls (list): List of URLs to scrape
        workers (int): Number of concurrent workers
        quiet (bool): If True, suppresses logging output
    """
    with ThreadPoolExecutor(max_workers=workers) as executor:
        executor.map(lambda url: scrape_site(url, quiet=quiet), urls)

