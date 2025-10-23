
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Capture console messages correctly
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        try:
            await page.goto("http://localhost:8000")
            await page.wait_for_load_state('networkidle')

            worker_url_input = page.locator("#ping-worker-url")
            await worker_url_input.fill("https://worker-proud-glade-1942.khairul-15.workers.dev")

            reping_button = page.locator("#reping-btn")
            await reping_button.click()

            # Look for the first card with a successful ping result
            successful_ping_card = page.locator(".server-card .ping-badge:text-matches(r'\\d+ ms')").first
            await expect(successful_ping_card).to_be_visible(timeout=30000)

            await page.screenshot(path="jules-scratch/verification/verification.png")
            print("Verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            await page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
