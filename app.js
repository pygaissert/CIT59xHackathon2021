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
app.action('button_createProfile', async({ ack, view, body, say, client }) => {
  await ack();
  try {
    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      //hash: body.view.hash,
      view: await views.newUserInformation()
    });
  } catch (error) {
    console.error(error);
  }
});

// ACTION:   static_select-action
// RESPONSE: Acknowledge academic year selection
app.action('select_year', async({ ack, body, say, client }) => {
  // console.log(body.actions[0].selected_option.text.text);
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
  let year = view.state.values.select_year['static_select-action'].selected_option.value;
  // print out selected academic year value
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
    await data.addSkill(topic, skill);
    clearNewUserInfo = await views.newUserInformation();
    clearNewUserInfo.blocks[2] = await views.clearSkillList();
    updateNewUserInfo = await views.newUserInformation();
    updateNewUserInfo.blocks[2] = await views.updateSkillList(selected_skill_list);
    //console.log(updateNewUserInfo.blocks);
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


//app.action('programming_modal', async({}))

// app.view_submission('modal', async({ ack, body, say }) => {
//   await ack();
//   console.log(body);
// });


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
