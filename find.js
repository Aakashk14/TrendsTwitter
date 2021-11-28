const { Router } = require("express");

module.exports.find= function(app){

    app.post("/find",(req,res,next)=>{
        console.log(req.body.password)
        if(req.body.password=="pvt/"){
            req.session.password=req.body.password;
           let tmp1=req.body.hashtag.split(",");
           req.session.hashtag=tmp1[0];
           console.log(tmp1);
           if(tmp1.length ==2){
           req.session.hashtag_2=tmp1[1];
           }
           res.redirect("/test");
        }else{
            res.send("not allowed")
        }
    })
}
module.exports.logout=function(app){
    app.post("/logout",(req,res,next)=>{
        req.session.destroy(null);
        res.redirect("/");
    })

}

