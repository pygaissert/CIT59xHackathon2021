// IMPORT THIRD-PARTY MODULES
require('dotenv').config();


// IMPORTS VARIABLES FROM .env
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_CONNECTION;

// IMPORT OUR MODULES
const views = require('./views');

// INITIALIZES THE APP
const { App } = require('@slack/bolt');
const app = new App({
  token: slackBotToken,
  signingSecret: slackSigningSecret,
  endpoints: {
    events: '/slack/events',
    commands: '/slack/commands'
  }
});

// FOR INITIALIZING MONGODB CLIENTS
const MongoClient = require('mongodb').MongoClient;


// TESTS RESPONSE TO 'hello' MESSAGE
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

// // MAIN FUNCTION FOR INITIALIZING THE SLACKBOT
// async function main(){
// 	try {
//     await app.say(`Hello there! To participate, reply with _yes_.`);
//     await app.message('yes', async ({ message, say }) => {
//       await app.say(`To get started, type command "/modal".`);
//     });
// 	} catch (e) {
//     		console.error(e);
//   }
// }
//
// // TEST MAIN FUNCTION
// main().catch(console.error);
//

app.command('/start', async({ command, ack, say, client }) => {
  await ack();
  let result = await client.conversations.open({
    token: slackBotToken,
    users: "U01JMNX5NSF, U01JMNSEL75, U01JEPEGDCN"
  });
  console.log(result);
  let msg = await client.chat.postMessage({
    token: slackBotToken,
    channel: result.channel.id,
    text: "Group message test"
  });
});

// TESTS RESPONSE TO '/modal' SLASH COMMAND & CREATING MODAL
app.command('/modal', async ({ ack, body, client }) => {
  // Acknowledge the command request
  await ack();
  console.log(body.trigger_id);
  try {
    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view:
      {
	       type: "modal",
	       title: {
           type: "plain_text",
		       text: "Elicit",
		       emoji: true
         },
         submit: {
           type: "plain_text",
           text: "Submit",
           emoji: true
         },
         close: {
           type: "plain_text",
           text: "Cancel",
           emoji: true
         },
         blocks: [
           {
             type: "section",
             text: {
               type: "mrkdwn",
               text: "Welcome to Elicit! To participate, tell us about you!"
             }
           },
           {
             type: "section",
             text: {
               type: "mrkdwn",
               text: "Academic Status"
             },
             accessory: {
               type: "static_select",
               placeholder: {
                 type: "plain_text",
                 text: "year",
                 emoji: true
               },
               options: [
                 {
                   text: {
                     type: "plain_text",
                     text: "first year",
                     emoji: true
                   },
                   value: "value-0"
                 },
                 {
                   text: {
                     type: "plain_text",
                     text: "second year",
                     emoji: true
                   },
                   value: "value-1"
                 },
                 {
                   text: {
                     type: "plain_text",
                     text: "submatriculate",
                     emoji: true
                   },
                   value: "value-2"
                 },
                 {
                   text: {
                     type: "plain_text",
                     text: "part-time",
                     emoji: true
                   },
                   value: "value-3"
                 },
                 {
                   text: {
                     type: "plain_text",
                     text: "alumni",
                     emoji: true
                   },
                   value: "value-4"
                 }
               ],
               action_id: "static_select-action"
             }
           }
         ]
       }
    });
  } catch (error) {
    console.error(error);
  }
});

// TESTS CONNECTION TO MONGODB CLUSTER (not working right now)
app.command('/mongo', async ({ ack, say }) => {
  await ack();
  let client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  try {
    collection = await client.db("app-data").collection("test");
    result = await collection.findOne({group: "test"});
    await say(result.name);
    client.close();
  } catch (error) {
    console.error(error);
  }
});

// STARTS THE APP
(async () => {
  await app.start(port);

  console.log('⚡️ Bolt app is running!');
})();
