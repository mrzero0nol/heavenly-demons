// Salin dan tempel semua kode di bawah ini ke dalam editor Cloudflare Worker Anda.
// Worker ini akan menyajikan aplikasi web VLESS configurator secara lengkap.

// ==========================================================
// KONTEN ASET (HTML, CSS, JAVASCRIPT)
// ==========================================================

// --- Konten HTML ---
// Catatan: Referensi ke style.css dan script.js diubah menjadi path relatif
// agar dapat disajikan oleh worker ini.
const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heavenly Demons</title>
    <link rel="stylesheet" href="/style.css">
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
                <!-- Kontrol Utama -->
                <div class="info-card" id="provider-filter-container" style="grid-area: search;">
                    <span class="icon">🛰️</span>
                    <div class="custom-dropdown">
                        <div class="dropdown-selected" tabindex="0"><span id="selected-provider">Pilih Server VPN</span></div>
                        <div class="dropdown-options" id="provider-options"></div>
                    </div>
                </div>
                <div class="info-card" id="country-filter-container" style="grid-area: country;">
                    <span class="icon">🌍</span>
                    <div class="custom-dropdown">
                        <div class="dropdown-selected" tabindex="0"><span id="selected-country">Pilih Negara</span></div>
                        <div class="dropdown-options" id="country-options"></div>
                    </div>
                </div>
                <div class="info-card" id="settings-btn" style="grid-area: settings;"><span class="icon">⚙️</span><div><h4>Pengaturan</h4></div></div>
                <div class="info-card" id="custom-server-btn" style="grid-area: custom;"><span class="icon">🖥️</span><div><h4>Custom Server</h4></div></div>
                <div class="info-card" id="test-wildcard-btn" style="grid-area: wildcard;"><span class="icon">🔍</span><div><h4>Test Wildcard</h4></div></div>
                <!-- Info & URL Kustom -->
                <div class="info-card" id="ping-settings-btn" style="grid-area: worker;"><span class="icon">📡</span><div><h4>Ping Server</h4><p id="ping-mode-status">Mode: Browser</p></div></div>
                <div class="info-card" style="grid-area: provider;"><div><p>Provider</p><h4 id="isp-info">Mendeteksi...</h4></div></div>
                <div class="info-card" style="grid-area: location;"><div><p>Lokasi</p><h4 id="location-info">Mendeteksi...</h4></div></div>
            </div>
            <div class="server-list-container" id="server-list"></div>
        </main>
    </div>

    <footer class="controls-footer">
        <div class="control-buttons">
            <button class="btn" id="selected-count-btn">0 proxies</button>
            <button class="btn" id="reping-btn">Test Ping</button>
            <button class="btn primary" id="export-btn">Export</button>
        </div>
    </footer>

    <!-- MODAL SETTINGS -->
    <div class="modal-overlay" id="settings-modal-overlay">
        <div class="modal-content">
            <button class="close-btn">&times;</button>
            <h2>Settings</h2>
            <p>Atur parameter untuk generate konfigurasi.</p>
            <div class="form-group"><label for="bug-cdn-input">Bug CDN / Host</label><input type="text" id="bug-cdn-input" placeholder="contoh.bug.com"></div>
            <div class="form-group"><label for="worker-host-input">Worker Host (SNI)</label><input type="text" id="worker-host-input" placeholder="worker.anda.workers.dev"></div>
            <button class="btn" id="save-settings-btn" style="margin-top: 10px;">Simpan Pengaturan</button>
            <hr style="border-color: #333; margin: 20px 0;">
            <h4>Pengaturan Tersimpan</h4>
            <div id="saved-settings-list" class="saved-settings-container"></div>
            <div class="form-group"><label for="uuid-input">UUID</label><input type="text" id="uuid-input" placeholder="UUID VLESS Anda"></div>
            <div class="form-group"><label for="protocol-select">Protocol</label><select id="protocol-select"><option value="vless">VLESS</option><option value="trojan">Trojan</option></select></div>
            <div class="form-group"><label for="tls-select">TLS</label><select id="tls-select"><option value="true">True</option><option value="false">False</option></select></div>
            <button class="btn primary" id="settings-done-btn">Done</button>
        </div>
    </div>

    <!-- MODAL EDIT CUSTOM SERVER -->
    <div class="modal-overlay" id="edit-server-modal-overlay">
        <div class="modal-content">
            <button class="close-btn">&times;</button>
            <h2>Edit Custom Server</h2>
            <input type="hidden" id="edit-server-id-input">
            <div class="form-group"><label for="edit-server-name-input">Nama Server</label><input type="text" id="edit-server-name-input"></div>
            <div class="form-group"><label for="edit-server-ip-input">IP Server</label><input type="text" id="edit-server-ip-input"></div>
            <div class="form-group"><label for="edit-server-port-input">Port</label><input type="text" id="edit-server-port-input"></div>
            <button class="btn primary" id="save-server-changes-btn">Simpan Perubahan</button>
        </div>
    </div>

    <!-- MODAL CUSTOM SERVER -->
    <div class="modal-overlay" id="custom-server-modal-overlay">
        <div class="modal-content">
            <button class="close-btn">&times;</button>
            <h2>Custom Server</h2>
            <div class="form-group"><label for="server-name-input">Nama Server</label><input type="text" id="server-name-input" placeholder="misal: Server SG"></div>
            <div class="form-group"><label for="server-ip-input">IP Server</label><input type="text" id="server-ip-input" placeholder="123.45.67.89"></div>
            <div class="form-group"><label for="server-port-input">Port</label><input type="text" id="server-port-input" placeholder="80"></div>
            <button class="btn primary" id="add-server-btn">Tambahkan</button>
        </div>
    </div>

    <!-- MODAL TEST WILDCARD -->
    <div class="modal-overlay" id="test-wildcard-modal-overlay">
        <div class="modal-content">
            <button class="close-btn">&times;</button>
            <h2>Test Wildcard Domain</h2>
            <div class="form-group"><label for="wildcard-domain-input">Domain</label><input type="text" id="wildcard-domain-input" placeholder="contoh: ava.game.naver.com"></div>
            <button class="btn primary" id="run-wildcard-test-btn">Test</button>
            <div id="wildcard-test-result" class="test-result"></div>
        </div>
    </div>

    <!-- MODAL PING SETTINGS -->
    <div class="modal-overlay" id="ping-settings-modal-overlay">
        <div class="modal-content">
            <button class="close-btn">&times;</button>
            <h2>Pengaturan Ping Server</h2>
            <p>Kosongkan input untuk menggunakan mode ping Browser (default).</p>
            <div class="form-group"><label for="ping-worker-url-input">URL Ping Kustom</label><input type="text" id="ping-worker-url-input" placeholder="https://worker.anda.workers.dev"></div>
            <button class="btn primary" id="save-ping-settings-btn">Simpan</button>
        </div>
    </div>

    <script src="/script.js" defer></script>
