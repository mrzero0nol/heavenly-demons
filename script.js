// ==========================================================
// script.js (v7.0 - Worker-Based Ping)
// Heavenly Demons Configurator
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    // --- PENGATURAN ---
    const PROXY_LIST_URL = 'https://raw.githubusercontent.com/FoolVPN-ID/Nautica/main/proxyList.txt';
    const DEFAULT_PING_TESTER_URL = 'https://ping-tester-worker.zallstore.workers.dev'; // URL Worker Ping Default

    // --- Referensi Elemen DOM ---
    const serverListContainer = document.getElementById('server-list');
    const searchInput = document.getElementById('search-input');
    const pingWorkerUrlInput = document.getElementById('ping-worker-url');
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

    // Tombol Aksi Modal
    const settingsDoneBtn = document.getElementById('settings-done-btn');
    const addServerBtn = document.getElementById('add-server-btn');
    const runWildcardTestBtn = document.getElementById('run-wildcard-test-btn');

    // Tombol Pembuka Modal
    const customServerBtn = document.getElementById('custom-server-btn');
    const testWildcardBtn = document.getElementById('test-wildcard-btn');

    // Input & Result Wildcard
    const wildcardDomainInput = document.getElementById('wildcard-domain-input');
    const wildcardTestResult = document.getElementById('wildcard-test-result');

    // Input Custom Server
    const serverNameInput = document.getElementById('server-name-input');
    const serverIpInput = document.getElementById('server-ip-input');
    const serverPortInput = document.getElementById('server-port-input');

    // Elemen Dropdown Kustom
    const customDropdown = document.querySelector('.custom-dropdown');
    const selectedCountryEl = document.getElementById('selected-country');
    const countryOptionsContainer = document.getElementById('country-options');

    const bugCdnInput = document.getElementById('bug-cdn-input');
    const workerHostInput = document.getElementById('worker-host-input');
    const uuidInput = document.getElementById('uuid-input');
    const protocolSelect = document.getElementById('protocol-select');
    const tlsSelect = document.getElementById('tls-select');
    
    // --- State Aplikasi ---
    let allServers = [];
    let selectedServers = new Set();
    let isShowingOnlySelected = false;
    let activePingTesterUrl = DEFAULT_PING_TESTER_URL;

    // =======================================================
    // FUNGSI INTI & PEMBANTU
    // =======================================================

    function setupPingWorkerUrl() {
        // Selalu gunakan URL default sebagai dasar, tetapi biarkan input bisa kosong
        activePingTesterUrl = DEFAULT_PING_TESTER_URL;
        let savedUrl = localStorage.getItem('pingTesterUrl');

        if (savedUrl) {
            // PERBAIKAN: Pastikan URL yang tersimpan menggunakan HTTPS
            savedUrl = savedUrl.trim();
            if (!savedUrl.startsWith('http://') && !savedUrl.startsWith('https://')) {
                savedUrl = 'https://' + savedUrl;
            }
            if (savedUrl.startsWith('http://')) {
                savedUrl = savedUrl.replace('http://', 'https://');
            }
            pingWorkerUrlInput.value = savedUrl;
            activePingTesterUrl = savedUrl;
        }
        // Jangan set nilai default ke input field, biarkan placeholder yang bekerja

        pingWorkerUrlInput.addEventListener('change', () => {
            let newUrl = pingWorkerUrlInput.value.trim();
            if (newUrl) {
                // PERBAIKAN: Pastikan URL selalu HTTPS untuk menghindari redirect yang mengubah POST menjadi GET.
                if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                    newUrl = 'https://' + newUrl;
                }
                if (newUrl.startsWith('http://')) {
                    newUrl = newUrl.replace('http://', 'https://');
                }

                activePingTesterUrl = newUrl;
                pingWorkerUrlInput.value = newUrl; // Tampilkan URL yang sudah dikoreksi kepada pengguna
                localStorage.setItem('pingTesterUrl', newUrl);
                showToast('URL Worker Ping diperbarui. Tekan Test Ping untuk memulai.');
            } else {
                // Jika pengguna mengosongkan input, kembali ke default
                activePingTesterUrl = DEFAULT_PING_TESTER_URL;
                localStorage.removeItem('pingTesterUrl');
                pingWorkerUrlInput.value = ''; // Kosongkan input untuk menampilkan placeholder
                showToast('URL Worker Ping dikembalikan ke default.');
            }
        });
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
            setupPingWorkerUrl();
            detectUserInfo();
            populateSettingsFromUrl();

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
        customDropdown.dataset.value = value;
        customDropdown.classList.remove('active');

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

    function renderServers(serversToRender) {
        serverListContainer.innerHTML = '';
        if (serversToRender.length === 0) {
            serverListContainer.innerHTML = '<p>Tidak ada server yang ditemukan.</p>';
            return;
        }

        const customServers = serversToRender.filter(s => s.country_code === 'CUSTOM');
        const regularServers = serversToRender.filter(s => s.country_code !== 'CUSTOM');

        // Render Custom Servers terlebih dahulu jika ada
        if (customServers.length > 0) {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'server-group-title';
            groupTitle.textContent = 'Custom Servers';
            serverListContainer.appendChild(groupTitle);

            customServers.forEach(server => {
                const card = createServerCard(server);
                serverListContainer.appendChild(card);
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
            serverListContainer.appendChild(groupTitle);
            
            groupedByProvider[provider].forEach(server => {
                const card = createServerCard(server);
                serverListContainer.appendChild(card);
            });
        }
        // pingAllVisibleServers(); // Dihapus untuk mencegah ping otomatis
    }

    function createServerCard(server) {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.dataset.serverId = server.id;
        if (selectedServers.has(server.id)) {
            card.classList.add('selected');
        }

        card.innerHTML = `
            <div class="server-details">
                <p class="provider">
                    <span class="country-code">${server.country_code}</span>
                    ${server.provider}
                </p>
                <p class="address">${server.ip}:${server.port}</p>
            </div>
            <span class="ping-badge">...</span>
        `;
        card.addEventListener('click', () => toggleServerSelection(card, server.id));
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

        wildcardTestResult.textContent = `Menguji ${domain}...`;
        wildcardTestResult.style.color = 'var(--text-light)';
        const startTime = Date.now();

        try {
            // Menggunakan mode 'no-cors' untuk menghindari error CORS,
            // karena kita hanya peduli jika domain dapat dijangkau, bukan membaca responsnya.
            const response = await fetch(domain, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(5000) });
            const duration = Date.now() - startTime;

            // Dalam mode no-cors, status akan 0, jadi kita anggap berhasil jika tidak ada error.
            wildcardTestResult.textContent = `SUKSES!\nDomain merespons dalam ${duration} md.`;
            wildcardTestResult.style.color = 'var(--cyber-cyan)';

        } catch (error) {
            console.error("Wildcard Test Error:", error);
            wildcardTestResult.textContent = `GAGAL!\nError: ${error.name === 'AbortError' ? 'Timeout' : 'Tidak dapat dijangkau'}. Periksa konsol untuk detail.`;
            wildcardTestResult.style.color = 'var(--danger-color)';
        }
    }

    // =======================================================
    // FUNGSI PING (VERSI 4.0 - WORKER-BASED PING)
    // =======================================================
    
    async function pingServer(ip, port, timeout = 8000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(activePingTesterUrl, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ip, port }),
            });

            clearTimeout(id);

            if (!response.ok) {
                console.error(`Ping worker returned an error for ${ip}:${port}: ${response.statusText}`);
                return -1;
            }

            const data = await response.json();
            return data.ping;

        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                console.warn(`Ping request for ${ip}:${port} timed out.`);
            } else {
                console.error(`Error pinging ${ip}:${port} via worker:`, error);
            }
            return -1;
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
                    pingBadge.style.backgroundColor = '';
                });

                // Tunggu hasil ping untuk server ini sebelum melanjutkan ke server berikutnya
                const pingValue = await pingServer(ip, port);

                // Perbarui UI dengan hasil ping
                requestAnimationFrame(() => {
                    if (pingValue === -1) {
                        pingBadge.textContent = 'N/A';
                        pingBadge.style.backgroundColor = '#555';
                    } else {
                        pingBadge.textContent = `${pingValue} ms`;
                        if (pingValue < 250) pingBadge.style.backgroundColor = 'var(--cyber-cyan)';
                        else if (pingValue < 1000) pingBadge.style.backgroundColor = '#fdd835';
                        else pingBadge.style.backgroundColor = 'var(--primary-demonic)';
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
        const query = searchInput.value.toLowerCase();
        const selectedCountry = customDropdown.dataset.value || 'all';
        
        let serversToDisplay = allServers;
        if (isShowingOnlySelected) {
            serversToDisplay = allServers.filter(s => selectedServers.has(s.id));
        }
        if (selectedCountry !== 'all') {
            serversToDisplay = serversToDisplay.filter(s => s.country_code === selectedCountry);
        }
        if (query) {
            serversToDisplay = serversToDisplay.filter(s => 
                s.provider.toLowerCase().includes(query) ||
                s.country_code.toLowerCase().includes(query) ||
                s.ip.includes(query)
            );
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
        const uuid = uuidInput.value.trim();
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
                
                // --- LOGIKA BARU SESUAI CONTOH ---
                // Alamat (Address) sekarang menggunakan Bug CDN.
                // Port adalah 443 untuk TLS, 80 untuk non-TLS.
                // Host header (host) sekarang menggunakan Worker Host.
                // SNI (sni) tetap menggunakan Worker Host.
                // Ditambahkan parameter flow.
                const uri = `${protocolSelect.value}://${uuid}@${bugCdn}:${port}` +
                            `?encryption=none&type=ws&flow=` +
                            `&host=${workerHost}` + // Host header adalah Worker Host
                            `&security=${useTls ? 'tls' : 'none'}` +
                            `&sni=${workerHost}` + // SNI adalah Worker Host
                            `&path=${encodeURIComponent(path)}` +
                            `#${encodeURIComponent(name)}`;
                outputUris.push(uri);
            }
        });

        const resultString = outputUris.join('\n');
        navigator.clipboard.writeText(resultString).then(() => {
            showToast("Konfigurasi berhasil disalin!");
        }).catch(err => {
            console.error('Gagal menyalin: ', err);
            showToast("Gagal menyalin ke clipboard.", true);
        });
    }

    function openSettingsModal() { settingsModalOverlay.classList.add('visible'); }
    function closeSettingsModal() { settingsModalOverlay.classList.remove('visible'); }
    function openCustomServerModal() { customServerModalOverlay.classList.add('visible'); }
    function closeCustomServerModal() { customServerModalOverlay.classList.remove('visible'); }
    function openTestWildcardModal() { testWildcardModalOverlay.classList.add('visible'); }

    // Fungsi Generik untuk menutup modal
    function closeModal(modalElement) {
        modalElement.classList.remove('visible');
    }

    // =======================================================
    // EVENT LISTENERS
    // =======================================================
    
    searchInput.addEventListener('input', applyAllFilters);

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
    addServerBtn.addEventListener('click', handleAddCustomServer);
    runWildcardTestBtn.addEventListener('click', handleWildcardTest);

    exportBtn.addEventListener('click', exportProxies);
    repingBtn.addEventListener('click', () => {
        showToast("Memulai ulang tes ping...");
        pingAllVisibleServers();
    });

    // Event listener untuk dropdown kustom
    customDropdown.querySelector('.dropdown-selected').addEventListener('click', () => {
        customDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!customDropdown.contains(event.target)) {
            customDropdown.classList.remove('active');
        }
    });

    // Jalankan aplikasi
    initializeApp();
});
