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

// Returns an array of values parsed from an array of JSON option objects
const getValuesFromOptions = function(options) {
  let values = [];
  options.forEach( function(option) {
    values.push(`${option.value}`);
  });
  return values;
}

// Parses the view_submission from the Question Form and returns
// a JSON object with fields necessary for sending their question
// .topics = comma-separated topics relating to the question (String)
// .users = comma-separated Slack IDs of the users to send the question to (String)
// .question = the question (String)
const parseQuestionSubmission = function(view, user) {
  // Parse the array of selected topics from the view_submission and join into a String
  topics = getValuesFromOptions(view.state.values.select_topics_question.select_topics_question.selected_options).join(', ');
  // Parse the array of selected users from the view_submission
  users = getValuesFromOptions(view.state.values.select_users_question.select_users_question.selected_options);
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

module.exports = {
  isOptionGroupEmpty: isOptionGroupEmpty,
  getValuesFromOptions: getValuesFromOptions,
  parseQuestionSubmission: parseQuestionSubmission
}
