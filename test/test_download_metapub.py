from metapub import PubMedFetcher,CrossRefFetcher
import time
import requests
from metapub import FindIt
import socket
import os
import logging
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import argparse
import sys

def setup_logging():
    hostname = socket.gethostname()
    pid = os.getpid()
    
    log_format = f'%(asctime)s {hostname} %(module)s[{pid}] %(levelname)s %(message)s'
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    logger = logging.getLogger('download_pdf')
    return logger

log = setup_logging()

def init_selenium():
    try:
        # Set up Chrome options
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        # Add custom preferences
        options.add_experimental_option('prefs', {
            'profile.default_content_settings.pdf': 2,
            'download.prompt_for_download': False,
            'download.default_directory': os.getcwd(),
        })
        
        options.add_argument('--disable-blink-features=AutomationControlled')
        
        log.info("Setting up ChromeDriver...")
        service = Service(ChromeDriverManager().install())
        
        log.info("Initializing ChromeDriver...")
        driver = webdriver.Chrome(service=service, options=options)
        log.info("ChromeDriver initialized successfully")
        return driver
        
    except Exception as e:
        log.error(f"Failed to initialize ChromeDriver: {str(e)}")
        raise

def call_selenium_pass_cloudflare(driver: webdriver.Chrome, url:str):
    try:
        # 打开网页
        driver.get(url)
        time.sleep(5)  # 增加等待时间
        
        # 获取页面源代码
        page_source = driver.page_source
        
        # 如果是PDF文件，应该直接下载而不是获取页面源代码
        if url.lower().endswith('.pdf'):
            response = requests.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/pdf',
                'Content-Type': 'application/pdf'
            })
            if response.status_code == 200:
                return response.content
            
        log.info(f"Page source: {page_source[:200]}...")  # 记录页面源码的前200个字符
        return None
    except Exception as e:
        log.error(f"浏览器打开{url}时发生错误: {str(e)}")
        return None

def close_selenium(driver):  
    # 确保浏览器被关闭
    if 'driver' in locals():
        try:
            driver.quit()
        except Exception as e:
            print(f"关闭浏览器时发生错误: {str(e)}")

def PubMedArticle2doi(pma):
    '''Starting with a PubMedArticle object, use CrossRef to find a DOI for given article.

    Args:
        pma (PubMedArticle)

    Returns:
        doi (str) or None
    '''
    cr_fetch = CrossRefFetcher()
    try:
        # 获取CrossRef结果
        results = cr_fetch.cr.works(
            query_bibliographic=pma.title, 
            query_container_title=pma.journal, 
            limit=5
        )
        
        if results and 'message' in results and 'items' in results['message']:
            # 获取第一个匹配结果
            items = results['message']['items']
            if items:
                work = items[0]  # 取第一个结果
                doi = work.get('DOI')
                log.info(f'CrossRefWork found DOI: {doi}')
                
                # 尝试获取PDF URL
                if 'link' in work:
                    links = work['link']
                    for link in links:
                        if isinstance(link, dict):
                            url = link.get('URL', '')
                            content_type = link.get('content-type', '')
                            if content_type == 'application/pdf' or url.lower().endswith('.pdf'):
                                return doi, url
                    # 如果没有找到PDF链接，返回第一个链接
                    if links and isinstance(links[0], dict):
                        return doi, links[0].get('URL')
                
                return doi, None
                
    except Exception as e:
        log.error(f"CrossRef查询失败: {str(e)}")
    return None, None

def convert_pmid_to_doi(pmid):
    pm_fetch = PubMedFetcher()
    pma = pm_fetch.article_by_pmid(pmid)
    # if pma.doi:
    #     log.info('PMID %s: Found DOI in MedLine XML.', pma.doi)
    #     log.info('PMID %s: Found URL in MedLine XML.', pma.url)
    #     return pma.doi
    return PubMedArticle2doi(pma)

def get_pdf_url_by_pmid(pmid, max_retries=3):
    for attempt in range(max_retries):
        try:
            src = FindIt(pmid)
            if src.url is not None:
                return src.url
            
            doi, url = convert_pmid_to_doi(pmid)
            log.info(f"doi: {doi}")
            log.info(f"url: {url}")
            if url is not None:
                return url
                
        except Exception as e:
            log.warning(f"第{attempt + 1}次尝试失败: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))  # 递增等待时间
                continue
            log.error(f"获取PDF URL失败，已重试{max_retries}次")
    return None

def download_article_pdfs(pmid_list, download_dir, driver):
    fetch = PubMedFetcher()
    for pmid in pmid_list:
        try:
            article = fetch.article_by_pmid(pmid)
            log.info(f"article: {article}")

            pdf_url = get_pdf_url_by_pmid(pmid)
            log.info(f"pdf_url: {pdf_url}")
            if pdf_url:
                log.info(f"Attempting to download PDF from: {pdf_url}");
                try:
                    # Directly download the PDF if the URL is accessible
                    response = requests.get(pdf_url)
                    log.info(f"Response status code: {response.status_code}");
                    if response.status_code == 200:
                        # Ensure the download directory exists with proper permissions
                        os.makedirs(download_dir, mode=0o755, exist_ok=True)
                        pdf_path = os.path.join(download_dir, f"{pmid}.pdf")
                        with open(pdf_path, 'wb') as f:
                            f.write(response.content)
                        os.chmod(pdf_path, 0o644)  # Make file readable
                        log.info(f"Downloaded PDF for PMID {pmid} to {pdf_path}")
                        return True  # Indicate successful download
                    else:
                        log.warning(f"Failed to download PDF, status code: {response.status_code}")
                    time.sleep(5)
                except Exception as e:
                    log.error(f"Error downloading PDF for PMID {pmid}: {e}")
                time.sleep(2)
            else:
                log.info(f"No PDF available for PMID {pmid}")
        except Exception as e:
            log.error(f"Error processing PMID {pmid}: {e}")
            continue
    return False  # Indicate failed download

def main():
    parser = argparse.ArgumentParser(description='Download PubMed article PDFs')
    parser.add_argument('--pmid', type=str, required=True, help='PubMed ID to download')
    args = parser.parse_args()

    # Set download directory to public/download
    download_dir = os.path.join(os.getcwd(), 'public', 'download')
    driver = init_selenium()
    success = False
    
    try:
        success = download_article_pdfs([args.pmid], download_dir, driver)
        if success:
            print(f"Successfully downloaded PDF for PMID {args.pmid}")
        else:
            print(f"Failed to download PDF for PMID {args.pmid}")
    finally:
        close_selenium(driver)
        
    # Exit with appropriate status code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()