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
});


app.action('button_no', async({ ack, body, say, client }) => {
  await ack();
  await client.chat.update({
    channel: body.channel.id,
    ts: body.container.message_ts,
    blocks: [],
    text: "No problem! Let me know if you change your mind!",
    message: {
      text: "No problem! Let me know if you change your mind!",
      user: body.user.id
    }
  });
});

// ACTION:   button_createProfile
// RESPONSE: Show modal to collect user information
app.action('button_createProfile', async({ ack, body, say, client }) => {
  await ack();
  try {
    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: await views.newUserInformation()
    });
  } catch (error) {
    console.error(error);
  }
});

// ACTION:   static_select-action
// RESPONSE: Acknowledge academic year selection
app.action('select_year', async({ ack, body, say, client }) => {
  // save result of selected option
  // const val = JSON.stringify(body['actions'][0]);
  // confirm value on console
  // console.log(val);
  console.log(body.actions[0].selected_option.text.text);
  // Acknowledge static_select
  await ack();
});

// ACTION:   button_addSkill
// RESPONSE: Acknowledge skills selection
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

app.action('select_topics_newuser', async({ ack}) => {
  await ack();
})

/* QUESTION FORM */

// ACTION:   button_question
// RESPONSE: Open a modal view to allow user to ask a question
app.action('button_question',async({ack, body, client}) =>{
  // Acknowlege the action request
  await ack();
  console.log("Acknowledged")
  try {
    // Open "question" modal from views.js
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: await views.questionForm()
    });
  } catch (error){
    console.error(error);
  }
});

// when user submit question, read view_submission
app.view('submit_question', async({ack, body, view, client}) => {
  // acknowlege the command request
  await ack();
  console.log("Question Acknowledged");
  try {

  } catch (error){
    console.error(error);
  }
});

app.action('select_topic', async({ ack, body, action, client }) => {
  await ack();
  let updated_topics = [];
  action.selected_options.forEach( function(option) {
    updated_topics.push(`${option.value}`);
  });
  // Get list of Slack IDs associated with the selected topics
  userList = await data.findUsersByTopics(updated_topics);
  // Get list of all topics
  topicList = await data.listTopics();
  updatedQuestionForm = await views.questionForm();
  updatedQuestionForm.blocks[2] = await views.selectUsers(userList);
  await client.views.update({
    view: updatedQuestionForm,
    view_id: body.view.id,
    hash: body.view.hash,
  });
});

// app.options('select_user', async({ ack, options, body }) => {
//   try {
//     console.log(body);
//     await ack();
//     // await ack({
//     //   option_groups: option_groups
//     // });
//   } catch (error) {
//     console.error(error);
//   }
//   });

app.view('modal-newuser', async({ ack, body, say, client }) => {
  console.log(body);
  await ack();
});

// STARTS THE APP
(async () => {
  await app.start(port);
  console.log('⚡️ Bolt app is running!');
})();
