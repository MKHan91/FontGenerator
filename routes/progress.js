const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fse = require('fs-extra');
const gracefulFs = require('graceful-fs')
const router = express.Router();
const {execSync} = require('child_process');

const PNG = require('pngjs').PNG;
const svgicons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
// const ImageTracer = require('./public/javascript/imagetracer_v1.2.1.js');
const ImageTracer = require('/home/dev/public/javascript/imagetracer_v1.2.1.js');
const { log } = require('console');
const fontStream = new svgicons2svgfont({
    fontName: 'myfont'
})


const option = {
    'ltres': 1,
    'qtres': 1,
    'strokewidth': 0.5,
    'pathomit': 8,
    'blurradius': 0,
    'blurdelta': 10
};

option.pal = [{ r: 0, g: 0, b: 0, a: 255 }, { r: 255, g: 255, b: 255, a: 255 }];
option.linefilter = true;

gracefulFs.gracefulify(fs);

// router.get('/', (req, res) => {
//     res.render('progress') 
//  });



router.post('/', (req, res) => {
    // const startTrain = req.body.startTrain;

    //start
    let doing_training = false;
    let training_progress = [];
    // const root_dir = 'python/' + +new Date();
    // const root_dir = 'python/' + +new Date();
    // const root_dir = '/home/dev/fontpython/data' + +new Date();
    // const exp_dir = '/home/dev/fontpython/experiments' + +new Date();
    const root_dir = '/home/dev/fontpython/data'
    const exp_dir = '/home/dev/fontpython/experiments'
    // const scan_dir = root_dir + '/scanned_image';
    // const crop_dir = root_dir + '/cropped_image';
    // const sample_dir = root_dir + '/sample_image';
    // const data_dir = root_dir + '/data';
    const scan_dir = root_dir + '/client_template';
    const crop_dir = root_dir + '/handwriting';
    const sample_dir = root_dir + '/pair';
    const data_dir = root_dir + '/package';
    
    const model_dir = exp_dir + '/checkpoint';
    const logs_dir = exp_dir + '/logs'
    // const result_dir = exp_dir + '/result';
    const result_dir = '/home/dev/FONT/experiment_9_batch_16';

    const svg_dir = result_dir + '/svg'
    const svg_fonts_dir = result_dir + '/svg_fonts'
    const ttf_dir = result_dir + '/ttf_fonts'

    if (!fs.existsSync(root_dir)){
        fs.mkdirSync(root_dir)
    }
    
    if (!fs.existsSync(scan_dir)){
        fs.mkdirSync(scan_dir)
    }
    
    // if (!fs.existsSync(result_dir)){
    //     fs.mkdirSync(result_dir)
    // }
    
    if (!fs.existsSync(svg_dir)) {
        fs.mkdirSync(svg_dir)
    }
    
    if (!fs.existsSync(svg_fonts_dir)) {
        fs.mkdirSync(svg_fonts_dir)
    }
    
    if (!fs.existsSync(ttf_dir)) {
        fs.mkdirSync(ttf_dir)
    }
    
    if (!fs.existsSync(logs_dir)) {
        fs.mkdirSync(logs_dir)
    }

    fse.copySync('./baseline_checkpoint', `${root_dir}/`)
    // fse.copySync('./python/baseline', `${root_dir}/`)
    // fse.copySync('./public/uploads', `${scan_dir}`)
    

    fs.closeSync(fs.openSync(`${logs_dir}/progress`, 'w'));

    execSync(`cp /home/dev/public/uploads/*.png ${scan_dir}`);
    training_progress.push("image uploaded");   

    console.log(scan_dir);
    
    execSync(`python /home/dev/fontpython/01_crop.py --src_dir=${scan_dir} --dst_dir=${crop_dir} --unicode_txt=${root_dir}/399-uniform.txt`);
    training_progress.push("image cropped");

    console.log('Loading File .... /home/dev/fontpython/01_crop.py');
    
    execSync(`python /home/dev/fontpython/02_font2image.py --src_font=${root_dir}/NanumGothic.ttf --dst_font=${root_dir}/NanumGothic.ttf --sample_dir=${sample_dir} --handwriting_dir=${crop_dir}`);
    training_progress.push("image created");

    console.log('Loading File .... /home/dev/fontpython/02_font2image.py');
    
    execSync(`python /home/dev/fontpython/03_package.py --dir=${sample_dir} --save_dir=${data_dir}`)
    training_progress.push("data compressed");
    console.log('Loading File .... /home/dev/fontpython/03_package.py');
    
    execSync(`python /home/dev/fontpython/04_train.py --experiment_dir=${exp_dir} --experiment_id=9 --batch_size=16 --lr=0.001 --epoch=40 --sample_steps=100 --schedule=20 --L1_penalty=100 --Lconst_penalty=15 --freeze_encoder=1`);
    training_progress.push("first trained");
    console.log('/Loading File.... /home/dev/fontpython/04_train.py');
    
    execSync(`python /home/dev/fontpython/04_train.py --experiment_dir=${exp_dir} --experiment_id=9 --batch_size=16 --lr=0.001 --epoch=120 --sample_steps=100 --schedule=40 --L1_penalty=500 --Lconst_penalty=1000 --freeze_encoder=1`);
    training_progress.push("secondPhaseTrained");

    console.log('----------------------------------------------------'+model_dir)
    execSync(`python /home/dev/fontpython/05_infer.py --model_dir=${model_dir}/experiment_9_batch_16 --batch_size=1 --source_obj=${root_dir}/package/val.obj --embedding_ids=0 --save_dir=${result_dir}/inferred_result --progress_file=${logs_dir}/experiment_9_batch_16/progress`);
    training_progress.push("Inference");
    

    var sources = [];
    var fileName = [];
    const files = fs.readdirSync(`${result_dir}`);


    for (var i = 0; i < files.length; i++) {
        sources[i] = '0x' + files[i].substring(9, 13);
        fileName[i] = files[i].substring(9, 13);
    }

    // png to svg
    for (var i = 0; i < files.length; i++) {
        let j = i;

        var data = fs.readFileSync(`${result_dir}/inferred_` + fileName[j] + '.png');

        var png = PNG.sync.read(data);

        var myImageData = { width: 128, height: 128, data: png.data };
        var options = { ltres: option.ltres, strokewidth: option.strokewidth, qtres: option.qtres, pathomit: option.pathomit, blurradius: option.blurradius, blurdelta: option.blurdelta };

        options.pal = [{ r: 0, g: 0, b: 0, a: 255 }, { r: 255, g: 255, b: 255, a: 255 }];
        options.linefilter = true;

        var svgstring = ImageTracer.imagedataToSVG(myImageData, options);

        fs.writeFileSync(`${svg_dir}/` + fileName[j] + '.svg', svgstring);
    }

    fontStream.pipe(fs.createWriteStream(`${svg_fonts_dir}/font.svg`))
        .on('finish', function () {
            var ttf = svg2ttf(fs.readFileSync(`${svg_fonts_dir}/font.svg`, 'utf8'), {});
            fs.writeFileSync(`${ttf_dir}/myfont.ttf`, new Buffer(ttf.buffer));
        })
        .on('error', function (err) {
            console.log(err);
        });

    for (var i = 0; i < sources.length; i++) {
        let glyph1 = fs.createReadStream(`${svg_dir}/` + fileName[i] + '.svg');
        glyph1.metadata = {
            unicode: [String.fromCharCode((sources[i]).toString(10))],
            name: 'uni' + sources[i]
        };

        fontStream.write(glyph1);
    }
    fontStream.end();
    res.end('font created')
    
})

router.get('/', (req, res) => {
        res.render('progress') 
     });



module.exports = router;
