var express = require('express');
var Collection = require('nedb');
var annoCollection = new Collection({ filename: 'annotations.json', autoload: true });
var bodyParser = require("body-parser");
var app = express();
var path = require('path');
var exphbs = require('express-handlebars');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Webapp, some pages, like the homepage, need to be rendered server side
var hbs = exphbs.create({extname: '.hbs', partialsDir: path.join(__dirname, '/webapp/customize-partials')});
// So you can use angular templating in HBS files.
hbs.handlebars.registerHelper('raw-helper', function(options) {
    return options.fn();
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', __dirname);

app.use(require('./routes'));


app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  
  next();
});

app.get('/', function (request, response) {
	response.send('Server up and running');
})

app.get('/init', function (request, response) {
	
	annoCollection.count({}, function (error, annoCount) {

		if (annoCount === 0) {

			var defaultAnnotations = [
				{pox: 2528.731096135685,
				poy: -19190.43590718395,
				poz: 3678.676169105742,
				nox: 0,
				noy: -0.884616851264307,
				noz: 0.4663185890131586,
				camPos: [-2.202090315504301, -52561.6724175868, 16083.3739252877],
				camTarget: [-2.2020903155, -17439.9461159383, 4671.6332841808],
				title: 'Defect1',
				descr: 'This is a test'},
				{
					pox: 11262.413522921077,
					poy: -19142.15400145214,
					poz: 3215.0738074970504,
					nox: 0.1417735169909265,
					noy: -0.9870345850112161,
					noz: 0.07525289278001433,
					camPos: [-2.2020903155354956, -52561.67241758685, 16083.373925287702],
					camTarget: [-2.2020903155, -17439.9461159383, 4671.6332841808],
					title: 'Defect2',
					descr: 'This is another test'
				}
			];		
			

			annoCollection.insert( defaultAnnotations );

			response.send('Annotation collection created with ' + defaultAnnotations.length + ' new annotations');
		} else {
			response.send('The annotations collection has been already initialized');
		}

	})

})

app.post('/saveAnnotation', function(req, res){
  const annotation = req.body;  
  console.log(annotation);
  if (annotation) {
	  annoCollection.insert(annotation, function (err, newDocs) {
		if(err){
		  res.status(500).send({'error': err});
		}else{
		  res.status(201).send(annotation);
		}
	  });
  } 
})

app.get('/getAnnotationList', function (request, response) {
	
	annoCollection.find({}, function (error, annotations) {
		response.render('webapp/defects', {annos: annotations});
	});

})

app.get('/getAnnotations', function (request, response) {
	
	annoCollection.find({}, function (error, annotations) {
		response.send(annotations);
	});
})


var server = app.listen(process.env.PORT || 8080, function () {
	var host = server.address().address;
	var port = server.address().port;
	var serverUrl = 'http://' + host + ':' + port;
	console.log('Example app listening at %s', serverUrl);
})