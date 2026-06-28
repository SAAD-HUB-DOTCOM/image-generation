import httpx
from config import HF_TOKEN

HF_API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"


async def generate_thumbnail(prompt: str, style_prompt: str, headshot_url: str) -> bytes:
    """
    Use Hugging Face FLUX.1-schnell to generate a YouTube thumbnail.
    Returns raw PNG bytes.
    """
    full_prompt = (
        f"{style_prompt} "
        f"YouTube thumbnail for: {prompt}. "
        "Eye-catching, high quality, cinematic, 16:9 format, professional YouTube thumbnail."
    )

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": full_prompt,
        "parameters": {
            "width": 1280,
            "height": 720,
            "num_inference_steps": 30,
        }
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(HF_API_URL, headers=headers, json=payload)
        if response.status_code != 200:
            raise RuntimeError(f"Hugging Face error: {response.text}")
        return response.content
