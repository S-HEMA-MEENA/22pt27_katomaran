import requests

def query_grok3(prompt, api_key):
    """Query Grok 3 API with the given prompt."""
    url = "https://api.x.ai/grok3"  # Update with actual endpoint
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {"prompt": prompt, "model": "grok3"}
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json()["text"]
    else:
        raise Exception(f"API error: {response.status_code} - {response.text}")