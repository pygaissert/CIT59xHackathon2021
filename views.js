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

const newUserInformation = function (list) {
  return {
    type: "modal",
    callback_id: "modal-intro",
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
                text: "first year",
                //emoji: true
              },
              value: "first year"
            },
            {
              text: {
                type: "plain_text",
                text: "second year",
                //emoji: true
              },
              value: "second year"
            },
            {
              text: {
                type: "plain_text",
                text: "submatriculate",
                //emoji: true
              },
              value: "submatriculate"
            },
            {
              text: {
                type: "plain_text",
                text: "part-time",
                //emoji: true
              },
              value: "part-time"
            },
            {
              text: {
                type: "plain_text",
                text: "alumni",
                //emoji: true
              },
              value: "alumni"
            }
          ],
          action_id: "static_select-action"
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
          action_id: "topics",
          type: "multi_static_select",
          placeholder: {
            type: "plain_text",
            text: "Programming Languages, data visualization,..."
          },
          option_groups: list
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

module.exports = {
  // Template modal from Slack's website
  test: test,
  newUserGreeting: newUserGreeting,
  existingUserGreeting: existingUserGreeting,
  newUserInformation: newUserInformation,
  addSkill: addSkill
}
