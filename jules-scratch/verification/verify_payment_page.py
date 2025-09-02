from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # The user provided this URL in the issue description
    page.goto("http://localhost:5173/payment/order/68b5d6c17dfd070a15fda865")

    # Expect the page to show an error message because the order doesn't exist
    expect(page.get_by_text("Failed to fetch order details.")).to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
