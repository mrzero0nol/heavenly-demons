from playwright.sync_api import sync_playwright, expect
import os
import json

# Data server tiruan untuk pengujian offline
mock_server_data = [
    {"provider": "MockServ", "country_code": "SG", "ip": "1.1.1.1", "port": 80},
    {"provider": "MockServ", "country_code": "ID", "ip": "1.1.1.2", "port": 443},
    {"provider": "MockServ", "country_code": "JP", "ip": "1.1.1.3", "port": 8080},
    {"provider": "MockServ", "country_code": "US", "ip": "1.1.1.4", "port": 2080},
]

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(**p.devices['iPhone 11'])
        page = context.new_page()

        # Mencegat permintaan jaringan
        def handle_route(route):
            # Batalkan permintaan ke Google Fonts
            if "fonts.googleapis.com" in route.request.url:
                return route.abort()
            # Berikan respons tiruan untuk daftar prodi
            if "raw.githubusercontent.com" in route.request.url:
                return route.fulfill(
                    status=200,
                    headers={"Content-Type": "application/json"},
                    body=json.dumps(mock_server_data)
                )
            # Lanjutkan permintaan lainnya
            return route.continue_()

        page.route("**/*", handle_route)

        file_path = os.path.abspath('index.html')
        page.goto(f'file://{file_path}')

        # Verifikasi tautan sudah dihapus
        h1_element = page.locator('h1', has_text='Heavenly Demons')
        expect(h1_element.locator('xpath=..')).not_to_have_attribute('href', 'https://zhwifi.web.id')

        # Tunggu kartu server tiruan dirender
        page.wait_for_selector('.server-list-grid .server-card')

        # Ambil screenshot dari elemen grid daftar server
        server_list_element = page.locator('.server-list-grid')
        server_list_element.screenshot(path="jules-scratch/verification/verification_mobile.png")

        browser.close()

if __name__ == '__main__':
    run()
