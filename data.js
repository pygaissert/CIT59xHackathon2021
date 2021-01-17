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
const addTopicToUser = async function(userId, topic) {
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
    console.log(`${saved.slack_id}: ${saved.topic}`);
    // Disconnect client from MongoDB cluster
    client.close();
  });
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

// Returns true if new user skill is a duplicate
const findSkillInList = async function(new_skill) {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "topics" collection from "app-data" database
  collection = await client.db("app-data").collection("topics");
  // Get array of distinct topic groups (strings) from "topics" collection
  let skillList = await collection.distinct("name");
  // Disconnect client from MongoDB cluster
  client.close();
  // create a switch to determine if there is a duplicate
  let dup_switch = false;
  // Iterate over the skillList to find a match
  for (skill of skillList) {
    if (skill.trim() == new_skill.trim()){
      dup_switch = true;
      break;
    }
  }
  //console.log(dup_switch);
  return dup_switch;
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
    if (users.length != 0) {
      topic_groups.push(
        {
          label: {
            type: "plain_text",
            text: topic
          },
          "options": users
      });
    }
  }
  return topic_groups;
}


// function to to get user profile in array, by user id
// TODO: change user_id formated string when database is implemented
const getProfileById = async function(user_id){

  // return values: two strings, year and expertise
  let res = [];

  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();

  // get skills:
  // get two collections
  let collectionUserTopic = await client.db("app-data").collection("topics-users");
  let collectionUsers = await client.db("app-data").collection("users");

  // get user document
  let user = await collectionUsers.findOne({slack_id:user_id});

  // get user graduating year:
  res.push(user.year);


  // array to store expertise of given user_id
  let exList = [];
  // Get topics associated with given user_id, add to array
  await collectionUserTopic.find({user:user_id}).sort({"topic":1}).forEach( function(item) {
    // exList.push(item.topic);
    exList.push(item.topic);
  });
  // concat all string in array and sperate by comma+spaces
  res.push(exList.join(", "));

  return res;
}

// function to to get all user profile in 2D array
// TODO: change user_id formated string when database is implemented
const getAllProfile = async function(){

  // return values, 2D arrays,
  // [["user_id", "year", "skills"]]
  let res = [];

  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();

  // get two collections
  let collectionUserTopic = await client.db("app-data").collection("topics-users");
  let collectionUsers = await client.db("app-data").collection("users");

  // Get array of distinct user_id
  // TODO: think about if there is repeat or not exist
  let users = await collectionUserTopic.distinct("user");
  users.sort();
  // Iterate over users
  for (u of users) {
    let temp = [];

    // get user document
    let user = await collectionUsers.findOne({slack_id:u});

    // !!!!! TODO: change this
    // // push user_id
    // temp.push(u);

    temp.push(user.name);
    // push year
    temp.push(user.year);

    // get skill list, sorted
    let exList = [];
    await collectionUserTopic.find({user:u}).sort({"group":1, "topic":1}).forEach( function(item) {
      exList.push(item.topic);
    });
    // push skills
    temp.push(exList.join(", "));

    // push to 2D return array
    res.push(temp);
  }

  return res;
}


module.exports = {
  addUser: addUser,
  userExists: userExists,
  listTopics:listTopics,
  listUsers:listUsers,
  addTopicToUser: addTopicToUser,
  findUsersByTopics: findUsersByTopics,
  addNewSkill: addNewSkill,
  getProfileById: getProfileById,
  getAllProfile: getAllProfile,
  listGroups: listGroups,
  findSkillInList: findSkillInList
}
