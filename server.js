/*
 * this is just node stuff to mock out a back end 
 * not really worth looking into
 */
var connect = require("connect");
var _ = require("underscore");
var stream = require("stream");
var util = require("util");

function Response(request) {
  return {
    _id: request._id,
    status: 200,
    statusText: "OK",
    data: request.data.toString().split("").reverse().join("")
  };
}

function Reverser(opts) {
  stream.Transform.call(this, opts);
}

util.inherits(Reverser, stream.Transform);

Reverser.prototype._transform = function(chunk, enc, done) {
  var ch = chunk.toString(enc);
  this.push(ch.split("").reverse().join(""));
  done();
};

var queued = [];

function Batcher(opts) {
  stream.Duplex.call(this, opts);
}
util.inherits(Batcher, stream.Duplex);

Batcher.prototype._write = function(chunk, enc, cb) {
  var str = chunk.toString(enc),
      json = JSON.parse(str),
      time = 500; // interval between responses

  _.each(json.requests, function(req, index) {
    setTimeout(function() {
      queued.push(new Response(req));
      console.log("pushed response", queued);
    }, time * index);
  }, this);
  cb();
};

Batcher.prototype._read = function(size) {
  console.log("read call");
  var stream = this;
  function push() {
    if(!queued.length) {
      return setTimeout(push, 10);
    }

    console.log("push to reader");
    stream.push(JSON.stringify(queued));
    queued.length = 0;
    stream.push(null);
    // always end after sending a chunk
    console.log("ending");
    stream.emit("end");
  }

  setTimeout(push, 10);
};

var routes = [{
  regex: /^\/endpoint/,
  stream: Reverser
}, {
  regex: /^\/batch$/,
  stream: Batcher
}];

function routing(req, res, next) {
  var route = _.find(routes, function(route) {
                return route.regex.test(req.url);
              });

  if(!route) {
    return next();
  }

  var stream = new route.stream();
  req.pipe(stream).pipe(res);
}

connect()
  .use(connect["static"](__dirname))
  .use(routing)
  .listen(3000);
