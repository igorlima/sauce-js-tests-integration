var { remote } = require('webdriver');
var Bluebird = require('bluebird');

module.exports = function(config, url) {
  var auth = config.auth();
  var username = auth.username;
  var accessKey = auth.accessKey;

  var browser = remote({
    hostname: 'ondemand.saucelabs.com',
    port: 80,
    path: '/wd/hub',
    user: username,
    key: accessKey
  });

  var initAsync = Bluebird.promisify(browser.init.bind(browser));

  var pendingHeartBeat;
  var heartbeat = function() {
    pendingHeartBeat = setTimeout(async function() {
      await browser.getTitle();
      heartbeat();
    }, 60000);
  };

  return initAsync().then(function () {
    heartbeat();

    var getAsync = Bluebird.promisify(browser.url.bind(browser));

    return getAsync(url).then(function () {
      return browser;
    });
  }).disposer(function() {
    clearTimeout(pendingHeartBeat);

    var quitAsync = Bluebird.promisify(browser.deleteSession.bind(browser));

    return quitAsync().then(function () {
      console.log("Closed browser.");
    });
  });
};
