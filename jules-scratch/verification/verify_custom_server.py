
import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local index.html file
        file_path = os.path.abspath('index.html')
        page.goto(f'file://{file_path}')

        # Wait for the loader to disappear, which indicates the initial server list has been loaded and rendered.
        expect(page.locator("#loader")).to_be_hidden()

        # Add a small delay to ensure the UI is fully settled after the loader disappears
        page.wait_for_timeout(500)

        # 1. Open the Custom Server modal using a more specific ID selector
        page.locator("#custom-server-btn").click()

        # Expect the modal to be visible
        modal = page.locator("#custom-server-modal-overlay")
        expect(modal).to_be_visible()

        # 2. Fill in the server details using specific ID locators
        modal.locator("#server-name-input").fill("My Test Server")
        modal.locator("#server-ip-input").fill("1.2.3.4") # Using a valid IP format
        modal.locator("#server-port-input").fill("443")

        # 3. Click the "Add" button, scoped to the modal
        modal.locator("#add-server-btn").click()

        # Modal should be hidden after adding
        expect(modal).not_to_be_visible()

        # 4. Verify the new server is in the list using the correct class selector
        custom_server_card = page.locator(".server-list .server-card", has_text="My Test Server")
        expect(custom_server_card).to_be_visible()
        expect(custom_server_card).to_contain_text("1.2.3.4")

        # 5. Take a screenshot
        screenshot_path = 'jules-scratch/verification/verification.png'
        page.screenshot(path=screenshot_path)

        browser.close()
        print(f"Verification screenshot saved to {screenshot_path}")

if __name__ == "__main__":
    run_verification()
