var express = require('express')
var Search = require('bing.search');
var util = require('util');
var url = require('url');

var Bing = require('node-bing-api')({ accKey: "8805a5c8bfe94e38924aea9d3dda07b5" });

var mongo = require('mongodb').MongoClient;

var urlMongo ="mongodb://viethqc:hoangquocviet24@ds159328.mlab.com:59328/imagesearch"

var app = express()


app.set('port', process.env.PORT || 5000);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/api/imagesearch/*', function (req, res) {

	var objURL = url.parse(req.url, true);
	console.log(objURL);
	var iOffset = 1
	iOffset = parseInt(objURL["query"]["offset"]);
	var szKeyword = objURL["pathname"].split("\/")[3];

	console.log("offset : " + iOffset);
	console.log("keyword : " + szKeyword);

	mongo.connect(urlMongo, function(err, db){
		var doc = db.collection('history');
		var d1 = new Date();

		doc.insert({"term" : szKeyword, "when" : d1.toUTCString()});
	});


	Bing.images(szKeyword, {
  	}, function(error, res1, body){
  		var data = [];
  		var obj;
  		var iStart;
  		var iEnd;

  		var iMaxPage = Math.ceil(body["value"].length / 10);
  		if (iOffset != iMaxPage)
  		{
  			iStart = (iOffset - 1) * 10;
  			iEnd = iStart + 10;
  		}
  		else
  		{
  			iStart = (iOffset - 1) * 10;
  			iEnd = body["value"].length - iStart;
  		}

  		for (var i = iStart; i < iEnd; i++)
  		{
  			obj = body["value"][i];
  			data.push({
  				"url": obj["contentUrl"],
				"snippet": obj["name"],
				"thumbnail": obj["thumbnailUrl"],
				"context": obj["webSearchUrl"]
  			});
  		}
    	res.send(data);
  	});
})

app.get('/api/lasted/imagesearch/', function (req, res) {

	mongo.connect(urlMongo, function(err, db){
		var doc = db.collection('history');
		var d1 = new Date();

		doc.find({}).toArray(function(err, documents) {
			var data = [];
			for (var i = 0; i < documents.length; i++)
			{
				data.push({"term" : documents[i]["term"], "when": documents[i]["when"]});
			}
			res.send(data);
		});
	});
	//res.render('index', {});
})

app.get('/', function (req, res) {

	res.render('index', {});
})

app.listen(app.get('port'), function(){
	console.log("Listen in port : %d", app.get("port"));
})