</body>
</html>
`;

// --- Konten CSS ---
const cssContent = \`
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Exo+2:wght@400;600&display=swap');
:root{--bg-dark:#0a0a0a;--primary-demonic:#ff003c;--cyber-cyan:#00f6ff;--primary-green:#00ff6a;--text-light:#e0e0e0;--text-dark:#0a0a0a;--surface-light:#1a1a1a;--border-color:#ff003c;--danger-color:#e0115f;--font-main:'Exo 2',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;--font-titles:'Orbitron','Courier New',monospace}
*{box-sizing:border-box;margin:0;padding:0;border-radius:0}
body{font-family:var(--font-main);background-color:var(--bg-dark);color:var(--text-light);font-size:16px;background-image:linear-gradient(rgba(10,10,10,.95),rgba(10,10,10,.95)),url(https://www.transparenttextures.com/patterns/diagmonds.png)}
.container{max-width:900px;margin:0 auto;padding:15px}
header{display:flex;justify-content:center;align-items:center;text-align:center;padding:15px 0;border-bottom:2px solid var(--border-color);box-shadow:0 2px 15px -5px var(--border-color)}
.title-container{display:flex;flex-direction:column;align-items:center;gap:5px}
.telegram-link{color:var(--primary-demonic);text-decoration:none;font-size:.9em;font-weight:600;letter-spacing:1px;transition:all .2s ease;text-shadow:0 0 5px var(--primary-demonic)}
.telegram-link:hover{color:var(--cyber-cyan);text-shadow:0 0 8px var(--cyber-cyan)}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text-light)}
.logo h1{font-family:var(--font-titles);font-size:1.8em;font-weight:700;color:var(--cyber-cyan);text-shadow:0 0 5px var(--cyber-cyan),0 0 10px var(--cyber-cyan)}
.info-grid{display:grid;grid-template-columns:repeat(2,1fr);grid-template-areas:"provider location" "country settings" "search worker" "custom wildcard";gap:10px;margin:20px 0}
.info-card{background-color:var(--surface-light);border:1px solid #333;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transition:all .2s ease}
.info-card>div{display:flex;flex-direction:column;align-items:center}
.info-card:hover{border-color:var(--cyber-cyan);box-shadow:0 0 5px var(--cyber-cyan)}
#settings-btn,#custom-server-btn,#test-wildcard-btn,#ping-settings-btn{cursor:pointer}
.info-card p{font-size:.8em;color:#aaa}
.info-card h4{font-size:1em;font-family:var(--font-main);font-weight:600;color:var(--cyber-cyan)}
.info-card select{width:100%;background-color:var(--bg-dark);color:var(--text-light);border:1px solid var(--border-color);padding:8px;font-size:1em}
.info-card select:focus{outline:none;border-color:var(--cyber-cyan);box-shadow:0 0 10px var(--cyber-cyan)}
.server-list-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.server-group-title{text-transform:uppercase;font-weight:bold;color:var(--primary-demonic);margin:30px 0 10px 0;font-size:.9em;text-shadow:0 0 5px var(--primary-demonic);grid-column:1/-1}
.server-card{background-color:var(--surface-light);padding:8px;border:1px solid #333;border-left:4px solid #555;transition:all .2s ease;display:flex;flex-direction:column;justify-content:space-between;min-height:80px}
.server-card-clickable-area{cursor:pointer;flex-grow:1;display:flex;flex-direction:column;justify-content:space-between}
.server-card:hover{border-left-color:var(--cyber-cyan);background-color:#2a2a2a;box-shadow:0 0 8px var(--cyber-cyan)}
.server-card.selected{border-left-color:var(--primary-demonic);background-color:#221a1d;box-shadow:inset 0 0 10px var(--primary-demonic),0 0 10px var(--primary-demonic)}
.card-actions{display:flex;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid #333}
.card-actions button{flex-grow:1;background:transparent;border:1px solid;padding:5px;font-size:.8em;font-weight:600;cursor:pointer;transition:all .2s ease;text-transform:uppercase}
.card-actions .edit-btn{color:var(--cyber-cyan);border-color:var(--cyber-cyan)}
.card-actions .edit-btn:hover{background-color:var(--cyber-cyan);color:var(--text-dark);box-shadow:0 0 8px var(--cyber-cyan)}
.card-actions .delete-btn{color:var(--primary-demonic);border-color:var(--primary-demonic)}
.card-actions .delete-btn:hover{background-color:var(--primary-demonic);color:var(--text-light);box-shadow:0 0 8px var(--primary-demonic)}
.server-details .provider{font-weight:600;color:var(--text-light);display:flex;align-items:center;gap:5px;font-size:.85em;flex-wrap:wrap}
.country-code{background-color:#333;color:var(--cyber-cyan);padding:2px 5px;font-size:.7em;font-weight:bold;text-transform:uppercase;border:1px solid var(--cyber-cyan);box-shadow:0 0 4px var(--cyber-cyan)}
.server-details .address{font-family:var(--font-main);font-size:.75em;color:#aaa;margin-bottom:8px;word-break:break-all}
.ping-badge{background-color:#333;color:var(--text-light);font-weight:bold;padding:3px 8px;font-size:.8em;text-align:center;transition:background-color .3s ease,color .3s ease;width:100%;margin-top:auto}
.ping-badge.good{background-color:var(--primary-green);color:var(--text-dark);box-shadow:0 0 8px var(--primary-green)}
.ping-badge.medium{background-color:#fdd835;color:var(--text-dark);box-shadow:0 0 8px #fdd835}
.ping-badge.bad{background-color:var(--primary-demonic);box-shadow:0 0 8px var(--primary-demonic)}
.controls-footer{position:sticky;bottom:0;left:0;width:100%;background-color:rgba(10,10,10,.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:15px;border-top:2px solid var(--border-color);margin:20px 0 0 0;display:grid;gap:15px;align-items:center;box-shadow:0 -2px 15px -5px var(--border-color);box-sizing:border-box}
.control-buttons{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}
.btn{background-color:var(--surface-light);color:var(--text-light);border:1px solid var(--cyber-cyan);padding:12px;font-size:1em;font-weight:600;cursor:pointer;transition:all .2s ease;text-align:center;text-transform:uppercase;letter-spacing:1px}
.btn.primary{background-color:transparent;color:var(--primary-demonic);border-color:var(--primary-demonic);font-weight:bold;box-shadow:0 0 5px var(--primary-demonic)}
.btn:hover{background-color:var(--cyber-cyan);color:var(--text-dark);text-shadow:none;box-shadow:0 0 15px var(--cyber-cyan)}
.btn.primary:hover{background-color:var(--primary-demonic);color:var(--text-light);text-shadow:0 0 5px var(--text-light);box-shadow:0 0 20px var(--primary-demonic)}
.modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(10,10,10,.8);backdrop-filter:blur(5px);display:flex;justify-content:center;align-items:center;z-index:2000;opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease}
.modal-overlay.visible{opacity:1;visibility:visible}
.modal-content{background-color:var(--bg-dark);padding:25px;width:90%;max-width:500px;border:2px solid var(--primary-demonic);box-shadow:0 0 25px var(--primary-demonic);position:relative}
.close-btn{position:absolute;top:10px;right:15px;background:none;border:none;color:var(--text-light);font-size:2em;cursor:pointer;transition:all .2s ease}
.close-btn:hover{color:var(--primary-demonic);text-shadow:0 0 8px var(--primary-demonic)}
.form-group label{display:block;margin-bottom:5px;color:var(--cyber-cyan);font-size:.9em;text-transform:uppercase;letter-spacing:.5px}
.form-group input,.form-group select{width:100%;padding:10px;font-size:1em;background-color:var(--surface-light);border:1px solid #333;color:var(--text-light);transition:all .2s ease}
.form-group input:focus,.form-group select:focus{outline:none;border-color:var(--cyber-cyan);box-shadow:0 0 10px var(--cyber-cyan)}
.saved-settings-container{margin-top:10px;max-height:150px;overflow-y:auto;border:1px solid #333;padding:5px;background-color:var(--surface-light)}
.saved-settings-item{display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #2a2a2a;transition:background-color .2s ease}
.saved-settings-item:last-child{border-bottom:none}
.saved-settings-item:hover{background-color:#252525}
.settings-text{flex-grow:1;font-size:.9em;color:var(--text-light);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.settings-text strong{color:var(--cyber-cyan)}
.settings-actions button{background:transparent;border:1px solid;padding:4px 8px;font-size:.8em;font-weight:600;cursor:pointer;transition:all .2s ease;margin-left:5px}
.settings-actions .use-btn{color:var(--primary-green);border-color:var(--primary-green)}
.settings-actions .use-btn:hover{background-color:var(--primary-green);color:var(--text-dark);box-shadow:0 0 8px var(--primary-green)}
.settings-actions .delete-btn{color:var(--primary-demonic);border-color:var(--primary-demonic)}
.settings-actions .delete-btn:hover{background-color:var(--primary-demonic);color:var(--text-light);box-shadow:0 0 8px var(--primary-demonic)}
.test-result{margin-top:15px;padding:10px;background-color:var(--surface-light);border:1px solid #333;min-height:40px;color:var(--text-light);font-family:'Courier New',Courier,monospace}
.toast-notification{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background-color:var(--cyber-cyan);color:var(--text-dark);padding:12px 25px;font-weight:600;z-index:3000;opacity:0;transition:opacity .3s ease,bottom .3s ease;box-shadow:0 0 15px var(--cyber-cyan);border:1px solid var(--cyber-cyan);text-transform:uppercase;letter-spacing:1px}
.toast-notification.visible{bottom:90px;opacity:1}
.toast-notification.error{background-color:var(--danger-color);color:var(--text-light);box-shadow:0 0 15px var(--danger-color);border-color:var(--danger-color)}
#country-filter-container,#provider-filter-container{position:relative;padding:15px}
.custom-dropdown{width:100%;height:100%;position:relative}
.dropdown-selected{width:100%;height:100%;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--cyber-cyan);font-size:1.1em;font-weight:600;font-family:var(--font-main);transition:all .2s ease;outline:none}
.dropdown-selected:focus,.custom-dropdown.active .dropdown-selected{color:var(--cyber-cyan)}
.dropdown-options{position:absolute;top:105%;left:0;right:0;background-color:var(--surface-light);border:1px solid var(--border-color);z-index:1000;max-height:250px;overflow-y:auto;display:none;box-shadow:0 5px 15px rgba(0,0,0,.5)}
.custom-dropdown.active .dropdown-options{display:block}
.dropdown-options .option{padding:12px 15px;cursor:pointer;transition:all .2s ease;border-bottom:1px solid #2a2a2a}
.dropdown-options .option:last-child{border-bottom:none}
.dropdown-options .option:hover,.dropdown-options .option.selected{background-color:var(--primary-demonic);color:var(--text-light);text-shadow:0 0 5px var(--text-light)}
.dropdown-options::-webkit-scrollbar{width:8px}
.dropdown-options::-webkit-scrollbar-track{background:var(--bg-dark)}
.dropdown-options::-webkit-scrollbar-thumb{background-color:var(--primary-demonic);border:2px solid var(--primary-demonic)}
@media (max-width:768px){.server-list-grid{display:flex;flex-wrap:wrap;gap:10px}.server-group-title{flex-basis:100%}.server-card{padding:8px;display:flex;flex-direction:column;justify-content:space-between;flex:1 1 calc(50% - 5px)}.country-code{font-size:.7em;padding:2px 5px}.server-details .provider{font-size:.8em;gap:5px}.server-details .address{font-size:.75em;margin-bottom:6px}.ping-badge{padding:3px 6px;font-size:.75em}.info-grid{grid-template-columns:repeat(2,1fr);grid-template-areas:"provider location" "country settings" "search worker" "custom wildcard";gap:8px}.info-card{padding:8px 4px;gap:4px;min-height:60px}.info-card .icon{font-size:1.1em}.info-card p{font-size:.65em}.info-card h4{font-size:.75em}#ping-worker-url{font-size:.8em;padding:8px}.custom-dropdown .dropdown-selected{font-size:.75em}.controls-footer{padding:8px;gap:8px}.control-buttons{grid-template-columns:repeat(3,1fr)}.btn{padding:10px;font-size:.8em}}
\`;

// --- Konten JavaScript ---
// Catatan: URL eksternal diganti dengan path relatif agar ditangani oleh worker.
const jsContent = \`
document.addEventListener('DOMContentLoaded', function() {
    // --- PENGATURAN ---
    const PROXY_LIST_URL = '/proxy-list'; // Diubah untuk disajikan oleh worker

    // --- Referensi Elemen DOM ---
    const serverListContainer = document.getElementById('server-list');
    const selectedCountBtn = document.getElementById('selected-count-btn');
    const repingBtn = document.getElementById('reping-btn');
    const ispInfo = document.getElementById('isp-info');
    const locationInfo = document.getElementById('location-info');
    const settingsBtn = document.getElementById('settings-btn');
    const exportBtn = document.getElementById('export-btn');
    const settingsModalOverlay = document.getElementById('settings-modal-overlay');
    const customServerModalOverlay = document.getElementById('custom-server-modal-overlay');
    const testWildcardModalOverlay = document.getElementById('test-wildcard-modal-overlay');
    const pingSettingsModalOverlay = document.getElementById('ping-settings-modal-overlay');
    const editServerModalOverlay = document.getElementById('edit-server-modal-overlay');
    const settingsDoneBtn = document.getElementById('settings-done-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const addServerBtn = document.getElementById('add-server-btn');
    const runWildcardTestBtn = document.getElementById('run-wildcard-test-btn');
    const savedSettingsListContainer = document.getElementById('saved-settings-list');
    const customServerBtn = document.getElementById('custom-server-btn');
    const testWildcardBtn = document.getElementById('test-wildcard-btn');
    const pingSettingsBtn = document.getElementById('ping-settings-btn');
    const pingModeStatus = document.getElementById('ping-mode-status');
    const pingWorkerUrlInput = document.getElementById('ping-worker-url-input');
    const savePingSettingsBtn = document.getElementById('save-ping-settings-btn');
    const wildcardDomainInput = document.getElementById('wildcard-domain-input');
    const wildcardTestResult = document.getElementById('wildcard-test-result');
    const serverNameInput = document.getElementById('server-name-input');
    const serverIpInput = document.getElementById('server-ip-input');
    const serverPortInput = document.getElementById('server-port-input');
    const editServerIdInput = document.getElementById('edit-server-id-input');
    const editServerNameInput = document.getElementById('edit-server-name-input');
    const editServerIpInput = document.getElementById('edit-server-ip-input');
    const editServerPortInput = document.getElementById('edit-server-port-input');
    const saveServerChangesBtn = document.getElementById('save-server-changes-btn');
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

    let allServers = [], selectedServers = new Set(), isShowingOnlySelected = false, pingMode = 'browser', customPingUrl = '';

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

    function generateUUIDv4() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'toast-notification';
        if (isError) toast.classList.add('error');
        document.body.appendChild(toast);
        setTimeout(() => { toast.classList.add('visible'); }, 10);
        setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => { document.body.removeChild(toast); }, 300); }, 2700);
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
            loadAndRenderSettings();
            const customServers = JSON.parse(localStorage.getItem('customServers')) || [];
            let remoteServers = [];
            try {
                serverListContainer.innerHTML = '<p>Mengunduh daftar server...</p>';
                const response = await fetch(PROXY_LIST_URL);
                if (response.ok) {
                    const textData = await response.text();
                    remoteServers = parseProxyList(textData);
                } else { console.warn(\`Gagal mengunduh daftar: \${response.statusText}\`); }
            } catch (fetchError) { console.error("Gagal mengunduh daftar server:", fetchError); }
            allServers = [...customServers, ...remoteServers];
            populateCountryFilter(allServers);
            populateProviderFilter(allServers);
            renderServers(allServers);
        } catch (error) {
            console.error("Initialization Error:", error);
            serverListContainer.innerHTML = \`<p style="color: var(--danger-color);">Terjadi kesalahan. <small>\${error.message}</small></p>\`;
        } finally { loader.remove(); }
    }

    function parseProxyList(text) {
        return text.trim().split('\\n').map(line => {
            const parts = line.split(',');
            if (parts.length < 4) return null;
            return { id: \`\${parts[0].trim()}:\${parts[1].trim()}\`, ip: parts[0].trim(), port: parts[1].trim(), country_code: parts[2].trim(), provider: parts[3].trim() };
        }).filter(Boolean);
    }

    function populateCountryFilter(servers) {
        countryOptionsContainer.innerHTML = '';
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
        countryOptionsContainer.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        const selectedOption = countryOptionsContainer.querySelector(\`.option[data-value="\${value}"]\`);
        if (selectedOption) selectedOption.classList.add('selected');
        applyAllFilters();
    }

    function populateProviderFilter(servers) {
        providerOptionsContainer.innerHTML = '';
        const allOption = document.createElement('div');
        allOption.className = 'option selected';
        allOption.dataset.value = 'all';
        allOption.textContent = 'Pilih Server VPN';
        allOption.addEventListener('click', () => selectProvider('all', 'Pilih Server VPN'));
        providerOptionsContainer.appendChild(allOption);
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
        providerOptionsContainer.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        const selectedOption = providerOptionsContainer.querySelector(\`.option[data-value="\${value}"]\`);
        if (selectedOption) selectedOption.classList.add('selected');
        applyAllFilters();
    }

    function renderServers(serversToRender) {
        serverListContainer.innerHTML = serversToRender.length === 0 ? '<p>Tidak ada server yang ditemukan.</p>' : '';
        if (serversToRender.length === 0) return;
        const gridContainer = document.createElement('div');
        gridContainer.className = 'server-list-grid';
        const customServers = serversToRender.filter(s => s.country_code === 'CUSTOM');
        const regularServers = serversToRender.filter(s => s.country_code !== 'CUSTOM');
        if (customServers.length > 0) {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'server-group-title';
            groupTitle.textContent = 'Custom Servers';
            gridContainer.appendChild(groupTitle);
            customServers.forEach(server => gridContainer.appendChild(createServerCard(server)));
        }
        const groupedByProvider = regularServers.reduce((acc, server) => {
            (acc[server.provider] = acc[server.provider] || []).push(server);
            return acc;
        }, {});
        for (const provider in groupedByProvider) {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'server-group-title';
            groupTitle.textContent = provider;
            gridContainer.appendChild(groupTitle);
            groupedByProvider[provider].forEach(server => gridContainer.appendChild(createServerCard(server)));
        }
        serverListContainer.appendChild(gridContainer);
    }

    function createServerCard(server) {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.dataset.serverId = server.id;
        if (selectedServers.has(server.id)) card.classList.add('selected');
        const clickableArea = document.createElement('div');
        clickableArea.className = 'server-card-clickable-area';
        clickableArea.innerHTML = \`<div class="server-details"><p class="provider"><span class="country-code">\${server.country_code}</span> \${server.provider}</p><p class="address">\${server.ip}:\${server.port}</p></div><span class="ping-badge">...</span>\`;
        clickableArea.addEventListener('click', () => toggleServerSelection(card, server.id));
        card.appendChild(clickableArea);
        if (server.country_code === 'CUSTOM') {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'card-actions';
            actionsContainer.innerHTML = \`<button class="edit-btn" data-server-id="\${server.id}">Edit</button><button class="delete-btn" data-server-id="\${server.id}">Hapus</button>\`;
            card.appendChild(actionsContainer);
        }
        return card;
    }

    async function detectUserInfo() {
        try {
            const response = await fetch('/ip-info'); // Diubah untuk disajikan oleh worker
            if (!response.ok) throw new Error('Response not OK');
            const data = await response.json();
            ispInfo.textContent = data.org || 'N/A';
            locationInfo.textContent = \`\${data.city || ''}, \${data.country || ''}\`;
        } catch (error) {
            console.warn("Gagal mendeteksi info pengguna:", error);
            ispInfo.textContent = 'N/A';
            locationInfo.textContent = 'N/A';
        }
    }

    function populateSettingsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const hostFromUrl = urlParams.get('host');
        if (hostFromUrl) workerHostInput.value = hostFromUrl;
        if (!uuidInput.value) uuidInput.value = generateUUIDv4();
    }

    function renderSavedSettings(settings) {
        savedSettingsListContainer.innerHTML = (!settings || settings.length === 0) ? '<p style="font-size: 0.8em; color: #888;">Belum ada pengaturan.</p>' : '';
        if (!settings || settings.length === 0) return;
        settings.forEach((setting, index) => {
            const item = document.createElement('div');
            item.className = 'saved-settings-item';
            item.innerHTML = \`<div class="settings-text" title="Host: \${setting.host}\\nSNI: \${setting.sni}"><strong>Host:</strong> \${setting.host} <br><strong>SNI:</strong> \${setting.sni}</div><div class="settings-actions"><button class="use-btn" data-index="\${index}">Gunakan</button><button class="delete-btn" data-index="\${index}">Hapus</button></div>\`;
            savedSettingsListContainer.appendChild(item);
        });
    }

    function loadAndRenderSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('savedHostSniSettings')) || [];
        renderSavedSettings(savedSettings);
        const lastUsedSetting = JSON.parse(localStorage.getItem('lastUsedHostSni'));
        if (lastUsedSetting) {
            bugCdnInput.value = lastUsedSetting.host || '';
            workerHostInput.value = lastUsedSetting.sni || '';
        }
    }

    function handleSaveSettings() {
        const host = bugCdnInput.value.trim(), sni = workerHostInput.value.trim();
        if (!host || !sni) { showToast("Host dan SNI tidak boleh kosong.", true); return; }
        let savedSettings = JSON.parse(localStorage.getItem('savedHostSniSettings')) || [];
        if (savedSettings.some(s => s.host === host && s.sni === sni)) { showToast("Pengaturan ini sudah ada.", true); return; }
        savedSettings.push({ host, sni });
        localStorage.setItem('savedHostSniSettings', JSON.stringify(savedSettings));
        localStorage.setItem('lastUsedHostSni', JSON.stringify({ host, sni }));
        renderSavedSettings(savedSettings);
        showToast("Pengaturan disimpan!");
    }

    function handleUseSetting(index) {
        const savedSettings = JSON.parse(localStorage.getItem('savedHostSniSettings')) || [];
        if (savedSettings[index]) {
            const { host, sni } = savedSettings[index];
            bugCdnInput.value = host;
            workerHostInput.value = sni;
            localStorage.setItem('lastUsedHostSni', JSON.stringify({ host, sni }));
            showToast("Pengaturan dimuat.");
        }
    }

    function handleDeleteSetting(index) {
        if (!confirm('Yakin ingin menghapus?')) return;
        let savedSettings = JSON.parse(localStorage.getItem('savedHostSniSettings')) || [];
        savedSettings.splice(index, 1);
        localStorage.setItem('savedHostSniSettings', JSON.stringify(savedSettings));
        renderSavedSettings(savedSettings);
        showToast("Pengaturan dihapus.");
    }

    function loadCustomServers() { return JSON.parse(localStorage.getItem('customServers')) || []; }

    function handleAddCustomServer() {
        const name = serverNameInput.value.trim(), ip = serverIpInput.value.trim(), port = serverPortInput.value.trim();
        if (!name || !ip || !port) { showToast("Harap isi semua kolom.", true); return; }
        if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) { showToast("Format IP tidak valid.", true); return; }
        if (isNaN(port) || port < 1 || port > 65535) { showToast("Port harus antara 1-65535.", true); return; }
        const newServer = { id: \`\${ip}:\${port}\`, ip, port, country_code: 'CUSTOM', provider: name };
        if (allServers.some(s => s.id === newServer.id)) { showToast("Server ini sudah ada.", true); return; }
        let customServers = loadCustomServers();
        customServers.push(newServer);
        localStorage.setItem('customServers', JSON.stringify(customServers));
        allServers.unshift(newServer);
        applyAllFilters();
        closeModal(customServerModalOverlay);
        showToast("Custom server ditambahkan!");
        serverNameInput.value = ''; serverIpInput.value = ''; serverPortInput.value = '';
    }

    function handleDeleteCustomServer(serverId) {
        if (!confirm('Yakin ingin menghapus server ini?')) return;
        let customServers = loadCustomServers();
        const updatedCustomServers = customServers.filter(s => s.id !== serverId);
        localStorage.setItem('customServers', JSON.stringify(updatedCustomServers));
        allServers = allServers.filter(s => s.id !== serverId);
        if (selectedServers.has(serverId)) { selectedServers.delete(serverId); updateSelectedCount(); }
        applyAllFilters();
        showToast("Custom server dihapus.");
    }

    function handleSaveChanges() {
        const serverIdToUpdate = editServerIdInput.value, newName = editServerNameInput.value.trim(), newIp = editServerIpInput.value.trim(), newPort = editServerPortInput.value.trim();
        if (!newName || !newIp || !newPort) { showToast("Harap isi semua kolom.", true); return; }
        if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newIp)) { showToast("Format IP tidak valid.", true); return; }
        if (isNaN(newPort) || newPort < 1 || newPort > 65535) { showToast("Port harus 1-65535.", true); return; }
        const newServerId = \`\${newIp}:\${newPort}\`;
        if (allServers.some(s => s.id === newServerId && s.id !== serverIdToUpdate)) { showToast("Server dengan IP & Port ini sudah ada.", true); return; }
        let customServers = loadCustomServers();
        const updatedCustomServers = customServers.map(s => s.id === serverIdToUpdate ? { ...s, id: newServerId, ip: newIp, port: newPort, provider: newName } : s);
        localStorage.setItem('customServers', JSON.stringify(updatedCustomServers));
        const serverIndexInMemory = allServers.findIndex(s => s.id === serverIdToUpdate);
        if (serverIndexInMemory !== -1) allServers[serverIndexInMemory] = { ...allServers[serverIndexInMemory], id: newServerId, ip: newIp, port: newPort, provider: newName };
        if (serverIdToUpdate !== newServerId && selectedServers.has(serverIdToUpdate)) { selectedServers.delete(serverIdToUpdate); selectedServers.add(newServerId); }
        closeModal(editServerModalOverlay);
        applyAllFilters();
        showToast("Custom server diperbarui.");
    }

    async function handleWildcardTest() {
        let domain = wildcardDomainInput.value.trim();
        if (!domain) { wildcardTestResult.textContent = 'Error: Domain kosong.'; wildcardTestResult.style.color = 'var(--danger-color)'; return; }
        if (!domain.startsWith('http')) domain = 'https://' + domain;
        wildcardTestResult.textContent = \`Memeriksa \${domain}...\`;
        wildcardTestResult.style.color = 'var(--text-light)';
        try {
            const cfCheckResponse = await fetch(\`\${domain}/cdn-cgi/trace\`, { method: 'GET', signal: AbortSignal.timeout(8000) });
            const cfCheckText = await cfCheckResponse.text();
            if (cfCheckText.includes('fl=') && cfCheckText.includes('h=')) {
                wildcardTestResult.textContent = \`SUKSES!\\nDomain ini kemungkinan besar menggunakan Cloudflare.\`;
                wildcardTestResult.style.color = 'var(--primary-green)';
            } else {
                wildcardTestResult.textContent = \`INFO\\nTidak ada tanda-tanda jelas Cloudflare.\`;
                wildcardTestResult.style.color = 'var(--cyber-cyan)';
            }
        } catch (error) {
            wildcardTestResult.textContent = \`GAGAL!\\nTidak dapat terhubung.\\nError: \${error.name}\`;
            wildcardTestResult.style.color = 'var(--danger-color)';
        }
    }

    async function pingServer(ip, port, timeout = 5000) {
        if (pingMode === 'worker') {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(customPingUrl, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip, port }) });
                clearTimeout(id);
                if (!response.ok) return -1;
                const data = await response.json();
                return data.ping;
            } catch (error) { clearTimeout(id); return -1; }
        } else {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const startTime = Date.now();
            try {
                await fetch(\`http://\${ip}:\${port}\`, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
                clearTimeout(id);
                return Date.now() - startTime;
            } catch (error) { clearTimeout(id); return -1; }
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
                requestAnimationFrame(() => { pingBadge.textContent = '...'; pingBadge.className = 'ping-badge'; });
                const pingValue = await pingServer(ip, port);
                requestAnimationFrame(() => {
                    pingBadge.classList.remove('good', 'medium', 'bad');
                    if (pingValue === -1) { pingBadge.textContent = 'N/A'; } else {
                        pingBadge.textContent = \`\${pingValue} ms\`;
                        if (pingValue < 250) pingBadge.classList.add('good');
                        else if (pingValue < 1000) pingBadge.classList.add('medium');
                        else pingBadge.classList.add('bad');
                    }
                });
            }
        }
    }

    function toggleServerSelection(cardElement, serverId) {
        if (selectedServers.has(serverId)) { selectedServers.delete(serverId); cardElement.classList.remove('selected'); }
        else { selectedServers.add(serverId); cardElement.classList.add('selected'); }
        updateSelectedCount();
        if (isShowingOnlySelected && selectedServers.size === 0) { isShowingOnlySelected = false; applyAllFilters(); }
    }

    function updateSelectedCount() { selectedCountBtn.textContent = \`\${selectedServers.size} proxies\`; }

    function applyAllFilters() {
        const selectedProvider = providerDropdown.dataset.value || 'all';
        const selectedCountry = countryDropdown.dataset.value || 'all';
        let serversToDisplay = isShowingOnlySelected ? allServers.filter(s => selectedServers.has(s.id)) : allServers;
        if (selectedCountry !== 'all') serversToDisplay = serversToDisplay.filter(s => s.country_code === selectedCountry);
        if (selectedProvider !== 'all') serversToDisplay = serversToDisplay.filter(s => s.provider === selectedProvider);
        renderServers(serversToDisplay);
    }

    function exportProxies() {
        if (selectedServers.size === 0) { showToast("Pilih setidaknya satu server!", true); return; }
        const bugCdn = bugCdnInput.value.trim(), workerHost = workerHostInput.value.trim(), uuid = uuidInput.value.trim(), selectedProtocol = protocolSelect.value;
        if (!bugCdn || !workerHost || !uuid) { showToast("Harap isi semua kolom di Settings.", true); settingsModalOverlay.classList.add('visible'); return; }
        let outputUris = [];
        selectedServers.forEach(serverId => {
            const server = allServers.find(s => s.id === serverId);
            if (server) {
                const path = \`/\${server.ip}-\${server.port}\`;
                const name = \`\${server.country_code} \${server.provider} [\${server.ip}]\`;
                const useTls = tlsSelect.value === 'true';
                const port = useTls ? '443' : '80';
                let uri = '';
                if (selectedProtocol === 'vless') {
                    uri = \`vless://\${uuid}@\${bugCdn}:\${port}?encryption=none&type=ws&flow=&host=\${workerHost}&security=\${useTls ? 'tls' : 'none'}&sni=\${workerHost}&path=\${encodeURIComponent(path)}#\${encodeURIComponent(name)}\`;
                } else if (selectedProtocol === 'trojan') {
                    uri = \`trojan://\${uuid}@\${bugCdn}:\${port}?type=ws&host=\${workerHost}&security=\${useTls ? 'tls' : 'none'}&sni=\${workerHost}&path=\${encodeURIComponent(path)}#\${encodeURIComponent(name)}\`;
                }
                if (uri) outputUris.push(uri);
            }
        });
        if (outputUris.length > 0) {
            navigator.clipboard.writeText(outputUris.join('\\n')).then(() => showToast("Konfigurasi berhasil disalin!"))
            .catch(err => showToast("Gagal menyalin.", true));
        }
    }

    function closeModal(modalElement) { modalElement.classList.remove('visible'); }

    serverListContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) handleDeleteCustomServer(event.target.dataset.serverId);
        if (event.target.classList.contains('edit-btn')) {
            const serverToEdit = allServers.find(s => s.id === event.target.dataset.serverId);
            if (serverToEdit) {
                editServerIdInput.value = serverToEdit.id;
                editServerNameInput.value = serverToEdit.provider;
                editServerIpInput.value = serverToEdit.ip;
                editServerPortInput.value = serverToEdit.port;
                editServerModalOverlay.classList.add('visible');
            }
        }
    });

    selectedCountBtn.addEventListener('click', () => {
        if (selectedServers.size === 0) return;
        isShowingOnlySelected = !isShowingOnlySelected;
        applyAllFilters();
        selectedCountBtn.style.backgroundColor = isShowingOnlySelected ? 'var(--primary-green)' : '';
        selectedCountBtn.style.color = isShowingOnlySelected ? 'var(--text-dark)' : '';
    });

    settingsBtn.addEventListener('click', () => settingsModalOverlay.classList.add('visible'));
    customServerBtn.addEventListener('click', () => customServerModalOverlay.classList.add('visible'));
    testWildcardBtn.addEventListener('click', () => testWildcardModalOverlay.classList.add('visible'));
    pingSettingsBtn.addEventListener('click', () => pingSettingsModalOverlay.classList.add('visible'));

    document.querySelectorAll('.modal-overlay').forEach(modal => modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); }));
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay'))));

    settingsDoneBtn.addEventListener('click', () => closeModal(settingsModalOverlay));
    saveSettingsBtn.addEventListener('click', handleSaveSettings);
    addServerBtn.addEventListener('click', handleAddCustomServer);
    runWildcardTestBtn.addEventListener('click', handleWildcardTest);
    saveServerChangesBtn.addEventListener('click', handleSaveChanges);
    savePingSettingsBtn.addEventListener('click', () => {
        let newUrl = pingWorkerUrlInput.value.trim();
        if (newUrl) {
            if (!newUrl.startsWith('http')) newUrl = 'https://' + newUrl;
            localStorage.setItem('pingTesterUrl', newUrl);
            pingModeStatus.textContent = 'Mode: Custom URL';
            showToast('Mode Ping diubah ke Custom URL.');
        } else {
            localStorage.removeItem('pingTesterUrl');
            pingModeStatus.textContent = 'Mode: Browser';
            showToast('Mode Ping dikembalikan ke Browser.');
        }
        setupPingMode();
        closeModal(pingSettingsModalOverlay);
    });

    savedSettingsListContainer.addEventListener('click', e => {
        if (e.target.classList.contains('use-btn')) handleUseSetting(parseInt(e.target.dataset.index, 10));
        if (e.target.classList.contains('delete-btn')) handleDeleteSetting(parseInt(e.target.dataset.index, 10));
    });

    exportBtn.addEventListener('click', exportProxies);
    repingBtn.addEventListener('click', () => { showToast("Memulai tes ping..."); pingAllVisibleServers(); });

    countryDropdown.querySelector('.dropdown-selected').addEventListener('click', () => { countryDropdown.classList.toggle('active'); providerDropdown.classList.remove('active'); });
    providerDropdown.querySelector('.dropdown-selected').addEventListener('click', () => { providerDropdown.classList.toggle('active'); countryDropdown.classList.remove('active'); });
    document.addEventListener('click', e => {
        if (!countryDropdown.contains(e.target)) countryDropdown.classList.remove('active');
        if (!providerDropdown.contains(e.target)) providerDropdown.classList.remove('active');
    });

    initializeApp();
});
\`;

// ==========================================================
// LOGIKA CLOUDFLARE WORKER
// ==========================================================

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Atur header CORS untuk respons proxy
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Menyajikan aset utama
        if (path === '/') {
            return new Response(htmlContent, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        if (path === '/style.css') {
            return new Response(cssContent, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
        }
        if (path === '/script.js') {
            return new Response(jsContent, { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } });
        }

        // --- Proxy untuk permintaan API lintas-domain ---

        // Proxy untuk daftar proxy dari GitHub
        if (path === '/proxy-list') {
            const PROXY_LIST_URL = 'https://raw.githubusercontent.com/mrzero0nol/My-v2ray/refs/heads/main/proxyList.txt';
            const response = await fetch(PROXY_LIST_URL);
            // Buat respons baru dengan header CORS
            const newResponse = new Response(response.body, response);
            Object.keys(corsHeaders).forEach(key => newResponse.headers.set(key, corsHeaders[key]));
            return newResponse;
        }

        // Proxy untuk info IP dari ipinfo.io
        if (path === '/ip-info') {
            const response = await fetch('https://ipinfo.io/json');
            // Buat respons baru dengan header CORS
            const newResponse = new Response(response.body, response);
            Object.keys(corsHeaders).forEach(key => newResponse.headers.set(key, corsHeaders[key]));
            return newResponse;
        }

        // Jika tidak ada path yang cocok, kembalikan 404
        return new Response('Not Found', { status: 404 });
    },
};
