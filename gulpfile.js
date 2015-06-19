var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    mocha = require('gulp-mocha');

gulp.task('default', function() {
    return gulp.start(['jshint', 'build', 'watch']);
});

gulp.task('jshint', function() {
    return gulp.src(['src/*.js', 'spec/*.js', 'gulpfile.js'])
        .pipe(jshint())
        .pipe(jshint.reporter());
});

gulp.task('build', function() {
    return gulp.src(['src/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});

gulp.task('test', function() {
    return gulp.src(['spec/*.js'], {read: false})
        .pipe(mocha({reporter: 'dot'}))
        .on('error', function() {
            gulp.emit('fail', 'Unit tests failed!');
        });
});

gulp.task('watch', function(callback) {
    gulp.watch('src/*.js', ['build']);
});