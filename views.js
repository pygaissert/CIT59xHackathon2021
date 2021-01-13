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

module.exports = {
  // Template modal from Slack's website
  test: test,
  newUserGreeting: newUserGreeting,
  existingUserGreeting: existingUserGreeting
}
