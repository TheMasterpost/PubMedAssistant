import requests

# Your NCBI API key
api_key = "5b3e6cd9f20f4f5d1fe11cb5fce88875a109"

# Test URL for the NCBI Entrez API
url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"

# Example parameters
params = {
    "db": "pubmed",
    "term": "genetics",  # Search term
    "retmode": "xml",
    "api_key": api_key
}

# Send the request
response = requests.get(url, params=params)

# Check if the API call was successful
if response.status_code == 200:
    print("API key is working. Response:", response.text[:200])  # Display part of the response
else:
    print(f"Failed to connect. Status code: {response.status_code}")
