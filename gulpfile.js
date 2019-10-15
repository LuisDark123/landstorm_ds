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
    './src/core/components/videoplayers/videoplayer_vanilla/*.{js,scss}'
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

gulp.task('build_dist', gulp.series(['create_dist', 'clean_dist']));

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

gulp.task('build_generator', gulp.series(['create_generator', 'clean_generator']));


// --------------------------------------------------------------------------
// Compilación de SASS y conversion a CSS del Framework
gulp.task('import_framework_styles', () => {
    return gulp.src('./src/core/framework/styles/core.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('02-framework.css'))
        .pipe(gulp.dest('./dist/'))
});

// Minificación y concatenación de JS del Framework
gulp.task('import_framework_scripts', () => {
    return gulp.src('./src/core/framework/scripts/**/*.js')
        .pipe(concat('02-framework.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'))
});

// Importar el Framework a la carpeta Dist
gulp.task('build_framework', gulp.series(['import_framework_styles', 'import_framework_scripts']))




// -----------------------------------------------------------------
// Importación de los Plugins
gulp.task('import_plugins', () => {
    return gulp.src(plugins)
        .pipe(gulp.dest('./generator/plugins-pack/'))
});

// Generación de la hoja de estilos de los plugins
gulp.task('generate_plugin_styles', () => {
    return gulp.src('./generator/plugins-pack/*.css')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('01-plugins.css'))
        .pipe(gulp.dest('./dist/'))
});

// Generación de los scripts de los plugins
gulp.task('generate_plugin_scripts', () => {
    return gulp.src('./generator/plugins-pack/*.js')
        .pipe(concat('01-plugins.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'))
});

// Generación e importación de los plugins
gulp.task('build_plugins', gulp.series(['import_plugins', 'generate_plugin_styles', 'generate_plugin_scripts']));




//-------------------------------------------------------------------------
// Importación de los componentes seleccionados
gulp.task('import_components', () => {
    return gulp.src(components)
        .pipe(gulp.dest('./generator/components-pack/'))
});

// Generación de la hoja de estilos de los plugins
gulp.task('generate_component_styles', () => {
    return gulp.src('./generator/components-pack/*.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('03-components.css'))
        .pipe(gulp.dest('./dist/'))
});

// Generación de los scripts de los plugins
gulp.task('generate_component_scripts', () => {
    return gulp.src('./generator/components-pack/*.js')
        .pipe(concat('03-components.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'))
});

gulp.task('build_components', gulp.series(['import_components', 'generate_component_styles', 'generate_component_scripts']));




//-----------------------------------------------------------------
// Compilación de Pug a Html
gulp.task('compile_pug', () => {
    return gulp.src('./src/core/pages/**/*.pug')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('./dist/'))
});

// Inyección de CDNs
gulp.task('inject_scripts', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(inject(gulp.src(['./dist/**/*.js', './dist/**/*.css'], { read: false }), { relative: true }))
        .pipe(gulp.dest('./dist'))
});

gulp.task('build_pages', gulp.series(['compile_pug', 'inject_scripts']));




//-----------------------------------------------------------------------
// Manejo de las fuentes web
gulp.task('font', () => {
    return gulp.src('./src/assets/fonts/**')
        .pipe(gulp.dest('./dist/'))
});

// Manejo del favicon
gulp.task('favicon', () => {
    return gulp.src('./src/assets/favicons/**')
        .pipe(gulp.dest('./dist/favicons/'))
});

// Minificado de las imagenes jpg y png
gulp.task('img', () => {
    return gulp.src('./src/assets/images/*')
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
    return gulp.src('./src/assets/images/*')
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
    return gulp.src('./src/assets/videos/**')
        .pipe(gulp.dest('./dist/videos/'))
});

gulp.task('build_assets', gulp.series(['font', 'favicon', 'img', 'img_webp', 'video']));


gulp.task('build', gulp.series(['build_dist', 'build_generator', 'build_framework', 'build_plugins', 'build_components', 'build_pages', 'build_assets']));

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
