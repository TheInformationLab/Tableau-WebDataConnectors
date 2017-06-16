"use strict";
var sys = require("system"),
    page = require("webpage").create(),
    logResources = true,
    username = "",
    password = "";

if (sys.args.length === 1) {
  var output = {};
  output.action = "Error";
  output.error = "Missing Username and Password for Tableau Partner Portal";
  sys.stdout.write(JSON.stringify(output));
} else {
  sys.args.forEach(function (arg, i) {
    if (i == 1) {
      username = arg;
    } else if (i == 2) {
      password = arg;
    }
  });
}
/*
page.onConsoleMessage = function() {
  var output = {};
  output.action = "Console Message";
  output.msg = arguments;
  sys.stdout.write(JSON.stringify(output));
};
*/
page.onUrlChanged = function() {
  var output = {};
  output.action = "URL Change";
  output.url = page.url;
  sys.stdout.write(JSON.stringify(output));
}

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 90000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    //console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

page.open("https://myaccount.tableau.com/", function (status) {
    // Check for page load success
    //page.render("early.png");
    if (status !== "success") {
        //console.log("Unable to access network");
    } else {
        // Wait for 'signin-dropdown' to be visible
        waitFor(function() {
            // Check in the page if a specific element is now visible
            var newUrl = page.url;
            return page.evaluate(function() {
                return document.querySelector("button[id='signInButton']") != null;
            });
        }, function() {
           setTimeout(function() {
             var creds = {};
             creds.username = username;
             creds.password = password;
             var credStr = JSON.stringify(creds);
             page.evaluate(function(username, password) {
               $('#email').val(username);
               $('#password').val(password);
               var ev = document.createEvent("MouseEvents");
               ev.initEvent("click", true, true);
               document.querySelector("button[id='signInButton']").dispatchEvent(ev);
             }, username, password);
             waitFor(function() {
               page.switchToChildFrame(0);
               var curPage = page.url;
               return curPage.indexOf('home/home.jsp') > -1 && page.evaluate(function() {
                return document.getElementsByClassName('management').length > 0 || document.getElementsByClassName('cp_home_box').length > 0;
                 });
             }, function() {
               setTimeout(function() {
                 page.switchToChildFrame(0);
                 page.evaluate(function() {
                   var ev = document.createEvent("MouseEvents");
                   ev.initEvent("click", true, true);
                   if (document.getElementsByClassName('management').length > 0) {
                     document.getElementsByClassName('management')[3].getElementsByTagName('a')[1].dispatchEvent(ev);
                   } else {
                     document.getElementsByClassName('cp_home_box')[0].getElementsByTagName('a')[0].dispatchEvent(ev);
                   }
                 });
                 waitFor(function() {
                   return page.evaluate(function() {
                    return document.querySelector("input[name='csvsetup']") != null;
                     });
                 }, function() {
                   setTimeout(function() {
                     var cookies = page.cookies;
                     for (var i=0; i < cookies.length; i++) {
                        var output = {};
                        output.action = "Cookie";
                        output.cookie = cookies[i].name + '=' + cookies[i].value + '; ';
                        sys.stdout.write(JSON.stringify(output));
                     }
                     output = {}
                     output.action = "Download";
                     output.url = page.url;
                     sys.stdout.write(JSON.stringify(output));
                   }, 5000);
                   setTimeout(function() {
                     phantom.exit(0);
                   }, 30000);
                  });
               },1000);
             });
           }, 1000);
        });
    }
});
