// parse.js
// This is a module of helper functions for parsing JSON objects

// Checks if an array of option_groups contains any empty option_groups
// (INCOMPLETE, CURRENTLY UNUSED)
const isOptionGroupEmpty = function(option_groups) {
  let empty_groups = [];
  option_groups.forEach( function(group) {
    if (group.options.length == 0) {
      empty_groups.push(group.label.text);
    }
  });
  console.log(empty_groups);
}

// FUNCTION: Returns an array of values parsed from an array of JSON options
// ARGUMENT: options (JSON[])
const getValuesFromOptions = function(options) {
  let values = [];
  options.forEach( function(option) {
    values.push(`${option.value}`);
  });
  return values;
}

// FUNCTION: Parses the view_submission from the Question Form and returns
//           a JSON object with fields necessary for sending their question
//           .topics = comma-separated topics relating to the question (String)
//           .users = comma-separated Slack IDs of the users to send the question to (String)
//           .question = the question (String)
// ARGUMENTS: view (JSON), user (String)
const parseQuestionSubmission = function(view, user) {
  // Parse the array of selected topics from the view_submission and join into a String
  topics = getValuesFromOptions(view.state.values.select_topics_question.select_topics_question.selected_options).join(', ');
  // Parse the array of selected users from the view_submission
  users = getValuesFromOptions(view.state.values.select_users_question.select_users_question.selected_options);
  if (users.length == 0) {
    users = getValuesFromOptionGroups(view.blocks[2].accessory.option_groups);
  }
  // Add the asking user's Slack ID to the array if it is not already included
  if (!users.includes(user)) {
    users.push(user);
  }
  // Join the Slack IDs into a comma-separated String
  users = users.join(', ');
  // Parse the question from the view_submission
  question = view.state.values.input_question.input_question.value;
  // Return a JSON object containing the topics, users, and question as fields
  return {
    topics: topics,
    users: users,
    question: question
  }
}

// FUNCTION: Returns an array of distinct values
//           parsed from an option_groups JSON
// ARGUMENT: option_groups
const getValuesFromOptionGroups = function(option_groups) {
  let values = [];
  // For each option group, add the values to the array
  for (group of option_groups) {
    values = values.concat(getValuesFromOptions(group.options));
  }
  // Return the array without duplicate values
  return [...new Set(values)];
}

// FUNCTION: Formats selected skills into options JSON object
// ARGUMENTS: list (String[])
const formatSkillList = async function(list) {
  console.log()
  let selectedSkills = [];
  for (i = 0; i < list.length; i++){
    selectedSkills.push(
      {
        text: {
          type: "plain_text",
          text: list[i],
          emoji: true
        },
        value: list[i]
      }
    );
  }
  return selectedSkills;
}

// FUNCTION: Capitalizes the first letter of each word of a string
// ARGUMENTS: skill_input (string)
const capitalize = function(skill_input){
  let skill_array = skill_input.split(" ");
  let formatted_skill = "";
//  console.log(skill_array);
  for (word of skill_array){
    formatted_skill+= word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + " ";
  }
  //console.log(formatted_skill);
  return formatted_skill;
}

// FUNCTION:
// ARGUMENTS:
const toKeepSkillList = function(old_skills, new_skills){
  let keepList = [];
  for (i of old_skills){
    for (j of new_skills){
      if (i === j){
        keepList.push(i);
      }
    }
  }
  return keepList;
}

// FUNCTION:
// ARGUMENTS:
const toDeleteSkillList = function(keep_skills, old_skills){
  let deleteList = old_skills;
  for (i = 0; i < old_skills.length; i++){
    for (j = i; j < keep_skills.length; j++){
      if(i === j){
        deleteList.splice(old_skills[i], 1);
      }
    }
  }
  return deleteList;
}

// FUNCTION:
// ARGUMENTS:
const toAddSkillList = function(keep_skills, new_skills){
  let addList = new_skills;
  for (i = 0; i < new_skills.length; i++){
    for (j = i; j < keep_skills.length; j++){
      if(i === j){
        addList.splice(new_skills[i], 1);
      }
    }
  }
  return addList;
}

module.exports = {
  isOptionGroupEmpty: isOptionGroupEmpty,
  getValuesFromOptions: getValuesFromOptions,
  parseQuestionSubmission: parseQuestionSubmission,
  formatSkillList: formatSkillList,
  capitalize: capitalize,
  toKeepSkillList: toKeepSkillList,
  toDeleteSkillList: toDeleteSkillList,
  toAddSkillList: toAddSkillList
}
