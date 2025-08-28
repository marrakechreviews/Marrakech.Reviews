from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        iphone_11 = p.devices['iPhone 11']
        browser = p.webkit.launch(headless=True)
        context = browser.new_context(**iphone_11)
        page = context.new_page()

        try:
            page.goto("http://localhost:5173", wait_until="networkidle")
            page.wait_for_selector("h1")
            page.screenshot(path="jules-scratch/verification/verification.png")
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
