// data.js
// This is a module for interacting with the MongoDB cluster


// Import MongoClient class from mongodb module
const MongoClient = require('mongodb').MongoClient;

// Import Uniform Resource Identifier for MongoDB cluster from .env file
const uri = process.env.MONGODB_CONNECTION;

// FUNCTION: Returns a new MongoClient object
const newClient = function() {
  return new MongoClient(uri, { useUnifiedTopology: true });
}

// FUNCTION: Checks if a user is already in "users" collection
// ARGUMENTS: userId (String) - Slack ID
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

// FUNCTION: Adds a new user to the "users" collection
// ARGUMENTS: userName (String), userId (String), userYear (String)
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

// FUNCTION:
// ARGUMENTS:
const addTopicToUser = async function(userId, topic) {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "topics-users"
  collection = await client.db("app-data").collection("topics-users");
  relation = {
    topic: topic,
    user: userId
  }
  await collection.insertOne(relation, {w: 1}, function(err, doc) {
    if (err) {
      console.log(err);
      process.exit(0);
    }
    let saved = doc.ops[0];
    console.log(`${saved.user}: (${saved.topic})`);
    // Disconnect client from MongoDB cluster
    client.close();
  });
}


// FUNCTION: Adds user-inputted skills to the "topics" collection
// ARGUMENTS:
const addNewSkill = async function(topic, skill) {
  //create new MongoDB client
  let client = new MongoClient(uri, { useUnifiedTopology: true });
  // Connect client to MongoDB cluster
  await client.connect();
  // Get "users" collection from "app-data" database
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
    console.log(`${saved.group}: ${saved.name}`);
    // Disconnect client from MongoDB cluster
    client.close();
  });
}

// FUNCTION: Formats topic groups in "topics" collection as an options JSON object
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

// FUNCTION: Formats topics in "topics" colelction as an option_groups JSON object
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
      }
    );
  }
  return option_groups;
  // Disconnect client from MongoDB cluster
  client.close();
}

// FUNCTION: Formats selected skill list into option_groups JSON object and append to listTopics
// ARGUMENTS: string of skills
const formatSkillToOptionsGroup = async function(skillList){
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
      }
    );
  }
  // Disconnect client from MongoDB cluster
  client.close();
  // Empty array to store skill in option_group
  let options = [];
  // Store each new skill in options
  for (skill of skillList){
    options.push(
      {
        text: {
          type: 'plain_text',
          text: skill
        },
        value: skill
      }
    );
  }
  // After topics have been added to options[], add formatted JSON to option_groups[]
  option_groups.push(
    {
      label: {
        type: "plain_text",
        text: "User Selected Skill(s)"
      },
      options: options
    }
  );
  return option_groups;
}

// FUNCTION: Finds user's graduation year and full name and puts that into an array
// ARGUMENT: user's slack_id
const userInfo = async function(userId){
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Empty array to store user graduation and name
  let info = [];
  // Find user's info from "users" collection
  let result = await client.db("app-data").collection("users").findOne({slack_id: userId});
  info.push(result.name);
  info.push(result.year);
  // Disconnect client from MongoDB cluster
  client.close();
  return info;
}

// Function: puts user's current skills into an array (no JSON object formatting)
// ARGUMENT: user's slack_id
const userSkill = async function(userId){
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Empty array to store option_groups for select menu
  let skills = [];
  // Get "topics-user" collection from "app-data" database
  // Find skills with user's slack_id
  const cursor = await client.db("app-data").collection("topics-users").find({user: userId});
  const parsedResult = await cursor.toArray();
  // Parse through results to obtain the topic string
  for (result of parsedResult){
    // Add topic string to skills array
    skills.push(result.topic);
  }
  client.close();
  return skills;
}

// FUNCTION:
// ARGUMENT:
const userUpdateInfo = async function(userId, newName, newYear){
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();
  // Find user's info from "users" collection
  collection = await client.db("app-data").collection("users");
  await collection.updateOne(
    {slack_id: {$lt: userId}}, { $set: {name: newName}}, { $set: {year: newYear}}
  );
  // Disconnect client from MongoDB cluster
  client.close();
}

// FUNCTION: Returns an array of all users in "users" collection
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
  await client.close();
  return user_list;
}

// FUNCTION: Removes a topic-user pairing from the "topics-users" collection
// ARGUMENTS: topicName (String), userID ()
const removeTopicFromUser = async function(topicName, userID) {
  let client = newClient();
    await client.connect();
    let connection = await client.db("app-data").collection("topics-users");
    // Removes a document from "topics-users" with the matching topic and user
    // let result = await connection.findOne({})
    let result = await connection.findOneAndDelete({ topic: topicName, user: userID });
    console.log(`deleted: ${result.value.topic} (${result.value.user})`);
    // if (deleteResult.deletedCount === 1) {
    //   console.log("Successfully deleted one document.");
    // } else {
    //   console.log("No documents matched the query. Nothing was deleted.")
    // }
    await client.close();
}

