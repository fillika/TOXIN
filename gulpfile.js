var gulp = require('gulp'); // Подключаем gulp
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var gp = require('gulp-load-plugins')(); // Подключаем GLP, чтобы каждый раз не объявлять много переменных, а напрямую обращаться к плагинам
var browserSync = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});

gulp.task('styl', function () { // Таск на компиляцию stylus
    return gulp.src('src/stylus/main.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({
            'include css': true
        }))
        .pipe(gp.autoprefixer({
            overrideBrowserslist: ['last 10 versions']
        }))
        .on("error", gp.notify.onError({ // Определяем ошибки
            message: "Error: <%= error.message %>",
            title: "Error running something"
        }))
        .pipe(gp.csso()) // Оптимизирует, минифицирует
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('pug', function () { // Установили PUG
    return gulp.src('src/pug/*.pug')
        .pipe(gp.pug({
            pretty: true
        }))
        .pipe(gulp.dest('dist'))
        .on('end', browserSync.reload);
});

gulp.task('html', function () { // Установили PUG
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('css', function () { //
    return gulp.src('./src/css/*.css')
        .on('end', browserSync.reload);
});

gulp.task('img', function () {
    return gulp.src('src/img/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        pngquant(),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false},
            ]
        })
    ]))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('watch', function () { // Добавляем вотчер
    gulp.watch('src/**/*.styl', gulp.series('styl')); // Указываем, куда будет смотреть watcher
    gulp.watch('src/*.html', gulp.series('html'));
    gulp.watch('src/pug/**/*.pug', gulp.series('pug'));
    gulp.watch('src/js/**/*.js', gulp.series('script'));
    gulp.watch('src/css/*.css', gulp.series('css'));
    gulp.watch('src/img/**/*.+(jpg|jpeg|png|gif|WebP)', gulp.series('img'));
});

gulp.task('libs', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js']) // Здесь же мы будем подключать слайдеры, плагины и прочее. Подключаем через запятую внутри массива ['bla bla', 'bla bla]
        .pipe(gp.concat('libs.min.js')) // Все библиотеки, которые указаны в массиве сверху, мы будет объединять в один файл
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('script', function () {
    return gulp.src('./src/js/*.js') // Здесь же мы будем подключать наш JS файл
        .pipe(gp.concat('main.js')) // Все файлы в один
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('default', gulp.series( // Запускается обычной командой gulp 
    gulp.parallel('html', 'pug', 'styl', 'libs', 'script','img' , 'css'),
    gulp.parallel('watch', 'browser-sync')
));