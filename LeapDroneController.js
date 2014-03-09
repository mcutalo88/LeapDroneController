'use strict'
/*
Copyright (C) 2014  Michael Cutalo

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var Leap = require('leapjs');
var arDrone = require('ar-drone');
var droneClient = arDrone.createClient();
var controller = new Leap.Controller();

var isTakenOff     = false;
var lastHandHeight = 0;


controller.on("frame", function(frame) {
  //Drone will take off once a single hand is in place,
  //This will also diticate the altitude of the drone 
  if(frame.hands.length == 1){
  
    if(isTakenOff == false){ 
      console.log("Taking off.......");
      droneClient.takeoff();
      droneClient.stop();
      isTakenOff = true;
    }
    
    var hand = frame.hands[0];
    var position = hand.palmPosition;//[Horiztional Index, Vertical Index, Front/Back ?]
    var currentHandHeight = ((position[1] / 1000) + .1).toFixed(2);        
    var currentHandRoll = hand.roll().toFixed(1);
    var currentHandPitch = hand.pitch().toFixed(1);
   
    //console.log(currentHandHeight);
    console.log(hand.pitch().toFixed(1));
    //console.log(hand.roll().toFixed(1));

    if(position != 0){
     
      //Controlls the AR.Drone Height
      if(lastHandHeight < currentHandHeight){
        console.log("Increasing Height by : " + currentHandHeight);
        droneClient.up(currentHandHeight); //value 0 - 1
      }else if (lastHandHeight > currentHandHeight){
        console.log("Decrease Height by : " + currentHandHeight);  
        droneClient.down(currentHandHeight); //value 0 - 1
      }

      //Controlls the AR.Drone Roll
      if(currentHandRoll == 0.0){
        console.log("Holding Position.");
        droneClient.stop();
      }else if(currentHandRoll < 0){
        console.log('Moving Right...');
        //console.log(Math.abs(currentHandRoll));
        droneClient.right(Math.abs(currentHandRoll)); 
      }else{ 
        console.log('Moving Left...');
        //console.log(currentHandRoll);
        droneClient.left(currentHandRoll);
      }

      //Controlls the AR.Drone Pitch
      if(currentHandPitch == 0.0){
        droneClient.stop();
      }else if(currentHandPitch < 0){
        console.log("Moving Drone Forward..");
        droneClient.front(Math.abs(currentHandPitch));
      }else{
        console.log("Moving Drone Backward..");
        droneClient.back(currentHandPitch);
      }
    }

    lastHandHeight = currentHandHeight; //Saved old value
  }
    
  //On Two fingers the drone will turn click wise
  // if(frame.fingers.length == 2){
  //   console.log("Turning Clockwise .......");
  //   droneClient.clockwise(0.1);
  // }

  /* Stop the Drone and land */
  if(frame.hands.length == 0){
    if(isTakenOff == true){
      console.log('Landing Drone.........')
      droneClient.stop();    
      droneClient.land();
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
    droneClient.land();
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
    droneClient.land();
    console.log("deviceDisconnected");
});

controller.connect();
console.log("\nWaiting for device to connect...");