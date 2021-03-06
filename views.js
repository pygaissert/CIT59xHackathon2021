// views.js
// This is a module for creating the app's views

// Import the data.js module
const data = require('./data');
const parse = require('./parse');

/* GREETINGS */

// FUNCTION: Returns a view JSON object for a message to a user not in the
//           "users" collection
// ARGUMENT: userID (String)
const newUserGreeting = function (userID) {
  return {
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${userID}>!\nWould you like to join?`
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
    text: `Hey there <@${userID}>!`
  }
};

// FUNCTION: Returns a view JSON object for a message to a user
//           in the "users" collection
// ARGUMENT: userID (String)
const existingUserGreeting = function (userID) {
  return {
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${userID}>!\nWhat can I help you with?`
        },
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "View Profile"
            },
            "style": "primary",
            "action_id": "button_viewMyProfile"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Ask a Question"
            },
            "action_id": "button_question"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "View classmates profiles"
            },
            "action_id": "button_profiles"
          }
        ]
      }
    ],
    text: `Hey there <@${userID}>!`
  }
};



/* NEW USER FORM */

// FUNCTION: Returns a view JSON object for the Create Profile view
// ARGUMENTS: channel (String), timestamp (String)
const newUserInformation = async function (channel, timestamp) {
  topicList = await data.listTopics();
  return {
    type: "modal",
    private_metadata: `${channel}_${timestamp}`,
    callback_id: "modal-newuser",
    title: {
      type: "plain_text",
      text: "Welcome to EliCIT!",
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
          text: "To participate, tell us about yourself! :bust_in_silhouette:"
        }
      },
      {
        type: "input",
        block_id: "student_name",
        element: {
          type: "plain_text_input",
          action_id: "student_name",
          placeholder: {
            type: "plain_text",
            text: "ie: John Smith"
          }
        },
        label: {
          type: "plain_text",
          text: "Enter your Full Name",
          emoji: true
        }
      },
      // Static select button for student status
      {
        type: "input",
        block_id: "select_year",
        element: {
          type: "plain_text_input",
          action_id: "graduation_year",
          placeholder: {
            type: "plain_text",
            text: "ie: 2021"
          }
        },
        label: {
          type: "plain_text",
          text: "Graduation Year  :mortar_board:",
          emoji: true
        }
      },
      // List skills from a external multi-select
      {
        type: "section",
        block_id: "select_topics_newuser",
        text: {
          type: "mrkdwn",
          text: "*List your skills of expertise* :memo:"
        },
        accessory: {
          action_id: "select_topics_newuser",
          type: "multi_static_select",
          placeholder: {
            type: "plain_text",
            text: "Programming Languages, Data Visualization, . . ."
          },
          option_groups: topicList
        }
      },
      {
        type: "section",
        block_id: "add_new_skill",
        text: {
          type: "mrkdwn",
          text: "*Don't see your skills listed above?*"
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Add a new skill",
            emoji: true
          },
          value: "add_new_skill",
          action_id: "button_addSkill"
        }
      }
    ]
  }
};

// FUNCTION: block format for new user and edit profile form by clearing block 3
const clearSkillList = async function() {
  let topicList = await data.listTopics();
  return {
    // List skills from a external multi-select
    type: "section",
    block_id: "select_topics_newuser",
    text: {
      type: "mrkdwn",
      text: "*. . . Loading Updated Topics . . .*"
    }
  }
}

// FUNCTION: block format for new user and edit profile form by updating
//           selected skills and topics list in block 3
// ARGUMENT: selectedList (array of string), topicList (array of string)
const updateSkillList = async function(selectedList, topicList) {
  return {
    // List skills from a external multi-select
    type: "section",
    block_id: "select_topics_newuser",
    text: {
      type: "mrkdwn",
      text: "*List your skills of expertise* :memo:"
    },
    accessory: {
      action_id: "select_topics_newuser",
      type: "multi_static_select",
      placeholder: {
        type: "plain_text",
        text: "Programming Languages, Data Visualization, . . ."
      },
      initial_options: selectedList,
      option_groups: topicList
    }
  }
}





/* ADDING NEW SKILLS TO ELICIT */

// FUNCTION:
// ARGUMENTS:
const addSkill = async function (channel, timestamp, hash, skillList) {
  let topicList = await data.listGroups();
  return {
    type: "modal",
    private_metadata: `${channel}_${timestamp}_${hash}_${skillList}`,
    callback_id: "modal_addskill",
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
      // List skills from a external static-select
      {
        type: "input",
        block_id: "add_Topic",
        element: {
          type: "static_select",
          placeholder: {
            type: "plain_text",
            text: "Select A Topic",
            emoji: true
          },
          action_id: "add_Topic",
          options: topicList
        },
        label: {
          type: "plain_text",
          text: "Select Topic of Expertise",
          emoji: true
        }
      },
      {
        type: "input",
        block_id: "add_Skill",
        element: {
          type: "plain_text_input",
          action_id: "add_Skill",
          placeholder: {
            type: "plain_text",
            text: "Type A Skill"
          }
        },
        label: {
          type: "plain_text",
          text: "Add A New Skill",
          emoji: true
        }
      }
    ]
  }
};





