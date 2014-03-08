'use strict'

var Leap  = require('leapjs');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var controller = new Leap.Controller();

var isTakenOff = false;
var lastHandHeight = 0;


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
    var currentHandHeight = (position[1] / 1000) + .1;        
    
    if(position != 0){
      //forevery 1000 position increase the drone will move up .1
      if(lastHandHeight < currentHandHeight){
        console.log("Increasing Height by : " + currentHandHeight);
        client.up(currentHandHeight); //value 0 - 1
      }else if (lastHandHeight > currentHandHeight){
        console.log("Decrease Height by : " + currentHandHeight);  
        client.down(currentHandHeight); //value 0 - 1
      }else{
        //TODO: Need to figure out how to hold the position when hand is not moving that much..
        console.log("Holding position....");
        client.stop();
      }        
    }
    lastHandHeight = currentHandHeight; //Saved old value
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