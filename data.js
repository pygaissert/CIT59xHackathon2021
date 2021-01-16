// data.js
// This is a module for interacting with the MongoDB database

// FOR INITIALIZING MONGODB CLIENTS
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_CONNECTION;
const newClient = function() {
  return new MongoClient(uri, { useUnifiedTopology: true });
}

const userExists = async function(userId) {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  collection = await client.db("app-data").collection("users");
  exists = await collection.findOne( {slack_id: userId});
  if (exists) {
    return true;
  } else {
    return false;
  }
  client.close();
}


// Add user id, name, and year into users collection
const addUser = async function(userName, userId, userYear) {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "users" collection from "app-data" database
  collection = await client.db("app-data").collection("users");
  user = {
    name: userName,
    slack_id: userId,
    year: userYear
  }
  await collection.insertOne(user, {w: 1}, function(err, doc) {
    if (err) {
      console.log(err);
      process.exit(0);
    }
    let saved = doc.ops[0];
    console.log(`${saved._id}: ${saved.name} (${saved.slack_id})`);
    // Disconnect client from MongoDB cluster
    client.close();
  });
}

// Add user id and skill (topic) into topics-users collection
const addUserSkill = async function(userId, skillList) {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "users" collection from "app-data" database
  collection = await client.db("app-data").collection("topics-users");
  for (skill of skillList) {
    topic = {
      user: userId,
      topic: skill
    }
    await collection.insertOne(topic, {w: 1}, function(err, doc) {
      if (err) {
        console.log(err);
        process.exit(0);
      }
      let saved = doc.ops[0];
      console.log(`${saved.user}: ${saved.topic})`);
  }
    // Disconnect client from MongoDB cluster
    client.close();
  });
}

// format selected skills into options block for update NewUserView
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

// Adds user inputted skill into database
const addNewSkill = async function(topic, skill) {
  //create new MongoDB client
  let client = new MongoClient(uri, { useUnifiedTopology: true });
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "users" collection from "test_slack" database
  collection = await client.db("app-data").collection("topics");
  topic = {
    name: skill,
    group: topic
  }
  await collection.insertOne(topic, {w: 1}, function(err, doc) {
    if (err) {
      console.log(err);
      process.exit(0);
    }
    let saved = doc.ops[0];
    console.log(`${saved._id}: ${saved.group} (${saved.name})`);
    // Disconnect client from MongoDB cluster
    client.close();
  });
}

// Returns all skills sorted by group, formatted as [{ options: [{},...] },...]
const listGroups = async function() {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "topics" collection from "app-data" database
  collection = await client.db("app-data").collection("topics");
  // Empty array to store option_groups for select menu
  let options = [];
  // Get array of distinct topic groups (strings) from "topics" collection
  let topic_groups = await collection.distinct("group");
  // Iterate over the topic groups
  for (group of topic_groups) {
    options.push(
      {
        text: {
          type: 'plain_text',
          text: group
        },
        value: group
      }
    );
  }
  return options;
  console.log(options);
  // Disconnect client from MongoDB cluster
  client.close();
}


// Returns all skills sorted by group, formatted as [{ options: [{},...] },...]
const listTopics = async function() {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "topics" collection from "app-data" database
  collection = await client.db("app-data").collection("topics");
  // Empty array to store option_groups for select menu
  let option_groups = [];
  // Get array of distinct topic groups (strings) from "topics" collection
  let topic_groups = await collection.distinct("group");
  // Iterate over the topic groups
  for (group of topic_groups) {
    // Empty array to store options in current option_group
    let options = [];
    // Get topics in current topic group, and add formatted JSON to options[]
    await collection.find({group:group}).sort({"name": 1}).forEach( function(topic) {
      options.push(
        {
          text: {
            type: 'plain_text',
            text: topic.name
          },
          value: topic.name
        });
      });
    // After topics have been added to options[], add formatted JSON to option_groups[]
    option_groups.push(
      {
        label: {
          type: "plain_text",
          text: group
        },
        options: options
      });
    }

      //   option_groups.push(
      //       {
      //         text: {
      //           type: 'plain_text',
      //           text: item.name
      //         },
      //         value: item.name // MAYBE CHANGE THIS to option_groups
      //       });
      // });
      // console.log( option_groups );


      // FIX THIS
      // Get array of skill groups from "skills" collection
      // groups = await collection.find({});
      //
      // // Get array of skills from "skills" collection
      // // skills = await collection.find({}).sort({group: 1, name: 1}).toArray();
      // // Initialize an empty options array for the dropdown menu
      // let option_groups = [];
      // // Add each skill's name to the options array
      // for (group of groups) {
      //   // let options = [];
      //   let skills = await collection.find({group: group}).sort({name: 1}).toArray();
      //   for (skill of skills) {
      //     console.log(skill.name);
      //
      //
      //     option_groups.push(
      //       {
      //       text: {
      //         type: 'plain_text',
      //         text: skill.name
      //       },
      //       value: "value-0"
      //     });
      //   }
      //   // option_groups.push({
      //   //   label: {
      //   //     type: 'plain_text',
      //   //     text: group
      //   //   },
      //   //   options: options
      //   // });
      // }

      // let alt = [        {
      //           text: {
      //             type: "plain_text",
      //             text: "Java"
      //           },
      //           value: "value-0"
      //         },
      //         {
      //           text: {
      //             type: "plain_text",
      //             text: "Python"
      //           },
      //           value: "value-1"
      //         },
      //         {
      //           text: {
      //             type: "plain_text",
      //             text: "Data Visualization"
      //           },
      //           value: "value-2"
      //         }]


  return option_groups;
}


const listUsers = async function() {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "skills" collection from "test_slack" database
  collection = await client.db("app-data").collection("users");
  // String array of user ID
  let user_list = [];
  // find each JSON under group:group, push to option
  let eachColl = await collection.find({}).forEach( function(item) {
    user_list.push(item.slack_id);
  });
  return user_list;
}

const addTopicToUser = async function() {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "topics-users"
  collection = await client.db("app-data").collection("topics-users");
  relation = {
    topic: topic,
    slack_id: userId
  }
  await collection.insertOne(relation, {w: 1}, function(err, doc) {
    if (err) {
      console.log(err);
      process.exit(0);
    }
    let saved = doc.ops[0];
    console.log(`${saved._id}: ${saved.name} (${saved.slack_id})`);
    // Disconnect client from MongoDB cluster
    client.close();
  });
}

const findUsersByTopics = async function(topics) {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "topics-users" collection from "app-data" database
  let collection = await client.db("app-data").collection("topics-users");
  let topic_groups = [];
  for (topic of topics) {
    let users = [];
    await collection.find({"topic":topic}).forEach( function(doc) {
      users.push(
        {
          text: {
            type: "plain_text",
            text: `${doc.user}`
          },
          value: `${doc.user}`
      }
    );
    });
    topic_groups.push(
      {
        label: {
          type: "plain_text",
          text: topic
        },
        "options": users
    });
  }
  return topic_groups;
}

module.exports = {
  addUser: addUser,
  addUserSkill: addUserSkill,
  userExists: userExists,
  listTopics:listTopics,
  listUsers:listUsers,
  addTopicToUser: addTopicToUser,
  findUsersByTopics: findUsersByTopics,
  addNewSkill: addNewSkill,
  listGroups: listGroups,
  formatSkillList: formatSkillList
}
