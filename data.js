// data.js
// This is a module for interacting with the MongoDB database

// FOR INITIALIZING MONGODB CLIENTS
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_CONNECTION;

const userExists = async function(userId) {
  // Create new MongoDB client
  let client = new MongoClient(uri, { useUnifiedTopology: true });
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

const addUser = async function(userName, userId) {
  // Create new MongoDB client
  let client = new MongoClient(uri, { useUnifiedTopology: true });
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "users" collection from "test_slack" database
  collection = await client.db("app-data").collection("users");
  user = {
    name: userName,
    slack_id: userId
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

// Copied from Jintong's code
const listSkills = async function() {
  // Create new MongoDB client
  let client = new MongoClient(uri, { useUnifiedTopology: true });
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "skills" collection from "test_slack" database
  collection = await client.db("app-data").collection("topics");
  // 2d array to store option_groups for modal view
  let option_groups = [];
  // get array of groups (strings) from skilsl collection
  let groups = await collection.distinct("group");
  // for each group, get a 1-d option array
  for (group of groups) {
    // get option array
    let option = [];
    // find each JSON under group:group, push to option
    let eachColl = await collection.find({group:group}).forEach( function(item) {
      option.push(
        {
          text: {
            type: 'plain_text',
            text: item.name
          },
          value: item.name
        }
      );
    });
    // after 1D option array is complete, add label and push an option group to 2-D array
    option_groups.push(
      {
        label: {
          type: "plain_text",
          text: group
        },
        options: option
      });
    }
    return option_groups;
  }
  // end copy

module.exports = {
  addUser: addUser,
  userExists: userExists,
  listSkills: listSkills
}
