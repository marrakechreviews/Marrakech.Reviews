
import time
import csv
import re
from urllib.parse import urljoin
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import random

# === CONFIGURATION ===
SHOP_URL = "https://www.etsy.com/shop/CopperArtMoroccan"
LOAD_DELAY = (3, 7)      # Random delay between requests (seconds)
PAGE_LOAD_DELAY = (5, 10) # Delay after page load
MAX_RETRIES = 3

# === SETUP DRIVER WITH ANTI-DETECTION ===
def setup_driver():
    options = Options()
    
    # --- HEADERS & FINGERPRINTING ---
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.81 Safari/537.36")
    options.add_argument("--accept-language=en-US,en;q=0.9")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # --- MORE HUMAN-LIKE BEHAVIOR ---
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--start-maximized")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-plugins")
    options.add_argument("--disable-popup-blocking")
    
    # --- DISABLE WEBGL ERRORS (optional, reduces noise) ---
    options.add_argument("--disable-webgl")
    options.add_argument("--disable-software-rasterizer")

    # --- SERVICE ---
    service = Service(ChromeDriverManager().install())
    
    driver = webdriver.Chrome(service=service, options=options)
    
    # --- OVERRIDE NAVIGATOR.WEBDRIVER ---
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    driver.execute_script("navigator.mediaDevices.getUserMedia = undefined")
    
    return driver

# === FETCH LISTINGS WITH RETRY LOGIC ===
def get_shop_listings(driver, base_url):
    listings = []
    driver.get(base_url)
    page_num = 1
    
    for attempt in range(MAX_RETRIES):
        print(f"Fetching page {page_num} (attempt {attempt + 1})...")
        
        try:
            # Wait for any listing container to appear
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-listing-id]"))
            )
            time.sleep(random.uniform(*PAGE_LOAD_DELAY))  # Human pause after load
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Find all product links
            listing_links = soup.find_all('a', href=re.compile(r'/listing/\d+'))
            seen_urls = set()
            
            for link in listing_links:
                href = link['href'].split('?')[0]
                listing_url = urljoin(base_url, href)
                
                if listing_url in seen_urls:
                    continue
                seen_urls.add(listing_url)
                
                title_elem = link.find('h3') or link.find('div', class_=re.compile(r'text-caption'))
                title = title_elem.text.strip() if title_elem else 'Unknown'
                
                price_elem = link.find('span', class_=re.compile(r'currency-value'))
                price = price_elem.text.strip() if price_elem else 'Unknown'
                
                image_elem = link.find('img')
                image = image_elem.get('src') or image_elem.get('data-src') if image_elem else ''
                
                listings.append({
                    'title': title,
                    'price': price,
                    'image': image,
                    'url': listing_url
                })
            
            print(f"Found {len(listings)} listings so far.")
            
            # Try to click next page
            try:
                next_button = driver.find_element(By.CSS_SELECTOR, "a[rel='next'], button[aria-label*='Next']")
                if next_button.is_enabled():
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_button)
                    time.sleep(random.uniform(1, 3))
                    next_button.click()
                    time.sleep(random.uniform(*LOAD_DELAY))
                    page_num += 1
                    continue
                else:
                    break
            except NoSuchElementException:
                print("No next button found. End of listings.")
                break
                
        except TimeoutException:
            print(f"Timeout on page {page_num}, retrying... ({attempt + 1}/{MAX_RETRIES})")
            time.sleep(random.uniform(5, 10))
            continue
        except Exception as e:
            print(f"Unexpected error on page {page_num}: {e}")
            time.sleep(random.uniform(5, 10))
            continue
    
    # Remove duplicates
    unique_listings = {l['url']: l for l in listings}.values()
    return list(unique_listings)

