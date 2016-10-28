var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    plumber = require('gulp-plumber');


/* es6 */
gulp.task('es6', function() {
   return gulp.src('**/*.es6')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./'));
});

//监听文件修改
gulp.task('watch', function() {
    gulp.watch(['**/*.es6'], ['es6']);
});

gulp.task('default', ['es6','watch']);