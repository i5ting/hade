#!/usr/bin/env node
var html2jade = require('html2jade');
var express  = require('express');
var app      = express();
var path     = require('path');
var open     = require("open");
var jade     = require('jade');

app.use(express.static(path.join(__dirname, 'vendor/html2jade/')));

app.get('/', function (req, res) {
  res.send('Hello World')
})



var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', function(socket){ /* … */ 
  console.log('connection');
  
  socket.on('html2jade', function(message, callback) {
    console.log(message);
  });

  socket.on('jade2html', function(message, callback) {
    console.log(message);
  });
  
  socket.on('edit jade', function(myjade, callback) {
    console.log('edit jade---\n');
    console.log(myjade)
    var locals = {};
    var options = {
      pretty:true,
      debug:true
    };
    
    var html = jade.render(myjade, options);
    
    console.log(html);
    socket.emit('jade2html', {html : html});
  });
  
  socket.on('edit html', function(html, callback) {
    console.log(12121);
    console.log(html);
    
    html2jade.convertHtml(html, {}, function (err, jade) {
      // do your thing
      console.log(jade);
      socket.emit('html2jade', jade);
    });
  });
  
});


// 随机端口3000 - 10000 之间
server.listen(3025)

// html2jade
// jade2html
open("http://127.0.0.1:3025");