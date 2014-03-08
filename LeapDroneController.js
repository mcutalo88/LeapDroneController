'use strict'

var Leap  = require('leapjs');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var controller = new Leap.Controller();

var isTakenOff = false;
var droneIncreaseTmp = 0;


controller.on("frame", function(frame) {
  //Drone will take off once a single hand is in place,
  //This will also diticate the altitude of the drone 
  if(frame.hands.length == 1){
  
    if(isTakenOff == false){ 
      console.log("Taking off.......");
      client.takeoff();
      client.stop();
      isTakenOff = true;
    }
    
    var hand = frame.hands[0];
    var position = hand.palmPosition;
    var handPosition = position[1] / 1000;        
    
    if(position != 0){
      //forevery 1000 position increase the drone will move up .1
      if(droneIncreaseTmp < handPosition){
        console.log("Increasing Height by : " + handPosition);
        client.up(handPosition); //value 0 -1
      }else{
        console.log("Decrease Height by : " + handPosition);  
        client.down(handPosition); //value 0 -1
      }        
    }
    droneIncreaseTmp = handPosition; //Saved old value
  }
    
  //On Two fingers the drone will turn click wise
  // if(frame.fingers.length == 2){
  //   console.log("Turning Clockwise .......");
  //   client.clockwise(0.1);
  // }

  /* Stop the Drone and land */
  if(frame.hands.length == 0){
    if(isTakenOff == true){
      console.log('Landing Drone.........')
      client.stop();    
      client.land();
      isTakenOff = false;  
    }    
  }

  // for (var i in frame.handsMap) {
  //   var hand = frame.handsMap[i];
  //   console.log("Roll: " + hand.roll());
  //   console.log("Pitch: " +hand.pitch()); 
  //   console.log("Yaw: " +hand.yaw());
  // }

});

// var frameCount = 0;
// controller.on("frame", function(frame) {
//   frameCount++;
// });

// setInterval(function() {
//   var time = frameCount/2;
//   console.log("received " + frameCount + " frames @ " + time + "fps");
//   frameCount = 0;
// }, 2000);

controller.on('ready', function() {
    console.log("ready");
});
controller.on('connect', function() {
    console.log("connect");
});
controller.on('disconnect', function() {
    client.land();
    console.log("disconnect");
});
controller.on('focus', function() {
    console.log("focus");
});
controller.on('blur', function() {
    console.log("blur");
});
controller.on('deviceConnected', function() {
    console.log("deviceConnected");
});
controller.on('deviceDisconnected', function() {
    client.land();
    console.log("deviceDisconnected");
});

controller.connect();
console.log("\nWaiting for device to connect...");