/* EDIT PROFILE */

// FUNCTION: Modal format for edit profile modal
// ARGUMENTS: channel (String), timestamp (string), slack_id(string)
const editUserInformation = async function (channel, timestamp, slack_id) {
  // get user information from data.js
  let info = await data.userInfo(slack_id);
  // get user's skills from data
  let userSkillList = await data.userSkill(slack_id);
  console.log(userSkillList);
  let formattedUserSkillList = await parse.formatSkillList(userSkillList);
  // get list of skills from data with user's skill in options_group
  topicList = await data.formatSkillToOptionsGroup(userSkillList);
  return {
    type: "modal",
    private_metadata: `${channel}_${timestamp}`,
    callback_id: "modal-editProfile",
    title: {
      type: "plain_text",
      text: "Edit profile",
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
          text: "Update your profile! :bust_in_silhouette:"
        }
      },
      {
        type: "input",
        block_id: "student_name",
        element: {
          type: "plain_text_input",
          action_id: "student_name",
          placeholder: {
            type: "plain_text",
            text: "ie: John Smith"
          },
          initial_value: info[0]
        },
        label: {
          type: "plain_text",
          text: "Enter your Full Name",
          emoji: true
        }
      },
      // Static select button for student status
      {
        type: "input",
        block_id: "select_year",
        element: {
          type: "plain_text_input",
          action_id: "graduation_year",
          placeholder: {
            type: "plain_text",
            text: "ie: 2021"
          },
          initial_value: info[1]
        },
        label: {
          type: "plain_text",
          text: "Graduation Year  :mortar_board:",
          emoji: true
        }
      },
      // List skills from a external multi-select
      {
        type: "section",
        block_id: "select_topics_newuser",
        text: {
          type: "mrkdwn",
          text: "*List your skills of expertise* :memo:"
        },
        accessory: {
          action_id: "select_topics_newuser",
          type: "multi_static_select",
          placeholder: {
            type: "plain_text",
            text: "Programming Languages, Data Visualization, . . ."
          },
          initial_options: formattedUserSkillList,
          option_groups: topicList
        }
      },
      {
        type: "section",
        block_id: "add_new_skill",
        text: {
          type: "mrkdwn",
          text: "*Don't see your skills listed above?*"
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Add a new skill",
            emoji: true
          },
          value: "add_new_skill",
          action_id: "button_addSkill"
        }
      }
    ]
  }
};



/* QUESTION FORM */

// FUNCTION: Returns a view JSON object for the base Question Form
const questionForm = async function () {
  // Get all topics from database as a JSON object
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
      			type: "input",
      			block_id: "select_topics_question",
            dispatch_action: true,
      			label: {
      				type: "plain_text",
      				text: "Select related topic(s)"
      			},
      			element: {
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
      	],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
  }
}

// OBJECT: 3rd block for the Question Form when no topics are selected
const noTopicsSelected = {
  type: "section",
  block_id: "select_users_question",
  text: {
    type: "mrkdwn",
    text: " "
  },
}

// FUNCTION: Returns the 3rd block for the Question Form
//           when topics are selected but no users found
// ARGUMENT: empty_groups (String[])
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

