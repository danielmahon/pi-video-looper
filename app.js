var dotenv = require('dotenv').load();

var _ = require('underscore');
var omx = require('omx-manager');
var Download = require('download');
var progress = require('download-status');
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

  console.log('Syncing media');

  var remoteFiles = [];
  var localFiles = [];

  if (data.Contents.length) {
    data.Contents.forEach(function(file) {
      if (file.Size) remoteFiles.push(file.Key.split('/').pop());
    });
  }

  function play() {
    // Start playing videos in loop
    console.log('Playing media in loop');
    fs.readdir(__dirname + '/media', function(err, files) {
      if (err) throw err;
      localFiles = files;
      // omx.enableMultipleNativeLoop();
      omx.setVideosDirectory(__dirname + '/media');
      omx.play(localFiles, {'--loop': false, '-b': true, '--no-osd': true, '-p': true, '-o': 'hdmi'}, true);
    });
  }


  if (remoteFiles.length) {
    // Delete old videos
    console.log('Clean up old videos...');
    localFiles = fs.readdirSync(__dirname + '/media');
    _.each(_.difference(localFiles, remoteFiles), function(fileToDelete) {
      console.log('Deleting ' + fileToDelete);
      fs.unlinkSync(__dirname + '/media/' + fileToDelete);
    });
    // Download local versions if missing
    var download = new Download();
    var endpoint = 'http://' + process.env.AWS_BUCKET + '.' + s3.endpoint.hostname + '/' + data.Prefix + '/';
    _.each(_.difference(remoteFiles, localFiles), function(fileToDownload) {
      console.log('Adding ' + fileToDownload + ' to download queue');
      download.get(endpoint + fileToDownload);
    });
    console.log('Downloading...');
    download.dest(__dirname + '/media/');
    download.use(progress());
    download.run(function(err, files) {
      if (err) throw err;
      console.log('File(s) downloaded successfully!');
      play();
    });
  } else {
    console.log('All media is synced');
    play();
  }


});
