from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the homepage
        page.goto("http://localhost:5174")

        # Find the language switcher button by its aria-label
        language_switcher_button = page.get_by_label("Switch language")

        # Expect the button to be visible
        expect(language_switcher_button).to_be_visible()

        # Click the button to open the dropdown
        language_switcher_button.click()

        # Wait for the Google Translate iframe to be visible
        iframe = page.frame_locator(".goog-te-menu-frame")

        # Check for an element within the iframe
        expect(iframe.locator("table")).to_be_visible(timeout=10000)

        # Take a screenshot
        page.screenshot(path="frontend/jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
