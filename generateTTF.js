var express = require('express');
// var router = express.Router();
const { exec, execSync, spawn } = require('child_process');
var ImageTracer = require('./public/javascript/imagetracer_v1.2.1.js');
var fs = require('fs');
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(fs)
var svg2ttf = require('svg2ttf');
var svgicons2svgfont = require('svgicons2svgfont');

var fontStream = new svgicons2svgfont({
    fontName: '윤경민 글씨체'
})

var PNG = require('pngjs').PNG;

// var dir_name = 'FONT/inferred_result'
// var folderName = 'exp0_b8'
var dir_name = 'FONT/experiment_1_batch_16'
// var dir_name = +new Date()

var img_dir = `./${dir_name}`
if (!fs.existsSync(img_dir)){
    fs.mkdirSync(img_dir)
}

var svg_dir = img_dir + '/svg'
if (!fs.existsSync(svg_dir)){
    fs.mkdirSync(svg_dir)
}

var svg_fonts_dir = img_dir + '/svg_fonts'
if (!fs.existsSync(svg_fonts_dir)){
    fs.mkdirSync(svg_fonts_dir)
}

var ttf_dir = img_dir + '/ttf_fonts'
if (!fs.existsSync(ttf_dir)){
    fs.mkdirSync(ttf_dir)
}

//  flipped_result 디렉터리 안에 있는 파일 목록을 가져와서 files 변수에 저장합니다.
// var files = fs.readdirSync(`./${dir_name}/flipped_result`);
var files = fs.readdirSync(`./${dir_name}/inferred_result`);

var option = {    
        'ltres' : 0.01, //  선을 추출하는 최소 길이입니다. 이 값이 낮을수록 작은 세부사항이 추출됩니다.
        'qtres' : 0.01, //점을 추출하는 최소 퀄리티입니다. 이 값이 낮을수록 더 많은 점이 추출됩니다.
        'strokewidth' : 0.5, // 선의 폭입니다. 이 값이 높을수록 두꺼운 선이 생성됩니다.
        // 'pathomit' : 8, //  경로를 건너뛰는 정도입니다. 이 값이 높을수록 더 단순화된 경로가 생성됩니다.
        'pathomit' : 0.1, //  경로를 건너뛰는 정도입니다. 이 값이 높을수록 더 단순화된 경로가 생성됩니다.
        'blurradius' : 0, // 흐림 반경입니다. 이 값이 0보다 크면 흐림 효과가 적용됩니다.
        'blurdelta' : 10 // 흐림 델타 값입니다. 이 값이 클수록 더 강한 흐림 효과가 적용됩니다.
    };

option.pal = [{r:0,g:0,b:0,a:255},{r:255,g:255,b:255,a:255}];
option.linefilter=true;


const app = async function generate() {
    const sources = [];
    const fileName = [];

    files.forEach(file => {
        let source = '0x' + file.substring(9, 13);
        let name = file.substring(9, 13);
        if (file.length === 14) {
            source = '0x' + file.substring(9, 10).charCodeAt(0).toString(16);
            name = file.substring(9, 10);
        }
        sources.push(source);
        fileName.push(name);
    });

    // PNG to SVG
    await Promise.all(fileName.map(async (name, i) => {
        const data = fs.readFileSync(`${__dirname}/${dir_name}/inferred_result/inferred_${name}.png`);
        const png = PNG.sync.read(data);
        const myImageData = {width: png.width, height: png.height, data: png.data};
        const svgstring = ImageTracer.imagedataToSVG(myImageData, option);
        fs.writeFileSync(`${svg_dir}/${name}.svg`, svgstring);
    }));

    // Font stream handling
    fontStream.pipe(fs.createWriteStream(`${svg_fonts_dir}/font_ss.svg`))
        .on('finish', function() {
            const ttf = svg2ttf(fs.readFileSync(`${svg_fonts_dir}/font_ss.svg`, 'utf8'), {fontHeight: 1000, normalize: true});
            fs.writeFileSync(`${ttf_dir}/FONT.ttf`, Buffer.from(ttf.buffer));
        })
        .on('error', function(err) {
            console.error(err);
        });

    // Writing glyphs to the font stream
    sources.forEach((source, i) => {
        // const glyph = fs.createReadStream(`${svg_dir}/${fileName[i]}.svg`);
        let glyph = fs.createReadStream(`${svg_dir}/${fileName[i]}.svg`);
        glyph.metadata = {
            unicode: [String.fromCharCode(parseInt(source, 16))],
            // name: 'uni' + source
            name: 'glyph' + source
        };
        fontStream.write(glyph);
    });

    fontStream.end();
};

