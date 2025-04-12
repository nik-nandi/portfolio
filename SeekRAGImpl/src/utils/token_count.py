import tiktoken

def count_tokens(text: str, encoding_name: str = "cl100k_base") -> int:
    """
    Count the number of tokens in a string using tiktoken encodings.
    
    Args:
        text (str): The input text to count tokens for
        encoding_name (str): The encoding to use (default: cl100k_base for GPT-4)
    
    Returns:
        int: Number of tokens in the text
    """
    try:
        encoding = tiktoken.get_encoding(encoding_name)
        num_tokens = len(encoding.encode(text))
        return num_tokens
    except Exception as e:
        print(f"Error counting tokens: {e}")
        return 0

def split_into_chunks(text: str, max_tokens: int = 50000) -> list[str]:
    """
    Split text into chunks of approximately max_tokens each.
    
    Args:
        text (str): The text to split
        max_tokens (int): Maximum tokens per chunk (default: 800,000)
        
    Returns:
        List[str]: List of text chunks
    """
    chunks = []
    paragraphs = text.split('\n\n')  # Split on double newlines to preserve structure
    current_chunk = []
    current_token_count = 0
    
    for paragraph in paragraphs:
        paragraph_tokens = count_tokens(paragraph)
        
        if current_token_count + paragraph_tokens > max_tokens and current_chunk:
            # Join the current chunk and add it to chunks
            chunks.append('\n\n'.join(current_chunk))
            current_chunk = [paragraph]
            current_token_count = paragraph_tokens
        else:
            current_chunk.append(paragraph)
            current_token_count += paragraph_tokens
    
    # Add the last chunk if it exists
    if current_chunk:
        chunks.append('\n\n'.join(current_chunk))
    
    return chunks