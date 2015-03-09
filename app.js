var dotenv = require('dotenv');

var omx = require('omxdirector');

var s3 = new AWS.S3();

// List objects from S3
var params = {
  Bucket: process.env.AWS_BUCKET,
  Prefix: 'movies/loop'
};
s3.listObjects(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else console.log(data); // successful response
});

// Check for local versions

// Download local version if missing

// Start playing videos in loop

// omx.play('video.avi');