# === EXTRACT PRODUCT DETAILS ===
def extract_product_details(driver, listing_url):
    for attempt in range(MAX_RETRIES):
        try:
            driver.get(listing_url)
            WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1")))
            time.sleep(random.uniform(*PAGE_LOAD_DELAY))
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Title
            title_elem = soup.find('h1', class_=re.compile(r'text-title'))
            title = title_elem.text.strip() if title_elem else 'Unknown'
            
            # Price
            price_elem = soup.find('span', class_=re.compile(r'currency-value'))
            price = float(price_elem.text.strip().replace('$', '').replace(',', '')) if price_elem else 0.0
            
            # Compare price (sale price)
            compare_price_elem = soup.find('span', class_=re.compile(r'compare-at-price'))
            compare_price = float(compare_price_elem.text.strip().replace('$', '').replace(',', '')) if compare_price_elem else None
            
            # Description
            desc_elem = soup.find('div', id=re.compile(r'content-toggle-product-details')) or \
                        soup.find('div', class_=re.compile(r'description'))
            description = desc_elem.get_text(strip=True) if desc_elem else ''
            
            # Category/Subcategory
            breadcrumbs = soup.find('nav', class_=re.compile(r'breadcrumb'))
            category = subcategory = 'Unknown'
            if breadcrumbs:
                cats = [a.get_text(strip=True) for a in breadcrumbs.find_all('a')]
                if len(cats) >= 3:
                    category = cats[-3]
                    subcategory = cats[-2]
                elif len(cats) >= 2:
                    category = 'Home & Living'
                    subcategory = cats[-2]
                else:
                    category = 'Home & Living'
                    subcategory = 'Lighting'
            
            # Brand
            brand_elem = soup.find('span', class_=re.compile(r'seller-name')) or soup.find('a', href=re.compile(r'/shop/'))
            brand = brand_elem.text.strip() if brand_elem else 'CopperArtMoroccan'
            
            # Images
            image_gallery = soup.find_all('img', class_=re.compile(r'carousel-image|image'))
            main_image = image_gallery[0].get('src') or image_gallery[0].get('data-src') if image_gallery else ''
            images = ','.join([img.get('src') or img.get('data-src') for img in image_gallery[1:]]) if len(image_gallery) > 1 else ''
            
            # Stock
            stock_elem = soup.find('span', class_=re.compile(r'availability')) or soup.find('p', text=re.compile(r'in stock', re.I))
            count_in_stock = int(re.search(r'(\d+)', stock_elem.text).group(1)) if stock_elem and re.search(r'(\d+)', str(stock_elem.text)) else 9
            low_stock_threshold = 10
            
            # Rating & Reviews
            rating_elem = soup.find('span', class_=re.compile(r'star-rating'))
            rating = float(rating_elem.get('aria-label', '').split()[0]) if rating_elem else 0.0
            num_reviews_elem = soup.find('span', class_=re.compile(r'review-count'))
            num_reviews = int(re.sub(r'[^\d]', '', num_reviews_elem.text)) if num_reviews_elem else 0
            
            # Recent Review
            review_name = review_rating = review_comment = ''
            reviews_section = soup.find('ol', class_=re.compile(r'reviews'))
            if reviews_section:
                first_review = reviews_section.find('li')
                if first_review:
                    review_name_elem = first_review.find('span', class_=re.compile(r'reviewer-name'))
                    review_name = review_name_elem.text.strip() if review_name_elem else ''
                    review_stars = first_review.find('span', class_=re.compile(r'stars'))
                    review_rating = review_stars.get('aria-label', '').split()[0] if review_stars else ''
                    review_text_elem = first_review.find('p', class_=re.compile(r'review-text'))
                    review_comment = review_text_elem.text.strip() if review_text_elem else ''
            
            # Tags
            tags_elem = soup.find('meta', attrs={'name': 'keywords'})
            tags = tags_elem.get('content', '') if tags_elem else ','.join(re.findall(r'\b\w+\b', description.lower())[:10])
            
            # SKU
            sku = ''
            
            # SEO
            seo_title = soup.title.text.strip() if soup.title else title
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            seo_description = meta_desc.get('content', '') if meta_desc else description[:160]
            meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
            seo_keywords = meta_keywords.get('content', '') if meta_keywords else tags
            
            return {
                'name': title,
                'description': description,
                'price': price,
                'comparePrice': compare_price,
                'category': category,
                'subcategory': subcategory,
                'brand': brand,
                'image': main_image,
                'images': images,
                'countInStock': count_in_stock,
                'lowStockThreshold': low_stock_threshold,
                'rating': rating,
                'numReviews': num_reviews,
                'isFeatured': False,
                'isActive': True,
                'tags': tags,
                'sku': sku,
                'seoTitle': seo_title,
                'seoDescription': seo_description,
                'seoKeywords': seo_keywords,
                'reviewName': review_name,
                'reviewRating': review_rating,
                'reviewComment': review_comment,
            }
            
        except Exception as e:
            print(f"Error extracting {listing_url} (attempt {attempt + 1}): {e}")
            time.sleep(random.uniform(5, 10))
            continue
    
    return {}

# === MAIN SCRIPT ===
def main():
    driver = setup_driver()
    try:
        print("Fetching shop listings...")
        listings = get_shop_listings(driver, SHOP_URL)
        print(f"Found {len(listings)} unique listings.")

        all_data = []
        for i, listing in enumerate(listings, 1):
            print(f"Processing {i}/{len(listings)}: {listing['title']}")
            details = extract_product_details(driver, listing['url'])
            if details:
                # Override basics from listing
                details['name'] = listing['title']
                details['image'] = listing['image'] or details['image']
                all_data.append(details)
            time.sleep(random.uniform(*LOAD_DELAY))

        if all_data:
            fieldnames = [
                'name', 'description', 'price', 'comparePrice', 'category', 'subcategory', 'brand',
                'image', 'images', 'countInStock', 'lowStockThreshold', 'rating', 'numReviews',
                'isFeatured', 'isActive', 'tags', 'sku', 'seoTitle', 'seoDescription', 'seoKeywords',
                'reviewName', 'reviewRating', 'reviewComment'
            ]

            with open('etsy_products.csv', 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for row in all_data:
                    row['price'] = str(row['price']) if row['price'] is not None else ''
                    row['comparePrice'] = str(row['comparePrice']) if row['comparePrice'] is not None else ''
                    row['countInStock'] = str(row['countInStock'])
                    row['lowStockThreshold'] = str(row['lowStockThreshold'])
                    row['rating'] = str(row['rating'])
                    row['numReviews'] = str(row['numReviews'])
                    row['isFeatured'] = str(row['isFeatured']).upper()
                    row['isActive'] = str(row['isActive']).upper()
                    writer.writerow(row)

            print("\n✅ SUCCESS! CSV file 'etsy_products.csv' created successfully!")
        else:
            print("❌ No data extracted. Try again later or use Etsy's official export.")

    finally:
        driver.quit()

if __name__ == "__main__":
    main()