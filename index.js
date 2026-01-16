const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// CONFIGURACIÓN: Render tomará esto de tus Variables de Entorno
const token = process.env.WHATSAPP_TOKEN; 
const myVerifyToken = process.env.VERIFY_TOKEN; 

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Servidor Oficial LUMMET listo y escuchando...");
});

// 1. VERIFICACIÓN DEL WEBHOOK (Cuando le das al botón "Verificar" en Facebook)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === myVerifyToken) {
      console.log("✅ WEBHOOK VERIFICADO CORRECTAMENTE");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// 2. RECIBIR MENSAJES DE CLIENTES
app.post("/webhook", async (req, res) => {
  const body = req.body;

  // [DIAGNÓSTICO] Esto imprimirá en Render TODO lo que llegue de Facebook
  console.log("📨 LLEGO ALGO DE FACEBOOK:", JSON.stringify(body, null, 2));

  if (body.object) {
    // Avisamos a Facebook que recibimos el aviso (Status 200)
    res.sendStatus(200);

    // Verificamos si es un mensaje de texto válido
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = body.entry[0].changes[0].value.messages[0].from;
      const msg_body = body.entry[0].changes[0].value.messages[0].text.body.toLowerCase(); // Convertimos a minúsculas

      console.log(`💬 Mensaje recibido de ${from}: ${msg_body}`);

      // --- RESPUESTAS AUTOMÁTICAS DE LUMMET ---
      let respuestaTexto = "";

      if (msg_body.includes("hola") || msg_body.includes("buenas")) {
        respuestaTexto = "¡Hola! Bienvenido a *LUMMET* 🇧🇴.\n\nSomos expertos en iluminación para vehículos y hogar en Santa Cruz.\n\n¿Qué buscas hoy?\n💡 *Exploradoras*\n🏠 *Iluminación Hogar*\n🏍️ *Accesorios Moto*";
      } 
      else if (msg_body.includes("precio") || msg_body.includes("costo")) {
        respuestaTexto = "Para darte el precio exacto, ¿podrías decirme qué modelo o producto necesitas?";
      }
      else {
        respuestaTexto = "Gracias por escribir a LUMMET. Un asesor revisará tu consulta en breve.";
      }

      // Enviar la respuesta
      await sendMessage(phone_number_id, from, respuestaTexto);
    }
  } else {
    res.sendStatus(404);
  }
});

// FUNCIÓN PARA ENVIAR EL MENSAJE A WHATSAPP
async function sendMessage(phoneId, to, text) {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      data: {
        messaging_product: "whatsapp",
        to: to,
        text: { body: text },
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ Respuesta enviada exitosamente");
  } catch (error) {
    console.error("❌ ERROR ENVIANDO MENSAJE:", error.response ? error.response.data : error.message);
  }
}