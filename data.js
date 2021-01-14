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
        });
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
  let client = new MongoClient(uri, { useUnifiedTopology: true });
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

module.exports = {
  addUser: addUser,
  userExists: userExists,
  listSkills:listSkills,
  listUsers:listUsers
}
