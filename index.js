const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// TUS CREDENCIALES (Las tomará de Render)
const token = process.env.WHATSAPP_TOKEN; 
const myVerifyToken = process.env.VERIFY_TOKEN; 

// MENSAJE DE ARRANQUE
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 SISTEMA LUMMET REINICIADO Y LISTO.");
});

// RUTAS

// 1. RUTA PRINCIPAL (Para verificar que el servidor vive)
app.get("/", (req, res) => {
  res.send("🤖 EL BOT DE LUMMET ESTÁ VIVO Y ESPERANDO MENSAJES.");
});

// 2. VERIFICACIÓN DEL WEBHOOK (El saludo de mano con Facebook)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verify_token = req.query["hub.verify_token"];

  console.log("🔎 INTENTO DE VERIFICACIÓN DE FACEBOOK...");

  if (mode && verify_token) {
    if (mode === "subscribe" && verify_token === myVerifyToken) {
      console.log("✅ WEBHOOK VERIFICADO CORRECTAMENTE.");
      res.status(200).send(challenge);
    } else {
      console.log("❌ FALLO DE VERIFICACIÓN: Token incorrecto.");
      res.sendStatus(403);
    }
  }
});

// 3. RECIBIR MENSAJES (El oído del bot)
app.post("/webhook", async (req, res) => {
  const body = req.body;

  // [DIAGNÓSTICO] ¡Esto nos dirá si entra algo!
  console.log("📨 PAQUETE RECIBIDO DE FACEBOOK:", JSON.stringify(body, null, 2));

  if (body.object) {
    // IMPORTANTE: Responder a Facebook rápido para que no reintente
    res.sendStatus(200);

    // Verificar si es un mensaje real
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const messageInfo = body.entry[0].changes[0].value.messages[0];
      const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = messageInfo.from;
      const msg_body = messageInfo.text ? messageInfo.text.body.toLowerCase() : "";

      console.log(`💬 MENSAJE DE CLIENTE (${from}): ${msg_body}`);

      // LÓGICA DE RESPUESTA LUMMET
      let respuesta = "";

      if (msg_body.includes("hola") || msg_body.includes("buenas")) {
        respuesta = "¡Hola! Bienvenido a *LUMMET* 🇧🇴.\n\nEspecialistas en iluminación vehicular y hogar en Santa Cruz.\n\n¿En qué podemos ayudarte hoy?";
      } else {
        respuesta = "Gracias por escribir a LUMMET. Un asesor revisará tu mensaje.";
      }

      await enviarMensaje(phone_number_id, from, respuesta);
    }
  } else {
    res.sendStatus(404);
  }
});

// FUNCIÓN DE ENVÍO
async function enviarMensaje(phoneId, to, text) {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      data: { messaging_product: "whatsapp", to: to, text: { body: text } },
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    console.log("📤 RESPUESTA ENVIADA CON ÉXITO");
  } catch (error) {
    console.error("❌ ERROR AL ENVIAR:", error.response ? error.response.data : error.message);
  }
}