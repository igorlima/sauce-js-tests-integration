var https = require('https');

module.exports = function (sessionID, auth, data) {
  return new Promise((resolve, reject) => {
    var options = {
      hostname: 'saucelabs.com',
      port: 443,
      path: `/rest/v1/${auth.username}/jobs/${sessionID}`,
      method: 'PUT',
      auth: `${auth.username}:${auth.accessKey}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    var req = https.request(options, res => {
      var body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
};
