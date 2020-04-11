var channelIDs = [];
$(function() {
  $('#channelList').html('Loading...');

  bindChannelList();
});

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
        channelIDs.push(channel.uniqueName.toLowerCase());
        var item = '<div class="item"><span>'+channel.uniqueName+'</span><a id="channel'+i+'" class="btn btn-lg btn-danger" href="#" onclick="deleteChannel(\''+channel.sid+'\')">Delete</a></div>'
        channelContent += item;
      }
    }
    $('#channelList').html(channelContent);
  });
}

function deleteChannel(id) {
  $('.loading').show();
  $.getJSON('/token', {
    action: 'delete',
    id: id,
    type: 'channel'
  }, function(data) {
    if(data.response){
      bindChannelList();
    } else {
      alert('Has an error');
      bindChannelList();
    }
  });
}

function create() {
  var val = $('#channel-input').val();
  if(val.trim().length < 1) {
    return;
  }
  val =  val.toLowerCase();
  if(channelIDs.indexOf(val) !== -1) {
    alert("channel exist!");
    return;
  }
  var detectSpace = val.split(' ');
  if(detectSpace.length > 1){
    alert("invalid name");
    return;
  }
  $('.loading').show();
  $.getJSON('/token', {
    action: 'add',
    id: $('#channel-input').val(),
    type: 'channel'
  }, function(data) {
    if(data.response){
      bindChannelList();
    } else {
      alert('Has an error');
      bindChannelList();
    }
  });
}
