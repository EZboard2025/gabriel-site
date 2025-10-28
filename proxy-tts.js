const http = require('http');
const https = require('https');

const TTS_WEBHOOK_URL = 'https://ezboard.app.n8n.cloud/webhook/0ffb3d05-ba95-40e1-b3f1-9bd963fd2b59';

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/tts') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('📥 Recebendo texto para TTS:', body);

            const postData = body;

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const n8nReq = https.request(TTS_WEBHOOK_URL, options, (n8nRes) => {
                console.log('✅ Status do n8n TTS:', n8nRes.statusCode);

                // Se for erro, captura a resposta
                if (n8nRes.statusCode !== 200) {
                    let errorBody = '';
                    n8nRes.on('data', chunk => {
                        errorBody += chunk.toString();
                    });
                    n8nRes.on('end', () => {
                        console.error('❌ Erro do n8n:', errorBody);
                        res.writeHead(n8nRes.statusCode, { 'Content-Type': 'application/json' });
                        res.end(errorBody);
                    });
                } else {
                    // Repassa os headers (exceto CORS que já configuramos)
                    Object.keys(n8nRes.headers).forEach(key => {
                        if (!key.toLowerCase().startsWith('access-control')) {
                            res.setHeader(key, n8nRes.headers[key]);
                        }
                    });

                    res.writeHead(n8nRes.statusCode);

                    // Stream o áudio diretamente
                    n8nRes.pipe(res);

                    n8nRes.on('end', () => {
                        console.log('🔊 Áudio enviado com sucesso');
                    });
                }
            });

            n8nReq.on('error', (error) => {
                console.error('❌ Erro no TTS n8n:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            });

            n8nReq.write(postData);
            n8nReq.end();
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`🎤 Proxy TTS rodando em http://localhost:${PORT}`);
});
