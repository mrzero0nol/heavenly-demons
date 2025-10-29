// Salin dan tempel semua kode di bawah ini ke dalam editor Cloudflare Worker Anda.
const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heavenly Demons</title>

    <script>
        // Suntik CSS dengan cache busting
        const cssVersion = new Date().getTime();
        document.write(\`<link rel="stylesheet" href="style.css?v=\${cssVersion}">\`);
    </script>
</head>
<body>
    <div class="container">
        <header>
            <div class="title-container">
                <h1>Heavenly Demons</h1>
                <a href="https://t.me/Heavenlydemonsimmortal" class="telegram-link" target="_blank" rel="noopener noreferrer">@Heavenlydemonsimmortal</a>
            </div>
        </header>

        <main>
            <div class="info-grid">
                <!-- Baris 1: Kontrol Utama -->
                <div class="info-card" id="provider-filter-container" style="grid-area: search;">
                    <span class="icon">🛰️</span>
                    <div class="custom-dropdown">
                        <div class="dropdown-selected" tabindex="0">
                            <span id="selected-provider">Pilih Server VPN</span>
                        </div>
                        <div class="dropdown-options" id="provider-options">
                            <!-- Opsi diisi oleh script.js -->
                        </div>
                    </div>
                </div>
                <div class="info-card" id="country-filter-container" style="grid-area: country;">
                    <span class="icon">🌍</span>
                    <div class="custom-dropdown">
                        <div class="dropdown-selected" tabindex="0">
                            <span id="selected-country">Pilih Negara</span>
                        </div>
                        <div class="dropdown-options" id="country-options">
                            <!-- Opsi diisi oleh script.js -->
                        </div>
                    </div>
                </div>
                <div class="info-card" id="settings-btn" style="grid-area: settings;">
                    <span class="icon">⚙️</span>
                    <div>
                        <h4>Pengaturan</h4>
                    </div>
                </div>

                <!-- Tombol Fitur Baru -->
                <div class="info-card" id="custom-server-btn" style="grid-area: custom;">
                    <span class="icon">🖥️</span>
                    <div>
                        <h4>Custom Server</h4>
                    </div>
                </div>

                <div class="info-card" id="test-wildcard-btn" style="grid-area: wildcard;">
                    <span class="icon">🔍</span>
                    <div>
                        <h4>Test Wildcard</h4>
                    </div>
                </div>

                <!-- Baris 2: Info & URL Kustom -->
                <div class="info-card" id="ping-settings-btn" style="grid-area: worker;">
                    <span class="icon">📡</span>
                    <div>
                        <h4>Ping Server</h4>
                        <p id="ping-mode-status">Mode: Browser</p>
                    </div>
                </div>
                <div class="info-card" style="grid-area: provider;">

                    <div>
                        <p>Provider</p>
                        <h4 id="isp-info">Mendeteksi...</h4>
                    </div>
                </div>
                <div class="info-card" style="grid-area: location;">

                    <div>
                        <p>Lokasi</p>
                        <h4 id="location-info">Mendeteksi...</h4>
                    </div>
                </div>
            </div>

            <div class="server-list-container" id="server-list">
                <!-- Konten di sini akan diisi oleh script.js -->
            </div>
        </main>
    </div>

    <footer class="controls-footer">
        <div class="control-buttons">
            <button class="btn" id="selected-count-btn">0 proxies</button>
            <button class="btn" id="reping-btn">Test Ping</button>
            <button class="btn primary" id="export-btn">Export</button>
        </div>
    </footer>

    <!-- ======================================================= -->
    <!-- MODAL SETTINGS (ELEMEN BARU)                            -->
    <!-- ======================================================= -->
    <div class="modal-overlay" id="settings-modal-overlay">
        <div class="modal-content">
            <button class="close-btn" data-modal-id="settings-modal-overlay">&times;</button>
            <h2>Settings</h2>
            <p>Atur parameter untuk generate konfigurasi.</p>

            <div class="form-group">
                <label for="bug-cdn-input">Bug CDN / Host</label>
                <input type="text" id="bug-cdn-input" placeholder="contoh.bug.com">
            </div>
            <div class="form-group">
                <label for="worker-host-input">Worker Host (SNI)</label>
                <input type="text" id="worker-host-input" placeholder="worker.anda.workers.dev">
            </div>

            <button class="btn" id="save-settings-btn" style="margin-top: 10px;">Simpan Pengaturan</button>

            <hr style="border-color: #333; margin: 20px 0;">

            <h4>Pengaturan Tersimpan</h4>
            <div id="saved-settings-list" class="saved-settings-container">
                <!-- Daftar pengaturan akan ditampilkan di sini oleh script.js -->
            </div>

            <div class="form-group">
                <label for="uuid-input">UUID</label>
                <input type="text" id="uuid-input" placeholder="UUID VLESS Anda">
            </div>
            <div class="form-group">
                <label for="protocol-select">Protocol</label>
                <select id="protocol-select">
                    <option value="vless">VLESS</option>
                    <option value="trojan">Trojan</option>
                    <!-- Opsi lain bisa ditambahkan nanti -->
                </select>
            </div>
            <div class="form-group">
                <label for="tls-select">TLS</label>
                <select id="tls-select">
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </div>

            <button class="btn primary" id="settings-done-btn">Done</button>
        </div>
    </div>

    <!-- ======================================================= -->
    <!-- MODAL EDIT CUSTOM SERVER (BARU)                         -->
    <!-- ======================================================= -->
    <div class="modal-overlay" id="edit-server-modal-overlay">
        <div class="modal-content">
            <button class="close-btn">&times;</button>
            <h2>Edit Custom Server</h2>
            <p>Perbarui detail server kustom Anda.</p>
            <input type="hidden" id="edit-server-id-input">
            <div class="form-group">
                <label for="edit-server-name-input">Nama Server</label>
                <input type="text" id="edit-server-name-input" placeholder="misal: Server SG">
            </div>
            <div class="form-group">
                <label for="edit-server-ip-input">IP Server</label>
                <input type="text" id="edit-server-ip-input" placeholder="123.45.67.89">
            </div>
            <div class="form-group">
                <label for="edit-server-port-input">Port</label>
                <input type="text" id="edit-server-port-input" placeholder="80">
            </div>
            <button class="btn primary" id="save-server-changes-btn">Simpan Perubahan</button>
        </div>
    </div>

    <!-- ======================================================= -->
    <!-- MODAL CUSTOM SERVER                                     -->
    <!-- ======================================================= -->
    <div class="modal-overlay" id="custom-server-modal-overlay">
        <div class="modal-content">
            <button class="close-btn" data-modal-id="custom-server-modal-overlay">&times;</button>
            <h2>Custom Server</h2>
            <p>Tambahkan server Anda sendiri.</p>
            <div class="form-group">
                <label for="server-name-input">Nama Server</label>
                <input type="text" id="server-name-input" placeholder="misal: Server SG">
            </div>
            <div class="form-group">
                <label for="server-ip-input">IP Server</label>
                <input type="text" id="server-ip-input" placeholder="123.45.67.89">
            </div>
            <div class="form-group">
                <label for="server-port-input">Port</label>
                <input type="text" id="server-port-input" placeholder="80">
            </div>
            <button class="btn primary" id="add-server-btn">Tambahkan</button>
        </div>
    </div>

    <!-- ======================================================= -->
    <!-- MODAL TEST WILDCARD                                     -->
    <!-- ======================================================= -->
    <div class="modal-overlay" id="test-wildcard-modal-overlay">
        <div class="modal-content">
            <button class="close-btn" data-modal-id="test-wildcard-modal-overlay">&times;</button>
            <h2>Test Wildcard Domain</h2>
            <p>Masukkan domain untuk menguji konektivitas.</p>
            <div class="form-group">
                <label for="wildcard-domain-input">Domain</label>
                <input type="text" id="wildcard-domain-input" placeholder="contoh: ava.game.naver.com">
            </div>
            <button class="btn primary" id="run-wildcard-test-btn">Test</button>
            <div id="wildcard-test-result" class="test-result">
                <!-- Hasil tes akan muncul di sini -->
            </div>
        </div>
    </div>

    <!-- ======================================================= -->
    <!-- MODAL PING SETTINGS                                     -->
    <!-- ======================================================= -->
    <div class="modal-overlay" id="ping-settings-modal-overlay">
        <div class="modal-content">
            <button class="close-btn" data-modal-id="ping-settings-modal-overlay">&times;</button>
            <h2>Pengaturan Ping Server</h2>
            <p>Kosongkan input di bawah untuk menggunakan mode ping via Browser (default).</p>
            <div class="form-group">
                <label for="ping-worker-url-input">URL Ping Kustom</label>
                <input type="text" id="ping-worker-url-input" placeholder="https://worker.anda.workers.dev">
            </div>
            <button class="btn primary" id="save-ping-settings-btn">Simpan</button>
        </div>
    </div>

    <script>
        // Suntik JavaScript dengan cache busting
        const jsVersion = new Date().getTime();
        document.write(\`<script src="script.js?v=\${jsVersion}" defer><\\/script>\`);
    </script>
</body>
</html>`;
const cssContent = `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Exo+2:wght@400;600&display=swap');

/* --- Definisi Warna & Font --- */
:root {
    --bg-dark: #0a0a0a;
    --primary-demonic: #ff003c; /* Merah Neon */
    --cyber-cyan: #00f6ff;      /* Sian Neon */
    --primary-green: #00ff6a;   /* Hijau Neon Baru */
    --text-light: #e0e0e0;
    --text-dark: #0a0a0a;
    --surface-light: #1a1a1a;
    --border-color: #ff003c;   /* Border merah */
    --danger-color: #e0115f;     /* Magenta untuk error */

    --font-main: 'Exo 2', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --font-titles: 'Orbitron', 'Courier New', monospace;
}

/* --- Reset & Dasar --- */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border-radius: 0; /* Menghilangkan semua sudut bulat */
}

body {
    font-family: var(--font-main);
    background-color: var(--bg-dark);
    color: var(--text-light);
    font-size: 16px;
    background-image: linear-gradient(rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.95)),
                      url('https://www.transparenttextures.com/patterns/diagmonds.png'); /* Pola latar halus */
}

/* --- Layout Utama --- */
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
}

header {
    display: flex;
    justify-content: center; /* Mengubah ke tengah */
    align-items: center;
    text-align: center; /* Memastikan teks di tengah */
    padding: 15px 0;
    border-bottom: 2px solid var(--border-color);
    box-shadow: 0 2px 15px -5px var(--border-color);
}

.title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.telegram-link {
    color: var(--primary-demonic);
    text-decoration: none;
    font-size: 0.9em;
    font-weight: 600;
    letter-spacing: 1px;
    transition: all 0.2s ease;
    text-shadow: 0 0 5px var(--primary-demonic);
}

.telegram-link:hover {
    color: var(--cyber-cyan);
    text-shadow: 0 0 8px var(--cyber-cyan);
}


/* --- Header & Logo --- */
.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--text-light);
}
.logo h1 {
    font-family: var(--font-titles);
    font-size: 1.8em;
    font-weight: 700;
    color: var(--cyber-cyan);
    text-shadow: 0 0 5px var(--cyber-cyan), 0 0 10px var(--cyber-cyan);
}

/* --- Kartu Informasi Atas --- */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas:
        "provider location"
        "country settings"
        "search worker"
        "custom wildcard";
    gap: 10px;
    margin: 20px 0;
}
.info-card {
    background-color: var(--surface-light);
    border: 1px solid #333;
    padding: 12px;
    display: flex;
    flex-direction: column; /* Menumpuk ikon dan teks secara vertikal */
    align-items: center; /* Menengahkan secara horizontal */
    justify-content: center; /* Menengahkan secara vertikal */
    text-align: center;
    transition: all 0.2s ease;
}

.info-card > div {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.info-card:hover {
    border-color: var(--cyber-cyan);
    box-shadow: 0 0 5px var(--cyber-cyan);
}

/* Membuat kartu Settings dapat diklik */
#settings-btn,
#custom-server-btn,
#test-wildcard-btn,
#ping-settings-btn {
    cursor: pointer;
}

.info-card p {
    font-size: 0.8em;
    color: #aaa;
}
.info-card h4 {
    font-size: 1em;
    font-family: var(--font-main);
    font-weight: 600;
    color: var(--cyber-cyan);
}
.info-card select {
    width: 100%;
    background-color: var(--bg-dark);
    color: var(--text-light);
    border: 1px solid var(--border-color);
    padding: 8px;
    font-size: 1em;
}
.info-card select:focus {
    outline: none;
    border-color: var(--cyber-cyan);
    box-shadow: 0 0 10px var(--cyber-cyan);
}

/* --- Daftar Server --- */
.server-list-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* Diubah menjadi 4 kolom */
    gap: 10px;
}

.server-group-title {
    text-transform: uppercase;
    font-weight: bold;
    color: var(--primary-demonic);
    margin: 30px 0 10px 0;
    font-size: 0.9em;
    text-shadow: 0 0 5px var(--primary-demonic);
    grid-column: 1 / -1; /* Judul mencakup semua kolom */
}
.server-card {
    background-color: var(--surface-light);
    padding: 8px; /* Diperkecil untuk 4 kolom */
    border: 1px solid #333;
    border-left: 4px solid #555;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 80px;
}
.server-card-clickable-area {
    cursor: pointer;
    flex-grow: 1; /* Memastikan area ini mengisi ruang yang tersedia */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.server-card:hover {
    border-left-color: var(--cyber-cyan);
    background-color: #2a2a2a;
    box-shadow: 0 0 8px var(--cyber-cyan);
}
.server-card.selected {
    border-left-color: var(--primary-demonic);
    background-color: #221a1d;
    box-shadow: inset 0 0 10px var(--primary-demonic), 0 0 10px var(--primary-demonic);
}
.card-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #333;
}
.card-actions button {
    flex-grow: 1;
    background: transparent;
    border: 1px solid;
    padding: 5px;
    font-size: 0.8em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
}
.card-actions .edit-btn {
    color: var(--cyber-cyan);
    border-color: var(--cyber-cyan);
}
.card-actions .edit-btn:hover {
    background-color: var(--cyber-cyan);
    color: var(--text-dark);
    box-shadow: 0 0 8px var(--cyber-cyan);
}
.card-actions .delete-btn {
    color: var(--primary-demonic);
    border-color: var(--primary-demonic);
}
.card-actions .delete-btn:hover {
    background-color: var(--primary-demonic);
    color: var(--text-light);
    box-shadow: 0 0 8px var(--primary-demonic);
}
.server-details .provider {
    font-weight: 600;
    color: var(--text-light);
    display: flex; /* Menggunakan flexbox untuk penyejajaran */
    align-items: center;
    gap: 5px; /* Diperkecil */
    font-size: 0.85em; /* Diperkecil untuk 4 kolom */
    flex-wrap: wrap; /* Izinkan wrap jika nama provider panjang */
}

.country-code {
    background-color: #333;
    color: var(--cyber-cyan);
    padding: 2px 5px;
    font-size: 0.7em; /* Diperkecil */
    font-weight: bold;
    text-transform: uppercase;
    border: 1px solid var(--cyber-cyan);
    box-shadow: 0 0 4px var(--cyber-cyan);
}

.server-details .address {
    font-family: var(--font-main);
    font-size: 0.75em; /* Diperkecil untuk 4 kolom */
    color: #aaa;
    margin-bottom: 8px; /* Beri jarak ke ping badge */
    word-break: break-all; /* Memastikan teks panjang tidak meluap */
}
.ping-badge {
    background-color: #333;
    color: var(--text-light);
    font-weight: bold;
    padding: 3px 8px; /* Diperkecil */
    font-size: 0.8em; /* Diperkecil */
    text-align: center;
    transition: background-color 0.3s ease, color 0.3s ease; /* Transisi halus */
    width: 100%; /* Lebar penuh */
    margin-top: auto; /* Dorong ke bawah */
}

.ping-badge.good {
    background-color: var(--primary-green);
    color: var(--text-dark); /* Teks hitam */
    box-shadow: 0 0 8px var(--primary-green);
}

.ping-badge.medium {
    background-color: #fdd835; /* Kuning */
    color: var(--text-dark);
    box-shadow: 0 0 8px #fdd835;
}

.ping-badge.bad {
    background-color: var(--primary-demonic);
    box-shadow: 0 0 8px var(--primary-demonic);
}

/* --- Footer & Kontrol --- */
.controls-footer {
    position: sticky;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(10, 10, 10, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 15px;
    border-top: 2px solid var(--border-color);
    margin: 20px 0 0 0; /* Hapus margin negatif, atur margin atas */
    display: grid;
    gap: 15px;
    align-items: center;
    box-shadow: 0 -2px 15px -5px var(--border-color);
    box-sizing: border-box; /* Pastikan padding termasuk dalam width: 100% */
}

/* Dihapus karena .search-box tidak lagi digunakan */

.control-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
}
.btn {
    background-color: var(--surface-light);
    color: var(--text-light);
    border: 1px solid var(--cyber-cyan);
    padding: 12px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.btn.primary {
    background-color: transparent;
    color: var(--primary-demonic);
    border-color: var(--primary-demonic);
    font-weight: bold;
    box-shadow: 0 0 5px var(--primary-demonic);
}
.btn:hover {
    background-color: var(--cyber-cyan);
    color: var(--text-dark);
    text-shadow: none;
    box-shadow: 0 0 15px var(--cyber-cyan);
}
.btn.primary:hover {
    background-color: var(--primary-demonic);
    color: var(--text-light);
    text-shadow: 0 0 5px var(--text-light);
    box-shadow: 0 0 20px var(--primary-demonic);
}

/* --- Modal Settings --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}
.modal-overlay.visible {
    opacity: 1;
    visibility: visible;
}
.modal-content {
    background-color: var(--bg-dark);
    padding: 25px;
    width: 90%;
    max-width: 500px;
    border: 2px solid var(--primary-demonic);
    box-shadow: 0 0 25px var(--primary-demonic);
    position: relative; /* Diperlukan untuk memposisikan tombol tutup */
}
.close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    color: var(--text-light);
    font-size: 2em;
    cursor: pointer;
    transition: all 0.2s ease;
}
.close-btn:hover {
    color: var(--primary-demonic);
    text-shadow: 0 0 8px var(--primary-demonic);
}
.form-group label {
    display: block;
    margin-bottom: 5px;
    color: var(--cyber-cyan);
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.form-group input,
.form-group select {
    width: 100%;
    padding: 10px;
    font-size: 1em;
    background-color: var(--surface-light);
    border: 1px solid #333;
    color: var(--text-light);
    transition: all 0.2s ease;
}
.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--cyber-cyan);
    box-shadow: 0 0 10px var(--cyber-cyan);
}

/* --- Gaya Daftar Pengaturan Tersimpan --- */
.saved-settings-container {
    margin-top: 10px;
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #333;
    padding: 5px;
    background-color: var(--surface-light);
}

.saved-settings-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #2a2a2a;
    transition: background-color 0.2s ease;
}
.saved-settings-item:last-child {
    border-bottom: none;
}
.saved-settings-item:hover {
    background-color: #252525;
}

.settings-text {
    flex-grow: 1;
    font-size: 0.9em;
    color: var(--text-light);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.settings-text strong {
    color: var(--cyber-cyan);
}

.settings-actions button {
    background: transparent;
    border: 1px solid;
    padding: 4px 8px;
    font-size: 0.8em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: 5px;
}
.settings-actions .use-btn {
    color: var(--primary-green);
    border-color: var(--primary-green);
}
.settings-actions .use-btn:hover {
    background-color: var(--primary-green);
    color: var(--text-dark);
    box-shadow: 0 0 8px var(--primary-green);
}
.settings-actions .delete-btn {
    color: var(--primary-demonic);
    border-color: var(--primary-demonic);
}
.settings-actions .delete-btn:hover {
    background-color: var(--primary-demonic);
    color: var(--text-light);
    box-shadow: 0 0 8px var(--primary-demonic);
}

.test-result {
    margin-top: 15px;
    padding: 10px;
    background-color: var(--surface-light);
    border: 1px solid #333;
    min-height: 40px;
    color: var(--text-light);
    font-family: 'Courier New', Courier, monospace;
}

/* --- Toast Notification --- */
.toast-notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--cyber-cyan);
    color: var(--text-dark);
    padding: 12px 25px;
    font-weight: 600;
    z-index: 3000;
    opacity: 0;
    transition: opacity 0.3s ease, bottom 0.3s ease;
    box-shadow: 0 0 15px var(--cyber-cyan);
    border: 1px solid var(--cyber-cyan);
    text-transform: uppercase;
    letter-spacing: 1px;
}
.toast-notification.visible {
    bottom: 90px;
    opacity: 1;
}
.toast-notification.error {
    background-color: var(--danger-color);
    color: var(--text-light);
    box-shadow: 0 0 15px var(--danger-color);
    border-color: var(--danger-color);
}

/* --- Gaya Input Worker Ping --- */
#worker-input-card {
    padding: 0;
    position: relative;
}

#ping-worker-url {
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    padding: 15px;
    color: var(--text-light);
    font-size: 1em;
    font-family: var(--font-main);
    transition: all 0.2s ease;
    text-align: center; /* Menengahkan placeholder */
}

#ping-worker-url:focus {
    outline: none;
    border-color: var(--cyber-cyan);
    box-shadow: 0 0 10px var(--cyber-cyan);
}

/* --- Gaya Dropdown Kustom --- */
#country-filter-container, #provider-filter-container {
    /* Padding now inherited from .info-card for consistency */
    position: relative;
    padding: 15px; /* Explicitly reset to match .info-card */
}

.custom-dropdown {
    width: 100%;
    height: 100%;
    position: relative;
}

.dropdown-selected {
    width: 100%;
    height: 100%;
    padding: 0; /* Remove padding to allow perfect centering */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center; /* Center text horizontally */
    color: var(--cyber-cyan); /* Set color to cyan to match other cards */
    font-size: 1.1em; /* Match font-size of other h4 elements */
    font-weight: 600; /* Match font-weight of other h4 elements */
    font-family: var(--font-main);
    transition: all 0.2s ease;
    outline: none;
}

.dropdown-selected:focus,
.custom-dropdown.active .dropdown-selected {
    color: var(--cyber-cyan);
}

.dropdown-options {
    position: absolute;
    top: 105%;
    left: 0;
    right: 0;
    background-color: var(--surface-light);
    border: 1px solid var(--border-color);
    z-index: 1000;
    max-height: 250px;
    overflow-y: auto;
    display: none; /* Sembunyikan secara default */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.custom-dropdown.active .dropdown-options {
    display: block; /* Tampilkan saat aktif */
}

.dropdown-options .option {
    padding: 12px 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid #2a2a2a;
}
.dropdown-options .option:last-child {
    border-bottom: none;
}

.dropdown-options .option:hover,
.dropdown-options .option.selected {
    background-color: var(--primary-demonic);
    color: var(--text-light);
    text-shadow: 0 0 5px var(--text-light);
}

/* Scrollbar styling */
.dropdown-options::-webkit-scrollbar {
    width: 8px;
}
.dropdown-options::-webkit-scrollbar-track {
    background: var(--bg-dark);
}
.dropdown-options::-webkit-scrollbar-thumb {
    background-color: var(--primary-demonic);
    border: 2px solid var(--primary-demonic);
}

/* --- Responsif untuk Seluler --- */
@media (max-width: 768px) {
    .server-list-grid {
        display: flex; /* Menggunakan Flexbox */
        flex-wrap: wrap; /* Izinkan item untuk wrap ke baris berikutnya */
        gap: 10px; /* Tetapkan jarak antar kartu */
    }

    .server-group-title {
        flex-basis: 100%; /* Pastikan judul mengambil lebar penuh */
    }

    /* Penyesuaian ukuran kartu server untuk seluler */
    .server-card {
        padding: 8px; /* Kembalikan padding ke nilai yang lebih nyaman */
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 1 1 calc(50% - 5px); /* Basis 50% untuk 2 kolom, dikurangi setengah gap */
    }

    .country-code {
        font-size: 0.7em; /* Kembalikan ukuran font ke nilai yang lebih mudah dibaca */
        padding: 2px 5px;
    }

    .server-details .provider {
        font-size: 0.8em; /* Kembalikan ukuran font */
        gap: 5px;
    }

    .server-details .address {
        font-size: 0.75em; /* Kembalikan ukuran font */
        margin-bottom: 6px;
    }

    .ping-badge {
        padding: 3px 6px;
        font-size: 0.75em; /* Kembalikan ukuran font */
    }

    .info-grid {
        grid-template-columns: repeat(2, 1fr); /* 2 kolom untuk seluler */
        grid-template-areas:
            "provider location"
            "country settings"
            "search worker"
            "custom wildcard"; /* Menambahkan tombol baru */
        gap: 8px;
    }

    .info-card {
        padding: 8px 4px; /* Atas/bawah 8px, Kiri/kanan 4px */
        gap: 4px;
        min-height: 60px; /* Menetapkan tinggi minimum agar rapi */
    }

    .info-card .icon {
        font-size: 1.1em; /* Memperkecil ikon lagi */
    }

    .info-card p {
        font-size: 0.65em; /* Memperkecil teks paragraf lagi */
    }

    .info-card h4 {
        font-size: 0.75em; /* Memperkecil teks judul lagi */
    }

    #ping-worker-url {
        font-size: 0.8em;
        padding: 8px; /* Menghapus padding-left yang tidak perlu */
    }

    .custom-dropdown .dropdown-selected {
        font-size: 0.75em;
    }

    /* Penyesuaian Footer untuk Seluler */
    .controls-footer {
        padding: 8px;
        gap: 8px;
    }

    .control-buttons {
        grid-template-columns: repeat(3, 1fr); /* 3 tombol sejajar */
    }
    .btn {
        padding: 10px;
        font-size: 0.8em;
    }
}`;
const jsContent = `// ==========================================================
// script.js (v7.0 - Worker-Based Ping)
// Heavenly Demons Configurator
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    // --- PENGATURAN ---
    const PROXY_LIST_URL = 'https://raw.githubusercontent.com/mrzero0nol/My-v2ray/refs/heads/main/proxyList.txt';
    const DEFAULT_PING_TESTER_URL = 'https://test-ping.fazo0zero.workers.dev/ping'; // URL Worker Ping Default

    // --- Referensi Elemen DOM ---
    const serverListContainer = document.getElementById('server-list');
    // const searchInput = document.getElementById('search-input'); // Dihapus
    const selectedCountBtn = document.getElementById('selected-count-btn');
    const repingBtn = document.getElementById('reping-btn');
    const ispInfo = document.getElementById('isp-info');
    const locationInfo = document.getElementById('location-info');
    const settingsBtn = document.getElementById('settings-btn');
    const exportBtn = document.getElementById('export-btn');

    // Referensi Modal
    const settingsModalOverlay = document.getElementById('settings-modal-overlay');
    const customServerModalOverlay = document.getElementById('custom-server-modal-overlay');
    const testWildcardModalOverlay = document.getElementById('test-wildcard-modal-overlay');
    const pingSettingsModalOverlay = document.getElementById('ping-settings-modal-overlay');
    const editServerModalOverlay = document.getElementById('edit-server-modal-overlay'); // Modal baru

    // Tombol Aksi Modal
    const settingsDoneBtn = document.getElementById('settings-done-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn'); // Tombol baru
    const addServerBtn = document.getElementById('add-server-btn');
    const runWildcardTestBtn = document.getElementById('run-wildcard-test-btn');

    // Kontainer Daftar Pengaturan
    const savedSettingsListContainer = document.getElementById('saved-settings-list'); // Kontainer baru

    // Tombol Pembuka Modal
    const customServerBtn = document.getElementById('custom-server-btn');
    const testWildcardBtn = document.getElementById('test-wildcard-btn');
    const pingSettingsBtn = document.getElementById('ping-settings-btn');
    const pingModeStatus = document.getElementById('ping-mode-status');
    const pingWorkerUrlInput = document.getElementById('ping-worker-url-input');
    const savePingSettingsBtn = document.getElementById('save-ping-settings-btn');

    // Input & Result Wildcard
    const wildcardDomainInput = document.getElementById('wildcard-domain-input');
    const wildcardTestResult = document.getElementById('wildcard-test-result');

    // Input Custom Server
    const serverNameInput = document.getElementById('server-name-input');
    const serverIpInput = document.getElementById('server-ip-input');
    const serverPortInput = document.getElementById('server-port-input');

    // Input Edit Server
    const editServerIdInput = document.getElementById('edit-server-id-input');
    const editServerNameInput = document.getElementById('edit-server-name-input');
    const editServerIpInput = document.getElementById('edit-server-ip-input');
    const editServerPortInput = document.getElementById('edit-server-port-input');
    const saveServerChangesBtn = document.getElementById('save-server-changes-btn');

    // Elemen Dropdown Kustom
    const countryDropdown = document.getElementById('country-filter-container').querySelector('.custom-dropdown');
    const selectedCountryEl = document.getElementById('selected-country');
    const countryOptionsContainer = document.getElementById('country-options');

    const providerDropdown = document.getElementById('provider-filter-container').querySelector('.custom-dropdown');
    const selectedProviderEl = document.getElementById('selected-provider');
    const providerOptionsContainer = document.getElementById('provider-options');

    const bugCdnInput = document.getElementById('bug-cdn-input');
    const workerHostInput = document.getElementById('worker-host-input');
    const uuidInput = document.getElementById('uuid-input');
    const protocolSelect = document.getElementById('protocol-select');
    const tlsSelect = document.getElementById('tls-select');

    // --- State Aplikasi ---
    let allServers = [];
    let selectedServers = new Set();
    let isShowingOnlySelected = false;
    let pingMode = 'browser'; // 'browser' or 'worker'
    let customPingUrl = '';

    // =======================================================
    // FUNGSI INTI & PEMBANTU
    // =======================================================

    function setupPingMode() {
        const savedUrl = localStorage.getItem('pingTesterUrl');
        if (savedUrl) {
            pingMode = 'worker';
            customPingUrl = savedUrl;
            pingWorkerUrlInput.value = savedUrl;
            pingModeStatus.textContent = 'Mode: Custom URL';
        } else {
            pingMode = 'browser';
            pingModeStatus.textContent = 'Mode: Browser';
        }
    }

    function generateUUIDv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'toast-notification';
        if (isError) toast.classList.add('error');

        document.body.appendChild(toast);

        setTimeout(() => { toast.classList.add('visible'); }, 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => { document.body.removeChild(toast); }, 300);
        }, 2700);
    }

    async function initializeApp() {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.textContent = 'Memuat...';
        document.body.appendChild(loader);

        try {
            setupPingMode();
            detectUserInfo();
            populateSettingsFromUrl();
            loadAndRenderSettings(); // Muat pengaturan yang disimpan

            // Muat server kustom terlebih dahulu
            const customServers = JSON.parse(localStorage.getItem('customServers')) || [];

            // Kemudian, coba unduh daftar server remote
            let remoteServers = [];
            try {
                serverListContainer.innerHTML = '<p>Mengunduh daftar server...</p>';
                const response = await fetch(PROXY_LIST_URL);
                if (response.ok) {
                    const textData = await response.text();
                    remoteServers = parseProxyList(textData);
                } else {
                    console.warn(\\`Gagal mengunduh daftar: ${response.statusText}\\`);
                }
            } catch (fetchError) {
                console.error("Gagal mengunduh daftar server:", fetchError);
                // Jangan hentikan aplikasi jika fetch gagal
            }

            // Gabungkan daftar: server kustom selalu di atas dan tidak terpengaruh oleh kegagalan fetch
            allServers = [...customServers, ...remoteServers];

            populateCountryFilter(allServers);
            populateProviderFilter(allServers); // Panggil fungsi baru
            renderServers(allServers);

        } catch (error) {
            console.error("Initialization Error:", error);
            serverListContainer.innerHTML = \\`<p style="color: var(--danger-color);">Terjadi kesalahan saat inisialisasi. <br><small>${error.message}</small></p>\\`;
        } finally {
            loader.remove(); // Selalu hapus loader
        }
    }

    function parseProxyList(text) {
        return text.trim().split('\n').map(line => {
            const parts = line.split(',');
            if (parts.length < 4) return null;
            return {
                id: \\`${parts[0].trim()}:${parts[1].trim()}\\`,
                ip: parts[0].trim(),
                port: parts[1].trim(),
                country_code: parts[2].trim(),
                provider: parts[3].trim()
            };
        }).filter(Boolean);
    }

    function populateCountryFilter(servers) {
        countryOptionsContainer.innerHTML = ''; // Bersihkan opsi lama

        // Tambahkan opsi "Pilih Negara" sebagai default
        const allOption = document.createElement('div');
        allOption.className = 'option selected';
        allOption.dataset.value = 'all';
        allOption.textContent = 'Pilih Negara';
        allOption.addEventListener('click', () => selectCountry('all', 'Pilih Negara'));
        countryOptionsContainer.appendChild(allOption);

        const countries = [...new Set(servers.map(s => s.country_code))].sort();
        countries.forEach(code => {
            const option = document.createElement('div');
            option.className = 'option';
            option.dataset.value = code;
            option.textContent = code;
            option.addEventListener('click', () => selectCountry(code, code));
            countryOptionsContainer.appendChild(option);
        });
    }

    function selectCountry(value, text) {
        selectedCountryEl.textContent = text;
        countryDropdown.dataset.value = value;
        countryDropdown.classList.remove('active');

        // Hapus kelas 'selected' dari semua opsi
        countryOptionsContainer.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Tambahkan kelas 'selected' ke opsi yang diklik
        const selectedOption = countryOptionsContainer.querySelector(\\`.option[data-value="${value}"]\\`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        applyAllFilters();
    }

    function populateProviderFilter(servers) {
        providerOptionsContainer.innerHTML = ''; // Bersihkan opsi lama

        // Tambahkan opsi "Pilih Server VPN" sebagai default
        const allOption = document.createElement('div');
        allOption.className = 'option selected';
        allOption.dataset.value = 'all';
        allOption.textContent = 'Pilih Server VPN';
        allOption.addEventListener('click', () => selectProvider('all', 'Pilih Server VPN'));
        providerOptionsContainer.appendChild(allOption);

        // Filter provider unik, kecuali 'CUSTOM'
        const providers = [...new Set(servers.map(s => s.provider))].filter(p => p.toLowerCase() !== 'custom').sort();
        providers.forEach(provider => {
            const option = document.createElement('div');
            option.className = 'option';
            option.dataset.value = provider;
            option.textContent = provider;
            option.addEventListener('click', () => selectProvider(provider, provider));
            providerOptionsContainer.appendChild(option);
        });
    }

    function selectProvider(value, text) {
        selectedProviderEl.textContent = text;
        providerDropdown.dataset.value = value;
        providerDropdown.classList.remove('active');

        // Hapus kelas 'selected' dari semua opsi
        providerOptionsContainer.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Tambahkan kelas 'selected' ke opsi yang diklik
        const selectedOption = providerOptionsContainer.querySelector(\\`.option[data-value="${value}"]\\`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        applyAllFilters();
    }

    function renderServers(serversToRender) {
        serverListContainer.innerHTML = '';
        if (serversToRender.length === 0) {
            serverListContainer.innerHTML = '<p>Tidak ada server yang ditemukan.</p>';
            return;
        }

        const gridContainer = document.createElement('div');
        gridContainer.className = 'server-list-grid';

        const customServers = serversToRender.filter(s => s.country_code === 'CUSTOM');
        const regularServers = serversToRender.filter(s => s.country_code !== 'CUSTOM');

        // Render Custom Servers terlebih dahulu jika ada
        if (customServers.length > 0) {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'server-group-title';
            groupTitle.textContent = 'Custom Servers';
            gridContainer.appendChild(groupTitle);

            customServers.forEach(server => {
                const card = createServerCard(server);
                gridContainer.appendChild(card);
            });
        }

        // Kemudian render server reguler
        const groupedByProvider = regularServers.reduce((acc, server) => {
            (acc[server.provider] = acc[server.provider] || []).push(server);
            return acc;
        }, {});

        for (const provider in groupedByProvider) {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'server-group-title';
            groupTitle.textContent = provider;
            gridContainer.appendChild(groupTitle);

            groupedByProvider[provider].forEach(server => {
                const card = createServerCard(server);
                gridContainer.appendChild(card);
            });
        }
        serverListContainer.appendChild(gridContainer);
    }

    function createServerCard(server) {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.dataset.serverId = server.id;
        if (selectedServers.has(server.id)) {
            card.classList.add('selected');
        }

    // Konten utama yang dapat diklik dibungkus untuk memisahkannya dari tombol aksi
    const clickableArea = document.createElement('div');
    clickableArea.className = 'server-card-clickable-area';
    clickableArea.innerHTML = \\`
            <div class="server-details">
                <p class="provider">
                    <span class="country-code">${server.country_code}</span>
                    ${server.provider}
                </p>
                <p class="address">${server.ip}:${server.port}</p>
            </div>
            <span class="ping-badge">...</span>
        \\`;
    clickableArea.addEventListener('click', () => toggleServerSelection(card, server.id));
    card.appendChild(clickableArea);

    // Tambahkan tombol Edit/Hapus untuk server kustom
    if (server.country_code === 'CUSTOM') {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'card-actions';
        actionsContainer.innerHTML = \\`
            <button class="edit-btn" data-server-id="${server.id}">Edit</button>
            <button class="delete-btn" data-server-id="${server.id}">Hapus</button>
        \\`;
        card.appendChild(actionsContainer);
    }

        return card;
    }

    async function detectUserInfo() {
        try {
            const response = await fetch('https://ipinfo.io/json');
            if (!response.ok) throw new Error('Response not OK');
            const data = await response.json();
            ispInfo.textContent = data.org || 'N/A';
            locationInfo.textContent = \\`${data.city || ''}, ${data.country || ''}\\`;
        } catch (error) {
            console.warn("Gagal mendeteksi info pengguna:", error);
            ispInfo.textContent = 'N/A';
            locationInfo.textContent = 'N/A';
        }
    }

    function populateSettingsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const hostFromUrl = urlParams.get('host');

        if (hostFromUrl) {
            workerHostInput.value = hostFromUrl;
        }

        if (!uuidInput.value) {
            uuidInput.value = generateUUIDv4();
        }
    }

    // =======================================================
    // FUNGSI SIMPAN & MUAT PENGATURAN HOST/SNI
    // =======================================================
    function renderSavedSettings(settings) {
        savedSettingsListContainer.innerHTML = '';
        if (!settings || settings.length === 0) {
            savedSettingsListContainer.innerHTML = '<p style="font-size: 0.8em; color: #888;">Belum ada pengaturan yang disimpan.</p>';
            return;
        }

        settings.forEach((setting, index) => {
            const item = document.createElement('div');
            item.className = 'saved-settings-item';
            item.innerHTML = \\`
                <div class="settings-text" title="Host: ${setting.host}\nSNI: ${setting.sni}">
                    <strong>Host:</strong> ${setting.host} <br>
                    <strong>SNI:</strong> ${setting.sni}
                </div>
                <div class="settings-actions">
                    <button class="use-btn" data-index="${index}">Gunakan</button>
                    <button class="delete-btn" data-index="${index}">Hapus</button>
                </div>
            \\`;
            savedSettingsListContainer.appendChild(item);
        });
    }

    function loadAndRenderSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('savedHostSniSettings')) || [];
        renderSavedSettings(savedSettings);

        // Muat pengaturan terakhir yang digunakan jika ada
        const lastUsedSetting = JSON.parse(localStorage.getItem('lastUsedHostSni'));
        if (lastUsedSetting) {
            bugCdnInput.value = lastUsedSetting.host || '';
            workerHostInput.value = lastUsedSetting.sni || '';
        }
    }

    function handleSaveSettings() {
        const host = bugCdnInput.value.trim();
        const sni = workerHostInput.value.trim();

        if (!host || !sni) {
            showToast("Host dan SNI tidak boleh kosong untuk disimpan.", true);
            return;
        }

        let savedSettings = JSON.parse(localStorage.getItem('savedHostSniSettings')) || [];

        // Cek duplikat
        const isDuplicate = savedSettings.some(s => s.host === host && s.sni === sni);
        if (isDuplicate) {
            showToast("Pengaturan ini sudah ada.", true);
            return;
        }

        savedSettings.push({ host, sni });
        localStorage.setItem('savedHostSniSettings', JSON.stringify(savedSettings));

        // Simpan juga sebagai yang terakhir digunakan
        localStorage.setItem('lastUsedHostSni', JSON.stringify({ host, sni }));

        renderSavedSettings(savedSettings);
        showToast("Pengaturan berhasil disimpan!");
    }

    function handleUseSetting(index) {
        const savedSettings = JSON.parse(localStorage.getItem('savedHostSniSettings')) || [];
        if (savedSettings[index]) {
            const { host, sni } = savedSettings[index];
            bugCdnInput.value = host;
            workerHostInput.value = sni;

            // Simpan sebagai yang terakhir digunakan
            localStorage.setItem('lastUsedHostSni', JSON.stringify({ host, sni }));
            showToast("Pengaturan dimuat.");
        }
    }

    function handleDeleteSetting(index) {
        if (!confirm('Anda yakin ingin menghapus pengaturan ini?')) {
            return;
        }
        let savedSettings = JSON.parse(localStorage.getItem('savedHostSniSettings')) || [];
        savedSettings.splice(index, 1);
        localStorage.setItem('savedHostSniSettings', JSON.stringify(savedSettings));
        renderSavedSettings(savedSettings);
        showToast("Pengaturan dihapus.");
    }


    // =======================================================
    // FUNGSI CUSTOM SERVER
    // =======================================================

    function loadCustomServers() {
        // Fungsi ini sekarang hanya mengembalikan daftar dari localStorage.
        // Logika penggabungan ada di initializeApp.
        return JSON.parse(localStorage.getItem('customServers')) || [];
    }

    function handleAddCustomServer() {
        const name = serverNameInput.value.trim();
        const ip = serverIpInput.value.trim();
        const port = serverPortInput.value.trim();

        if (!name || !ip || !port) {
            showToast("Harap isi semua kolom untuk custom server.", true);
            return;
        }

        // Validasi IP (lebih baik, tapi masih sederhana)
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(ip)) {
            showToast("Format IP address tidak valid.", true);
            return;
        }

        // Validasi Port
        if (isNaN(port) || port < 1 || port > 65535) {
            showToast("Port harus berupa angka antara 1 dan 65535.", true);
            return;
        }

        const newServer = {
            id: \\`${ip}:${port}\\`,
            ip: ip,
            port: port,
            country_code: 'CUSTOM',
            provider: name // Menggunakan nama sebagai provider
        };

        let customServers = loadCustomServers();

        // Cek duplikat di seluruh daftar server (baik kustom maupun remote)
        if (allServers.some(s => s.id === newServer.id)) {
            showToast("Server dengan IP dan Port ini sudah ada.", true);
            return;
        }

        // Tambahkan ke daftar kustom dan simpan
        customServers.push(newServer);
        localStorage.setItem('customServers', JSON.stringify(customServers));

        // Tambahkan ke daftar 'allServers' yang aktif di memori (di bagian depan)
        allServers.unshift(newServer);

        applyAllFilters(); // Render ulang daftar
        closeCustomServerModal();
        showToast("Custom server berhasil ditambahkan!");

        // Kosongkan input
        serverNameInput.value = '';
        serverIpInput.value = '';
        serverPortInput.value = '';
    }

    function handleDeleteCustomServer(serverId) {
        if (!confirm('Apakah Anda yakin ingin menghapus server kustom ini?')) {
            return;
        }

        let customServers = loadCustomServers();

        // Hapus dari localStorage
        const updatedCustomServers = customServers.filter(s => s.id !== serverId);
        localStorage.setItem('customServers', JSON.stringify(updatedCustomServers));

        // Hapus dari state allServers di memori
        allServers = allServers.filter(s => s.id !== serverId);

        // Jika server yang dihapus ada di set server yang dipilih, hapus juga dari sana
        if (selectedServers.has(serverId)) {
            selectedServers.delete(serverId);
            updateSelectedCount();
        }

        applyAllFilters(); // Render ulang daftar server
        showToast("Custom server berhasil dihapus.");
    }

    function handleSaveChanges() {
        const serverIdToUpdate = editServerIdInput.value;
        const newName = editServerNameInput.value.trim();
        const newIp = editServerIpInput.value.trim();
        const newPort = editServerPortInput.value.trim();

        if (!newName || !newIp || !newPort) {
            showToast("Harap isi semua kolom.", true);
            return;
        }

        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(newIp)) {
            showToast("Format IP address tidak valid.", true);
            return;
        }

        if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
            showToast("Port harus berupa angka antara 1 dan 65535.", true);
            return;
        }

        const newServerId = \\`${newIp}:${newPort}\\`;
        let customServers = loadCustomServers();

        const isDuplicate = allServers.some(s => s.id === newServerId && s.id !== serverIdToUpdate);
        if (isDuplicate) {
            showToast("Server dengan IP dan Port ini sudah ada.", true);
            return;
        }

        const updatedCustomServers = customServers.map(server => {
            if (server.id === serverIdToUpdate) {
                return { ...server, id: newServerId, ip: newIp, port: newPort, provider: newName };
            }
            return server;
        });
        localStorage.setItem('customServers', JSON.stringify(updatedCustomServers));

        const serverIndexInMemory = allServers.findIndex(s => s.id === serverIdToUpdate);
        if (serverIndexInMemory !== -1) {
            allServers[serverIndexInMemory] = { ...allServers[serverIndexInMemory], id: newServerId, ip: newIp, port: newPort, provider: newName };
        }

        if (serverIdToUpdate !== newServerId && selectedServers.has(serverIdToUpdate)) {
            selectedServers.delete(serverIdToUpdate);
            selectedServers.add(newServerId);
        }

        closeModal(editServerModalOverlay);
        applyAllFilters();
        showToast("Custom server berhasil diperbarui.");
    }

    // =======================================================
    // FUNGSI TEST WILDCARD
    // =======================================================

    async function handleWildcardTest() {
        let domain = wildcardDomainInput.value.trim();
        if (!domain) {
            wildcardTestResult.textContent = 'Error: Domain tidak boleh kosong.';
            wildcardTestResult.style.color = 'var(--danger-color)';
            return;
        }

        // Tambahkan https:// jika tidak ada protokol
        if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
            domain = 'https://' + domain;
        }

        wildcardTestResult.textContent = \\`Memeriksa ${domain}...\\`;
        wildcardTestResult.style.color = 'var(--text-light)';

        try {
            // Kita menggunakan 'no-cors' karena kita tidak perlu membaca body,
            // tapi kita akan mencoba memeriksa header jika memungkinkan.
            // Peringatan: Header 'Server' biasanya tidak terekspos ke JS karena kebijakan CORS.
            // Pendekatan ini mungkin tidak selalu berhasil, tapi ini adalah yang terbaik
            // yang bisa dilakukan tanpa proxy di sisi server.
            const response = await fetch(domain, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(8000) });

            // Dalam mode no-cors, kita tidak bisa mengakses header secara langsung.
            // Jadi, kita akan mengandalkan pesan error untuk mendeteksi beberapa hal.
            // Namun, untuk Cloudflare, kita bisa mencoba trik lain.
            // Kita akan mencoba fetch ke path khusus Cloudflare. Jika berhasil, kemungkinan besar itu Cloudflare.
            // Ini bukan jaminan 100%, tapi merupakan indikator yang kuat.

            // Trik: Coba akses path yang sering ada di balik Cloudflare
            const cfCheckResponse = await fetch(\\`${domain}/cdn-cgi/trace\\`, { method: 'GET', signal: AbortSignal.timeout(8000) });
            const cfCheckText = await cfCheckResponse.text();

            if (cfCheckText.includes('fl=') && cfCheckText.includes('h=')) {
                 wildcardTestResult.textContent = \\`SUKSES!\nDomain ini kemungkinan besar menggunakan Cloudflare.\\`;
                 wildcardTestResult.style.color = 'var(--primary-green)';
            } else {
                 wildcardTestResult.textContent = \\`INFO\nTidak ada tanda-tanda jelas Cloudflare. Domain mungkin tidak menggunakannya atau menyembunyikan jejaknya.\\`;
                 wildcardTestResult.style.color = 'var(--cyber-cyan)';
            }

        } catch (error) {
            console.error("Cloudflare Check Error:", error);
            wildcardTestResult.textContent = \\`GAGAL!\nTidak dapat terhubung ke domain. Mungkin down atau salah ketik.\nError: ${error.name}\\`;
            wildcardTestResult.style.color = 'var(--danger-color)';
        }
    }

    // =======================================================
    // FUNGSI PING (DUAL MODE: BROWSER & WORKER)
    // =======================================================

    async function pingServer(ip, port, timeout = 5000) {
        if (pingMode === 'worker') {
            // --- Mode Worker: Menggunakan URL kustom ---
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(customPingUrl, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ip, port }),
                });
                clearTimeout(id);
                if (!response.ok) return -1;
                const data = await response.json();
                return data.ping;
            } catch (error) {
                clearTimeout(id);
                return -1;
            }

        } else {
            // --- Mode Browser: Menggunakan fetch HEAD request ---
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const startTime = Date.now();

            try {
                // Kita tidak peduli dengan responsnya, hanya waktu yang dibutuhkan untuk terhubung
                await fetch(\\`http://${ip}:${port}\\`, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: controller.signal
                });
                clearTimeout(id);
                return Date.now() - startTime;
            } catch (error) {
                clearTimeout(id);
                return -1; // Gagal terhubung atau timeout
            }
        }
    }

    async function pingAllVisibleServers() {
        const serverCards = Array.from(serverListContainer.querySelectorAll('.server-card'));

        for (const card of serverCards) {
            const serverId = card.dataset.serverId;
            if (!serverId) continue;

            const [ip, port] = serverId.split(':');
            const pingBadge = card.querySelector('.ping-badge');

            if (pingBadge) {
                // Atur ulang badge menjadi '...' sebelum ping
                requestAnimationFrame(() => {
                    pingBadge.textContent = '...';
                    pingBadge.className = 'ping-badge'; // Reset kelas
                });

                // Tunggu hasil ping untuk server ini sebelum melanjutkan ke server berikutnya
                const pingValue = await pingServer(ip, port);

                // Perbarui UI dengan hasil ping
                requestAnimationFrame(() => {
                    pingBadge.classList.remove('good', 'medium', 'bad'); // Hapus kelas lama
                    if (pingValue === -1) {
                        pingBadge.textContent = 'N/A';
                    } else {
                        pingBadge.textContent = \\`${pingValue} ms\\`;
                        if (pingValue < 250) {
                            pingBadge.classList.add('good');
                        } else if (pingValue < 1000) {
                            pingBadge.classList.add('medium');
                        } else {
                            pingBadge.classList.add('bad');
                        }
                    }
                });
            }
        }
    }

    // =======================================================
    // FUNGSI INTERAKTIVITAS & MODAL
    // =======================================================

    function toggleServerSelection(cardElement, serverId) {
        if (selectedServers.has(serverId)) {
            selectedServers.delete(serverId);
            cardElement.classList.remove('selected');
        } else {
            selectedServers.add(serverId);
            cardElement.classList.add('selected');
        }
        updateSelectedCount();

        if (isShowingOnlySelected && selectedServers.size === 0) {
            isShowingOnlySelected = false;
            applyAllFilters();
        }
    }

    function updateSelectedCount() {
        selectedCountBtn.textContent = \\`${selectedServers.size} proxies\\`;
    }

    function applyAllFilters() {
        const selectedProvider = providerDropdown.dataset.value || 'all';
        const selectedCountry = countryDropdown.dataset.value || 'all';

        let serversToDisplay = allServers;

        if (isShowingOnlySelected) {
            serversToDisplay = allServers.filter(s => selectedServers.has(s.id));
        }

        if (selectedCountry !== 'all') {
            serversToDisplay = serversToDisplay.filter(s => s.country_code === selectedCountry);
        }

        if (selectedProvider !== 'all') {
            serversToDisplay = serversToDisplay.filter(s => s.provider === selectedProvider);
        }

        renderServers(serversToDisplay);
    }

    function exportProxies() {
        if (selectedServers.size === 0) {
            showToast("Pilih setidaknya satu server!", true);
            return;
        }

        const bugCdn = bugCdnInput.value.trim();
        const workerHost = workerHostInput.value.trim();
        const uuid = uuidInput.value.trim(); // Digunakan sebagai UUID untuk VLESS dan Password untuk Trojan
        const selectedProtocol = protocolSelect.value;

        if (!bugCdn || !workerHost || !uuid) {
            showToast("Harap isi semua kolom di Settings.", true);
            openSettingsModal();
            return;
        }

        let outputUris = [];
        selectedServers.forEach(serverId => {
            const server = allServers.find(s => s.id === serverId);
            if (server) {
                const path = \\`/${server.ip}-${server.port}\\`;
                const name = \\`${server.country_code} ${server.provider} [${server.ip}]\\`;
                const useTls = tlsSelect.value === 'true';
                const port = useTls ? '443' : '80';

                let uri = '';

                if (selectedProtocol === 'vless') {
                    // --- Logika untuk VLESS ---
                    uri = \\`vless://${uuid}@${bugCdn}:${port}\\` +
                          \\`?encryption=none&type=ws&flow=\\` +
                          \\`&host=${workerHost}\\` +
                          \\`&security=${useTls ? 'tls' : 'none'}\\` +
                          \\`&sni=${workerHost}\\` +
                          \\`&path=${encodeURIComponent(path)}\\` +
                          \\`#${encodeURIComponent(name)}\\`;
                } else if (selectedProtocol === 'trojan') {
                    // --- Logika untuk Trojan ---
                    // Trojan menggunakan UUID sebagai password dan tidak memiliki parameter 'encryption' & 'flow'.
                    uri = \\`trojan://${uuid}@${bugCdn}:${port}\\` +
                          \\`?type=ws\\` +
                          \\`&host=${workerHost}\\` +
                          \\`&security=${useTls ? 'tls' : 'none'}\\` +
                          \\`&sni=${workerHost}\\` +
                          \\`&path=${encodeURIComponent(path)}\\` +
                          \\`#${encodeURIComponent(name)}\\`;
                }

                if (uri) {
                    outputUris.push(uri);
                }
            }
        });

        if (outputUris.length > 0) {
            const resultString = outputUris.join('\n');
            navigator.clipboard.writeText(resultString).then(() => {
                showToast("Konfigurasi berhasil disalin!");
            }).catch(err => {
                console.error('Gagal menyalin: ', err);
                showToast("Gagal menyalin ke clipboard.", true);
            });
        }
    }

    function openSettingsModal() { settingsModalOverlay.classList.add('visible'); }
    function closeSettingsModal() { settingsModalOverlay.classList.remove('visible'); }
    function openCustomServerModal() { customServerModalOverlay.classList.add('visible'); }
    function closeCustomServerModal() { customServerModalOverlay.classList.remove('visible'); }
    function openTestWildcardModal() { testWildcardModalOverlay.classList.add('visible'); }
    function openPingSettingsModal() { pingSettingsModalOverlay.classList.add('visible'); }

    function openEditModal(server) {
        editServerIdInput.value = server.id;
        editServerNameInput.value = server.provider;
        editServerIpInput.value = server.ip;
        editServerPortInput.value = server.port;
        editServerModalOverlay.classList.add('visible');
    }

    function handleSavePingSettings() {
        let newUrl = pingWorkerUrlInput.value.trim();

        if (newUrl) {
            // Validasi sederhana dan pastikan https
            if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                newUrl = 'https://' + newUrl;
            }
            if (newUrl.startsWith('http://')) {
                newUrl = newUrl.replace('http://', 'https://');
            }

            localStorage.setItem('pingTesterUrl', newUrl);
            pingMode = 'worker';
            customPingUrl = newUrl;
            pingWorkerUrlInput.value = newUrl; // Perbarui input dengan URL yang sudah dikoreksi
            pingModeStatus.textContent = 'Mode: Custom URL';
            showToast('Mode Ping diubah ke Custom URL.');
        } else {
            localStorage.removeItem('pingTesterUrl');
            pingMode = 'browser';
            customPingUrl = '';
            pingModeStatus.textContent = 'Mode: Browser';
            showToast('Mode Ping dikembalikan ke Browser (Default).');
        }

        closeModal(pingSettingsModalOverlay);
    }

    // Fungsi Generik untuk menutup modal
    function closeModal(modalElement) {
        modalElement.classList.remove('visible');
    }

    // =======================================================
    // EVENT LISTENERS
    // =======================================================

    serverListContainer.addEventListener('click', function(event) {
        // Delegasi event untuk tombol hapus
        if (event.target.classList.contains('delete-btn')) {
            const serverId = event.target.dataset.serverId;
            handleDeleteCustomServer(serverId);
        }

        // Delegasi event untuk tombol edit
        if (event.target.classList.contains('edit-btn')) {
            const serverId = event.target.dataset.serverId;
            const serverToEdit = allServers.find(s => s.id === serverId);
            if (serverToEdit) {
                openEditModal(serverToEdit);
            }
        }
    });

    selectedCountBtn.addEventListener('click', () => {
        if (selectedServers.size === 0) return;
        isShowingOnlySelected = !isShowingOnlySelected;
        applyAllFilters();
        if (isShowingOnlySelected) {
            selectedCountBtn.style.backgroundColor = 'var(--primary-green)';
            selectedCountBtn.style.color = 'var(--text-dark)';
        } else {
            selectedCountBtn.style.backgroundColor = '';
            selectedCountBtn.style.color = '';
        }
    });

    // --- Event Listener untuk Modal ---
    settingsBtn.addEventListener('click', openSettingsModal);
    customServerBtn.addEventListener('click', openCustomServerModal);
    testWildcardBtn.addEventListener('click', openTestWildcardModal);
    pingSettingsBtn.addEventListener('click', openPingSettingsModal);

    // Menangani penutupan semua modal
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    settingsDoneBtn.addEventListener('click', closeSettingsModal);
    saveSettingsBtn.addEventListener('click', handleSaveSettings); // Listener baru
    addServerBtn.addEventListener('click', handleAddCustomServer);
    runWildcardTestBtn.addEventListener('click', handleWildcardTest);
    savePingSettingsBtn.addEventListener('click', handleSavePingSettings);
    saveServerChangesBtn.addEventListener('click', handleSaveChanges); // Listener baru

    // Event delegation for saved settings list
    savedSettingsListContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('use-btn')) {
            const index = parseInt(target.dataset.index, 10);
            handleUseSetting(index);
        }
        if (target.classList.contains('delete-btn')) {
            const index = parseInt(target.dataset.index, 10);
            handleDeleteSetting(index);
        }
    });

    exportBtn.addEventListener('click', exportProxies);
    repingBtn.addEventListener('click', () => {
        showToast("Memulai ulang tes ping...");
        pingAllVisibleServers();
    });

    // Event listener untuk dropdown kustom (Negara)
    countryDropdown.querySelector('.dropdown-selected').addEventListener('click', () => {
        countryDropdown.classList.toggle('active');
        providerDropdown.classList.remove('active'); // Tutup dropdown lain
    });

    // Event listener untuk dropdown kustom (Provider)
    providerDropdown.querySelector('.dropdown-selected').addEventListener('click', () => {
        providerDropdown.classList.toggle('active');
        countryDropdown.classList.remove('active'); // Tutup dropdown lain
    });


    document.addEventListener('click', (event) => {
        if (!countryDropdown.contains(event.target)) {
            countryDropdown.classList.remove('active');
        }
        if (!providerDropdown.contains(event.target)) {
            providerDropdown.classList.remove('active');
        }
    });

    // Jalankan aplikasi
    initializeApp();
});`;

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;
        const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

        if (path === '/') return new Response(htmlContent, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        if (path === '/style.css') return new Response(cssContent, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
        if (path === '/script.js') {
            const finalJsContent = jsContent
                .replace('https://raw.githubusercontent.com/mrzero0nol/My-v2ray/refs/heads/main/proxyList.txt', `${url.origin}/proxy-list`)
                .replace('https://ipinfo.io/json', `${url.origin}/ip-info`);
            return new Response(finalJsContent, { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } });
        }

        if (path === '/proxy-list') {
            const response = await fetch('https://raw.githubusercontent.com/mrzero0nol/My-v2ray/refs/heads/main/proxyList.txt');
            const newResponse = new Response(response.body, response);
            Object.keys(corsHeaders).forEach(key => newResponse.headers.set(key, corsHeaders[key]));
            return newResponse;
        }

        if (path === '/ip-info') {
            const response = await fetch('https://ipinfo.io/json');
            const newResponse = new Response(response.body, response);
            Object.keys(corsHeaders).forEach(key => newResponse.headers.set(key, corsHeaders[key]));
            return newResponse;
        }

        return new Response('Not Found', { status: 404 });
    },
};
