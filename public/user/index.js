var userIDs = [];
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
        userIDs.push(user.identity.toLowerCase());
        var item = '<div class="item"><span>'+user.identity+'</span><a id="user'+i+'" class="btn btn-lg btn-danger" href="#" onclick="deleteUser(\''+user.identity+'\')">Delete</a></div>'
        userContent += item;
      }
    }
    $('#userList').html(userContent);
  });
}

function deleteUser(id) {
  $('.loading').show();
  $.getJSON('/token', {
    action: 'delete',
    id: id,
    type: 'user'
  }, function(data) {
    if(data.response){
      bindUserList();
    } else {
      alert('Has an error');
      bindUserList();
    }
  });
}

function createUser() {
  var val = $('#user-input').val();
  if(val.trim().length < 1) {
    return;
  }
  val =  val.toLowerCase();
  if(userIDs.indexOf(val) !== -1) {
    alert("user exist!");
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
    id: $('#user-input').val(),
    type: 'user'
  }, function(data) {
    if(data.response){
      bindUserList();
    } else {
      alert('Has an error');
      bindUserList();
    }
  });
}
