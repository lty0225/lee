var express = require('express');
const session = require('express-session');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mdRouter = require('./mdRouter');
var fs = require('fs');
const cookieParser = require('cookie-parser');


var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(session({
	secret: 'Secret Key',
	resave: false,
	saveUninitialized: false,
	userid: '',
	cookie:{maxAge:1000*30}
 }));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))//public내에 존재하는 파일 사용
app.use(mdRouter);
/*app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});*/
app.use('/images', express.static(__dirname + '/images'));
app.use(function(err, req, res, next) {
   res.send('ERROR', err.stack);
});
app.use(function(req, res) {
	req.session.userid = '1';
	var sess = req.session;
	console.log(sess);
	res.render('index');
});
app.listen(3010, function() {
	console.log('server is listening 3000');
});