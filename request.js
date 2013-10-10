define([
  "node_modules/underscore/underscore"
], function() {

  var cache = [];
  var pending = [];

  var request = _.debounce(function() {
    // add cache to pedning list
    pending = pending.concat(cache);
    var data = cache;
    // reset cache for next round
    cache = [];

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/batch");
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText);
      _.each(data, function(response) {
        var found = _.findWhere(pending, { _id: response._id });
        if(found) {
          pending = _.without(pending, found);

          // copy status etc
          _.extend(found, response);
          found.responseText = response.data;
          found.onload();
        }
      });

      // if there are outstanding calls, poll again:
      if(pending.length || cache.length) {
        setTimeout(request, 3000);
      }
    };

    xhr.send(JSON.stringify({ requests: data }));
  }, 10);

  var ids = 0;

  function Request() {
    this._id = ++ids;
    this.setup = {};

    cache.push(this);
  }

  Request.prototype = {
    open: function(method, url) {
      this.url = url;
      this.method = method;
    },

    send: function(data) {
      this.data = data;
      request();
    }
  };

  return Request;
});
