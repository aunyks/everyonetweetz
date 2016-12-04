const http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      Twitter      = require('twitter'),
      twitterData  = require('./sensitive/twitter-creds'),
      env          = process.env;


String.prototype.replaceAll = function(search, replacement) {
  return this.split(search).join(replacement);
};

let server = http.createServer(function (req, res) {
  let url = req.url;

  // If root directory, redirect directly to index.html
  // to limit CPU cycles on our side
  if (url == '/') {
    url += 'index.html';
  }

  // Credentials and other super secret information
  let twit = new Twitter(twitterData);

  // This route will provides essential system information
  // in lovely JSON format
  // See utils/sys-info.js for more information
  if (url.indexOf('/info') == 0 || url.indexOf('/info/') == 0) {

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(sysInfo(), null, 2));

  // This route does most of the work, it receives a post request
  // and posts the body of the request to Twitter after some cleaning
} else if(url.indexOf('/announce') === 0 || url.indexOf('/announce/') === 0){

    if(req.method === 'POST'){

      // We receive the post request data in chunks,
      // so we just concat the chunks as we receive them
      // to get the entire tweet
      let tweet = '';
      req.on('data', function(chunk) {
        tweet += chunk.toString();
      });

      // When the last chunk of data has been sent,
      // the tweet that we have stored here is the
      // tweet that the user wanted to send, so now
      // we can post it
      req.on('end', function(){

        // Technically, we received the tweet as 'message=this+is+a+tweet',
        // so we start off by trimming off that message= prefix
        tweet = tweet.substr(('message='.length));

        // Now, we get rid of the pluses and replace them with spaces, because
        // that's how humans write nowadays I guess
        tweet = tweet.replaceAll('+', ' ');

        // Let's replace all urlencoded tokens with their
        // UTF-8, human-readable counterparts
        tweet = decodeURIComponent(tweet);

        // This looks absolutely hideous but it works.
        // It posts the tweet from the post request body
        // to Twitter and stores the id of that tweet
        // in a variable to be used during logging
        let tweetID = '';
        twit.post('/statuses/update',
                  { status: tweet },
                  function(err, tweet, response) {
                    tweetID = tweet.id;
        });

        // Log our tweets to a file
        // Turn this off while we're using Now (now.sh)
        /*
        fs.appendFile('/tmp/tweets.log', ("\n\n"+tweetID+" "+req.connection.remoteAddress+"\n"+tweet), function(err){
          console.error(err);
        });
        */

        // empty 200 OK response for now just to let the client we know
        // that everything went alright
        res.writeHead(200);

        // End our connection
        res.end();
      });
    }

  // If the client didn't want system info or to post a tweet,
  // then they're requesting static files (from our static folder of course!)
  }else {
    fs.readFile('./static' + url, function (err, data) {
      if (err) {
        res.writeHead(301, {Location: 'https://everyonetweetz.now.sh/'});
        res.end();
      } else {
        let ext = path.extname(url).slice(1);
        res.setHeader('Content-Type', 'text/' + ext);
        if (ext === 'html') {
          res.setHeader('Cache-Control', 'no-cache, no-store');
        }
        res.end(data);
      }
    });
  }
});

// Finished with server configuration.
// Let's launch it and bind it to the IP and port
// provided by the environment. If they aren't provided to us,
// then we simple bind to localhost:3000
server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function(){
  console.log(`Application worker ${process.pid} started...`);
});
