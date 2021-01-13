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
      view: views.test
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
