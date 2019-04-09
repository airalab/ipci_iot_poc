'use strict';

const fs = require('fs');
const { EventHubClient, EventPosition } = require('@azure/event-hubs');


var connectionString = fs.readFileSync('../creds/service_connection_string.txt').toString().split("\n")[2];

var printError = function (err) {
  console.log(err.message);
};

var printMessage = function (message) {
  console.log('Telemetry received: ');
  console.log(JSON.stringify(message.body));
  console.log('Application properties (set by device): ')
  console.log(JSON.stringify(message.applicationProperties));
  console.log('System properties (set by IoT Hub): ')
  console.log(JSON.stringify(message.annotations));
  console.log('');

  let plog = fs.createWriteStream("./incoming.txt", {flags:'a'});
  plog.write(JSON.stringify(message.body) + "\n");
  plog.write(JSON.stringify(message.applicationProperties) + "\n");
  plog.write(JSON.stringify(message.annotations) + "\n");
  plog.write("\n");
  plog.end();
};

var ehClient;
EventHubClient.createFromIotHubConnectionString(connectionString).then(function (client) {
  console.log("Successully created the EventHub Client from iothub connection string.");
  ehClient = client;
  return ehClient.getPartitionIds();
}).then(function (ids) {
  console.log("The partition ids are: ", ids);
  return ids.map(function (id) {
    return ehClient.receive(id, printMessage, printError, { eventPosition: EventPosition.fromEnqueuedTime(Date.now()) });
  });
}).catch(printError);
