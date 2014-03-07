var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();

client
  .after(5000, function() {
    //this.clockwise(0.5);
    this.up(0.1);
    this.front(0.1);
    this.left(0.2);
    this.right(0.2);


  })
  .after(3000, function() {
    this.stop();
    this.land();
  });