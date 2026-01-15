const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Variables de entorno
const token = process.env.WHATSAPP_TOKEN; 
const myVerifyToken = process.env.VERIFY_TOKEN; 

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Servidor Oficial LUMMET listo y limpio.");
});

// VERIFICACIÓN
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === myVerifyToken) {
      console.log("WEBHOOK VERIFICADO");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// MENSAJES
app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object) {
      // Solo confirmamos recepción para que Facebook no moleste
      res.sendStatus(200);

      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        const phone_id = body.entry[0].changes[0].value.metadata.phone_number_id;
        const from = body.entry[0].changes[0].value.messages[0].from;
        const msg = body.entry[0].changes[0].value.messages[0].text.body;

        // Responder el saludo
        await enviarMensaje(phone_id, from, "¡Hola! Bienvenido a LUMMET Oficial 🇧🇴. ¿En qué te ayudamos?");
      }
  } else {
    res.sendStatus(404);
  }
});

async function enviarMensaje(phoneId, to, text) {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      data: { messaging_product: "whatsapp", to: to, text: { body: text } },
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
  } catch (e) { console.error("Error envío:", e.response ? e.response.data : e.message); }
}