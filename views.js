// views.js
// This is a module for creating modal views

const data = require('./data');

const emptyOptionGroup = {
  label: {
    type: 'plain_text',
    text: 'None'
  }
}

/* GREETING FOR NEW USER */

const newUserGreeting = function (user) {
  return {
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${user}>!\nWould you like to join?`
        },
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "YES"
            },
            "style": "primary",
            "action_id": "button_yes"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "NO"
            },
            "action_id": "button_no"
          }
        ]
      }
    ],
    text: `Hey there <@${user}>!`
  }
};

/* GREETING FOR EXISTING USER */

const existingUserGreeting = function (user) {
  return {
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${user}>!\nHow can I help you?`
        },
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Edit Profile"
            },
            "style": "primary",
            "action_id": "button_edit"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Ask a Question"
            },
            "action_id": "button_question"
          }
        ]
      }
    ],
    text: `Hey there <@${user}>!`
  }
};

/* NEW USER FORM */

const newUserInformation = async function () {
  topicList = await data.listTopics();
  return {
    type: "modal",
    callback_id: "modal-newuser",
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
          text: "Welcome to Elicit! To participate, tell us about yourself!"
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
                text: "First Year",
                //emoji: true
              },
              value: "First Year"
            },
            {
              text: {
                type: "plain_text",
                text: "Second Year",
                //emoji: true
              },
              value: "Second Year"
            },
            {
              text: {
                type: "plain_text",
                text: "Submatriculate",
                //emoji: true
              },
              value: "Submatriculate"
            },
            {
              text: {
                type: "plain_text",
                text: "Part-Time",
                //emoji: true
              },
              value: "Part-Time"
            },
            {
              text: {
                type: "plain_text",
                text: "Alum",
                //emoji: true
              },
              value: "Alum"
            }
          ],
          action_id: "select_year"
        }
      },
      {
        type: "section",
        block_id: "add-new-skill",
        text: {
          type: "mrkdwn",
          text: "List your skills of expertise"
        },
        accessory: {
          action_id: "select_topics_newuser",
          type: "multi_static_select",
          placeholder: {
            type: "plain_text",
            text: "Programming Languages, data visualization,..."
          },
          option_groups: topicList
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Don't see your skills listed above?"
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Add a new skill"
            },
            style: "primary",
            action_id: "button_addSkill"
          }
        ]
      }
    ]
  }
};

/* ADDING NEW SKILLS */

const addSkill = function (){
  return {
    "type": "modal",
    "title": {
      "type": "plain_text",
      "text": "Add A New Skill",
      "emoji": true
    },
    "submit": {
      "type": "plain_text",
      "text": "Submit",
      "emoji": true
    },
    "close": {
      "type": "plain_text",
      "text": "Cancel",
      "emoji": true
    },
    "blocks": [
      {
        "type": "divider"
      },
      {
        "dispatch_action": true,
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "dispatch_action_config": {
            "trigger_actions_on": [
              "on_character_entered"
            ]
          },
          "action_id": "plain_text_input-action"
        },
        "label": {
          "type": "plain_text",
          "text": "Topic",
          "emoji": true
        }
      },
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "action_id": "plain_text_input-action"
        },
        "label": {
          "type": "plain_text",
          "text": "Skill",
          "emoji": true
        }
      }
    ]
  }
};

/* QUESTION FORM */

const questionForm = async function () {
  topicList = await data.listTopics();
  return{
        type: "modal",
        callback_id: "submit_question",
      	title: {
      		type: "plain_text",
      		text: "Ask a question:",
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
      			type: "input",
      			element: {
      				type: "plain_text_input",
      				multiline: true,
      				action_id: "plain_text_input-action",
      				placeholder: {
      					type: "plain_text",
      					text: "Example: What is the best language to learn for Data jobs?"
      				}
      			},
      			label: {
      				type: "plain_text",
      				text: "Ask a question:",
      				emoji: true
      			}
      		},
      		{
      			type: "section",
      			block_id: "section678",
      			text: {
      				type: "mrkdwn",
      				text: "Select related topic"
      			},
      			accessory: {
      				action_id: "select_topic",
      				type: "multi_static_select",
      				placeholder: {
      					type: "plain_text",
      					text: "Select question related skills"
      				},
              option_groups: topicList
      			},
      		},
          {
            type: "section",
            block_id: "section789",
            text: {
              type: "mrkdwn",
              text: " "
            }
          }
          // {
          //   type: "section",
          //   block_id: "section789",
          //   text: {
          //     type: "mrkdwn",
          //     text: "Select classmates (optional)"
          //   },
          //   accessory: {
          //     action_id: "select_user",
          //     type: "multi_external_select",
          //     placeholder: {
          //       type: "plain_text",
          //       text: "Select here"
          //     },
          //     min_query_length: 0
          //   }
          // }
      		// {
      		// 	type: "input",
      		// 	element: {
      		// 		type: "multi_users_select",
      		// 		placeholder: {
      		// 			type: "plain_text",
      		// 			text: "Select people to ask this question to:",
      		// 			emoji: true
      		// 		},
      		// 		action_id: "multi_users_select-action"
      		// 	},
      		// 	label: {
      		// 		type: "plain_text",
      		// 		text: "Select classmates (optional)",
      		// 		emoji: true
      		// 	}
      		// },

      	],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
  }
}

/* ADDITIONAL BLOCK FOR SELECTING USERS */

const selectUsers = function(userList) {
  return {
    type: "section",
    block_id: "section789",
    text: {
      type: "mrkdwn",
      text: "Select classmates (optional)"
    },
    accessory: {
      action_id: "select_user",
      type: "multi_static_select",
      placeholder: {
        type: "plain_text",
        text: "Select here"
      },
      option_groups: userList
    }
  };
}


module.exports = {
  newUserGreeting: newUserGreeting,
  existingUserGreeting: existingUserGreeting,
  questionForm: questionForm,
  selectUsers: selectUsers,
  newUserInformation: newUserInformation,
  addSkill: addSkill
}