// FUNCTION: Returns an option_groups JSON of users grouped by topics
// ARGUMENTS: topics (String[])
const findUsersByTopics = async function(topics) {
  // Create new MongoDB client
  let client = newClient();
  // Connect client to MongoDB cluster
  await client.connect();

  let results = await client.db("app-data").collection("topics-users").aggregate([
    {
      $match:
      {
        topic: {$in: topics}
      }
    },
    {
      $lookup:
      {
        from: "users",
        localField: "user",
        foreignField: "slack_id",
        as: "userdetails"
      }
    }
  ]).toArray();
  let topic_groups = [];
  for (topic of topics) {
    users = results.filter(result => result.topic == topic);
    users = users.map(user => {
      return {
        text: {
          type: "plain_text",
          text: `${user.userdetails[0].name} (${user.userdetails[0].year})`
        },
        "value": `${user.user}`
      }
    });
    if (users.length != 0) {
      topic_groups.push(
        {
          label: {
            type: "plain_text",
            text: topic
          },
          options: users
      });
    }
  }
  // // Get "topics-users" collection from "app-data" database
  // let collection = await client.db("app-data").collection("topics-users");
  // let topic_groups = [];
  // for (topic of topics) {
  //   let users = [];
  //   await collection.find({"topic":topic}).forEach( function(doc) {
  //     users.push(
  //       {
  //         text: {
  //           type: "plain_text",
  //           text: `${doc.user}`
  //         },
  //         value: `${doc.user}`
  //       }
  //     );
  //   });
  //   if (users.length != 0) {
  //     topic_groups.push(
  //       {
  //         label: {
  //           type: "plain_text",
  //           text: topic
  //         },
  //         "options": users
  //     });
  //   }
  // }
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

  console.log(user_id)

  // make sure user is in db
  if(user == null){
    return null;
  }

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

    // make sure user is in db
    if(user == null){
      continue;
    }
    // !!!!! TODO: change this
    // // push user_id
    // temp.push(u);

    temp.push(u);
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


// // function to to get user profile in array, by user id
// // TODO: change user_id formated string when database is implemented
// const getProfileByIdForEdit = async function(user_id){
//
//   // // return values: two strings, year and expertise
//   // let res = [];
//
//   // Create new MongoDB client
//   let client = newClient();
//   // Connect client to MongoDB cluster
//   await client.connect();
//
//   // get skills:
//   // get two collections
//   let collectionUserTopic = await client.db("app-data").collection("topics-users");
//   let collectionUsers = await client.db("app-data").collection("users");
//   let collectionTopics = collection = await client.db("app-data").collection("topics");
//
//   // // get user document
//   // let user = await collectionUsers.findOne({slack_id:user_id});
//   //
//   // console.log(user_id)
//   // // get user graduating year:
//   // res.push(user.year);
//
//   //
//   // // array to store expertise in option elements of given user_id
//   // let exList = [];
//   // // Get topics associated with given user_id, add to array
//   // await collectionUserTopic.find({user:user_id}).sort({"topic":1}).forEach( function(item) {
//   //   // push topic as option object
//   //   exList.push(
//   //     {
//   //       "text": {
//   //         "type": 'plain_text',
//   //         "text": item.topic
//   //       },
//   //       "value": item.topic
//   //     });
//   // });
//
//   let option_groups = [];
//
//   let topic_groups = await collectionTopics.distinct("group");
//   console.log("Option Groups:");
//   console.log(topic_groups);
//
//   let check = true;
//
//   // Iterate over the topic groups
//   for (group of topic_groups) {
//     // Empty array to store options in current option_group
//     let options = [];
//     // Get topics in current topic group, and add formatted JSON to options[]
//     await collectionUserTopic.find({user:user_id, group:group}).sort({"name": 1}).forEach( function(topic) {
//       check = false;
//       options.push(
//         {
//           "text": {
//             "type": 'plain_text',
//             "text": item.topic
//           },
//           "value": item.topic
//         });
//     });
//
//     if (!check){
//       // After topics have been added to options[], add formatted JSON to option_groups[]
//       option_groups.push(
//         {
//           label: {
//             type: "plain_text",
//             text: group
//           },
//           options: options
//         });
//     }
//
//     }
//   //
//   //
//   // res.push(exList);
//
//   // return exList;
//   console.log("Return:");
//   console.log(option_groups);
//
//   return option_groups;
// }


// MODULE EXPORTS
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
  findSkillInList: findSkillInList,
  formatSkillToOptionsGroup: formatSkillToOptionsGroup,
  userInfo: userInfo,
  userSkill: userSkill,
  userUpdateInfo: userUpdateInfo,
  removeTopicFromUser: removeTopicFromUser,
}
