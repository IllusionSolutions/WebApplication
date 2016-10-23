/* jshint node:true */
'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var plugins = require('gulp-load-plugins')();

// The Following Gulp Tasks help generate Static Files for web servers:
gulp.task('clean', require('del').bind(null, ['.temp','dist']));

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

gulp.task('build', ['html','images', 'fonts'], function() {});

//======================================================================================================================
//          The Following Tasks should only be used during development.
//======================================================================================================================

gulp.task('test', function(done) {
    karma.start({
        configFile: __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('wiredep', function() {
    var wiredep = require('wiredep').stream;
    var exclude = [
        'es5-shim',
        'json3',
        'angular-scenario'
    ];

    gulp.src('app/styles/*.less')
        .pipe(wiredep())
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep())
        .pipe(gulp.dest('app'));
});

gulp.task('connect', ['styles'], function() {

    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var cors = require('cors');
    var connect = require('connect');

    var app = connect();
    app
        .use(require('connect-livereload')({port: 35729}))
        .use(serveStatic('.tmp'))
        .use(serveStatic('app'))
        .use('/bower_components', serveStatic('bower_components'))
        .use(serveIndex('app'));

    app.listen(9000).on('listening', function () {
        console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('watch', ['connect'], function() {
    plugins.livereload.listen();

    gulp.watch([
        'app/**/*.html',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', plugins.livereload.changed);

    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('serve', ['wiredep', 'connect', 'fonts', 'watch'], function() {
    if (argv.open) {
        require('opn')('http://localhost:9000');
    }
});

gulp.task('docs', [], function() {
    return gulp.src('app/scripts/**/**')
        .pipe(plugins.ngdocs.process())
        .pipe(gulp.dest('./docs'));
});
