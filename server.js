require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');
/* Getting the URL input parameter */
const bodyParser = require('body-parser');
const shortid = require('shortid');
const URL = require("url").URL;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema  = mongoose.Schema;

var urlSchema = new Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: String,
});

let urlModel = mongoose.model('url', urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.get('/api/shorturl/:url', (req, res) => {
  let url = req.params.url
  urlModel.findOne({short_url: url}, (error, result) => {
    if(!error && result != undefined){
      res.redirect(result.original_url)
    }else{
      res.json('URL not Found')
    }
  })
});


app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }), function (req, res) {
  const newurl = req.body.url;
  if (!stringIsAValidUrl(newurl)) {
    return res.json({error: 'Invalid URL'});
  }
  urlModel.findOne({original_url: newurl}, function(err, result){
            if(err) throw err;
            if (result == null) {
               let url = new urlModel({
                  original_url: newurl,
                  short_url: shortid.generate()
            });

            url.save((error, data) => {
            if (error) {
              console.log(error);
            } else {
              return res.json({original_url: url.original_url, short_url: url.short_url})
            }
          });
          } else {
              return res.json({original_url: result.original_url, short_url: result.short_url})
          }
  });
 
});

const stringIsAValidUrl = (s) => {
    try {
      new URL(s);
      if (s.match(/^ftp/)) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
};


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
