// --------------------------------------------------------------------------------------------
// ----- Configuración del Usuario ------------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Configuración del Sitemap
const sitemapUrl = 'https://landstorm.dev';
const sitemapFrequence = 'monthly'; // 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
const sitemapPriority = '1.0'; // 0.0 to 1.0


// Configuración del nombre de los archivos CSS y JS generados por el Framework Landstorm
const jsFilename = 'landstorm-cdn-script.js'; // Nombre del archivo Javascript
const cssFilename = 'landstorm-cdn-stylesheet.css'; // Nombre del archivo CSS


// Configuración de los Plugins que se utilizaran en el proyecto
const plugins = [
    './src/core/plugins/blazy/*.{js,css}',
    './src/core/plugins/plyr/*.{js,css}',
];

// Configuración de los Componentes que se utilizaran en el proyecto
const components = [
    './src/core/views/blazy/*.{js,scss}',
    './src/core/plugins/plyr/*.{js,scss}',
];

// --------------------------------------------------------------------------------------------
// ----- Modulos Gulp -------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

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


// --------------------------------------------------------------------------------------------
// ----- Configuración para Desarrollo --------------------------------------------------------
// --------------------------------------------------------------------------------------------


// Crear el directorio dist
gulp.task('create_dist', () => {
    return gulp.src('./src/')
        .pipe(gulp.dest('./dist/'))
});

// Limpiar la carpeta dist
gulp.task('clean_dist', () => {
    return gulp.src('./dist/*')
        .pipe(clean())
});

// Crear el directorio generator
gulp.task('create_generator', () => {
    return gulp.src('./src/')
        .pipe(gulp.dest('./generator/'))
});

// Limpiar la carpeta generator
gulp.task('clean_generator', () => {
    return gulp.src('./generator/*')
        .pipe(clean())
});

// Compilación de Pug a Html
gulp.task('compile_pug', function () {
    return gulp.src('./src/core/views/pages/**/*.pug')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('./dist/'))
});

// Compilación de SASS y conversion a CSS
gulp.task('style_framework', function () {
    return gulp.src('./src/core/framework/styles/core.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('0a-framework-style.css'))
        .pipe(gulp.dest('./generator/'))
});

// Minificación y concatenación de Javascript
gulp.task('script_framework', () => {
    return gulp.src('./src/core/framework/scripts/**/*.js')
        .pipe(concat('0a-framework-script.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./generator/'))
});

// Importar el Framework a la carpeta Generator
gulp.task('import_framework', gulp.series(['style_framework', 'script_framework']));

// Importación de los Plugins
gulp.task('import_plugins', () => {
    return gulp.src(plugins)
        .pipe(gulp.dest('./generator/'))
});

// Empaquetado de archivos sass a dist
gulp.task('styles_packaging', function () {
    return gulp.src('./generator/*.css')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat(cssFilename))
        .pipe(gulp.dest('./dist/'))
});

// Empaquetado de archivos js a dist
gulp.task('scripts_packaging', () => {
    return gulp.src('./generator/*.js')
        .pipe(concat(jsFilename))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'))
});

// Empaquetar todos los recursos a la carpeta Dist
gulp.task('generate_assets', gulp.series(['styles_packaging', 'scripts_packaging']));

// Inyección de CDNs
gulp.task('inject_scripts', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(inject(gulp.src(['./dist/**/*.js', './dist/**/*.css'], { read: false }), { relative: true }))
        .pipe(gulp.dest('./dist'))
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
            webp({
                quality: 100,
                preset: 'photo'
            })
        ]))
        .pipe(extReplace('.webp'))
        .pipe(gulp.dest('./dist/images/'))
})

// Manejo de los Videos locales
gulp.task('video', () => {
    return gulp.src('./src/videos/**')
        .pipe(gulp.dest('./dist/videos/'))
});

gulp.task('dev', gulp.series(['create_dist', 'clean_dist', 'compile_pug', 'style_framework', 'script_framework', 'inject_scripts', 'font', 'favicon', 'img', 'img_webp','video']));

// --------------------------------------------------------------------------------------------
// ----- Configuración para Producción --------------------------------------------------------
// --------------------------------------------------------------------------------------------

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

// Minificación de los archivos html
gulp.task('htmlmin', () => {
  return gulp.src('./dist/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
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





// Crear un zip
gulp.task('zip', () => {
    return gulp.src('./dist/**')
        .pipe(zip('cpanel.zip'))
        .pipe(gulp.dest('./package/'))
})


// Configuración del Watch
gulp.task('watch', () => {
    gulp.watch(['./src/pages/**/*.pug', './src/javascripts/**/*.js', './src/sass/**/*.scss'], gulp.series(['inject_scripts']));
});

// Configuración de la tarea bundle
