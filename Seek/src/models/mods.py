import json
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
import time

def prompts_to_query(query:str, api_key:str) -> dict:
    genai.configure(api_key=api_key)
    generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_schema": content.Schema(
        type = content.Type.OBJECT,
        enum = [],
        required = ["query"],
        properties = {
        "query": content.Schema(
            type = content.Type.ARRAY,
            items = content.Schema(
            type = content.Type.OBJECT,
            enum = [],
            required = ["search_query_prompt", "search_query_relevance"],
            properties = {
                "search_query_prompt": content.Schema(
                type = content.Type.STRING,
                ),
                "search_query_relevance": content.Schema(
                type = content.Type.STRING,
                ),
            },
            ),
        ),
        },
    ),
    "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-8b",
        generation_config=generation_config,
        system_instruction=f"Note that for any query regarding time, pretend that it is {time.strftime('%d %B %Y')}. For any query, instead of answering it, give what would be five good search requests to learn more about the topic? Always make sure that there are 5 search queries in the response. In addition, rate those queries as Very Relevant or Slightly Relevant.",
    )

    chat_session = model.start_chat(
        history=[]
    )

    response = chat_session.send_message(query)
    return json.loads(response.text)
    
def text_block_analyze(query:str, text:str, api_key:str) -> dict: 
    genai.configure(api_key=api_key)
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 32768,
        "response_schema": content.Schema(
            type = content.Type.OBJECT,
            enum = [],
            required = ["output"],
            properties = {
                "output": content.Schema(
                    type = content.Type.ARRAY,
                    items = content.Schema(
                        type = content.Type.OBJECT,
                        enum = [],
                        required = ["text", "score", "url"],
                        properties = {
                            "text": content.Schema(
                                type = content.Type.STRING,
                            ),
                            "score": content.Schema(
                                type = content.Type.STRING,
                            ),
                                "url": content.Schema(
                                type = content.Type.STRING,
                            ),
                        },
                    ),
                ),
            },
        ),
        "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-lite-preview-02-05",
        generation_config=generation_config,
        system_instruction="Given an input prompt and a block of text, find all information relevant to that prompt within the text. Respond with a list of at least 35 items with the information that is relevant, the url of the docuemnt where the fragment came from, and a relevance score of either: Very Relevant or Slightly Relevant.",
    )
    
    chat_session = model.start_chat(
        history=[]
    )
    
    response = chat_session.send_message(str({query: text}))
    
    return json.loads(response.text)

def build_tree(query:str, api_key:str) -> dict:
    genai.configure(api_key=api_key)

    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_schema": content.Schema(
            type = content.Type.OBJECT,
            enum = [],
            required = ["Root Idea"],
            properties = {
                "Root Idea": content.Schema(
                    type = content.Type.OBJECT,
                    enum = [],
                    required = ["initial_query", "Sub Ideas"],
                    properties = {
                        "initial_query": content.Schema(
                            type = content.Type.STRING,
                        ),
                        "Sub Ideas": content.Schema(
                            type = content.Type.ARRAY,
                            items = content.Schema(
                                type = content.Type.OBJECT,
                                enum = [],
                                required = ["idea", "description ", "Linked Concept"],
                                properties = {
                                    "idea": content.Schema(
                                    type = content.Type.STRING,
                                    ),
                                    "description ": content.Schema(
                                    type = content.Type.STRING,
                                    ),
                                    "Linked Concept": content.Schema(
                                    type = content.Type.ARRAY,
                                        items = content.Schema(
                                            type = content.Type.OBJECT,
                                            enum = [],
                                            required = ["idea", "description "],
                                            properties = {
                                                "idea": content.Schema(
                                                    type = content.Type.STRING,
                                                ),
                                                "description ": content.Schema(
                                                    type = content.Type.STRING,
                                                ),
                                                "url": content.Schema(
                                                    type = content.Type.STRING,
                                                ),
                                            },
                                        ),
                                    ),
                                    "url": content.Schema(
                                    type = content.Type.STRING,
                                    ),
                                },
                            ),
                        ),
                    },
                ),
            },
        ),
        "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        generation_config=generation_config,
        system_instruction="With the given Information construct a data tree, at the root create a RootIdea object with the Query, with all capitalization and errors fixed and an array of Sub Ideas Objects. In the Sub Ideas Objects define the idea, describe it (Elaborate on the information in the context of the query), add URLs if they are related to the idea or description, and add an array of atleat 3 Linked Concept Objects. For each corresponding or related idea to the Sub Idea make a Linked Concept Object, in the Object note the idea, describe it (Elaborate on the information in the context of the query), and add URLs if they are necessary.",
    )

    chat_session = model.start_chat(
    history=[]
    )

    response = chat_session.send_message(query)

    return json.loads(response.text)