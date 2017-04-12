var get_formatted_time = function(timestamp) {
  var a = new Date(timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  return date + ' ' + month + ' ' + hour + ':' + (min < 10 ? '0' : '') + min;
};

var hide_recommends = function() {
  $("#recmd").hide();
};

var get_condition = ["Like New", "Very Good", "Good", "Acceptable", "Bad"];
