// views.js
// This is a module for creating modal views

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
            "action_id": "button_ask"
          }
        ]
      }
    ],
    text: `Hey there <@${user}>!`
  }
};


// function to show question view
const question = function (list) {
  return{
        type: "modal",
      	title: {
      		type: "plain_text",
      		text: "My App",
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
      				action_id: "skill_get",
      				type: "multi_static_select",
      				placeholder: {
      					type: "plain_text",
      					text: "Select question related skills"
      				},
      				options: list
      			}
      		},
      		{
      			type: "input",
      			element: {
      				type: "multi_users_select",
      				placeholder: {
      					type: "plain_text",
      					text: "Select people to ask this question to:",
      					emoji: true
      				},
      				action_id: "multi_users_select-action"
      			},
      			label: {
      				type: "plain_text",
      				text: "Optional: add preference",
      				emoji: true
      			}
      		}
      	],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
  }
}






const test = {
  type: 'modal',
  callback_id: 'view_1',
  title: {
    type: 'plain_text',
    text: 'Modal title'
  },
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Welcome to a modal with _blocks_'
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Click Me!'
        },
        action_id: 'button_abc'
      }
    },
    {
      type: 'input',
      block_id: 'input_c',
      label: {
        type: 'plain_text',
        text: 'What are your hopes and dreams?'
      },
      element: {
        type: 'plain_text_input',
        action_id: 'dreamy_input',
        multiline: true
      }
    }
  ],
  submit: {
    type:'plain_text',
    text: 'Submit'
  }
};

module.exports = {
  // Template modal from Slack's website
  test: test,
  newUserGreeting: newUserGreeting,
  existingUserGreeting: existingUserGreeting,
  question: question
}
