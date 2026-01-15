const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const port = process.env.PORT || 3000;

let qrCodeData = '';
let clientReady = false;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './auth_info' }),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true
    }
});

client.on('qr', (qr) => {
    console.log('NUEVO QR GENERADO');
    qrcode.toDataURL(qr, (err, url) => {
        qrCodeData = url;
    });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Conectado!');
    clientReady = true;
    qrCodeData = '';
});

// RESPUESTAS AUTOMÁTICAS
client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        const mensaje = msg.body.toLowerCase();

        // Pausa aleatoria entre 2 y 5 segundos (Anti-Ban)
        const delay = Math.floor(Math.random() * 3000) + 2000;
        
        // EJEMPLO: Si escriben "precio"
        if (mensaje.includes('precio') || mensaje.includes('costo')) {
            await new Promise(r => setTimeout(r, delay)); 
            chat.sendStateTyping(); 
            await new Promise(r => setTimeout(r, 2000)); 
            msg.reply('Hola, nuestros precios están en Bolivianos (Bs). ¿Qué modelo buscas?');
        }
    } catch (error) {
        console.error(error);
    }
});

client.initialize();

// PÁGINA WEB PARA VER EL QR
app.get('/', (req, res) => {
    if (clientReady) return res.send('<h1>🤖 Bot Activo y Escuchando 24/7</h1>');
    if (qrCodeData) return res.send(`
        <h1>Escanea este QR con tu celular:</h1>
        <img src="${qrCodeData}">
        <p>Si no carga, recarga la página en 10 segundos.</p>
    `);
    res.send('<h1>Cargando... espera unos segundos y recarga.</h1>');
});

app.listen(port, () => console.log(`Servidor escuchando en puerto ${port}`));  

