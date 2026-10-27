const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: function(req,file,cb){

        cb(null,"uploads/");

    },

    filename:function(req,file,cb){

        const uniqueName=Date.now()+"-"+Math.round(Math.random()*1E9);

        cb(null,uniqueName+path.extname(file.originalname));

    }

});

const fileFilter=(req,file,cb)=>{

    if(
        file.mimetype==="image/jpeg" ||
        file.mimetype==="image/png" ||
        file.mimetype==="image/jpg"
    ){

        cb(null,true);

    }

    else{

        cb(new Error("Only JPG and PNG Images Allowed"),false);

    }

};

module.exports=multer({

    storage,

    fileFilter,

    limits:{
        fileSize:2*1024*1024
    }

});