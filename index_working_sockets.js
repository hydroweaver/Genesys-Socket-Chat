// https://developer.genesys.cloud/api/tutorials/chat-email-routing/

const platformClient = require('purecloud-platform-client-v2');
// const websocket = require('websocket');
const WebSocket = require('websocket').w3cwebsocket;
var axios = require('axios');

const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Set Genesys Cloud objects
const client = platformClient.ApiClient.instance;
client.setEnvironment(platformClient.PureCloudRegionHosts.us_west_2);
// const notificationsApi = new platformClient.NotificationsApi();
// const conversationsApi = new platformClient.ConversationsApi();

// Get client credentials from environment variables
const CLIENT_ID = '';
const CLIENT_SECRET = '';

// Set environment
// const environment = platformClient.PureCloudRegionHosts['usw2.pure.cloud'];
// if(environment) client.setEnvironment(environment);
// console.log(client);


// Use your own data here
// const PROVIDER_NAME = 'Developer Center Tutorial';
// const QUEUE_ID = '636f60d4-04d9-4715-9350-7125b9b553db';

// Local vars
// let conversationsTopic = null;
let webSocket = null;
let memberId = null;
let conversationId = null;
let jwt = null;


// Authenticate with Genesys Cloud

const webChatApi = new platformClient.WebChatApi();

const createChatBody = {
  organizationId: '',
  deploymentId: '',
  routingTarget: {
    targetType: 'queue',
    targetAddress: 'LucyBot',
  },
  memberInfo: {
    displayName: 'JavaScript Guest',
    customFields: {
      firstName: 'John', 
      lastName: 'Doe'
    }
  }
};

// // WORKING CREATE CHAT CODE
// var config = {
//   method: "post",
//   url: `https://api.usw2.pure.cloud/api/v2/webchat/guest/conversations`,
//   headers: {
//     Authorization: `Bearer ` + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
//     "Content-Type": "application/json",
//   },
//   json:true, 
//   data: createChatBody,
// };

// axios(config)
//   .then(function (response) {
//     // console.log(JSON.stringify(response.data));
//     memberId = response.data.member.id;
//     conversationId = response.data.id
//     jwt = response.data.jwt;
//     console.log(memberId, conversationId, jwt);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

// Create chat
webChatApi.postWebchatGuestConversations(createChatBody)
  .then((createChatResponse) => {
    // Handle response
    console.log(createChatResponse);
    memberId = createChatResponse['member'].id;
    webSocket = new WebSocket(createChatResponse['eventStreamUri']);
    webSocket.onopen = () => {
			console.log('WSS Connection Established');
		};
    webSocket.onmessage = (msg) =>{
      jwt = createChatResponse['jwt'];
      let cleanMsg = JSON.parse(msg.data);
      // console.log(jwt);
      // client.setAccessToken(cleanMsg.jwt);
      // client.setJwt(cleanMsg.jwt);
      if(cleanMsg.eventBody.body && cleanMsg.eventBody.conversation.id){
        console.log('\nMessage Received:', cleanMsg.eventBody.body);
        conversationId = cleanMsg.eventBody.conversation.id;
        console.log(memberId, conversationId);
        prompt()
      }
    }
  })
  .catch((response) => {
    // Handle failure response
    console.log(response);
    console.log(`${response.status} - ${response.error.message}`);
    console.log(response.error);
  });

function prompt(){
  rl.question("\nMessage from User : ", function(userMessage) {

    var data = JSON.stringify({
      "body": userMessage,
      "bodyType": "standard"
    });

    var config = {
      method: 'post',
      url: `https://api.usw2.pure.cloud/api/v2/webchat/guest/conversations/${conversationId}/members/${memberId}/messages`,
      headers: { 
        'Authorization': `Bearer ${jwt}`, 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

//for some reason client.setJwt is not working! so swithing to HTTPS call.

    // webChatApi
    //   .postWebchatGuestConversationMemberMessages(
    //     conversationId,
    //     memberId,
    //     {
    //       "body" : name,
    //       "bodyType" : "standard"
    //   }
    //   )
    //   .then((data) => {
    //     console.log(
    //       `postWebchatGuestConversationMemberMessages success! data: ${JSON.stringify(
    //         data,
    //         null,
    //         2
    //       )}`
    //     );
    //   })
    //   .catch((err) => {
    //     console.log(
    //       "There was a failure calling postWebchatGuestConversationMemberMessages"
    //     );
    //     console.error(err);
    //   });

      // console.log(`\nYou typed : ${name}`);




      if(userMessage == 'exit'){
          rl.close();
      }
      else{
          prompt()
      }
  });
}


rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});

// prompt()
