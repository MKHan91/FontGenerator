const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('INDEX PAGE');
    res.render('index');
});

router.get('/download', (req, res) => {
    // res.download('/home/dev/public/myfont.ttf');
    res.download('/home/dev/FONT/experiment_10_batch_16/ttf_fonts/myfont.ttf');
});

module.exports = router;