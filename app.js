// IMPORT THIRD-PARTY MODULES
require('dotenv').config();

// IMPORT OUR MODULES
const views = require('./views');
const data = require('./data');

// IMPORTS VARIABLES FROM .env
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const port = process.env.PORT || 3000;


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


// Listens to incoming messages that contain "hello"
app.message(/^([Hh]ello)|([Hh]i).*/, async({message, say}) => {
  // Check if user is in database
  if (await data.userExists(message.user)) {
    await say(views.existingUserGreeting(message.user));
  } else {
    await say(views.newUserGreeting(message.user));
  }
});


app.action('button_yes', async({ ack, body, say, client }) => {
  await ack();
  await client.chat.update({
    channel: body.channel.id,
    ts: body.container.message_ts,
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Thank you for joining!`
        }
      }
    ]
  });
  try {
    await data.addUser(body.user.name, body.user.id);
  } catch (error) {
    console.log(error);
  }
});


app.action('button_no', async({ ack, body, say }) => {
  await ack();
  await say("No problem! Let me know if you change your mind!")
});

// STARTS THE APP
(async () => {
  await app.start(port);
  console.log('⚡️ Bolt app is running!');
})();
