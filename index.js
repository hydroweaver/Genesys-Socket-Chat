// https://developer.genesys.cloud/api/tutorials/chat-email-routing/

const platformClient = require('purecloud-platform-client-v2');
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

// Get client credentials from environment variables
const CLIENT_ID = '';
const CLIENT_SECRET = '';

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

// WORKING CREATE CHAT CODE
var config = {
  method: "post",
  url: `https://api.usw2.pure.cloud/api/v2/webchat/guest/conversations`,
  headers: {
    Authorization: `Bearer ` + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    "Content-Type": "application/json",
  },
  json:true, 
  data: createChatBody,
};

axios(config)
  .then(function (response) {
    // console.log(JSON.stringify(response.data));
    memberId = response.data.member.id;
    conversationId = response.data.id
    jwt = response.data.jwt;
    console.log(memberId, conversationId, jwt);

    //GET Streaming API Hit - Postman Handshake Details
    //response.data.eventStreamUri
    var wssconfig = {
      method: "get",
      url: `wss://streaming.usw2.pure.cloud/chat/jwt/${jwt}`,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket'
      },
      json:true,
    };

    return axios(wssconfig).then((response)=>{
      console.log(response);
    })
    })
  .catch(function (error) {
    console.log(error);
});

function prompt(){
  rl.question("\nMessage from User : ", function(userMessage) {
    var data = JSON.stringify({
      "body": userMessage,
      "bodyType": "standard"
    });
    //make send message request : POST /api/v2/webchat/guest/conversations/{conversationId}/members/{memberId}/messages	
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

    //get messages of the current chat : GET GET /api/v2/webchat/guest/conversations/{conversationId}/messages	
    var config = {
      method: 'get',
      url: `https://api.usw2.pure.cloud/api/v2/webchat/guest/conversations/${conversationId}/messages`,
      headers: { 
        'Authorization': `Bearer ${jwt}`, 
        'Content-Type': 'application/json'
      }
    };
    axios(config)
    .then(function (response) {
      console.log('Printing Messages :', JSON.stringify(response.data));
      })
    .catch(function (error) {
      console.log(error);
    });

    if(userMessage == 'exit'){
        rl.close();
    }
    else{
        prompt()
    }
  });
}

rl.on("close", function() {
    console.log("\nExit");
    process.exit(0);
});