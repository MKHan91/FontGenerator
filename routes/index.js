<<<<<<< HEAD
<<<<<<< HEAD
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('INDEX PAGE');
    res.render('index');
});

router.get('/download', (req, res) => {
    res.download('/home/dev/public/myfont.ttf');
});

=======
=======
>>>>>>> main
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('INDEX PAGE');
    res.render('index');
});

router.get('/download', (req, res) => {
    res.download('/home/dev/public/myfont.ttf');
});

<<<<<<< HEAD
>>>>>>> 153cada270f50fc1230aea0cbaa8781288294c90
=======
>>>>>>> main
module.exports = router;