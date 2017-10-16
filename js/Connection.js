'use strict';
/*global io*/
var socket = io.connect('/');

function getDataFromServer() {
	socket.on('message', function(message) {
		let receivedData = JSON.parse(message);
		initialize(receivedData);
	});
}

function saveDataToServer(dataToSave) {
	socket.send(JSON.stringify(dataToSave));
}

getDataFromServer();
