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

const listSkills = async function() {
  // Create new MongoDB client
  let client = new MongoClient(uri, { useUnifiedTopology: true });
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "skills" collection from "test_slack" database
  collection = await client.db("app-data").collection("topics");

  let option_groups = [];

  // get each skill name, push to option_group
  await collection.find({}).sort({group: 1, name: 1}).forEach( function(item) {
    // console.log( "Skill: " + item.name );
    option_groups.push(
        {
          text: {
            type: 'plain_text',
            text: item.name
          },
          value: item.name // MAYBE CHANGE THIS
        });
  });
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

  return option_groups;
}

module.exports = {
  addUser: addUser,
  userExists: userExists,
  listSkills:listSkills
}
