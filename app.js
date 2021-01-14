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
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Thank you for joining!"
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Click to create your profile!"
            },
            style: "primary",
            action_id: "button_createProfile"
          }
        ]
      }
    ]
  });
  // try {
  //   await data.addUser(body.user.name, body.user.id);
  // } catch (error) {
  //   console.log(error);
  // }
});


app.action('button_no', async({ ack, body, say }) => {
  await ack();
  await say("No problem! Let me know if you change your mind!")
});

// Show modal to collect user information
app.action('button_createProfile', async({ ack, body, say, client }) => {
  await ack();
  console.log(body.trigger_id);
  let list = await data.listSkills();
  try {
    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: views.newUserInformation(list)
    });
  } catch (error) {
    console.error(error);
  }
});

// Acknowledge academic year selection
app.action('static_select-action', async({ ack, body, say, client }) => {
  // save result of selected option
  // const val = JSON.stringify(body['actions'][0]);
  // confirm value on console
  // console.log(val);
  console.log(body);
  // Acknowledge static_select
  await ack();
});

// Acknowledge skills selection
app.action('button_addSkill', async({ ack, body, say, client }) => {
  console.log(body);
  await ack();
  try {
    const result = await client.views.push({
      trigger_id: body.trigger_id,
      view: views.addSkill()
    });
  } catch (error){
    console.error(error);
  }
});


// Modal view to allow user to ask a question
app.action('button_ask',async({ack, body, client}) =>{
  // acknowlege the command request
  await ack();
  console.log("Acknowledged");

  // get the list of skill from db
  const skillList = await data.listSkills();
  //console.log(skillList);
  const userList = await data.listUsers();
  //console.log(userList);

  try {
    // open modal view from views
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      // past list to question()
      view: views.question(skillList)
    });

    console.log(result);
  } catch (error){
    console.error(error);
  }
});

// when user submit question, read view_submission
app.view('question',async({ack, body, view, client}) =>{
  // acknowlege the command request
  await ack();
  console.log("View Acknowledged");

  try {

  } catch (error){
    console.error(error);
  }
});



app.view('modal-intro', async({ ack, body, say, client }) => {
  console.log(body);
  await ack();
});



//app.action('programming_modal', async({}))

// app.view_submission('modal', async({ ack, body, say }) => {
//   await ack();
//   console.log(body);
// });

// STARTS THE APP
(async () => {
  await app.start(port);
  console.log('⚡️ Bolt app is running!');
})();
