module("$versions");

test("Simple test", function() {
  stop(10000);
  expect(4);
  
  var calls = 0;
  $versions("1.4", "1.5").load("dummy_plugin.js").execute(function($, jQuery, version) {
    calls++;
    equals($("<div>").dummyPlugin(), "foo", "Plugin correctly executed");
  }).callback(function() {
    ok(true, "Callback executed");
    equals(calls, 2, "Correct amount of jQuery versions were loaded");
    start();
  });
});

test("Test order of versions", function() {
  stop(10000);
  expect(3);
  
  var versionsToLoad = ["1.4.3", "1.4.4", "1.4.2"];
  
  $versions(versionsToLoad).load("dummy_plugin.js").execute(function($, jQuery, version) {
    equals(version, versionsToLoad.shift());
  }).callback(function() {
    start();
  });
});

test("Test omitting of loading a plugin", function() {
  stop(10000);
  expect(3);
  
  var calls = 0;
  $versions("1.4.2", "1.4.3").execute(function($, jQuery, version) {
    calls++;
    ok(!$("<div>").dummyPlugin, "Dummy plugin is not loaded");
  }).callback(function() {
    equals(calls, 2, "Correct amount of jQuery versions were loaded");
    start();
  });
});

test("Test global namespace #1", function() {
  stop(10000);
  expect(4);
  
  $versions("1.4", "1.5").load("dummy_plugin.js").execute(function($, jQuery, version) {
    ok(!window.jQuery, "'jQuery' variable doesn't exist in global namespace");
    ok(!window.$, "'$' variable doesn't exist in global namespace");
  }).callback(function() {
    start();
  });
});

test("Test global namespace #2", function() {
  stop(10000);
  expect(6);
  
  var notJquery = window.$ = window.jQuery = "I'm not jQuery!",
      undef;
  
  $versions("1.5.0").execute(function($, jQuery, version) {
    equals(window.$, notJquery);
    equals(window.jQuery, notJquery);
    ok($ != window.$);
    ok(jQuery != window.jQuery);
  }).callback(function() {
    equals(window.$, notJquery);
    equals(window.jQuery, notJquery);
    window.$ = window.jQuery = undef;
    start();
  });
});

test("Test loading of multiple plugins", function() {
  stop(10000);
  expect(4);
  
  $versions("1.5.0", "1.4.0").load("dummy_plugin.js", "another_dummy_plugin.js").execute(function($, jQuery, version) {
    equals($("body").dummyPlugin(), "foo");
    equals($("body").anotherDummyPlugin(), "foo bar");
  }).callback(function() {
    start();
  });
});