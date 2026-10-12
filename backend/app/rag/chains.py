from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import BasePromptTemplate
from langchain_core.runnables import Runnable

def build_generation_chain(
    prompt: BasePromptTemplate,
    llm: Runnable
) -> Runnable:
    """
        Build a LangChain chain that generates a text response.

        Flow:
            Input dictionary -> Prompt -> LLM -> String output
        """
    
    return prompt | llm | StrOutputParser() 