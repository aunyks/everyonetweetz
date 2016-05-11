const http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      Twitter      = require('twitter'),
      env          = process.env;

let server = http.createServer(function (req, res) {
  let url = req.url;
  if (url == '/') {
    url += 'index.html';
  }
  
  var twit = new Twitter({
    consumer_key: 'gME5ZgJJTmaRpOzDtM1FuQ3YP',
    consumer_secret: 'sFlQlf7gPeJa6g2w5eUw5GV76rPnz6nPofVzZPtHDFnBUPaOz9',
    access_token_key: '724053135489007616-5siprGuhRBF7UPugt34SnqtjP60bFgB',
    access_token_secret: 'A4tcDBuUCbKwuLtwR0kzOCti4wh3cilX2zWkn1Om7JXlh',
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

  // IMPORTANT: Your application HAS to respond to GET /health with status 200
  //            for OpenShift health monitoring

  if (url == '/health') {
    res.writeHead(200);
    res.end();
  } else if (url.indexOf('/info/') == 0) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(sysInfo[url.slice(6)]()));
  } else if(url.indexOf('/announce') == 0 || url.indexOf('/announce/') == 0){
    
    if(req.method == 'POST'){
      var tweet = '';
    
      req.on('data', function(chunk) {
        // append the current chunk of data to the fullBody variable
        tweet += chunk.toString();
      });
      
      req.on('end', function() {
        tweet = tweet.substr(('message='.length));
        tweet = tweet.replaceAll('+', ' ');
        tweet = decodeURIComponent(tweet);
        
        var tweetID = "";
        
        // Post
        twit.post('/statuses/update', {
                        status: tweet
                    }, function(err, tweet, response) {
                        if (err) {
                        } else {
                          tweetID = tweet.id;
                        }
          });
          
          // Log
          fs.appendFile(process.env.OPENSHIFT_DATA_DIR+"tweets.log", ("\n\n"+tweetID+" "+req.connection.remoteAddress+"\n"+tweet), function(err) {
            console.error(err);
          });
        
        // empty 200 OK response for now
        res.writeHead(200);
        res.end();
      });
      
    }
    
  }else {
    fs.readFile('./static' + url, function (err, data) {
      if (err) {
        res.writeHead(301, {Location: 'http://everyonetweets-gnash48.rhcloud.com/'});
        res.end();
      } else {
        let ext = path.extname(url).slice(1);
        //res.setHeader('Content-Type', contentTypes[ext]);
        res.setHeader('Content-Type', 'text/' + ext);
        if (ext === 'html') {
          res.setHeader('Cache-Control', 'no-cache, no-store');
        }
        res.end(data);
      }
    });
  }
});

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});
