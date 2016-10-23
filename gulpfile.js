/* jshint node:true */
'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var plugins = require('gulp-load-plugins')();

// The Following Gulp Tasks help generate Static Files for web servers:
gulp.task('clean', require('del').bind(null, ['.temp','dist']));

gulp.task('extra', function() {
    return gulp .src('styles/*.css')
                .pipe(gulp.dest('dist/styles/'));
});

gulp.task('fonts', function() {
    return gulp.src(require('main-bower-files')().concat('app/fonts/**/*')
        .concat('bower_components/bootstrap/fonts/*'))
        .pipe(plugins.filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe(plugins.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe(gulp.dest('.tmp/fonts'));
});

gulp.task('images', function() {
    return gulp .src('app/images/*')
                .pipe(gulp.dest('dist/images/'));
});

gulp.task('html', ['styles'], function(){
    var lazypipe = require('lazypipe');
    var cssChannel = lazypipe()
        .pipe(plugins.csso)
        .pipe(plugins.replace, 'bower_components/bootstrap/fonts', 'fonts');

    var assets = plugins.useref.assets({searchPath: '{.tmp,app}'});

    return gulp.src('app/**/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', plugins.ngAnnotate()))
        //.pipe(gulpif('*.js', plugins.uglify()))
        .pipe(gulpif('*.css', cssChannel()))
        .pipe(assets.restore())
        .pipe(plugins.useref())
        //.pipe(gulpif('*.html', plugins.minifyHtml({conditionals: true, loose: true})))
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function () {
    return gulp .src('app/styles/main.less') //Load the main Less file
                .pipe(plugins.plumber()) //Pipe all output from LESS Compiler but keep input stream
                .pipe(plugins.less()) // Compile LESS input
                .pipe(gulp.dest('.tmp/styles')); // Output compiled LESS to temp styles folder
});

gulp.task('build', ['extra','html','images', 'fonts'], function() {});

//======================================================================================================================
