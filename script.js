// ==========================================================
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
                    console.warn(`Gagal mengunduh daftar: ${response.statusText}`);
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
            serverListContainer.innerHTML = `<p style="color: var(--danger-color);">Terjadi kesalahan saat inisialisasi. <br><small>${error.message}</small></p>`;
        } finally {
            loader.remove(); // Selalu hapus loader
        }
    }

    function parseProxyList(text) {
        return text.trim().split('\n').map(line => {
            const parts = line.split(',');
            if (parts.length < 4) return null;
            return {
                id: `${parts[0].trim()}:${parts[1].trim()}`,
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
        const selectedOption = countryOptionsContainer.querySelector(`.option[data-value="${value}"]`);
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
        const selectedOption = providerOptionsContainer.querySelector(`.option[data-value="${value}"]`);
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
    clickableArea.innerHTML = `
            <div class="server-details">
                <p class="provider">
                    <span class="country-code">${server.country_code}</span>
                    ${server.provider}
                </p>
                <p class="address">${server.ip}:${server.port}</p>
            </div>
            <span class="ping-badge">...</span>
        `;
    clickableArea.addEventListener('click', () => toggleServerSelection(card, server.id));
    card.appendChild(clickableArea);

    // Tambahkan tombol Edit/Hapus untuk server kustom
    if (server.country_code === 'CUSTOM') {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'card-actions';
        actionsContainer.innerHTML = `
            <button class="edit-btn" data-server-id="${server.id}">Edit</button>
            <button class="delete-btn" data-server-id="${server.id}">Hapus</button>
        `;
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
            locationInfo.textContent = `${data.city || ''}, ${data.country || ''}`;
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
            item.innerHTML = `
                <div class="settings-text" title="Host: ${setting.host}\nSNI: ${setting.sni}">
                    <strong>Host:</strong> ${setting.host} <br>
                    <strong>SNI:</strong> ${setting.sni}
                </div>
                <div class="settings-actions">
                    <button class="use-btn" data-index="${index}">Gunakan</button>
                    <button class="delete-btn" data-index="${index}">Hapus</button>
                </div>
            `;
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
            id: `${ip}:${port}`,
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

        const newServerId = `${newIp}:${newPort}`;
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

        wildcardTestResult.textContent = `Memeriksa ${domain}...`;
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
            const cfCheckResponse = await fetch(`${domain}/cdn-cgi/trace`, { method: 'GET', signal: AbortSignal.timeout(8000) });
            const cfCheckText = await cfCheckResponse.text();

            if (cfCheckText.includes('fl=') && cfCheckText.includes('h=')) {
                 wildcardTestResult.textContent = `SUKSES!\nDomain ini kemungkinan besar menggunakan Cloudflare.`;
                 wildcardTestResult.style.color = 'var(--primary-green)';
            } else {
                 wildcardTestResult.textContent = `INFO\nTidak ada tanda-tanda jelas Cloudflare. Domain mungkin tidak menggunakannya atau menyembunyikan jejaknya.`;
                 wildcardTestResult.style.color = 'var(--cyber-cyan)';
            }

        } catch (error) {
            console.error("Cloudflare Check Error:", error);
            wildcardTestResult.textContent = `GAGAL!\nTidak dapat terhubung ke domain. Mungkin down atau salah ketik.\nError: ${error.name}`;
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
                await fetch(`http://${ip}:${port}`, {
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
                        pingBadge.textContent = `${pingValue} ms`;
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
        selectedCountBtn.textContent = `${selectedServers.size} proxies`;
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
                const path = `/${server.ip}-${server.port}`;
                const name = `${server.country_code} ${server.provider} [${server.ip}]`;
                const useTls = tlsSelect.value === 'true';
                const port = useTls ? '443' : '80';
                
                let uri = '';

                if (selectedProtocol === 'vless') {
                    // --- Logika untuk VLESS ---
                    uri = `vless://${uuid}@${bugCdn}:${port}` +
                          `?encryption=none&type=ws&flow=` +
                          `&host=${workerHost}` +
                          `&security=${useTls ? 'tls' : 'none'}` +
                          `&sni=${workerHost}` +
                          `&path=${encodeURIComponent(path)}` +
                          `#${encodeURIComponent(name)}`;
                } else if (selectedProtocol === 'trojan') {
                    // --- Logika untuk Trojan ---
                    // Trojan menggunakan UUID sebagai password dan tidak memiliki parameter 'encryption' & 'flow'.
                    uri = `trojan://${uuid}@${bugCdn}:${port}` +
                          `?type=ws` +
                          `&host=${workerHost}` +
                          `&security=${useTls ? 'tls' : 'none'}` +
                          `&sni=${workerHost}` +
                          `&path=${encodeURIComponent(path)}` +
                          `#${encodeURIComponent(name)}`;
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
});
