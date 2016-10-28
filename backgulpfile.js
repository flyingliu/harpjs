'use strict';
var argv = require('yargs').argv
var _ = require('lodash')
var path = require('path')
var runSequence = require('gulp-run-sequence'); 
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var clean = require('gulp-clean');
var gulpif = require('gulp-if');
var del = require('del');
var minimist = require('minimist');
var gutil = require('gulp-util');

var gulp = require('gulp');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var jshint = require('gulp-jshint')
var less = require('gulp-less')
var plumber = require('gulp-plumber')
var uglify = require('gulp-uglify')
var markdown = require('gulp-markdown')
var tpl2js = require('gulp-tpl2js')
var cssmin = require('gulp-cssmin')
var imagemin = require('gulp-imagemin')
var cache = require('gulp-cache')
var autoprefixer = require('gulp-autoprefixer')

var config = require('./config').images
var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'dev' }
};
var options = minimist(process.argv.slice(2), knownOptions);
var isDev = options.env === "dev";



gulp.task('help', function() {
    console.log(' gulp watch    文件监控打包');
    console.log(' gulp server   测试server');
    console.log(' gulp -p       生产环境（默认生产环境）');
    console.log(' gulp -d       开发环境');
});


// 图片压缩---------------------------------
gulp.task('imagemin', function(){
    return gulp.src(config.src)
        .pipe(cache(imagemin()))
        .pipe(gulp.dest(config.dist));
});

// Lint Task---------------------------------
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


// Less To Css
gulp.task('less', function() {
    return gulp.src('v2.0/**/**/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false }))
        .on('error',function(e){console.log(e)})
        .pipe(gulp.dest('v2.0'))
        .pipe(cssmin({compatibility : 'ie8', noAdvanced : true }))
        .pipe(gulp.dest('dist'));
});

// Less To Css
gulp.task('less-p', function() {
    return gulp.src('p/**/**/*.less')
        .pipe(less())
        .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false }))
        .pipe(cssmin({compatibility : 'ie8', noAdvanced : true }))
        .pipe(gulp.dest('p'))
});

// Copy && Minify Css
gulp.task('css', function() {
    return gulp.src('v2.0/**/**/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('dist'));
});



// Copy && Minify html
gulp.task('html', function() {
    return gulp.src('v2.0/**/**/*.html')
        .pipe(gulp.dest('dist'));
});

// Converts Markdown to HTML
gulp.task('markdown', function () {
    return gulp.src('*.md')
        .pipe(markdown())
        .pipe(gulp.dest('md'));
});

// Concatenate && Minify JS
gulp.task('theme', function() {
    return gulp.src(['theme/**/**/*.js'])
        .pipe(plumber()) //plumber给pipe打补丁
        .pipe(uglify()) // 压缩js
        .pipe(gulp.dest('dist/theme')); // 移动到文件夹下
});


// Concatenate && Minify JS
gulp.task('scripts', function() {
    return gulp.src(['v2.0/**/*.js','v2.0/**/*.tpl.js','p/**/*.js','p/**/*.tpl.js'])
        .pipe(plumber()) //plumber给pipe打补丁
        .pipe(uglify()) // 压缩js
        .pipe(gulp.dest('dist')); // 移动到文件夹下
});

// jst
gulp.task('jst', function() {
    return gulp.src('v2.0/**/**/*.tpl.html')
        .pipe(tpl2js({type: 'amd', modBase: '.'}))
        .pipe(gulp.dest(function(file) {
            var hist = file.history[0].replace(/(\\)/g,'/'),
                sp = hist.split(/\/(?![^\/]*\/)/)[0],
                pt = sp.split("v2.0")[1];
                pt = pt.split(".html")[0];
                console.log(sp);
          return "v2.0"+pt;
        }))
        .pipe(gulp.dest(function(file) {
            var hist = file.history[0].replace(/(\\)/g,'/'),
                sp = hist.split(/\/(?![^\/]*\/)/)[0],
                pt = sp.split("v2.0")[1];
          return "dist"+pt;
        }));
});

// jst
gulp.task('jst-p', function() {
    return gulp.src('p/hotspot/comment/*.tpl.html')
        .pipe(tpl2js({type: 'amd',modBase: 'comment'}))
        .pipe(gulp.dest(function(file) {
            var hist = file.history[0].replace(/(\\)/g,'/'),
                sp = hist.split(/\/(?![^\/]*\/)/)[0],
                pt = sp.split("p/hotspot")[1];
                console.log(sp);
          return "p/hotspot"+pt;
        }))
        .pipe(gulp.dest(function(file) {
            var hist = file.history[0].replace(/(\\)/g,'/'),
                sp = hist.split(/\/(?![^\/]*\/)/)[0],
                pt = sp.split("v2.0")[1];
          return "dist"+pt;
        }));
});




//web server
gulp.task('server', function() {
    gulp.src('./') // 服务器目录（./代表根目录）
        .pipe(webserver({ // 运行gulp-webserver
            livereload: true, // 启用LiveReload
            port: 8080,
            open: true // 服务器启动时自动打开网页
        }));
});


// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('p/**/**/*.less', ['less-p']);
    gulp.watch('v2.0/**/**/*.less', ['less']);
    gulp.watch(['v2.0/**/**/*.js','!v2.0/**/**/*.tpl.js'], ['scripts']);
    gulp.watch('v2.0/**/**/*.html', ['jst']);
    gulp.watch('theme/**/**/*.js', ['theme']);

    // livereload.listen();

});

// Default Task
gulp.task('default', ['less','jst','scripts','imagemin', 'css','theme','watch']);

