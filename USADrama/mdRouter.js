
var express = require('express');
const session = require('express-session');
var fs = require('fs');
//let multer = require("multer");
//var upload = multer({dest : './images/md/'})
var MongoClient = require('mongodb').MongoClient
//var url = 'mongodb://localhost:27017/Mdest';
var url ='mongodb+srv://lty0225:1234@cluster0-wm4h8.mongodb.net/test?retryWrites=true';
const mdModel = require('./mdModel');
var db;
const cookieParser = require('cookie-parser');

/*MongoClient.connect(url, function (err, database) {
   if (err) {
      console.error('MongoDB 연결 실패', err);
      return;
   }
   db = database;
});*/
MongoClient.connect(url, function (err, client) {
	if (err) {
	   console.error('MongoDB 연결 실패', err);
	   return;
	}const collection = client.db("Mdest");
	console.log(collection);
	db = collection;//database;
 });

// 라우터 얻기
var router=express.Router();
router.route('/')
	.get(homepage);

router.route('/mds')
	.get(showMdList)
	.post(addMd)
	.delete(deleteMd)
	.put(editMd);
router.route('/login')
	.put(loginInfo);
router.route('/logout')
	.delete(logoutt);

//router.post('/mds', upload.array('UploadFile'), addMd);
router.route('/ids')
	//.get(showInfo)
	.post(addId);

router.route('/form')
	.get(addMdForm);

router.route('/joinInfo')//마이페이지
 	.get(joinInfo);

router.route('/joinForm')
	.get(joinForm);
router.route('/mdEditForm')
 	.get(editMd);
router.route('/review')
	.get(reviewS)
	.post(reviewAdd);

router.route('/search')
	.get(showSearch);
/*
router.route('/mds/:title')
	.get(showMdDetail)
	.delete(deleteMd)
	.put(editMd);	*/

module.exports = router;

async function deleteMd(req, res){
	console.log('deleteMd');
	try {
        // 미드 상세 정보 
        const titleMd = req.body.title;
        console.log('mdTitle : ', titleMd);
        const info = await mdModel.deleteMd(titleMd);
        mdModel.getMdList().then( results => {
			let resObj = {
				count: results.length,
				data: results
			}
			//res.send(resObj);
			res.redirect('/');
		}).catch( error => {
			console.log('error : ', error);
			next(error);
		});
    }
    catch ( error ) {
        console.log('Can not find, 404');
        res.status(error.code).send({msg:error.msg});
    }
}

function reviewS(req, res){
	var title=req.query.title;
	mdModel.getMdReview(title).then( results => {
		res.render('reviewList', {count: results.length, data: results});		
	}).catch( error => {
		console.log('error : ', error);
		next(error);
	});
}

async function reviewAdd(req, res, next) {
	// 바디 파서
	console.log('되냐안되냐');
	let title=req.query.title;
	console.log(title);
	console.log('되냐안되냐');
	let reviews = req.body.reviews;
	let grade=req.body.grade;
	const now = new Date();
	const date = now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate();
	try{
		const result = await mdModel.addReview(title, reviews, grade, date);
		//res.send({msg:'success', data:result});
		mdModel.getMdList().then( results => {
			let resObj = {
				count: results.length,
				data: results
			}
			//res.send(resObj);
			res.render('list', {count: results.length, data: results});
		}).catch( error => {
			console.log('error : ', error);
			next(error);
		});
	}
	catch ( error ) {
        res.status(500).send(error.msg);
    }
	// 모델에 호출
	//mdModel.addMd(title, year, channel, genre, age, actor, summary, season, website, picture)
 
	// 결과
	//res.send('TODO : 새 미드 추가');
 }


function showSearch(req, res){//검색
	
	var sess = req.session;
	let title=req.query.title;
	mdModel.getMdSearch(title).then( results => {		
		//res.send(resObj);
		console.log(results);
		res.render('list1', {count: results.length, data: results});
	}).catch( error => {
		console.log('error : ', error);
		next(error);
	});
}

function editMd(req, res) {
	var sess = req.session;
	let title=req.query.title;
	
	mdModel.getMdSearch(title).then(results => {		
		//res.send(resObj);
		console.log(results);
		console.log('되냐');
		res.render('editMd');
	}).catch( error => {
		console.log('error : ', error);
		next(error);
	});
}

