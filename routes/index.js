const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('INDEX PAGE');
    res.render('index');
});

router.get('/download', (req, res) => {
    res.download('/home/dev/FONT/experiment_1_batch_16/ttf_fonts/myfont.ttf');
});

router.get('/templatedown', (req, res) => {
    res.download('/home/dev/public/template/template1.jpg');
    res.download('/home/dev/public/template/template2.jpg');
    res.download('/home/dev/public/template/template3.jpg');
});

module.exports = router;
