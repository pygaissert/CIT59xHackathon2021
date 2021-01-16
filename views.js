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
        block_id: "select_skill",
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
      	"type": "section",
      	"text": {
      		"type": "plain_text",
      		"text": " ",
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
  			"type": "header",
  			"text": {
  				"type": "plain_text",
  				"text": "Introducing Elicit - 100% THAT app you've been looking for! :wink:",
  				"emoji": true
  			}
  		},
  		// {
  		// 	"type": "section",
  		// 	"text": {
  		// 		"type": "plain_text",
  		// 		"text": " ",
  		// 		"emoji": true
  		// 	}
  		// },
  		{
  			"type": "divider"
  		},
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "What is Elicit?",
          "emoji": true
        }
      },
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "-\t   Elicit harness the collective skills and experiences of the MCIT student body so that no problem will ever go unsolved.\t\t"
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
  				"alt_text": "spongebob_rainbow"
  			}
  		},
  		// {
  		// 	"type": "section",
  		// 	"text": {
  		// 		"type": "plain_text",
  		// 		"text": " ",
  		// 		"emoji": true
  		// 	}
  		// },
  		{
  			"type": "divider"
  		},
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "How to use Elicit?",
          "emoji": true
        }
      },
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "-   \t:zero:  (Each time) start the app by saying \"Hello\"  :wave:\n\n-   \t:one:  Opt-in Elcit  :white_check_mark:  and add your profile :bust_in_silhouette:\n\n-   \t:two:  Ask a question:question:\n\n-   \t:three:  Choose a classmate :nerd_face: to pose the question to :outbox_tray: \n\n-   \t:four:  Start conversation by browsing classmates profiles :handshake: \n\n-   \t:five:  Update your profile when you learn new skills :technologist:\n\n-   \tAlternatively, try our slash-command options by typing \"\\\" in the chat"
  			}
  		},
  		// {
  		// 	"type": "section",
  		// 	"text": {
  		// 		"type": "plain_text",
  		// 		"text": " ",
  		// 		"emoji": true
  		// 	}
  		// },
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


// by user_id, return a message blocks element of an existing user profile
const showUserProfile = async function(user_id) {
  let output = await data.getProfileById(user_id);

  // // console.log(output);
  // return {
  //   "blocks": [
  //     {
  // 			"type": "header",
  // 			"text": {
  // 				"type": "plain_text",
  // 				"text": "Your Current Elicit Profile:",
  // 				"emoji": true
  // 			}
  // 		},
  //     {
  //       "type": "section",
  //       "text": {
  //         "type": "mrkdwn",
  //         // TO-DO <@${user_id}>
  //         "text": `:bust_in_silhouette:  *Name*: ${user_id}\n\n :mortar_board:  *Graduating Year*: ${output[0]}\n\n :brain:  *Expertise*: ${output[1]}`
  //       },
  // 			// "accessory": {
  // 			// 	"type": "image",
  // 			// 	"image_url": url,
  // 			// 	"alt_text": "alt text for image"
  // 			// }
  //     },
  //     {
  //       "type": "section",
  //       "text": {
  //         "type": "plain_text",
  //         "text": " ",
  //         "emoji": true
  //       }
  //     },
  //     {
  //       "type": "actions",
  //       "elements": [
  //         {
  //           "type": "button",
  //           "text": {
  //             "type": "plain_text",
  //             "text": "Edit Your Profile"
  //           },
  //           "style": "primary",
  //           "action_id": "button_edit"
  //         }
  //       ]
  //     }
  //   ]
  // }


  return{
    "attachments": [
      {
        "color": "#f2c744",
        "blocks": [
          {
          	"type": "header",
          	"text": {
          		"type": "plain_text",
          		"text": "Your Current Elicit Profile:",
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
            "type": "section",
            "text": {
              "type": "mrkdwn",
              // TO-DO <@${user_id}>
              "text": `:bust_in_silhouette:  *Name*: ${user_id}\n\n :mortar_board:  *Graduating Year*: ${output[0]}\n\n :brain:  *Expertise*: ${output[1]}`
            },
            "accessory": {
            	"type": "image",
            	"image_url": "https://static.wikia.nocookie.net/spongebob/images/9/96/The_Two_Faces_of_Squidward_174.png/revision/latest/scale-to-width-down/1000?cb=20200923005328",
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
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Edit Your Profile"
                },
                "style": "primary",
                "action_id": "button_edit"
              }
            ]
          }
        ]
      }
    ]
  }
}


// by user_id, return a message blocks element of an existing user profile
const showAllProfiles = async function() {
  let output = await data.getAllProfile();

  // get blocks
  let blocks = [];
  // add header
  blocks.push(
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": "Welcome to the Elicit community!",
      "emoji": true
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Here you can view all user in the MCIT community we have data of. Look through it and see if you find anyone you want to talk to.\n\n:bust_in_silhouette:  Name   :mortar_board:  Graduating Year   :brain:  Expertise"
    },
      "accessory": {
        "type": "image",
        "image_url": "https://i.pinimg.com/originals/d7/0c/f5/d70cf54d4f45da79f3397ed9588f9ae8.jpg",
        "alt_text": "spongebob_community"
      }
  },
  {
    "type": "divider"
  });

  output.forEach(function(user){
      blocks.push(
    {
			"type": "section",
			"text": {
				"type": "mrkdwn",
        // TODO
        // <@${user[0]}>
        // "text": `:bust_in_silhouette:  Name: *${user[0]}*\n\n :mortar_board:  Graduating Year: *${user[1]}*\n\n :brain:  Expertise: *${user[2]}*`
        "text": `:bust_in_silhouette:  *${user[0]}*\n\n :mortar_board:  *${user[1]}*`
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Message  :outbox_tray:",
					"emoji": true
				},
				"value": user[0],
				"action_id": "button_message_by_profile"
			},

		},
    {
      "type": "section",
			"text": {
				"type": "mrkdwn",
        // TODO
        // <@${user[0]}>
        // "text": `:bust_in_silhouette:  Name: *${user[0]}*\n\n :mortar_board:  Graduating Year: *${user[1]}*\n\n :brain:  Expertise: *${user[2]}*`
        "text": `:brain:  ${user[2]}`
			},
    },
    {
      "type": "divider"
    }

      );
  });




  return {
    	"title": {
    		"type": "plain_text",
    		"text": "Elicit Profiles",
    		"emoji": true
    	},
    	// "submit": {
    	// 	"type": "plain_text",
    	// 	"text": "Submit",
    	// 	"emoji": true
    	// },
    	"type": "modal",
    	"close": {
    		"type": "plain_text",
    		"text": "Cancel",
    		"emoji": true
    	},
    	"blocks": blocks
  }
}




module.exports = {
  newUserGreeting: newUserGreeting,
  existingUserGreeting: existingUserGreeting,
  questionForm: questionForm,
  selectUsers: selectUsers,
  newUserInformation: newUserInformation,
  addSkill: addSkill,
  homepage: homepage,
  showUserProfile: showUserProfile,
  showAllProfiles:showAllProfiles
}