async function loginInfo(req, res, next) { //로그인
	let id=req.body.id;
	let pw=req.body.password;
	 try{
		const result = await mdModel.getlogin(id, pw);
		console.log(result.length);
		if(result.length==1){		
			console.log("로그인1");	
			const sessionID = req.sessionID;
			req.session.userid = id;
			console.log('login id :', req.session.userid);
   			console.log('login id :', req.session.userid);
			let sess = req.session;
   			console.log('cookies : ', sess);
		}else{
			alert("틀렷소");
		}res.send("");
	}
	catch ( error ) {
        res.status(500).send(error.msg);
    }
 }
 
function logoutt(req, res){
	req.session.destroy(function(err){
		if(err)console.error('err',err);
		res.send();
	})
}
function showMdList(req, res, next) {//미드 전체 리스트
	var sess = req.session;
	mdModel.getMdList().then( results => {
		res.render('list', {count: results.length, data: results});		
	}).catch( error => {
		console.log('error : ', error);
		next(error);
	});
}

async function showMdDetail(req, res, next) {
	var sess = req.session;
	console.log('showMdDetail');
	let mdId = req.params.id;
	try {
		let result = await mdModel.getMdDetail(mdId);
		res.send(result);
	}
	catch ( error ) {
		next(error);
	}	
}


// 미드 수정


async function addId(req, res, next) {
	// 바디 파서
	let id = req.body.id;
	if (!id) {
        res.status(400).send({error:'id 누락'});
        return;
	}	
	let password = req.body.password;
	let name = req.body.name;
	let birth = req.body.birth;
	let phone =  req.body.phone;
	let picture = req.body.picture;
	//var upFile=req.picture;
	//let picture = req.body.picture.filename;
	try{
		const result = await mdModel.addId(id, password, name, birth, phone, picture);
		//res.send({msg:'success', data:result});
		mdModel.getMdList().then( results => {
			let resObj = {
				count: results.length,
				data: results
			}
			//res.send(resObj);
			res.render('list', {count: results.length, data: results});
		}).catch( error => {
			console.log('error : ', error);
			next(error);
		});
	}
	catch ( error ) {
        res.status(500).send(error.msg);
    }
	// 모델에 호출
	//mdModel.addMd(title, year, channel, genre, age, actor, summary, season, website, picture)
 
	// 결과
	//res.send('TODO : 새 미드 추가');
 }

async function addMd(req, res, next) {//미드 추가
	var sess = req.session;
	// 바디 파서
	let title = req.body.title;
	console.log(title);
	if (!title) {
        res.status(400).send({error:'title 누락'});
        return;
	}	
	let year = req.body.year;
	let channel = req.body.channel;
	let genre = req.body.genre;
	let age =  req.body.age;
	let actor = req.body.actor;
	let summary = req.body.summary;
	let season = req.body.season;
	let website = req.body.website;	
	let picture = req.body.picture;
	const now = new Date();
	const date = now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate();
	//var upFile=req.picture;
	//let picture = req.body.picture.filename;
	try{
		const result = await mdModel.addMd(title, year, channel, genre, age, actor, summary, season, website, picture, date);
		//res.send({msg:'success', data:result});
		mdModel.getMdList().then( results => {
			let resObj = {
				count: results.length,
				data: results
			}		
			//res.send(resObj);
			res.render('list', {count: results.length, data: results});
		}).catch( error => {
			console.log('error : ', error);
			next(error);
		});
	}
	catch ( error ) {
        res.status(500).send(error.msg);
    }
	// 모델에 호출
	//mdModel.addMd(title, year, channel, genre, age, actor, summary, season, website, picture)
 
	// 결과
	//res.send('TODO : 새 미드 추가');
 }
function homepage(req, res){

	res.render('index');
}
function addMdForm(req, res){//미드 추가 폼
	var sess = req.session;
	res.render('newMd');
}
function joinForm(req, res){//회원가입 폼
	var sess = req.session;
	res.render('join');
}
function joinInfo(req, res){//회원가입 폼
	var sess = req.session;
	res.render('joinInfo');
}