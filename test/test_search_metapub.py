import argparse
import logging
from metapub import PubMedFetcher
import time

NCBI_API_KEY="5b3e6cd9f20f4f5d1fe11cb5fce88875a109"
# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

def search_with_dictionary(params):
    fetch = PubMedFetcher()
    logger.debug(f"Searching with dictionary parameters: {params}")
    # Perform search using dictionary parameters
    pmids_dict = fetch.pmids_for_query(**params)
    return pmids_dict

def search_with_query_string(query):
    fetch = PubMedFetcher()
    logger.debug(f"Searching with query string: {query}")
    # Perform search using query string
    pmids_query = fetch.pmids_for_query(query)
    return pmids_query

def search_pubmed(query, return_pmid=False):
    fetch = PubMedFetcher()
    try:
        # Search PubMed
        results = fetch.pmids_for_query(query, retmax=1)
        
        if not results:
            print("No results found")
            return

        if return_pmid:
            # For download feature, just return the first PMID
            print(f"PMID: {results[0]}")
            return

        # Get details for each result
        for pmid in results[:1]:  # Limit to first result for now
            article = fetch.article_by_pmid(pmid)
            print(f"\nTitle: {article.title}")
            print(f"Authors: {', '.join(article.authors)}")
            print(f"Journal: {article.journal}")
            print(f"Year: {article.year}")
            print(f"Abstract: {article.abstract}")
            time.sleep(0.1)  # Rate limiting

    except Exception as e:
        print(f"Error during search: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Search PubMed articles')
    parser.add_argument('--query', type=str, required=True, help='Search query')
    parser.add_argument('--return_pmid', action='store_true', help='Return only PMID')
    args = parser.parse_args()
    
    search_pubmed(args.query, args.return_pmid)

if __name__ == "__main__":
    main()

# python test_search_metapub.py --journal "Journal of Clinical Oncology" --keyword "leukemia"