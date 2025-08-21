from playwright.sync_api import sync_playwright
import os

# Create the directory for logs if it doesn't exist
os.makedirs("jules-scratch/verification/logs", exist_ok=True)

def handle_console(msg):
    with open("jules-scratch/verification/logs/console.log", "a") as f:
        f.write(f"{msg.type}: {msg.text}\n")

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.on("console", handle_console)
    page.goto("http://localhost:5174/", wait_until="load")
    page.screenshot(path="jules-scratch/verification/homepage.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
