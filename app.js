var express = require('express');
var app = express(); // 익스프레스 서버를 사용하기 위한 기본 작업
var cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const cheerio = require('cheerio');
const db = require('./lib/lowdb.js');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bodyparser = require('body-parser');
const shortid = require('shortid');
const bcrypt = require('bcrypt');

db.defaults({users : [], works : [], subjects : [], cards : []}).write();

var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(file.fieldname === 'thumnail'){
    cb(null, './data/thumnail');
  }else if (file.fieldname === 'cardImg'){
    cb(null, './data/image');
  }else{
    cb(null, './data');
  } // 파일이 저장될 위치에 대한 함수
  },

  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() +'.'+ path.basename(file.mimetype)); // 파일이 저장될 이름에 대한 함수
  }
});

const upload = multer({storage : _storage});// upload 할 수 있는 미들웨어 uploads라는 디렉토리에 파일을 업로드

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));// static설정을 해놓으면 정적인 파일들을 웹상에서 바로 접근할 수 있음
app.use(bodyparser.urlencoded({extended: false}));
app.use(cors());
app.use('/public', express.static('./public')); //upload 디렉토리를 통해 이미지 static파일에 접근 가능하도록 설정
app.use('/thumnail', express.static('./data/thumnail'));
app.use('/data/image', express.static('./data/image'));
app.locals.pretty = true;

app.use(session({
  secret : 'sdlkjfcaepir3i204123oi',
  resave : false,// 세션데이터가 바뀌기 전까지는 저장소에 저장하지 않음
  saveUninitialized: true, //세션이 필요하기 전까지는 구동하지 않는다
  // store:new FileStore(),
}))


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){//세션값을 생성해주고 user 값을 deserializeUser로 넘겨줌
  console.log('login is successful');
  done(null, user.id);
});

passport.deserializeUser(function (id, done){ //세션값이랑 db값을 비교하여 페이지 라우트의 req.user로 전달해줌
  var user = db.get('users').find({
    id : id,
  }).value();
  done(null, user);
})


passport.use(new LocalStrategy({
    usernameField: 'email',
    session : true,
  },
  function(email, password, done) {
    var user = db.get('users').find({
      email: email
    }).value();
    if (user) {
      bcrypt.compare(password, user.password, function(err, result) {
        if (result) {
          console.log('로그인이 성공하였습니다.');
          return done(null, user, {
            message: '로그인이 성공하였습니다.'
          });
        } else {
          console.log('비밀번호가 틀렸습니다.');
          return done(null, false, {
            message: '비밀번호가 틀렸습니다.'
          });
        }
      });
    } else {
        console.log('해당 계정이 존재하지 않습니다.');
      return done(null, false, {
        message: '해당 계정이 존재하지 않습니다.'
      });
    }
  }
));

app.post('/login_process',
passport.authenticate('local', { successRedirect: '/myPage',
                                 failureRedirect: '/loginPage.html',
                                })
);

var googleCredentials = require('./config/google.json');

passport.use(new GoogleStrategy({
    clientID: googleCredentials.web.client_id,
    clientSecret: googleCredentials.web.client_secret,
    callbackURL: googleCredentials.web.redirect_uris[0]
  },function(accessToken, refreshToken, profile, done) {
    var email = profile.emails[0].value;
    var user = db.get('users').find({
      email : email
    }).value();

    if(user){
      user.googleId = profile.id;
      db.get('users').find({id:user.id}).assign(user).write();
      done(null, user);
    } else {
      db.get('users').push({
        id:shortid.generate(),
        email,
        googleId:profile.id
      }).write();
      done(null, user);
    }
  }
));



app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
  }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/loginPage.html'
  }),
  function(req, res) {
    res.redirect('/mypage');
  });

