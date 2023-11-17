const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;
const TOKEN2 = process.env.LINE_SECRET;
const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: TOKEN,
  channelSecret: TOKEN2,
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/webhook", async function(req, res) {
  try {

    const userId = req.body.events[0].source.userId;
    
    if(req.body.events[0].source.groupId){
      const groupId = req.body.events[0].source.groupId;
      const profile = await client.getGroupMemberProfile(groupId, userId);;
      const displayName = profile.displayName;
    }else{displayName = "no"}
    
    const profile2 = await client.getProfile(userId);
    const displayName2 = profile2.displayName;
    

    if (req.body && req.body.events[0].type === "message") {
      let demand = [];
      let result = [];

      console.log("Sender's Display Name:", displayName);
      console.log("Sender's Display Name2:", displayName2);

      if (displayName.includes("oop") || displayName2.includes("oop")) {
        if (req.body.events[0].message.text.includes("jbupdate")) {
          stocked = req.body.events[0].message.text.replace("jbupdate", "").trim();
          stocked = stocked.split('\n').map(line => line.trim());
        } else {
          demand = req.body.events[0].message.text.trim();
          demand = demand.split('\n').map(line => line.split(' ')[0].trim());
        }
        result = stocked.filter(item => demand.some(d => item.includes(d)));
        result = result.map(line => line.trim());
        console.log("stock :\n" + stocked);
        console.log("\ndemand :\n" + demand)
        console.log("\nresult :\n" + result);
      }

      let messages = result.map(line => ({ type: "text", text: line }));

      let data = {
        replyToken: req.body.events[0].replyToken,
        messages: messages,
      };

      let dataString = JSON.stringify(data);

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      };

      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
      };

      const request = https.request(webhookOptions);

      request.on("error", (err) => {
        console.error("Request error:", err);
      });

      if (displayName.includes("oop") || displayName2.includes("oop")) {
        request.write(dataString);
        dataString = null;
        result = [];
        data = {
          replyToken: req.body.events[0].replyToken,
          messages: [],
        };
      }
      console.log("........");
      request.end();
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
