// IMPORT THIRD-PARTY MODULES
require('dotenv').config();

// IMPORT OUR MODULES
const views = require('./views');
const data = require('./data');
const parse = require('./parse');

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
          text: "Then let's get you started!"
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
      // Pass a valid view_id
      // View payload
      view: await views.newUserInformation(body.channel.id, body.container.message_ts)
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// ACTION:   select_year
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

// Acknowledge multi-select skills
app.action('select_skill', async({ ack, body, say, client }) => {
  // print out info
  console.log(body.actions.selected_options);
  // Acknowledge selection of skill
  await ack();
});

// ACTION:   button_addSkill
// RESPONSE: Acknowledge skills selection and open new modal
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


app.action('select_topics_newuser', async({ ack}) => {
  await ack();
})

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
app.view('modal-newuser', async({ ack, view, body, say, client }) => {
  // Acknowledge submission of modal
  await ack();
  console.log(body);
  let values = view.state.values;
  let year = values.select_year.select_year.selected_option.value;
  // parse through selected skills
  let skills = parse.getValuesFromOptions(values.select_topics_newuser.select_topics_newuser.selected_options);
  try {
    await data.addUser(body.user.name, body.user.id, year, skills);
    await client.chat.update({
      channel: view.private_metadata.split('_')[0],
      ts: view.private_metadata.split('_')[1],
      blocks: [],
      text: `All done! Thank you for joining, <@${body.user.id}>!`,
      message: {
        text: `All done! Thank you for joining, <@${body.user.id}>!`,
        user: body.user.id
      }
    });
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


/* QUESTION FORM */

// ACTION:   button_question
// RESPONSE: Open a modal view to allow user to ask a question
app.action('button_question',async({ack, body, client}) =>{
  // Acknowlege the action request
  await ack();
  console.log("Acknowledged - Opening Question Form")
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
app.view('submit_question', async({ ack, body, view, client }) => {
  // acknowlege the command request
  await ack();
  console.log("Acknowledged - Question Submitted");
  submission = parse.parseQuestionSubmission(view, body.user.id);
  console.log(submission.users);
  try {
    let result = await client.conversations.open({
      token: slackBotToken,
      users: submission.users
    });
    let msg = await client.chat.postMessage({
      token: slackBotToken,
      channel: result.channel.id,
      text: `<@${body.user.id}> has a question for you!`,
      attachments: [
        {
          color: "#36a64f",
          fields: [
            {
              title: "Topic(s)",
              value: submission.topics
            },
            {
              title: "Question",
              value: submission.question
            }
          ]
        }
      ]
    });
  } catch (error){
    console.error(error);
  }
});

app.action('select_topics_question', async({ ack, body, action, client }) => {
  await ack();
  console.log("Acknowledged - Topic Selected");
  // Create a new identical question form view
  updatedQuestionForm = await views.questionForm();
  // Check if there are topics selected
  if (action.selected_options.length == 0) {
    updatedQuestionForm.blocks[2] = views.noTopicsSelected;
  } else {
    let updated_topics = parse.getValuesFromOptions(action.selected_options);
    // Get list of Slack IDs associated with the selected topics
    userList = await data.findUsersByTopics(updated_topics);
    // Check for empty topic groups
    if (userList.length == 0) {
      updatedQuestionForm.blocks[2] = await views.noUsersFound(updated_topics);
    } else {
      updatedQuestionForm.blocks[2] = await views.usersSelected(userList);
    }
  }
  try {
    await client.views.update({
      view: updatedQuestionForm,
      view_id: body.view.id,
      hash: body.view.hash,
    });
  } catch (error) {
    console.log(error);
  }
});

app.action('select_users_question', async({ack}) => {
  await ack();
  console.log("Acknowledged - User Selected")
})

// adding some basic function below:

// app homepage
app.event('app_home_opened', async({ event, client }) =>{

  console.log("home opened!!!!!");
  try{
    // publish home page when user click home
    const result = await client.views.publish({
        user_id: event.user,
        view: await views.homepage(event)
    });
    console.log(result);
  } catch (error){
    console.error(error);
  }
});

/* SLASH COMMANDS */

//// app_command
// create_profile
app.command('/create-profile', async ({ command, ack, say, body, client}) => {
  await ack();
  console.log("User wants to create profile ");
  // add function
});
// edit_profile
app.command('/edit-profile', async ({ command, ack, say, body, client}) => {
  // acknowlege the command request
  console.log("User wants to edit profile ");
  // add function
});
// ask_question
app.command('/ask-question', async ({ command, ack, say, body, client}) => {
  // acknowlege the command request
  await ack();
  console.log("User wants to ask question ");
  // add function
});

// view_people
app.command('/view-people', async ({ command, ack, say, body, client}) => {
  // acknowlege the command request
  await ack();
  console.log("User wants to view other people's profiles ");
  try {
    // open modal view from views, list all people currently in the db
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: views.list_profiles()
    });

    console.log(result);
  } catch (error){
    console.error(error);
  }
});
// my_profile
app.command('/my-profile', async ({ command, ack, say, body, client}) => {
  // acknowlege the command request
  await ack();
  console.log(`User: ${command.user_id} wants to view their profile `);

  // try {
  //   // open modal view from views, show user's own profile
  //   const result = await client.views.open({
  //     trigger_id: body.trigger_id,
  //     view: views.list_profiles()
  //   });
  //
  //   console.log(result);
  // } catch (error){
  //   console.error(error);
  // }
});

// STARTS THE APP
(async () => {
  await app.start(port);
  console.log('⚡️ Bolt app is running!');
})();