app.post('/register_process', function(req,res){
  var post = req.body;
  var email = post.email;
  var password = post.password;
  var password2 = post.password2;

  if(db.get('users').find({email : email,}).value()){
    console.log('이미 존재하는 이메일 계정입니다.');
    return res.redirect('/register.html');
  }

  if(password !== password2 ){
    res.redirect('/register.html');
    console.log('비밀번호가 다릅니다.');
  }else{
    bcrypt.hash(password, 10, function(err, hash){
      var user = {
        id : shortid.generate(),
        email,
        password : hash,
      };
      db.get('users').push(user).write();
      req.login(user, function(err){
        if(err){
          console.log(err);
        }
        console.log('로그인 성공');
        return res.redirect('/');
      });
    });
  }
});

app.post('/cardSave', (req, res) => {
  let workId = req.body.workId;
  let subjectId = req.body.subjectId;

  let cardData =JSON.parse(req.body.reqData);
  let newCard = [];
  db.get('works').find({workId : workId}).get('subjectLists').find({subjectId}).get('cardList').remove().write();

  cardData.forEach(function(item, index){
    //현재는 cardData에 id값이 존재 하기 때문에 이런식의 작업이 가능하지만 id값을 저장할때 부여한다고 생각하여 재설계하여야 함
    if (item.cardId){
      //기 작업된 카드에 대한 작업 수행
      db.get('works').find({workId : workId}).get('subjectLists').find({subjectId}).get('cardList').push({
        cardId : item.cardId,
        workId,
        subjectId,
        cardNumber : item.cardNumber,
        cardContents : item.content
      }).write();
    }else{
      //작업되지 않은 카드(새로 추가된 카드)에 대한 작업 수행
      let cardId = shortid.generate();
      newCard.push({cardNumber : item.cardNumber,
                    cardId : cardId});//새로운 카드에 대한 정보를 담아 프론트에서 저장하는 작업을 수행해야함
      let $ = cheerio.load(item.content);
      $('.card-editor').attr('data-cardid', cardId);
      item.content = $('body').html();
      db.get('works').find({workId : workId}).get('subjectLists').find({subjectId}).get('cardList').push({
        cardId,
        workId,
        subjectId,
        cardNumber : item.cardNumber,
        cardContents : item.content
      }).write();

    }
  })
  res.send({newCard : newCard});
});


app.get('/logout', function(req, res){
  req.logout();
  req.session.destroy(function(){
    res.redirect('/feedboard');
  });
});

app.post('/cardImgSave', upload.single('cardImg'), (req, res)=>{
  const linkimg = `/data/image/${req.file.filename}`
  res.send(linkimg);
});

app.get('/cardEditor', function(req,res){
  let user = isLogin(req.user);
  let workId = req.query.workId;
  let subjectId = req.query.subjectId;
  let workTitle = db.get('works').find({workId}).get('workTitle').value();
  let subjectData = db.get('works').find({workId}).get('subjectLists').value();
  let subjectTitle = db.get('works').find({workId}).get('subjectLists').find({subjectId}).get('subjectTitle');

  let cardData = db.get('works').find({workId}).get('subjectLists').find({subjectId}).get('cardList').sortBy('cardNumber').value();
  res.render('CardEdit',{user, workId, workTitle, subjectData, subjectId, subjectTitle,cardData});
});


app.get('/cardView', function(req,res){
   let user = isLogin(req.user);
   let workId = req.query.workId;
   let subjectId = req.query.subjectId;
   let subjectData = db.get('works').find({workId}).get('subjectLists').value();
   let workTitle = db.get('works').find({workId}).get('workTitle').value();
   let subjectTitle = db.get('works').find({workId}).get('subjectLists').find({subjectId}).get('subjectTitle');

   let cardList = JSON.parse(JSON.stringify( db.get('works').find({workId}).get('subjectLists').find({subjectId}).get('cardList').value()));
   let cardData = [];

   cardList.forEach(function(item, index){
    let $ = cheerio.load(item.cardContents);
    $('#close').remove();
    $('#dragbar').remove();
    $('.close').remove();
    $('.modal-button-label').remove();
    $("[data-dismiss = modal]").remove();
    $('[contenteditable = true]').removeAttr('contenteditable');
    item.cardContents = $('body').html();
    cardData.push(item);
  })

   res.render('cardView', {user, workId, workTitle, subjectTitle, subjectData, cardData});

});

