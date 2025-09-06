import asyncio
from playwright.async_api import async_playwright
import csv
import io
from bs4 import BeautifulSoup
import requests
import re
import sys
import json

async def get_activity_urls(url):
    """
    Uses Playwright to load a page, extract all activity links, and handle pagination.
    """
    urls = set()
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            await page.goto(url, wait_until='networkidle', timeout=60000)

            while True:
                await page.wait_for_selector('a.item.standard', timeout=10000)
                page_urls = await page.eval_on_selector_all('a.item.standard', 'elements => elements.map(el => el.href)')
                for page_url in page_urls:
                    urls.add(page_url)

                next_button = await page.query_selector('nav.pagination a.next')
                if next_button:
                    await next_button.click()
                    await page.wait_for_load_state('networkidle')
                else:
                    break
        except Exception as e:
            print(json.dumps({"error": f"Playwright error: {e}"}), file=sys.stderr)
        finally:
            await browser.close()

    return list(urls)

def extract_data(html_content, url):
    """
    Extracts data from the HTML content of a single activity page using corrected selectors.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    data = {}

    data['name'] = soup.select_one('h1').text.strip() if soup.select_one('h1') else ''

    desc_div = soup.select_one('div#details')
    if desc_div:
        data['description'] = '\n'.join([p.text.strip() for p in desc_div.find_all('p')])
    else:
        data['description'] = ''
    data['shortDescription'] = data['description'].split('\n')[0] if data['description'] else ''

    price_text = ''
    price_section = soup.select_one('li#tab-0 div')
    if price_section:
        price_text = price_section.text.strip()
    else:
        price_element = soup.select_one('.price strong, .g-tour-price__value')
        if price_element:
            price_text = price_element.text.strip()

    price_numbers = re.findall(r'(\d+)\s*€', price_text) or re.findall(r'(\d+)\s*EUR', price_text, re.IGNORECASE) or re.findall(r'\d+', price_text)
    data['price'] = int(price_numbers[0]) if price_numbers else 0
    data['currency'] = 'EUR' if '€' in price_text or 'EUR' in price_text else 'USD'
    data['marketPrice'] = 0

    category_element = soup.select_one('.g-breadcrumbs li:nth-child(2) a')
    if category_element:
        data['category'] = category_element.text.strip()
    else:
        match = re.search(r'categorie-bon-plan/([^/]+)/', url)
        if match:
            data['category'] = match.group(1).replace('-', ' ').title()
        else:
            data['category'] = 'Activities'

    location_element = soup.select_one('h1 + p')
    data['location'] = location_element.text.strip() if location_element else ''

    data['duration'] = ''
    if price_section:
         data['duration'] = price_section.text.strip()

    if not data['duration'] and desc_div:
        for p in desc_div.find_all('p'):
            if 'de balade' in p.text:
                match = re.search(r'(\d+h de balade)', p.text)
                if match:
                    data['duration'] = match.group(1)
                    break
    if not data['duration']:
        duration_li = soup.find(lambda tag: tag.name == 'li' and 'de balade' in tag.text)
        if duration_li:
             data['duration'] = duration_li.text.strip()

    data['minParticipants'] = 1
    data['maxParticipants'] = 10
    if desc_div:
        desc_text_lower = desc_div.text.lower()
        min_match = re.search(r'minimum de (\d+)', desc_text_lower)
        if min_match:
            data['minParticipants'] = int(min_match.group(1))

    gallery = soup.select_one('section#gallery')
    if gallery:
        image_links = gallery.select('.item a')
        data['images'] = ','.join([a['href'] for a in image_links if a.has_attr('href')])
        data['image'] = image_links[0]['href'] if image_links else ''
    else:
        gallery_links = soup.select('.gallery-item a, .brave-gallery-grid-item a')
        data['images'] = ','.join([link['href'] for link in gallery_links if link.has_attr('href')])
        data['image'] = data['images'].split(',')[0] if data['images'] else ''


    data['isActive'] = True
    data['isFeatured'] = False

    tags_items = soup.select('.g-tour-tags a, .tags-links a')
    data['tags'] = ','.join([tag.text.strip() for tag in tags_items])

    data['difficulty'] = 'Easy'

    data['seoTitle'] = soup.find('title').text.strip() if soup.find('title') else data['name']
    seo_desc_tag = soup.find('meta', attrs={'name': 'description'})
    data['seoDescription'] = seo_desc_tag['content'] if seo_desc_tag and seo_desc_tag.has_attr('content') else ''
    seo_keys_tag = soup.find('meta', attrs={'name': 'keywords'})
    data['seoKeywords'] = seo_keys_tag['content'] if seo_keys_tag and seo_keys_tag.has_attr('content') else ''

    return data


async def main(category_url):
    activity_urls = await get_activity_urls(category_url)

    if not activity_urls:
        return

    all_data = []
    with requests.Session() as session:
        for url in activity_urls:
            try:
                response = session.get(url, timeout=15)
                response.raise_for_status()
                extracted_data = extract_data(response.text, url)
                all_data.append(extracted_data)
            except Exception as e:
                pass

    output = io.StringIO()
    headers = [
        'name', 'description', 'shortDescription', 'price', 'marketPrice', 'currency', 'category', 'location',
        'duration', 'maxParticipants', 'minParticipants', 'image', 'images', 'isActive', 'isFeatured',
        'tags', 'difficulty', 'seoTitle', 'seoDescription', 'seoKeywords'
    ]
    writer = csv.DictWriter(output, fieldnames=headers, delimiter='\t', extrasaction='ignore', quoting=csv.QUOTE_ALL)

    writer.writeheader()
    writer.writerows(all_data)

    with open("activities_data.csv", "w", encoding="utf-8") as f:
        f.write(output.getvalue())


if __name__ == '__main__':
    if len(sys.argv) > 1:
        url_to_scrape = sys.argv[1]
        try:
            asyncio.run(main(url_to_scrape))
        except Exception as e:
            pass
    else:
        sys.exit(1)
