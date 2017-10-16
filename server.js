'use strict';

var fs = require('fs');
var port = 1337;
var express = require('express');
var http = require('http');
var io = require('socket.io');

var app = express();
app.use(express.static(__dirname, {'index': ['index.html']}));

var server = http.createServer(app).listen(port);
io = io.listen(server);

io.sockets.on('connection', function(socket) {
	var dataToClient = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));
	socket.send(JSON.stringify(dataToClient));

    socket.on('message', function(data) {
        fs.writeFile('./data/data.json', data, function(err) {
			if (err) {
				console.log('Cant save to file');
			}
		});
    });
});
