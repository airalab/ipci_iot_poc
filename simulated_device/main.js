'use strict';

var fs = require('fs');
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var connectionString= fs.readFileSync('../creds/device_connection_string.txt').toString().split("\n")[2];
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

setInterval(function(){
  var temperature = 20 + (Math.random() * 15);
  var message = new Message(JSON.stringify({
    temperature: temperature,
    humidity: 60 + (Math.random() * 20)
  }));

  message.properties.add('temperatureAlert', (temperature > 30) ? 'true' : 'false');

  console.log('Sending message: ' + message.getData());

  client.sendEvent(message, function (err) {
    if (err) {
      console.error('send error: ' + err.toString());
    } else {
      console.log('message sent');
    }
  });
}, 1000);
