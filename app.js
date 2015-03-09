var dotenv = require('dotenv').load();

var omx = require('omxdirector');
var Download = require('download');
var AWS = require('aws-sdk');
var fs = require('fs');

var s3 = new AWS.S3();

// List objects from S3
var params = {
  Bucket: process.env.AWS_BUCKET,
  Prefix: 'movies/loop'
};

s3.listObjects(params, function(err, data) {
  // an error occurred
  if (err) {
    return console.log(err, err.stack);
  }

  console.log('Checking media');
  var toDownload = [];

  if (data.Contents.length) {
    data.Contents.forEach(function(file) {
      if (file.Size) {
        // Check for local versions
        try {
          fs.statSync(__dirname + '/media/' + file.Key.split('/').pop());
        } catch(err) {
          toDownload.push(file.Key);
        }
      }
    });
  }

  if (toDownload.length) {
    // Download local versions if missing
    var download = new Download();
    var endpoint = 'http://' + process.env.AWS_BUCKET + '.' + s3.endpoint.hostname + '/';
    toDownload.forEach(function(path) {
      console.log('Adding ' + path + ' to download queue');
      download.get(endpoint + path);
    });
    download.dest(__dirname + '/media/');

    console.log('Downloading...');
    download.run(function(err, files) {
      if (err) {
        throw err;
      }

      console.log('File(s) downloaded successfully!');
    });
  } else {
    console.log('All media is synced');
  }

  // Start playing videos in loop
  console.log('Playing media in loop');
  fs.readdir(__dirname + '/media', function(err, files) {
    if (err) throw err;
    omx.setVideoDir(__dirname + '/media');
    omx.play(files, {loop: true, audioOutput: 'hdmi'});
  });

});
