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

const newUserInformation = async function (channel, timestamp) {
  topicList = await data.listTopics();
  return {
    type: "modal",
    private_metadata: `${channel}_${timestamp}`,
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
      // Static select button for student status
      {
        type: "section",
        block_id: "select_year",
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
      // List skills from a external multi-select
      {
        type: "section",
        block_id: "select_topics_newuser",
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

/* ADDING NEW SKILLS TO ELICIT */

const addSkill = function (){
  return {
    type: "modal",
    callback_id: "NewSkill",
    title: {
      type: "plain_text",
      text: "Add A New Skill",
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
        type: "divider"
      },
      {
        dispatch_action: true,
        type: "input",
        block_id: "add_new_topic",
        element: {
          type: "plain_text_input",
          dispatch_action_config: {
            trigger_actions_on: [
              "on_character_entered"
            ]
          },
          action_id: "add_Topic"
        },
        label: {
          type: "plain_text",
          text: "Topic of Expertise",
          emoji: true
        }
      },
      {
        type: "input",
        block_id: "add_new_skill",
        element: {
          type: "plain_text_input",
          action_id: "add_Skill"
        },
        label: {
          type: "plain_text",
          text: "Skill",
          emoji: true
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
            block_id: "input_question",
      			element: {
      				type: "plain_text_input",
      				multiline: true,
      				action_id: "input_question",
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
      			block_id: "select_topics_question",
      			text: {
      				type: "mrkdwn",
      				text: "Select related topic(s)"
      			},
      			accessory: {
      				action_id: "select_topics_question",
      				type: "multi_static_select",
      				placeholder: {
      					type: "plain_text",
      					text: "No topics selected"
      				},
              option_groups: topicList
      			},
      		},
          noTopicsSelected,
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

/* ADDITIONAL BLOCKS FOR SELECTING USERS */

const noTopicsSelected = {
  type: "section",
  block_id: "select_users_question",
  text: {
    type: "mrkdwn",
    text: " "
  },
}

const noUsersFound = function(empty_groups){
  let list = "";
  for (group of empty_groups) {
    list += `\n- ${group}`;
  }
  return {
    type: "section",
    block_id: "select_users_question",
    text: {
      type: "mrkdwn",
      text: `We could not find classmates for the following topics:${list}`
    },
  }
}

const usersSelected = function(userList) {
  return {
    type: "section",
    block_id: "select_users_question",
    text: {
      type: "plain_text",
      text: "Optional: Select classmate(s)"
    },
    accessory: {
      action_id: "select_users_question",
      type: "multi_static_select",
      placeholder: {
        type: "plain_text",
        text: "No classmates selected"
      },
      option_groups: userList
    }
  };
}





// basic fucntions

const homepage = function (event){
  return {
    "type": "home",
  	"blocks": [
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "Have you ever been stuck on a project, but you didn't know where to look for help ??? :raising_hand:\n"
  			}
  		},
  		{
  			"type": "header",
  			"text": {
  				"type": "plain_text",
  				"text": "Introducing Elicit - 100% THAT app you've been looking for! :wink:",
  				"emoji": true
  			}
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "plain_text",
  				"text": " ",
  				"emoji": true
  			}
  		},
  		{
  			"type": "divider"
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "*What is Elicit?*\n-\t   Elicit harness the collective skills and experiences of the MCIT student body so that no problem will ever go unsolved.\t\t"
  			}
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "-\t   Whenever you have a burning question about JavaScript :jigsaw:, Machine Learning :robot_face: , Graphic Design :art: , the healthcare industry :hospital: , editing a cover letter :memo: , or even general organization techniques :busts_in_silhouette: , Elicit will help direct your question to one of your many benevolent classmates."
  			},
  			"accessory": {
  				"type": "image",
  				"image_url": "https://memegenerator.net/img/images/4637859/spongebob-rainbow.jpg",
  				"alt_text": "alt text for image"
  			}
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "plain_text",
  				"text": " ",
  				"emoji": true
  			}
  		},
  		{
  			"type": "divider"
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "*How to use Elicit?*\n\n\t\t:zero:  (Each time) start the app by saying \"Hello\", or type our slash-commands (ex. /ask-question) :wave:\n\n\t\t:one:  Opt-in Elcit  :white_check_mark:  and add your profile :bust_in_silhouette:\n\n\t\t:two:  Ask a question:question:\n\n\t\t:three:  Choose a classmate :nerd_face: to pose the question to :outbox_tray: \n\n\t\t:four:  Start conversation with the classmate :handshake: \n\n\t\t:five:  Update your profile when you learn new skills :technologist:"
  			}
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "plain_text",
  				"text": " ",
  				"emoji": true
  			}
  		},
  		{
  			"type": "divider"
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "*About Elicit:*\n\n Elicit is a student project at the CIT59x 2021 winter hackathon. Driven by the hope to better connect and foster the MCIT student community, the Elicit team hope to create application that facilitates and encourages students to be each other's greatest allies."
  			}
  		},
  		{
  			"type": "actions",
  			"elements": [
  				{
  					"type": "button",
  					"text": {
  						"type": "plain_text",
  						"text": "Visit our Git project page",
  						"emoji": true
  					},
  					"value": "git_repo_button",
  					"url": "https://github.com/pygaissert/CIT59xHackathon2021"
  				}
  			]
  		},
  		{
  			"type": "divider"
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "*Meet the team:*\n\n Philipp Gaissert, Jintong Wu, Dana Yang"
  			}
  		}
  	]
  }
};


// return a modal view of existing users profiles
const listProfiles = function() {

}




module.exports = {
  homepage: homepage,
  newUserGreeting: newUserGreeting,
  newUserInformation: newUserInformation,
  addSkill: addSkill,
  existingUserGreeting: existingUserGreeting,
  listProfiles: listProfiles,
  questionForm: questionForm,
  usersSelected: usersSelected,
  noUsersFound: noUsersFound,
  noTopicsSelected: noTopicsSelected
}
