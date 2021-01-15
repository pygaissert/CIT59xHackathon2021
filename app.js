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
app.action('button_createProfile', async({ ack, message, body, say, client }) => {
  await ack();
  console.log(body.trigger_id);
  let list = await data.listSkills();
  try {
    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // Pass a valid view_id
      // View payload
      view: views.newUserInformation(list)
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// Acknowledge academic year selection
app.action('static_select-action', async({ ack, body, say, client }) => {
  // print out selected academic year value
  //console.log(body.actions[0].selected_option.text.text);
  // Acknowledge static_select
  await ack();
});

// Acknowledge multi-seelct skills
app.action('select_skill', async({ ack, body, say, client }) => {
  // print out info
  console.log(body.actions.selected_options);
  // Acknowledge selection of skill
  await ack();
});

// Acknowledge selection of new skill and creation of new stacked modal
app.action('button_addSkill', async({ ack, body, say, client }) => {
  //console.log(body);
  // Acknowledge addSkill button
  await ack();
  // open new modal view to add new skill
  try {
    const result = await client.views.push({
      trigger_id: body.trigger_id,
      view: views.addSkill()
    });
  } catch (error){
    console.error(error);
  }
});

// Acknowledge character input on Add Skills Modal: Topic of expertise
app.action('add_Topic', async({ ack, body, say, client}) => {
  //acknowlege character input
  await ack();
});

// Acknowledge character input on Add Skills Modal: skill
app.action('add_Skill', async({ ack, body, say, client}) => {
  //acknowlege character input
  await ack();
});

// Submission of introduction modal and extraction of data
app.view('modal-intro', async({ ack, view, body, say, client }) => {
  // print out selected academic year value
  //console.log(view.state.values.select_year['static_select-action'].selected_option.value);
  let year = view.state.values.select_year['static_select-action'].selected_option.value;
  console.log(year);
  // parse through selected skills
  let skillList = view.state.values.select_skill.select_skill.selected_options;
  var skills = [];
  for (i = 0; i < skillList.length; i++){
    skills.push(skillList[i].value);
  }
  // print out selected skills on console
  console.log(skills);
  // Acknowledge submission of modal
  await ack();
  try {
    await data.addUser(body.user.name, body.user.id, year, skills);
    await client.chat.update({
      channel: body.channel.id,
      ts: body.container.message_ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Profile successfully added to database!"
          },
        }
      ]
    });
    // await client.chat.update({
    //   channel: body.channel.id,
    //   ts: body.container.message_ts,
    //   blocks: views.existingUserGreeting(message.user)
    // })
  } catch (error) {
    console.log(error);
  }
});

// Submission of introduction's stacked add modal view
app.view('NewSkill', async({ ack, view, body, say, client }) => {
  //print group value
  topic = view.state.values.add_new_topic.add_Topic.value;
  console.log(topic);
  // print skill value
  skill = view.state.values.add_new_skill.add_Skill.value;
  console.log(skill);
  await ack();
  // Add to MongoDB database
  try {
    await data.addSkill(topic, skill);
  } catch (error) {
    console.log(error);
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