app();


// var app = function generate()
// {
//     var sources = [];
//     var fileName = [];

//     for(var i=0; i<files.length; i++) {
//     sources[i] = '0x' + files[i].substring(9,13);
//     fileName[i] = files[i].substring(9,13);
//     // 숫자, 영어
//     if (files[i].length === 14){
//         console.log(files[i])
//         sources[i] = '0x' + (files[i].substring(9, 10).charCodeAt(0).toString(16));
//         fileName[i] = files[i].substring(9, 10);
//     }

//     }
//       // png to svg
//     for(var i=0; i<files.length; i++) {
//         let j = i;

//         var data = fs.readFileSync(__dirname+`/${dir_name}/inferred_result/inferred_`+fileName[j]+'.png');

//         var png = PNG.sync.read(data);

//         var myImageData = {width:png.width, height:png.height, data:png.data};
//         var options = {ltres:option.ltres, strokewidth:option.strokewidth, qtres:option.qtres, pathomit:option.pathomit, blurradius:option.blurradius, blurdelta:option.blurdelta};

//         options.pal = [{r:0,g:0,b:0,a:255},{r:255,g:255,b:255,a:255}];
//         options.linefilter=true;
        
//         var svgstring = ImageTracer.imagedataToSVG( myImageData, options);

//         fs.writeFileSync(`./${dir_name}/svg/` + fileName[j] + '.svg', svgstring);
// }

//     fontStream.pipe(fs.createWriteStream( `./${dir_name}/svg_fonts/font_ss.svg`))
//     .on('finish', function() {
//         // var ttf = svg2ttf(fs.readFileSync( `./${dir_name}/svg_fonts/font_ss.svg`, 'utf8'), {});
//         var ttf = svg2ttf(fs.readFileSync( `./${dir_name}/svg_fonts/font_ss.svg`, 'utf8'), {fontHeight: 5000, normalize: true});
//         // fs.writeFileSync(`./${dir_name}/ttf_fonts/FONT.ttf`, new Buffer(ttf.buffer));
//         fs.writeFileSync(`./${dir_name}/ttf_fonts/FONT.ttf`, Buffer.from(ttf.buffer));
//     })
//     .on('error',function(err) {
//         console.log(err);
//     });

//     for (var i=0; i < sources.length; i++) {
        
//         let glyph1 = fs.createReadStream(`./${dir_name}/svg/` + fileName[i] + '.svg');
//         glyph1.metadata = {
//         unicode: [String.fromCharCode((sources[i]).toString(10))],
//         name: 'uni' + sources[i]
//         };

//         fontStream.write(glyph1);
//     }
//     fontStream.end();

//     // execSync('ttfautohint D:\CUSTOM\FontGenerator\FONT\experiment_6_batch_16\ttf_fonts/FONT.ttf D:\CUSTOM\FontGenerator\FONT\experiment_6_batch_16\ttf_fonts/font-hinted.ttf');

//     // // 폰트 파일이 유효한지 확인하기 위해 FontForge로 열기
//     // execSync('fontforge -lang=ff -c "Open(\'D:\CUSTOM\FontGenerator\FONT\experiment_6_batch_16\ttf_fonts/font-hinted.ttf\'); Save(\'D:\CUSTOM\FontGenerator\FONT\experiment_6_batch_16\ttf_fonts/font-hinted-fixed.ttf\'); Quit()"');
// }

// app();
