const fetch = require('node-fetch');
const clientId = '';
const clientSecret = '';
const environment = 'usw2.pure.cloud'; // expected format: mypurecloud.com


// Genesys Cloud Authentication
const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');

// Test token by getting role definitions in the organization.
function handleTokenCallback(body){
    return fetch(`https://api.${environment}/api/v2/authorization/roles`, {
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': `${body.token_type} ${body.access_token}`
    }
    })
    .then(res => {
    if(res.ok){
        console.log(res);
    return res.json();
    } else {
    throw Error(res.statusText);
    }
    })
    .then(jsonResponse => {
    console.log(jsonResponse);
    })
    .catch(e => console.error(e));
    }


fetch(`https://login.${environment}/oauth/token`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString(
      "base64"
    )}`,
  },
  body: params,
})
  .then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      throw Error(res.statusText);
    }
  })
  .then((jsonResponse) => {
    console.log(jsonResponse);
    handleTokenCallback(jsonResponse);
  })
  .catch((e) => console.error(e));