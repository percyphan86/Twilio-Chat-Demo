var userIDs = [];
var channelIDs = [];
var userId = '';
var userSID = '';
var channelId = '';
var $chatWindow = $('#messages');
var generalChannel;
var username;
$(function() {
  $('#userList').html('Loading...');

  bindUserList();
});

function bindUserList() {
  $('.loading').show();
  $.getJSON('/token', {
    action: 'list',
    type: 'user'
  }, function(data) {
    $('.loading').hide();
    userContent = '';
    userIDs = [];
    const totalUser = data.response.length;
    if (totalUser === 0) {
      userContent = 'There has no user, please create one'
    } else {
      for (i = 0; i < totalUser; i++) {
        const user = data.response[i];
        console.log(user);
        userIDs.push(user.identity.toLowerCase());
        var item = '<div class="item"><span>'+user.identity+'</span><a id="user'+i+'" class="btn btn-lg btn-success" href="#" onclick="selectUser(\''+user.identity+'\',\''+user.accountSid+'\')">Select</a></div>'
        userContent += item;
      }
    }
    $('#userList').html(userContent);
  });
}

function bindChannelList() {
  $('.loading').show();
  $.getJSON('/token', {
    action: 'list',
    type: 'channel'
  }, function(data) {
    $('.loading').hide();
    channelContent = '';
    channelIDs = [];
    const totalchannel = data.response.length;
    if (totalchannel === 0) {
      channelContent = 'There has no channel, please create one'
    } else {
      for (i = 0; i < totalchannel; i++) {
        const channel = data.response[i];
        console.log(channel)
        channelIDs.push(channel.uniqueName.toLowerCase());
        var item = '<div class="item"><span class="cname">'+channel.uniqueName+'</span><span class="info"><b>Member</b>('+channel.membersCount+')<b>Message</b>('+channel.messagesCount+')</span><a id="channel'+i+'" class="btn btn-lg btn-success" href="#" onclick="join(\''+channel.sid+'\')">Join</a></div>'
        channelContent += item;
      }
    }
    $('#channelList').html(channelContent);
  });
}

function selectUser(id, sid) {
  userId = id;
  userSID = sid;
  $('#section-user').hide();
  $('#section-channel').show();
  bindChannelList();
}

function join(id) {
  $('.loading').show();
  $('#section-channel').hide();
  $('#section-chat').show();
  channelId = id;
  $.getJSON('/token', {
    id: userId,
    sid: userSID,
    type: 'chat'
  }, function(data) {
    initChatRoom(data)
  });
}

function initChatRoom(data) {
  // Initialize the Chat client
  Twilio.Chat.Client.create(data.token).then(client => {
    console.log('Created chat client');
    chatClient = client;
    chatClient.getSubscribedChannels().then(function (list){
      checkCurrentChannelSubscribled(list.items);
    })
    username = data.identity;
    var $input = $('#chat-input');
    $input.on('keydown', function(e) {
  
      if (e.keyCode == 13) {
        if (generalChannel === undefined) {
          print('The Chat Service is not configured. Please check your .env file.', false);
          return;
        }
        generalChannel.sendMessage($input.val())
        $input.val('');
      }
    });
  }).catch(error => {
    $('.loading').hide();
    console.error(error);
  });
}

function checkCurrentChannelSubscribled(listChannel) {
  if(listChannel){
    var neededChannel = null;
    for (i = 0; i < listChannel.length; i++) {
      const channel = listChannel[i];
      if (channel.sid === channelId){
        neededChannel = channel;
      }
    }
    if (neededChannel) {
      generalChannel = neededChannel;
      setupChannel(generalChannel)
    } else {
      joinChannel();
    }
  }
}

function joinChannel() {
  chatClient.getChannelByUniqueName(channelId)
  .then(function(channel) {
    generalChannel = channel;
    generalChannel.join().then(function(returnChannel) {
      setupChannel(channel);
    });
  }).catch(function(error) {
    console.log(error);
  });
}

// Set up channel after it has been found
function setupChannel(channel) {
  // Join the general channel
  $('body').addClass('chatRoom');

  retreiveHistory(channel);
  retrieveGroupMember(channel);
  // Listen for new messages sent to the channel
  channel.on('messageAdded', function(message) {
    printMessage(message.author, message.body);
  });
}

function retreiveHistory (channel) {
  channel.getMessages().then(function(messages) {
    $('.loading').hide();
    const totalMessages = messages.items.length;
    for (i = 0; i < totalMessages; i++) {
      const message = messages.items[i];
      console.log('Author:' + message.author);
      printMessage(message.author, message.body);
    }
    console.log('Total Messages:' + totalMessages);
  });
}

function retrieveGroupMember (channel) {
  channel.getMembers().then(function(members) {
    $('.loading').hide();
    var userItems = '';
    var totalMembers = members.length;
    for (i = 0; i < totalMembers; i++) {
      const member = members[i];
      console.log('member:');
      console.log(member.state.identity);
      userItems += '<li>'+member.state.identity+'</li>'
    }
    $('#groupUser').html(userItems);
    console.log('Total members:' + totalMembers);
  });
}

// Helper function to print chat message to the chat window
function printMessage(fromUser, message) {
  var $user = $('<span class="username">').text(fromUser + ':');
  if (fromUser === username) {
    $user.addClass('me');
  }
  var $message = $('<span class="message">').text(message);
  var $container = $('<div class="message-container">');
  $container.append($user).append($message);
  $chatWindow.append($container);
  $chatWindow.scrollTop($chatWindow[0].scrollHeight);
}

function leave() {
  if (generalChannel !== undefined){
    generalChannel.leave().then(function() {
      $('#home').click();
    })
  }
}
