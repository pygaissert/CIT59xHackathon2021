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


// ACTION: message (Hello, hello, Hi, hi)
// RESPONSE:
app.message(/^([Hh]ello)|([Hh]i).*/, async({message, say}) => {
  // Check if user is in database
  if (await data.userExists(message.user)) {
    await say(views.existingUserGreeting(message.user));
  } else {
    await say(views.newUserGreeting(message.user));
  }
});

/* NEW USER MESSAGE */

// ACTION: button_yes
// RESPONSE: Prompt the user to create an EliCIT profile
app.action('button_yes', async({ ack, body, say, client }) => {
  // Acknowledge the button click
  await ack();
  // Updates the previous message
  await client.chat.update({
    // Channel ID of the message containing the button
    channel: body.channel.id,
    // Timestamp of the message containing the button
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

// Respond to the user when they click "No"
app.action('button_no', async({ ack, body, say, client }) => {
  // Acknowledge the button click
  await ack();
  try {
    // Updates the previous message
    await client.chat.update({
      // Channel ID of the message containing the button
      channel: body.channel.id,
      // Timestamp of the message containing the button
      ts: body.container.message_ts,
      blocks: [],
      text: "No problem! Let me know if you change your mind!",
      message: {
        text: "No problem! Let me know if you change your mind!",
        user: body.user.id
      }
    });
  } catch (error) {
    console.log(error);
  }
});

/* NEW USER CREATES PROFILE */

// ACTION:   button_createProfile
// RESPONSE: Open modal for user to create an EliCIT profile
app.action('button_createProfile', async({ ack, body, say, client }) => {
  await ack();
  try {
    // Open the modal for creating an EliCIT profile
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // Pass a valid view_id
      // View payload
      view: await views.newUserInformation(body.channel.id, body.container.message_ts)
    });
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

// ACTION: multi_static_select-action
// RESPONSE: Acknowledge multi-select skills
app.action('select_topics_newuser', async({ ack, body, say, client }) => {
  // print out info
  // console.log(body.actions.selected_options);
  // Acknowledge selection of skill
  await ack();
});

// ACTION:   button_addSkill
// RESPONSE: Acknowledge skills selection and open add_skill modal
app.action('button_addSkill', async({ ack, view, body, say, client }) => {
  // Acknowledge addSkill button
  await ack();
  let selectedSkills = body.view.state.values.select_skill.select_topics_newuser.selected_options;
  var skills = [];
  console.log(selectedSkills);
  for (i = 0; i < selectedSkills.length; i++){
  //  skills.push(selectedSkills[i].value);
    console.log(selectedSkills[i].value);
    skills.push(`${selectedSkills[i].value}`);
  }
  console.log(skills);
// open new modal view to add new skill
  try {
    // Open modal for adding new skills
    const result = await client.views.push({
      trigger_id: body.trigger_id,
      // View payload with updated blocks
      view: await views.addSkill(body.view.hash, skills)
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
app.view('modal-newuser', async({ ack, view, body, say, client }) => {
  let year = view.state.values.select_year.graduation_year.value;
  // print out selected academic year value
  console.log(year);
  // parse through selected skills
  let skillList = view.state.values.select_skill.select_topics_newuser.selected_options;
  var skills = [];
  for (i = 0; i < skillList.length; i++){
    skills.push(skillList[i].value);
  }
  // print out selected skills on console
  console.log(skills);
  // Acknowledge submission of modal
  await ack();
  console.log(body);
  let values = view.state.values;
  let year = values.select_year.select_year.selected_option.value;
  // parse through selected skills
  let skills = parse.getValuesFromOptions(values.select_topics_newuser.select_topics_newuser.selected_options);
  try {
    // add user name, id, and graduation year to users collection
    await data.addUser(body.user.name, body.user.id, year);
    // add user and skills to topics-user collection





    await client.chat.update({
      // COMBINE THIS.........
      channel: body.channel.id,
      ts: body.container.message_ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Profile successfully added to database!"
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Edit Profile"
              },
              style: "primary",
              action_id: "button_edit"
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Ask a Question"
              },
              action_id: "button_question"
            }
          ]
        }
      ]
      // .......WITH THIS
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
app.view('modal_addskill', async({ ack, view, response, body, say, client }) => {
  await ack();
  //print group value
  let topic = view.state.values.add_Topic.add_Topic.selected_option.value;
  console.log(`Topic: ${topic}`);
  // print skill value
  let skill = view.state.values.add_Skill.add_Skill.value;
  console.log(`Skill: ${skill}`);
  //console.log(body.view);
  //console.log("hash: " + body.view.private_metadata.split('_')[0]);
  //console.log(body.view.private_metadata.split('_')[1]);
  //console.log(body.view.private_metadata.split('_')[1].length);
  let skill_list = body.view.private_metadata.split('_')[1].split(',');
  skill_list.push(skill);
  let selected_skill_list = await data.formatSkillList(skill_list);
  //console.log(selected_skill_list);
  try {
    // Add to MongoDB database
    await data.addNewSkill(topic, skill);
    clearNewUserInfo = await views.newUserInformation();
    clearNewUserInfo.blocks[2] = await views.clearSkillList();
    updateNewUserInfo = await views.newUserInformation();
    updateNewUserInfo.blocks[2] = await views.updateSkillList(selected_skill_list);
    await client.views.update({
      view_id: body.view.root_view_id,
      hash: body.view.private_metadata.split('_')[0],
      view: clearNewUserInfo
    });
    await client.views.update({
      view_id: body.view.root_view_id,
      view: updateNewUserInfo
    });
  } catch (error) {
    console.log(error);
  }
});


/* USER ASKS A QUESTION */

// ACTION:   User clicks the button to ask a question
// RESPONSE: Open a modal view to allow user to ask a question
app.action('button_question',async({ack, body, client}) =>{
  // Acknowlege the button click
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

// ACTION: User selects topics in the Question Form
// RESPONSE: Update the multi-select menu of users
app.action('select_topics_question', async({ ack, body, action, client }) => {
  // Acknowledge the selection
  await ack();
  console.log("Acknowledged - Topic Selected");
  // Create a new identical question form view
  updatedQuestionForm = await views.questionForm();
  // Check if there are topics selected
  if (action.selected_options.length == 0) {
    updatedQuestionForm.blocks[2] = views.noTopicsSelected;
  } else {
    // Parse values from selected options
    let updatedTopicsList = parse.getValuesFromOptions(action.selected_options);
    // Get list of Slack IDs associated with the selected topics
    relatedUserList = await data.findUsersByTopics(updatedTopicsList);
    // Check if related users were found
    if (relatedUserList.length == 0) {
      updatedQuestionForm.blocks[2] = await views.noUsersFound(updatedTopicsList);
    } else {
      updatedQuestionForm.blocks[2] = await views.usersSelected(relatedUserList);
    }
  }
  // Update the Question Form modal (INCOMPLETE)
  tempForm = await views.questionForm();
  tempForm.blocks[2] = views.noTopicsSelected;
  try {
    await client.views.update({
      token: slackBotToken,
      view: updatedQuestionForm,
      view_id: body.view.id,
      //hash: body.view.hash,
    });
  } catch (error) {
    console.log(error);
  }
});

// ACTION: User selects related users to direct their question at
// RESPONSE: Acknowledge action
app.action('select_users_question', async({ack}) => {
  await ack();
  console.log("Acknowledged - User Selected")
})

// TODO - if no users were selected, send to ALL users related to the topic(s)

// ACTION: User submits the Question Form
// RESPONSE: Creates a group direct message and sends question
app.view('submit_question', async({ ack, body, view, client }) => {
  // Acknowledge the view_submission
  await ack();
  console.log("Acknowledged - Question Submitted");
  // Parse the view_submission for the question, the topics, and the users
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

// implement these when above functions are finished
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
  try {
    // open modal view from views, list all people currently in the db
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: await views.showAllProfiles()
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

  try {
  //   await say({
  //     "blocks": [
  //     {
  //       "type": "header",
  //       "text": {
  //         "type": "plain_text",
  //         "text": "This is a header block",
  //         "emoji": true
  //       }
  //     }
  //   ]
  // });

    // write new message, show user's own profile
    const result = await say(
      // TODO change this
      // await views.showUserProfile(command.user_id)
      await views.showUserProfile("U01JMNX5NSF")



    );

    console.log(result);
  } catch (error){
    console.error(error);
  }
});

// STARTS THE APP
(async () => {
  await app.start(port);
  console.log('⚡️ Bolt app is running!');
})();
