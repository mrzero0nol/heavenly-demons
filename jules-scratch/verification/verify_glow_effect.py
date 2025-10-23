import asyncio
from playwright.async_api import async_playwright
import os

mock_server_data = """
1.1.1.1,80,US,Cloudflare
8.8.8.8,53,US,Google
104.16.132.229,443,US,DigitalOcean
208.67.222.222,53,US,OpenDNS
"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = None
        try:
            page = await browser.new_page()

            # Intercept permintaan ke GitHub dan berikan data tiruan
            await page.route(
                "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/main/proxyList.txt",
                lambda route: route.fulfill(
                    status=200,
                    content_type="text/plain",
                    body=mock_server_data
                )
            )

            html_file_path = os.path.abspath('index.html')
            await page.goto(f'file://{html_file_path}', wait_until='domcontentloaded')

            # Tunggu hingga kartu server yang pertama dari data tiruan muncul
            await page.wait_for_selector("div[data-server-id='1.1.1.1:80']")

            # Klik tombol "Test Ping" untuk memicu pewarnaan
            await page.click("#reping-btn")

            # Tunggu hingga badge ping pertama mendapatkan kelas status
            await page.wait_for_selector(".ping-badge.good, .ping-badge.medium, .ping-badge.bad")

            # Tunggu sebentar agar semua animasi selesai
            await page.wait_for_timeout(500)

            await page.screenshot(path="jules-scratch/verification/verification.png", full_page=True)
        finally:
            if page:
                await page.close()
            await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
