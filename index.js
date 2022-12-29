const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

const token = process.env.TOKEN;
const myToken = process.env.MY_TOKEN;

app.use(express.json());

app.listen(process.env.PORT || 8000, () => {
  console.log("LISTENING");
});

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];
  if (mode && token) {
    if (mode == "subscribe" && token === myToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body_params = req.body;
  console.log(JSON.stringify(body_params, null, 2));

  if (body_params.object) {
    if (
      body_params.entry &&
      body_params.entry[0].changes &&
      body_params.entry[0].changes[0].value.messages &&
      body_params.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        body_params.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_params.entry[0].changes[0].value.messages[0].from;
      let msg_body =
        body_params.entry[0].changes[0].value.messages[0].text.body;

      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v15.0/" + phone_number_id + "/messages",
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Hi... I'm Jose",
          },
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Hello this is a webhooks setup");
});