app.get('/workpage',function(req, res){
  let user = isLogin(req.user);
  let workId = req.query.workId;
  let workData = db.get('works').find({workId : workId}).value();
  let subjectLists = workData.subjectLists;



  res.render('Workpage', {user, workData, subjectLists});
})

app.get('/mypage',function(req,res){
  let user = isLogin(req.user);
  if(!user){
    return res.redirect('/loginPage.html');
  }
  let workData = workLoad(req.user.id);

  res.render('MyPage', {user, workData : workData});
})

app.get('/feedboard', function(req, res) {
  let user = isLogin(req.user);
  let subjectId = req.query.subjectId;
  let subject = subjectFinder(subjectId);

  for (let i = 0; i < subjectData.totalcards; i++) {
    let tempCardString = subjectData.cardList[i].card;
    let $ = cheerio.load(tempCardString);
    $('#close').remove();
    $('#dragbar').remove();
    $('.close').remove();
    $('.modal-button-label').remove();
    $("[data-dismiss = modal]").remove();
    tempCardString = $('body').html();
    subjectData.cardList[i].card = tempCardString;
  }

  res.render('feedboard', {user, subject});
})

app.post('/workUpload', function(req, res){
  let workData = {
    workTitle : req.body.workTitle,
    workId : shortid.generate(),
    ownerId : req.user.id,
    views : 0,
  }
  db.get('works').push({
    workTitle : workData.workTitle,
    workId : workData.workId,
    ownerId : workData.ownerId,
    subjectLists : [],
    views : 0,
  }).write();

  res.send(workData);
})
app.post('/workUpdate', function(req,res){

  let workData = {
    workId : req.body.workId,
    workDescription : req.body.workDescription,
    workTitle : req.body.workTitle
  };

  db.get('works').find({workId : workData.workId}).assign({
    workTitle : workData.workTitle,
    workDescription : workData.workDescription
  }).write();
  res.redirect(req.get('referer'));
})

app.get('/workDelete/:workId', function(req,res){
  let workId = req.params.workId;
  db.get('works').remove({workId : workId}).write();
  res.redirect('/myPage');
})

app.post('/subjectUpload', function(req, res){
  let subjectTitle = req.body.subjectName;
  let workId = req.body.currentWorkId;
  let subjectData = {
    subjectTitle,
    subjectId :shortid.generate(),
    workId,
  }

  db.get('works').find({workId : workId}).get('subjectLists').push({
    subjectTitle : subjectData.subjectTitle,
    subjectId : subjectData.subjectId,
    workId,
    cardList : [],
  }).write();

  res.send(subjectData);
});

app.post('/subjectUpdate', function(req,res){
  let subjectData = {
    subjectId : req.body.subjectId,
    subjectTitle : req.body.subjectTitle
  };
  let workId = req.body.workId;
  db.get('works').find({workId : workId}).get('subjectLists').
  find({subjectId : subjectData.subjectId}).
  assign({subjectTitle : subjectData.subjectTitle}).write();


  res.redirect(req.get('referer'));
});

app.get('/subjectDelete/:workId/:subjectId', function(req,res){
  let workId = req.params.workId;
  let subjectId = req.params.subjectId;
  db.get('works').find({workId : workId}).get('subjectLists').remove({subjectId : subjectId}).write();

  res.redirect(req.get('referer'));
});

app.listen(3000, function(){
  console.log('Conneted 3000 port');
});

function subjectFinder(subjectId){
  let Data;
  let cardData;

  let testSubject = {
    subjectname : 'testSubject',
    subjectId,
    totalcards : 16,
    cardList : new Array(),
  };

  for(let i = 1; i <= testSubject.totalcards; i++){

    Data = fs.readFileSync(`./data/${i}`, 'utf-8');
    cardData = JSON.parse(Data);
    testSubject.cardList.push(cardData);
  };
  return testSubject;
}

function workLoad(userId){
  return db.get('works').filter({ownerId : userId}).value();
}

function isLogin(userData){
  if(userData)
    return db.get('users').find({id: userData.id }).value();
  else {
    return undefined;
  }

}
