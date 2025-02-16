from typing import Optional
from pydantic import BaseModel, Field
from langchain_deepseek import ChatDeepSeek

from langchain_core.prompts import ChatPromptTemplate

import os
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

class SummaryResponse(BaseModel):
    summary: str = Field(description="Summary of the content")
    key_points: list[str] = Field(description="Key points from the content")
    action_items: list[str] = Field(description="Action items from the content")
    
    
def call_deepseek_llm(content, attachment_content):
    """Calls DeepSeek API via LangChain with structured output."""
    llm = ChatDeepSeek(
    model="deepseek-chat",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    # other params...
    )
   
    structured_llm = llm.with_structured_output(SummaryResponse)

    response = structured_llm.invoke(f"""
        This is an email and the text from the attached file. 
        Provide a summary, key points, and action items.
        email content: {content}
        attachments content: {attachment_content}
    """)
    return response.dict()