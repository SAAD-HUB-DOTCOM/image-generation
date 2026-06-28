from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = "sqlite:///./database.db"

IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY")
IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY")
IMAGEKIT_URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT")
HF_TOKEN = os.getenv("HF_TOKEN")