// FUNCTION: Returns the 3rd block for the Question Form
//           when topics are selected and users are found
// ARGUMENT: userList (option_groups JSON object)
const usersFound = function(userList) {
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
// homepage view
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
  				"text": "Introducing EliCIT - 100% THAT app you've been looking for! :wink:",
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
          "text": "What is EliCIT?",
          "emoji": true
        }
      },
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "-\t   EliCIT harness the collective skills and experiences of the MCIT student body so that no problem will ever go unsolved.\t\t"
  			}
  		},
  		{
  			"type": "section",
  			"text": {
  				"type": "mrkdwn",
  				"text": "-\t   Whenever you have a burning question about JavaScript :jigsaw:, Machine Learning :robot_face: , Graphic Design :art: , the healthcare industry :hospital: , editing a cover letter :memo: , or even general organization techniques :busts_in_silhouette: , EliCIT will help direct your question to one of your many benevolent classmates."
  			},
  			"accessory": {
  				"type": "image",
  				"image_url": "https://raw.githubusercontent.com/pygaissert/CIT59xHackathon2021/main/pics/spongebob-rainbow.jpg",
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
          "text": "How to use EliCIT?",
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
  				"text": "*About EliCIT:*\n\n EliCIT is a student project at the CIT59x 2021 winter hackathon. Driven by the hope to better connect and foster the MCIT student community, the EliCIT team hope to create application that facilitates and encourages students to be each other's greatest allies."
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

  return{
    "attachments": [
        {
	        // "mrkdwn_in": ["text"],
            "color": "#36a64f",
            // "pretext": "*Here is your current Elicit profile:*",
            // "text": `:bust_in_silhouette:  *Name*:  ${user_id}`,
            "fields": [
                {
                    "title": ":bust_in_silhouette:  *Name*:",
                    "value": `-\t  <@${user_id}>`,
                    "short": true
                },
                {
                    "title": ":mortar_board:  *Graduating Year*: ",
                    "value": `-\t  ${output[0]}`,
                    "short": true
                },
                {
                    "title": ":brain:  *Expertise*:",
                    "value": `-\t  ${output[1]}`,
                    "short": false

                }
            ],

        },
        {
          "color": "#f2c744",
          "blocks": [
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": "*Learned new skills? Click to update your profile:*",
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
      ],
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Here is your current EliCIT profile:*"
          }
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
      "text": "Welcome to the EliCIT community!",
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
        "image_url": "https://raw.githubusercontent.com/pygaissert/CIT59xHackathon2021/main/pics/spongebob_community.jpeg",
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
        "text": `:bust_in_silhouette:  *<@${user[0]}>*\n\n :mortar_board:  *${user[1]}*`
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Send message  :outbox_tray:",
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
    		"text": "EliCIT Profiles",
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
    		"text": "Close",
    		"emoji": true
    	},
    	"blocks": blocks
  }
}

//
// // edit an existing user infomation
// const editUserInformation = async function (user_id, channel, timestamp) {
//   let topicList = await data.listTopics();
//   let userExistingSkillList = await data.getProfileByIdForEdit(user_id);
//   let uExistYear = await data.getProfileById(user_id);
//
//   console.log(" Reaching list");
//   console.log(uExistYear[0]);
//   console.log(userExistingSkillList);
//
//
//   return {
//     type: "modal",
//     private_metadata: `${channel}_${timestamp}`,
//     callback_id: "modal_edit",
//     title: {
//       type: "plain_text",
//       text: "EliCIT",
//       emoji: true
//     },
//     submit: {
//       type: "plain_text",
//       text: "Submit",
//       emoji: true
//     },
//     close: {
//       type: "plain_text",
//       text: "Cancel",
//       emoji: true
//     },
//     blocks: [
//       {
//         type: "section",
//         text: {
//           type: "mrkdwn",
//           text: "Edit your EliCIT profile :bust_in_silhouette:"
//         }
//       },
//       // Static select button for student status
//       {
//         type: "input",
//         block_id: "edit_year",
//         element: {
//           type: "plain_text_input",
//           action_id: "graduation_year",
//           placeholder: {
//             type: "plain_text",
//             text: `Year on file: ${uExistYear[0]}`
//           },
//           initial_value: `${uExistYear[0]}`
//         },
//         label: {
//           type: "plain_text",
//           text: "Graduation Year  :mortar_board:",
//           emoji: true
//         }
//       },
//       // List skills from a external multi-select
//       {
//         type: "section",
//         block_id: "edit_topics_newuser",
//         text: {
//           type: "mrkdwn",
//           text: "List your skills of expertise :memo:"
//         },
//         accessory: {
//           action_id: "select_topics_edit",
//           type: "multi_static_select",
//           placeholder: {
//             type: "plain_text",
//             text: "Programming Languages, data visualization, ..."
//           },
//           initial_options: userExistingSkillList,
//           option_groups: topicList,
//         }
//       },
//       {
//         type: "section",
//         block_id: "add_new_skill",
//         text: {
//           type: "mrkdwn",
//           text: "Don't see your skills listed above?"
//         },
//         accessory: {
//           type: "button",
//           text: {
//             type: "plain_text",
//             text: "Add a new skill",
//             emoji: true
//           },
//           value: "add_new_skill",
//           action_id: "button_addSkill"
//         }
//       }
//     ]
//   }
// };





module.exports = {
  homepage: homepage,
  newUserGreeting: newUserGreeting,
  newUserInformation: newUserInformation,
  addSkill: addSkill,
  homepage: homepage,
  showUserProfile: showUserProfile,
  showAllProfiles:showAllProfiles,
  clearSkillList: clearSkillList,
  updateSkillList: updateSkillList,
  existingUserGreeting: existingUserGreeting,
  questionForm: questionForm,
  usersFound: usersFound,
  noUsersFound: noUsersFound,
  noTopicsSelected: noTopicsSelected,
  editUserInformation: editUserInformation
}
