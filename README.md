# Heavenly Demons VLESS Configurator

Ini adalah aplikasi web statis untuk menghasilkan konfigurasi VLESS berdasarkan daftar proxy yang disediakan.

## Skrip Cloudflare Ping Worker

Untuk fungsionalitas ping yang akurat, aplikasi ini mengandalkan Cloudflare Worker. Worker ini menerima permintaan dengan IP dan port, kemudian mengukur latensi koneksi TCP.

### Cara Deploy

1.  Buat Worker baru di dasbor Cloudflare Anda.
2.  Salin kode di bawah ini dan tempelkan ke editor Worker.
3.  Buka tab **Settings** -> **Compatibility Flags**.
4.  Tambahkan *compatibility flag* `sockets`. Ini **wajib** agar Worker dapat membuka koneksi TCP.
5.  Klik **Deploy**.
6.  Salin URL Worker yang telah di-deploy dan tempelkan ke kolom "URL Ping Kustom" di aplikasi web.

### Kode Worker

```javascript
// Nama Worker: ping-tester-worker
// Compatibility Flag yang dibutuhkan: "sockets"

export default {
  async fetch(request, env, ctx) {
    // Set CORS headers to allow requests from any origin
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests for ping tests
    if (request.method !== 'POST') {
      return new Response('Error: Method not allowed. Please use POST.', {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const { ip, port } = await request.json();

      if (!ip || !port) {
        return new Response(JSON.stringify({ error: 'IP and port are required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const startTime = Date.now();

      // The core of the ping test: attempting a TCP connection
      // This requires the "sockets" compatibility flag to be enabled in the Worker settings.
      const socket = await connect({ hostname: ip, port: parseInt(port, 10) });
      const endTime = Date.now();

      // Immediately close the socket as we only need the connection time
      await socket.close();

      const ping = endTime - startTime;

      return new Response(JSON.stringify({ ip, port, ping }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      // If the connection fails for any reason (e.g., timeout, host unreachable),
      // return a ping of -1. The client-side script interprets this as "N/A".
      console.error(`Connection to ${ip}:${port} failed: ${e.message}`);
      return new Response(JSON.stringify({ ping: -1, error: e.message }), {
        status: 200, // Return 200 OK so the client can parse the -1 ping value
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
```
