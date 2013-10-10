
define([
  "request"
], function(
  Request
) {
  var urls = [
    "/endpoint1",
    "/endpoint2",
    "/endpoint3",
    "/endpoint4",
    "/endpoint5"
  ];

  var list = document.getElementById("list");
  var button = document.getElementById("fire");

  button.addEventListener("click", fireFiveCalls, false);

  function call() {
    // just throw some shit in there that the server
    // can mirror
    var data = Math.floor(Math.random() * 1000 * Math.random());
    var randIndex = Math.floor(Math.random() * urls.length);
    var url = urls[randIndex];

    var li = document.createElement("li");
    li.textContent = url + " data: " + data;

    var xhr = new Request();
    xhr.open("POST", url);
    xhr.onload = function(e) {
      console.log("xhr", xhr);
      if(xhr.status !== 200) {
        return error();
      }

      li.style.backgroundColor = "green";
      li.appendChild(document.createTextNode("\n response: " + xhr.responseText));
    };

    function error(e) {
      li.style.backgroundColor = "red";
      li.appendChild(document.createTextNode("\n" + xhr.responseText));
    }

    xhr.onerror = error;

    list.insertBefore(li, list.childNodes[0]);

    xhr.send(data);
  }

  function fireFiveCalls() {
    for(var i = 0; i < 5; i++) {
      call();
    }
  }

  console.log("Init app");
});
