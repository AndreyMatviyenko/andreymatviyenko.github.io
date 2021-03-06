global.hostname = "localhost";

var gulp = require('gulp'),
sass = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
minifycss = require('gulp-minify-css'),
rename = require('gulp-rename');

gulp.task('express', function() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')({port: 35720}));
	app.use(express.static(__dirname + '/'));
	app.listen('3001', hostname);
});

var tinylr;
gulp.task('livereload', function() {
	tinylr = require('tiny-lr')();
	tinylr.listen(35720);
});

function notifyLiveReload(event) {
	var fileName = require('path').relative(__dirname, event.path);
	tinylr.changed({
		body: {
			files: [fileName]
		}
	});
}

gulp.task('styles', function () {
	gulp.src('./sass/*.sass')
	.pipe(sass({
		includePaths: require('node-bourbon').includePaths
	}).on('error', sass.logError))
	.pipe(rename({suffix: '.min'}))
	.pipe(autoprefixer({
		browsers: ['last 15 versions'],
		cascade: false
	}))
	.pipe(minifycss())
	.pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
	gulp.watch('./sass/*.sass', ['styles']);
	gulp.watch('./*.css', notifyLiveReload);
	gulp.watch('./*.html', notifyLiveReload);
	gulp.watch('./js/*.js', notifyLiveReload);
});

gulp.task('default', ['styles', 'express', 'livereload', 'watch'], function() {

});
