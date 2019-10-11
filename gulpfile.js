// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
// ----- Tokens del Usuario -------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Configuración del Sitemap
const sitemapUrl = 'https://landstorm.dev';
const sitemapFrequence = 'monthly'; // 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
const sitemapPriority = '1.0'; // 0.0 to 1.0


// Configuración del nombre de los archivos principales
const jsFilename = 'landstorm-cdn-script.js'; // Nombre del archivo Javascript
const cssFilename = 'landstorm-cdn-stylesheet.css'; // Nombre del archivo CSS


// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
// ----- Inicio de Configuración de Gulp ------------------------------------------------------
// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Modulos Requeridos
const gulp         =  require('gulp');
const concat       =  require('gulp-concat');
const uglify       =  require('gulp-uglify');
const sass         =  require('gulp-sass');
const cleanCSS     =  require('gulp-clean-css');
const autoprefixer =  require('gulp-autoprefixer');
const pug          =  require('gulp-pug');
const sitemap      =  require('gulp-sitemap');
const clean        =  require('gulp-clean');
const zip          =  require('gulp-zip');
const imagemin     =  require('gulp-imagemin');
const extReplace   =  require('gulp-ext-replace');
const webp         =  require('imagemin-webp');
const critical     =  require('critical').stream;
const purgecss     =  require('gulp-purgecss');
const inject       =  require('gulp-inject');
const htmlmin      =  require('gulp-htmlmin');

// Compilación de Pug a Html
gulp.task('pug', function () {
    return gulp.src('./src/pages/views/**/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('./dist/'))
});

// Minificación de los archivos html
gulp.task('htmlmin', () => {
  return gulp.src('./dist/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('./dist/'));
});

// Compilación de SASS y conversion a CSS
gulp.task('sass', function () {
    return gulp.src('./src/sass/*.scss')
        .pipe(sass())
        .pipe(concat(cssFilename))
        .pipe(autoprefixer())
        .pipe(purgecss({
            content: ['./dist/**/*.html']
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist/'));
});

// Compilación de Componentes (SASS)
gulp.task('components', function () {
    return gulp.src('./src/pages/components/**/*.scss')
        .pipe(sass())
        .pipe(concat('components-styles.scss'))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./src/sass/components/'));
});

// Generación de CSS Critico
gulp.task('critical', () => {
    return gulp
        .src('./dist/*.html')
        .pipe(critical({
            base: 'dist/',
            inline: true,
            css: [
                'dist/landstorm-cdn-stylesheet.css'
            ]
        }))
        .pipe(gulp.dest('dist/'));
});

// Inyección de CDNs
gulp.task('inject_scripts', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(inject(gulp.src(['./dist/**/*.js', './dist/**/*.css'], { read: false }), { relative: true }))
        .pipe(gulp.dest('./dist'));
});


// Minificación y concatenación de Javascript
gulp.task('js', () => {
    return gulp.src('./src/javascripts/*.js')
        .pipe(concat(jsFilename))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});

// Manejo de las fuentes web
gulp.task('font', () => {
   return gulp.src('./src/fonts/**')
    .pipe(gulp.dest('./dist/'))
});

// Manejo del favicon
gulp.task('favicon', () => {
    return gulp.src('./src/favicons/**')
    .pipe(gulp.dest('./dist/favicons/'))
});

// Minificado de las imagenes jpg y png
gulp.task('img', () => {
    return gulp.src('./src/images/*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            //imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(gulp.dest('./dist/images/'))
});


// Conversión de imagenes webp
gulp.task('img_webp', () => {
    return gulp.src('./src/images/*')
        .pipe(imagemin([
            webp({ quality:50 })
        ]))
        .pipe(extReplace('.webp'))
        .pipe(gulp.dest('./dist/images/'))
})

// Creación de sitemap
gulp.task('sitemap', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(sitemap({
            siteUrl: sitemapUrl,
            changefreq: sitemapFrequence,
            priority: sitemapPriority,
            images: true
        }))
        .pipe(gulp.dest('./dist'));
});

// Crear el directorio dist
gulp.task('create_dist', () => {
    return gulp.src('./src/')
        .pipe(gulp.dest('./dist/'))
});

// Limpiar la carpeta dist
gulp.task('clean_dist', () => {
    return gulp.src('./dist/*')
        .pipe(clean());
});

// Crear el directorio public
gulp.task('create_public', () => {
    return gulp.src('./src/')
        .pipe(gulp.dest('./dist/'))
});

// Limpiar la carpeta public
gulp.task('clean_public', () => {
    return gulp.src('./public/*')
        .pipe(clean());
});

// Crear un zip
gulp.task('zip', () => {
    return gulp.src('./dist/**')
        .pipe(zip('cpanel.zip'))
        .pipe(gulp.dest('./package/'))
})


// Configuración del Watch
gulp.task('watch', () => {
    gulp.watch(['./src/pages/**/*.pug', './src/javascripts/**/*.js', './src/sass/**/*.scss'], gulp.series(['pug', 'js', 'sass']));
});

// Configuración de la tarea bundle
gulp.task('build', gulp.series(['create_dist', 'clean_dist', 'create_public', 'clean_public', 'pug', 'sass', 'js', 'htmlmin', 'inject_scripts', 'components', 'critical', 'favicon', 'font', 'img', 'img_webp', 'sitemap', 'zip']));