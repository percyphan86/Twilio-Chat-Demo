const Twilio = require('twilio');
const config = require('./config');

async function channelHandler(action, identity = 0) {
  const client = new Twilio(
    config.TWILIO_API_KEY,
    config.TWILIO_API_SECRET,
    {accountSid: config.TWILIO_ACCOUNT_SID}
  );
  let response = {};
  console.log(identity);
  try {
    if(action === 'add') {
      response = await client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
             .channels
             .create({uniqueName: identity});
    } 

    if(action === 'list') {
      response = await client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
             .channels
             .list({limit: 200})
      
    }
    if(action === 'delete') {
      console.log('Delete channel: ' + identity);
      response = await client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
             .channels(identity)
             .remove()
      
    }
  } catch (error) {
    console.log('err:' + error);
  }


  return {
    response: response
  };
  
}

module.exports = channelHandler;
