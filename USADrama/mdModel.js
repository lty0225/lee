var MongoClient = require('mongodb').MongoClient
//var url = 'mongodb://localhost:27017/Mdest';
var url ='mongodb+srv://lty0225:1234@cluster0-wm4h8.mongodb.net/test?retryWrites=true';
var ObjectID = require('mongodb').ObjectID;

var db;

MongoClient.connect(url, function (err, client) {
   if (err) {
      console.error('MongoDB 연결 실패', err);
      return;
   }const collection = client.db("Mdest");
   console.log(collection);
   db = collection;//database;
});

class MdModel {
    getlogin(id, pw) {
       return db.collection('IDs').find({$and:[{id:id},{password:pw}]}).toArray();
    }

    deleteMd(title){
        console.log('여기는');
        console.log(title);
        db.collection('Mds').deleteOne({title:title},(err, result) =>{
            if(err){
                console.error('DeleteOne Error', err);
                return;
            }
            console.log('DeleteOne 성공. 결과 :',result.result);
        });
        return ;
    }
   // 전체 도큐먼트 목록 얻기
   getMdList(callback) {
      return db.collection('Mds').find({}).toArray();
   }

   getMdSearch(title){
       return db.collection('Mds').find({title:title}).toArray();
   }
   getMdReview(title){
    return db.collection('reviewC').find({title:title}).toArray();
    }

   getMdDetail(id) {
      return db.collection('mds').findOne({_id:new ObjectID(id)})
   }

   addMd(title, year, channel, genre, age, actor, summary, season, website, picture, date){
        let data = {title:title, year:year, channel:channel, genre:genre,
             age:age, actor:actor, summary:summary, season:season, 
            website:website, picture:picture};
            let grade=3;
            grade=grade*1;
            let data1 = {title:title, reviews:"재밌네요", grade:grade, date:date};
            //리뷰가 없으면 리뷰추가가 안되서 자동으로 Md를 추가하면 리뷰 하나 생성
            db.collection('reviewC').insert(data1, (err, result) => {
            if(err){
                console.log(result);
                return;}
            })
       db.collection('Mds').insert(data, (err, results) => {
           if(err){
               console.log(results);
                return;}
       })
       return db.collection('Mds').find({}).toArray();
   }
   addReview(title, reviews, grade, date){
       grade=grade*1;
    let data = {title:title, reviews:reviews, grade:grade, date:date};
    console.log(grade);
   db.collection('reviewC').insert(data, (err, results) => {
       if(err){
           console.log(results);
            return;}
   })
   return db.collection('Mds').find({}).toArray();
}
   addId(id, password, name, birth, phone, picture){
    let data = {id:id, password:password, name:name, birth:birth, phone:phone, picture:picture};
    console.log(id);
   db.collection('IDs').insert(data, (err, results) => {
       if(err){
           console.log(results);
            return;}
   })
   return db.collection('Mds').find({}).toArray();
}
}
module.exports = new MdModel()