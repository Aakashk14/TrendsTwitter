const express= require("express");

const path = require('path');
const socket = require('socket.io');
const session = require('express-session');
const got = require('got');
const { normalize } = require("path");
const app = express();


app.set("view engine","ejs");
app.use(express.static("public"));
var sessionmiddleware = session({
    secret:"123",
    resave:false,
    saveUninitialized:false,

})
app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use(sessionmiddleware);

const host="0.0.0.0";
const port = process.env.PORT || 3000;
const server=app.listen(port,host);

const io = socket(server);
io.use(function(socket, next) {
    sessionmiddleware(socket.request, socket.request.res || {}, next);
});
require('./find').find(app)
require('./find').logout(app)
app.use(function(req,res,next){

    if(!req.session.hashtag){

        res.sendFile(path.join(__dirname,'/index.html'));
    }else{
       next();
    }
}
);

app.get("/",(req,res)=>{
    if(req.session.hashtag){
        res.redirect("/test")
    }else{
        res.sendFile(path.join(__dirname,'/index.html'));

    }
})



var index=0;



app.get("/test",async(req,res)=>{
    let ans = await got(`https://api.twitter.com/1.1/search/tweets.json?q=%23${req.session.hashtag}&result_type=recent` ,{
        headers:{

         'Authorization': 'Bearer {Your_twitter_Api}'

    }})
ans = JSON.parse(ans.body);
req.session.data=ans;

if(req.session.hashtag_2){
let ans2= await got(`https://api.twitter.com/1.1/search/tweets.json?q=%23${req.session.hashtag_2}&result_type=recent` ,{
    headers:{

     'Authorization': 'Bearer {Your_twitter_Api}'

}})
res.cookie("Saved",`${req.session.hashtag},${req.session.hashtag_2}`)

ans2= JSON.parse(ans2.body);
req.session.data2=ans2;

res.render('main',{one:ans,two:ans2,first:req.session.hashtag,second:req.session.hashtag_2});
}else{
    app.locals.second="";
res.render('main',{one:ans,first:req.session.hashtag});

}
})





io.on("connection",(socket)=>{

socket.on("exec",()=>{

    setInterval(async() => {
        
    
   let test= await got(`https://api.twitter.com/1.1/search/tweets.json?q=%23${socket.request.session.hashtag}&result_type=recent` ,{
        headers:{

            'Authorization': 'Bearer {Your_twitter_Api}'
    }})
    test= JSON.parse(test.body);
    test=test.statuses
    let more=0;
if(socket.request.session.hashtag_2){
    var test2= await got(`https://api.twitter.com/1.1/search/tweets.json?q=%23${socket.request.session.hashtag_2}&result_type=recent` ,{
        headers:{


            'Authorization': 'Bearer {Your_twitter_Api}'
    }})

    test2= JSON.parse(test2.body);
    test2=test2.statuses;
     more=1;
}

let temp=0;
let temp2=0;
   for(let i=0;i<5;i++){
       for(let j=0;j<5;j++){
           if(test[i].text==socket.request.session.data.statuses[j].text){
               temp=1;
              break;
           }
           
       }
       if(temp==0){

           break;

       }
   }
if(more==1){
    for(let i=0;i<5;i++){
        for(let j=0;j<5;j++){
            if(test2[i].text==socket.request.session.data2.statuses[j].text){
                temp2=1;
               break;
            }
            
        }
        if(temp==0 && temp2==0){
            socket.emit("new data",{left:test,right:test2})
            break;
 
        }else if(temp2==0){
            socket.emit("new data",test2)
            break;
        }
    
}

    }else if(more==0 & temp==0){
        socket.emit("new data",test)
    }
},10000)

    

})
socket.on("new data",(data)=>{
socket.request.session.data=data;

})


})

app.use(function(req,res){
    res.send("404");
}
)