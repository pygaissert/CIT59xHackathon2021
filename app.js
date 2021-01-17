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
    console.log(`channel id: ${body.channel.id}`);
    console.log(`container message: ${body.container.message_ts}`);
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
  console.log(body.view.state);
  let selectedSkills = parse.getValuesFromOptions(body.view.state.values.select_topics_newuser.select_topics_newuser.selected_options);
  console.log(selectedSkills);
// open new modal view to add new skill
  try {
    // Open modal for adding new skills
    const result = await client.views.push({
      trigger_id: body.trigger_id,
      // View payload with updated blocks
      view: await views.addSkill(body.view.private_metadata.split('_')[0], body.view.private_metadata.split('_')[1], body.view.hash, selectedSkills)
    });
  } catch (error){
    console.error(error);
  }
});

// Acknowledge selection on Add Skills Modal: Topic of expertise
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
  let values = view.state.values;
  let year = values.select_year.graduation_year.value;
  if (year > 1900 && year < 2040){
    // acknowlege modal submission
    await ack();
    // parse through selected skills
    let skills = parse.getValuesFromOptions(values.select_topics_newuser.select_topics_newuser.selected_options);
    console.log(skills);
    try {
      // add user name, id, and graduation year to users collection
      await data.addUser(values.student_name.student_name.value, body.user.id, year);
      //add user and skills to topics-user collection
      for (skill of skills){
        await data.addTopicToUser(body.user.id, skill);
      }
      await client.chat.update({
        channel: view.private_metadata.split('_')[0],
        ts: view.private_metadata.split('_')[1],
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `All done! Thank you for joining ${values.student_name.student_name.value}!`
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Profile"
                },
                style: "primary",
                action_id: "button_viewMyProfile"
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Ask a Question"
                },
                action_id: "button_question"
              },
              {
                type: "button",
                text: {
                  "type": "plain_text",
                  "text": "View classmates profiles"
                },
                action_id: "button_profiles"
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.log(error);
    }
  }
  else {
    // return error of modal submission
    await ack(
      {
        response_action: "errors",
        errors: {
          select_year: "Invalid year! Enter a valid year!"
        }
      }
    )
  }
});

// Submission of introduction's stacked add modal view
app.view('modal_addskill', async({ ack, view, response, body, say, client }) => {
  let values = view.state.values;
  // Find inputted skill, properly capitalize and save string
  let formattedSkill = parse.capitalize(values.add_Skill.add_Skill.value).trim();
  // print skill value
  // console.log(`Skill: ${formattedSkill}`);
  // validate skill input: find duplicate
  if (await data.findSkillInList(formattedSkill)) {
    console.log("Found duplicate skill!");
    await ack(
      {
        response_action: "errors",
        errors: {
          add_Skill: "This skill is already in database!"
        }
      }
    )
  }
  else {
    await ack();
    let skill_list = body.view.private_metadata.split('_')[3].split(',');
    skill_list.push(formattedSkill);
    console.log(skill_list);
    let selected_skill_list = await parse.formatSkillList(skill_list);
    console.log(selected_skill_list);
    let channel = body.view.private_metadata.split('_')[0];
    let timestamp = body.view.private_metadata.split('_')[1];
    console.log(`channel ${channel}: ${timestamp}`);
    try {
      // Add to MongoDB database
      await data.addNewSkill(values.add_Topic.add_Topic.selected_option.value, formattedSkill);
      // Determine whether to show updated new user form or edit profile form
      if (await data.userExists(message.user)) {
        // set view back to editProfile view
        clearEditProfile = await views.editUserInformation(channel, timestamp, body.user.id);
        // clear block 3 of inputs
        clearEditProfile.blocks[3] = await views.clearSkillList();
        // update view to show "...updating tpoics..."
        await client.views.update({
          view_id: body.view.root_view_id,
          hash: body.view.private_metadata.split('_')[2],
          view: clearEditProfile
        });
        // forcefully add new skill to list of topics
        let topicsList = await data.formatSkillToOptionsGroup(skill_list);
        updateEditProfile = await views.editUserInformation(channel, timestamp, body.user.id);
        // modify select skills block by adding all selected skills
        // (including new skill) into topics list
        updateEditProfile.blocks[3] = await views.updateSkillList(selected_skill_list, topicsList);
        // update view to show selected skills
        await client.views.update({
          view_id: body.view.root_view_id,
          view: updateEditProfile
        });
      }
      else {
        // set view back to newUserInformation view
        clearNewUserInfo = await views.newUserInformation(channel, timestamp);
        // clear block 3 of inputs
        clearNewUserInfo.blocks[3] = await views.clearSkillList();
        // update view to show "...updating tpoics..."
        await client.views.update({
          view_id: body.view.root_view_id,
          hash: body.view.private_metadata.split('_')[2],
          view: clearNewUserInfo
        });
        // forcefully add new skill to list of topics
        let topicsList = await data.formatSkillToOptionsGroup(skill_list);
        updateNewUserInfo = await views.newUserInformation(channel, timestamp);
        // modify select skills block by adding all selected skills
        // (including new skill) into topics list
        updateNewUserInfo.blocks[3] = await views.updateSkillList(selected_skill_list, topicsList);
        // update view to show selected skills
        await client.views.update({
          view_id: body.view.root_view_id,
          view: updateNewUserInfo
        });
      }
    } catch (error) {
      console.log(error);
    }
 }
});


