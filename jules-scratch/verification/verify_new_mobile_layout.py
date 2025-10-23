from playwright.sync_api import sync_playwright
import os

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)

    # Define mobile viewport (iPhone 12)
    context = browser.new_context(
        viewport={'width': 390, 'height': 844},
        device_scale_factor=3,
        is_mobile=True,
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    )
    page = context.new_page()

    # Get the absolute path to index.html
    file_path = os.path.abspath('index.html')
    page.goto(f'file://{file_path}')

    # Wait for the server list to be populated
    page.wait_for_selector('.server-card')

    # Take a screenshot of the visible viewport
    page.screenshot(path='jules-scratch/verification/new_mobile_layout.png')

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)
