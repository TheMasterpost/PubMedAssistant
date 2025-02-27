import argparse
import logging
import os
import PyPDF2
import docx
from typing import Optional
from transformers import MarianMTModel, MarianTokenizer
import torch

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

# Dictionary of supported languages and their codes
SUPPORTED_LANGUAGES = {
    'French': 'fr',
    'German': 'de',
    'Spanish': 'es',
    'Italian': 'it',
    'Portuguese': 'pt',
    'Russian': 'ru',
    'Chinese': 'zh',
    'Japanese': 'ja',
    'Korean': 'ko'
}

def read_file_content(file_path: str) -> Optional[str]:
    """Read content from various file types."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
                
        elif file_ext == '.pdf':
            text = ""
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
            
        elif file_ext in ['.doc', '.docx']:
            doc = docx.Document(file_path)
            return "\n".join([paragraph.text for paragraph in doc.paragraphs])
            
        else:
            logger.error(f"Unsupported file type: {file_ext}")
            return None
            
    except Exception as e:
        logger.error(f"Error reading file: {str(e)}")
        return None

def translate_text(text: str, target_lang: str) -> str:
    """Translate text to the target language."""
    try:
        # Load model and tokenizer
        model_name = f'Helsinki-NLP/opus-mt-en-{target_lang}'
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)

        # Split text into chunks to handle long texts
        max_length = tokenizer.model_max_length
        chunks = [text[i:i + max_length] for i in range(0, len(text), max_length)]
        
        translated_chunks = []
        for chunk in chunks:
            # Tokenize and translate
            inputs = tokenizer(chunk, return_tensors="pt", padding=True, truncation=True)
            translated = model.generate(**inputs)
            translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
            translated_chunks.append(translated_text)

        return "\n".join(translated_chunks)
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return f"Translation error: {str(e)}"

def main():
    parser = argparse.ArgumentParser(description='Translate document content')
    parser.add_argument('--file', type=str, required=True, help='Path to the file to translate')
    parser.add_argument('--target_lang', type=str, required=True, help='Target language code')
    args = parser.parse_args()
    
    # Validate target language
    if args.target_lang not in SUPPORTED_LANGUAGES.values():
        logger.error(f"Unsupported target language: {args.target_lang}")
        print(f"Unsupported target language. Supported languages: {', '.join(SUPPORTED_LANGUAGES.keys())}")
        return
    
    # Read file content
    content = read_file_content(args.file)
    if content is None:
        logger.error("Failed to read file content")
        return
    
    # Translate content
    translated_text = translate_text(content, args.target_lang)
    print(translated_text)

if __name__ == "__main__":
    main() 