/* USER EDIT PROFILE */

// ACTION: User clicks the button to edit profile
// RESPONSE: Open modal view to allow user to edit profile
app.action('button_edit', async({ ack, view, response, body, say, client }) => {
  await ack();
  try {
    // Open the modal for creating an EliCIT profile
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // Pass a valid view_id
      // View payload
      view: await views.editUserInformation(body.channel.id, body.container.message_ts, body.user.id)
    });
    console.log(`channel id: ${body.channel.id}`);
    console.log(`container message: ${body.container.message_ts}`);
  } catch (error) {
    console.error(error);
  }
});

// ACTION: User clicks the button to view profile
// RESPONSE: Open attachment view to allow user to see profile
app.action('button_viewMyProfile', async({ command, ack, say, body, client}) => {
  await ack();
  try {
    // write new message, show user's own profile
    const result = await say(
      await views.showUserProfile(body.user.id)
    );
  } catch (error){
    console.error(error);
  }
});

// ACTION: User clicks the modal submit button
// RESPONSE: Extraction of name, graduation year and skills
app.view('modal-editProfile', async({ ack, view, body, say, client }) => {
  let values = view.state.values;
  let year = values.select_year.graduation_year.value;
  if (year > 1900 && year < 2040){
    // acknowlege modal submission
    await ack();
    // parse through selected skills
    let new_skills = parse.getValuesFromOptions(values.select_topics_newuser.select_topics_newuser.selected_options);
    console.log(new_skills);
    //UPDATING USER INFO
    try {
      // Update user name, id, and graduation year to "users" collection
      await data.userUpdateInfo(values.student_name.student_name.value, body.user.id, year);
      // store user's original skills
      let old_skills = await data.userSkill(body.user.id);
      // Determine what skills to keep
      let toKeep = await parse.toKeepSkillList(old_skills, new_skills);
      console.log(toKeep);
      // Determine what skills to delete
      let toDelete = await parse.toDeleteSkillList(toKeep, old_skills);
      console.log("Delete:");
      console.log(toDelete);
      // Remove skill in toDelete array from "topics-users" database
      for (skill of toDelete){
        await data.removeTopicFromUser(skill,body.user.id);
      }
      // Determine what skills to add
      let toAdd = await parse.toAddSkillList(toKeep, new_skills);
      console.log("Add");
      console.log(toAdd);
      // Add skill in toAdd array to "topics-users" database
      for (skill of toAdd){
        await data.addTopicToUser(body.user.id, skill);
      }
      await client.chat.update({
        channel: view.private_metadata.split('_')[0],
        ts: view.private_metadata.split('_')[1],
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Thank you for updating your profile* ${values.student_name.student_name.value}!`
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Ask A Question"
                },
                style: "primary",
                action_id: "button_question"
              },
              {
                type: "button",
                text: {
                  "type": "plain_text",
                  "text": "View classmates profiles"
                },
                action_id: "button_profiles"
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.log(error);
    }
  }
  else {
    // return error of modal submission
    await ack(
      {
        response_action: "errors",
        errors: {
          select_year: "Invalid year! Enter a valid year!"
        }
      }
    )
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
  // Create a new identical Question Form view
  let updatedQuestionForm = await views.questionForm();
  // Check if any topics are still selected
  if (action.selected_options.length == 0) {
    // If there are no topics selected, give the updated view an empty 3rd block
    updatedQuestionForm.blocks[2] = views.noTopicsSelected;
  }
  else {
    // If there are still topics selected...
    // Parse an array of selected topics from action.selected_options
    let updatedTopicsList = parse.getValuesFromOptions(action.selected_options);
    // Get list of users associated with the selected topics
    let relatedUserList = await data.findUsersByTopics(updatedTopicsList);
    // Check if any users were found
    if (relatedUserList.length == 0) {
      // If no users were found, give the updated view a 3rd block with a message
      updatedQuestionForm.blocks[2] = await views.noUsersFound(updatedTopicsList);
    }
    else {
      // If users were found...
      // Give the updated view a 3rd block with a multi-select menu for selecting users
      updatedQuestionForm.blocks[2] = await views.usersFound(relatedUserList);
      // Check if there were users already selected before
      if (body.view.state.values.select_users_question) {
        // If users were already selected...
        // Get the list of previously selected users as a JSON object
        previouslySelectedUsers = body.view.state.values.select_users_question.select_users_question.selected_options;
        // This array will hold the initial_options for the multi-select menu
        updatedSelectedUsers = [];
        // For each of the previously selected users...
        previouslySelectedUsers.forEach( (user) => {
          // Check if they are still in the selectable users, given the selected topic(s)
          updatedQuestionForm.blocks[2].accessory.option_groups.forEach( (group) => {
            // Ensure that there are no duplicates in the initial_options
            if (updatedSelectedUsers.includes(user)) {
              return;
            }
            // If a previously selected user is related to any of the currently selected topics...
            if (parse.getValuesFromOptions(group.options).includes(user.value)) {
              // Add them to the array
              updatedSelectedUsers.push(user);
            }
          });
        });
        // If the updated array of selected users is not empty...
        if (updatedSelectedUsers.length != 0) {
          // Set the array as the initial_options of the multi-select menu
          updatedQuestionForm.blocks[2].accessory.initial_options = updatedSelectedUsers;
        }
      }
    }
  }
  // At this point, we have the appropriately updated Question Form
  // Create a temporary base Question Form
  tempForm = await views.questionForm();
  // Give the temporary Question Form an empty 3rd block
  tempForm.blocks[2] = views.noTopicsSelected;
  try {
    // Briefly update the Question Form to have an empty 3rd block
    await client.views.update({
      token: slackBotToken,
      view: tempForm,
      view_id: body.view.id,
      hash: body.view.hash,
    });
    // Then update the Question Form with the desired settings
    await client.views.update({
      token: slackBotToken,
      view: updatedQuestionForm,
      view_id: body.view.id,
    });
  } catch (error) {
    console.log(error);
  }
});

// ACTION: User selects related users to direct their question at
// RESPONSE: Acknowledge action (No real action is needed)
app.action('select_users_question', async({ ack }) => {
  await ack();
  console.log("Acknowledged - User Selected");
})

// ACTION: User submits the Question Form
// RESPONSE: Creates a group direct message and sends question
app.view('submit_question', async({ ack, body, view, client }) => {
  // Acknowledge the view_submission
  await ack();
  console.log("Acknowledged - Question Submitted");
  // Parse the view_submission for the question, the topics, and the users
  submission = parse.parseQuestionSubmission(view, body.user.id);
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
app.event('app_home_opened', async({ payload, client }) =>{
  console.log(`Home tab opened by user ${payload.user}`);
  try{
    // publish home page when user click home
    const result = await client.views.publish({
        token: slackBotToken,
        user_id: payload.user,
        view: await views.homepage(payload)
    });
    console.log(result);
  } catch (error){
    console.error(error);
  }
});

/* SLASH COMMANDS */
// implement these two when above functions are finished
// // edit_profile
// app.command('/edit-profile', async ({ command, ack, say, body, client}) => {
//   await ack();
//
//   console.log(client);
//   try {
//     // Open the modal for creating an EliCIT profile
//     const result = await client.views.open({
//       // Pass a valid trigger_id within 3 seconds of receiving it
//       trigger_id: command.trigger_id,
//       // Pass a valid view_id
//       // View payload
//       view: await views.editUserInformation(command.channel.id, body.container.message_ts, command.user.id)
//     });
//     console.log(`channel id: ${body.channel.id}`);
//     console.log(`container message: ${body.container.message_ts}`);
//   } catch (error) {
//     console.error(error);
//   }
// });
// // ask_question
// app.command('/ask-question', async ({ command, ack, say, body, client}) => {
//   // acknowlege the command request
//   await ack();
//   console.log("User wants to ask question ");
//   // add function
// });
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

    // TODO change this to user_id
    // await views.showUserProfile(command.user_id)
    // write new message, show user's own profile
    const result = await say(
      // await views.showUserProfile("U01JMNX5NSF")
      await views.showUserProfile(body.user_id)

    );
  } catch (error){
    console.error(error);
  }
});

// /view-people profiles actions
// message user by profile, button is pressed
app.action('button_message_by_profile',async({action, ack, body, client}) =>{
  // Acknowledge the view_submission
  await ack();
  console.log("Acknowledged - DM");

  let dm_id = await action.value;
  console.log(action)
  let userInfo = await data.getProfileById(dm_id);

  try {
    // open modal view to ask user
    const result = await client.views.push({
      trigger_id: body.trigger_id,
      view: {
      	type: "modal",
      	callback_id: "dm_rusure",
        private_metadata: dm_id,
      	title: {
      		type: "plain_text",
      		text: "Confirm your request!",
      		emoji: true
      	},
      	submit: {
      		type: "plain_text",
      		text: "Send!",
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
      				text: `*:speech_balloon:  Are you sure you want to send a message to ${dm_id}?*`
      			}
      		},
      		{
      			type: "section",
      			text: {
      				type: "mrkdwn",
      				text: `:bust_in_silhouette:  *<@${dm_id}>*\n\n :mortar_board:  *${userInfo[0]}*\n\n :brain:  ${userInfo[1]}`
      			}
      		},
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:gift_heart:  We will start a groupchat on your behalf and make introduction by showing a preview of your profile!`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Example: \n\nHi Daniel, \nYour fellow classmate John wants to connect with you, \nhere is his profile! ...`
            }
          }
      	]
      }
    });

  } catch (error){
    console.error(error);
  }
});
// user confirmed that they want to send dm
app.view('dm_rusure', async({ ack, body, view, client }) => {
  // Acknowledge the view_submission
  await ack();
  console.log("Acknowledged - sure!");

  let dm_to_id = view.private_metadata;

  console.log(view.root_view_id)
  // Parse the view_submission for the question, the topics, and the users
  try {

    // confirm sending message
    // open modal view to ask user
    await client.views.update({
      view_id: view.root_view_id,
      view: {
        type: "modal",
        callback_id: "dm_sent",
        private_metadata: dm_to_id,
        title: {
          type: "plain_text",
          text: "Message Sent!",
          emoji: true
        },
        close: {
          type: "plain_text",
          text: "Close",
          emoji: true
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*:postbox:  Message sent to <@${dm_to_id}>!!!*`
            }
          },
          {
    			type: "image",
    			image_url: "https://media1.tenor.com/images/b72facfc90455a2dc6985a49c87eafac/tenor.gif?itemid=7518152",
    			alt_text: "inspiration"
    		}
        ]
      }
    });
    // TODO change this to comma seperated user_id for group message
    // send message
    let result = await client.conversations.open({
      token: slackBotToken,
      users: `${body.user.id},${dm_to_id}`
    });

    // TODO change user_id implementation
    let userProfile = await data.getProfileById(body.user.id);

    let msg = await client.chat.postMessage({
      token: slackBotToken,
      channel: result.channel.id,
      text: `Hi, <@${dm_to_id}>!!!\n\n Your fellow classmate <@${body.user.id}> wants to connect with you!\nHere is their profile:`,
      attachments: [
          {
              color: "#36a64f",
              fields: [
                  {
                      title: ":bust_in_silhouette:  *Name*:",
                      value: `-\t  <@${body.user.id}>`,
                      short: true
                  },
                  {
                      title: ":mortar_board:  *Graduating Year*: ",
                      value: `-\t  ${userProfile[0]}`,
                      short: true
                  },
                  {
                      title: ":brain:  *Expertise*:",
                      value: `-\t  ${userProfile[1]}`,
                      short: false
              }

          ]
      }
    ]
    });
  } catch (error){
    console.error(error);
  }
});


app.action('button_profiles',async({action, ack, body, client}) =>{
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

// // TODO: IMPLEMENTING edit profile
// app.action('button_edit',async({action, ack, body, client}) =>{
//   // Acknowledge the view_submission
//   await ack();
//   console.log("Acknowledged - EDIT!");
//
//   try {
//     let result = await editProfile({action, ack, body, client });
//
//   } catch (error){
//     console.error(error);
//   }
// });
//
// async function editProfile({action, ack, body, client }) {
//
//   // await views.editUserInformation("U01JMNX5NSF", body.channel.id, body.container.message_ts);
//
//   // Open the modal for editing an EliCIT profile
//   const result = await client.views.open({
//     // Pass a valid trigger_id within 3 seconds of receiving it
//     trigger_id: body.trigger_id,
//     // Pass a valid view_id
//     // View payload
//
//     // TODO change user_id
//     // view: await views.editUserInformation(body.user_id, body.channel.id, body.container.message_ts)
//     view: await views.editUserInformation("U01JMNX5NSF", body.channel.id, body.container.message_ts)
//   });
//
// }


// integration functions:


// STARTS THE APP
(async () => {
  await app.start(port);
  console.log('⚡️ Bolt app is running!');
})();
