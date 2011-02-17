/**
 * $versions - Test your code/plugin in multiple jQuery versions
 * Works perfectly together with QUnit and other test libraries
 *
 * @example
 *    $versions("1.4.3", "1.5").load("/js/jquery.myCoolPlugin.js").execute(function(jQuery, $, version) {
 *      module("jquery.myCoolPlugin in jQuery v" + version);
 *      test("Basic test", function() {
 *        expect(1);
 *        ok($.myCoolPlugin("foo"), "Works");
 *      });
 *    });
 */
var $versions = (function() {
  
  var PROTOCOL     = location.protocol == "https:" ? location.protocol : "http:",
      URL_TEMPLATE = PROTOCOL + "//ajax.googleapis.com/ajax/libs/jquery/{version}/jquery.min.js?" + new Date().getTime();
  
  var _makeArray = function(pseudoArray) {
    var array = [];
    if (pseudoArray && pseudoArray.length) {
      for (var i=0; i<pseudoArray.length; i++) {
        array.push(pseudoArray[i]);
      }
    }
    return array;
  };
  
  var _cloneArray = _makeArray;
  
  var _isArray = function(array) {
    return Object.prototype.toString.call(array) === "[object Array]";
  };
  
  
  var _loadScript = function(url, callback) {
    var script          = document.createElement("script"),
        callbackWrapper = function() {
          script.onload = script.onreadystatechange = null;
          callback();
          script.parentNode.removeChild(script);
          script = null;
        };
    
    script.async = true;
    script.src = url;
    script.onload = callbackWrapper;
    script.onreadystatechange = function() {
      if (/complete|loaded/.test(script.readyState)) { callbackWrapper(); }
    };
    document.body.appendChild(script);
  };
  
  var _loadScripts = function(urls, callback) {
    urls = _cloneArray(urls);
    var loadNext = function() {
      if (urls.length) {
        _loadScript(urls.shift(), loadNext);
      } else {
        callback();
      }
    };
    loadNext();
  };
  
  var _loadJquery = function(version, callback) {
    var url = URL_TEMPLATE.replace("{version}", version);
    _loadScript(url, callback);
  };
  
  
  var VersionRunner = function(versions) {
    this.scripts          = [];
    this.versions         = versions;
    this.callbackMethods  = [];
    return this;
  };
  
  VersionRunner.prototype.add = function(version) {
    this.versions.push(version);
    return this;
  }; 
  
  VersionRunner.prototype.load = function(scripts) {
    scripts = _isArray(scripts) ? scripts : _makeArray(arguments);
    this.scripts = this.scripts.concat(scripts);
    return this;
  };
  
  VersionRunner.prototype.execute = function(testExecuter) {
    var versions        = _cloneArray(this.versions),
        that            = this,
        loadNextJquery  = function() {
          if (!versions.length) {
            for (var i=0; i<that.callbackMethods.length; i++) {
              that.callbackMethods[i]();
            }
          }
          
          _loadJquery(versions.shift(), function() {
            _loadScripts(that.scripts, function() {
              var currentJquery  = window.jQuery.noConflict(true),
                  version        = currentJquery.fn.jquery;
              testExecuter(currentJquery, currentJquery, version);
              loadNextJquery();
            });
          });
        };
    
    loadNextJquery();
    return this;
  };
  
  VersionRunner.prototype.callback = function(method) {
    this.callbackMethods.push(method);
    return this;
  };
  
  return function(versions) {
    versions = _isArray(versions) ? versions : _makeArray(arguments);
    return new VersionRunner(versions);
  };
})();