// parse.js
// helper functions for parsing JSON

const isOptionGroupEmpty = function(option_groups) {
  let empty_groups = [];
  option_groups.forEach( function(group) {
    if (group.options.length == 0) {
      empty_groups.push(group.label.text);
    }
  });
  console.log(empty_groups);
}

const getValuesFromOptions = function(options) {
  let values = [];
  options.forEach( function(option) {
    values.push(`${option.value}`);
  });
  return values;
}

const parseQuestionSubmission = function(view, user) {
  topics = getValuesFromOptions(view.state.values.select_topics_question.select_topics_question.selected_options).join(', ');
  users = getValuesFromOptions(view.state.values.select_users_question.select_users_question.selected_options);
  if (!users.includes(user)) {
    users.push(user);
  }
  users = users.join(', ');
  question = view.state.values.input_question.input_question.value;
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
