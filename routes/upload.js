<<<<<<< HEAD
<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, './public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
        // 1-frequency.png
    }
});

// 3개의 image 업로드
const upload = multer({
        storage: storage
    }).array('templateImage', 3);

router.post('/', (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            // 업로드시 에러
            console.error(err);
            
        } else {
            const imageList = []

            req.files.forEach(element => {
                imageList.push(element.originalname)
            });
            
            console.log(req.files);
            res.render('upload');
        }
    })
});

=======
=======
>>>>>>> main
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, './public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
        // 1-frequency.png
    }
});

// 3개의 image 업로드
const upload = multer({
        storage: storage
    }).array('templateImage', 3);

router.post('/', (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            // 업로드시 에러
            console.error(err);
            
        } else {
            const imageList = []

            req.files.forEach(element => {
                imageList.push(element.originalname)
            });
            
            console.log(req.files);
            res.render('upload');
        }
    })
});

<<<<<<< HEAD
>>>>>>> 153cada270f50fc1230aea0cbaa8781288294c90
=======
>>>>>>> main
module.exports = router;