// --------------------------------------------------------------------------------------------
// ----- Modulos Gulp -------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const sitemap = require('gulp-sitemap');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const extReplace = require('gulp-ext-replace');
const webp = require('imagemin-webp');
const postcss = require('gulp-postcss')
const log = require('fancy-log');
const critical = require('critical').stream;
const purgecss = require('gulp-purgecss');
const inject = require('gulp-inject');
const htmlmin = require('gulp-htmlmin');
const tailwindcss = require('tailwindcss');
const strip = require('gulp-strip-comments');
const base64 = require('gulp-base64-inline');
const browserSync = require('browser-sync').create();


// --------------------------------------------------------------------------------------------
// ----- Archivos de configuración ------------------------------------------------------------
// --------------------------------------------------------------------------------------------

const sitemapConfig = require('./config/sitemap.config.js');
const projectConfig = require('./config/project.config.js');




// --------------------------------------------------------------------------------------------
// ----- Crear y limpiar los directorios principales ------------------------------------------
// --------------------------------------------------------------------------------------------

// Crear la carpeta dist
gulp.task('create_dist', () => {
    return gulp.src('./src/')
        .pipe(gulp.dest('./dist/'))
});

// Limpiar la carpeta dist
gulp.task('clean_dist', () => {
    return gulp.src('./dist/')
        .pipe(clean())
});


gulp.task('create_folders', gulp.series(['create_dist', 'clean_dist']));


// --------------------------------------------------------------------------------------------
// ---- Importar las hojas de estilos ---------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Importar los estilos de los componentes
gulp.task('import_components_styles', () => {
    return gulp.src('./src/app/components/**/*.css')
        .pipe(postcss([
            tailwindcss,
            autoprefixer,
        ]))
        .pipe(concat('components.css'))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.stream());
});

// Importar los estilos de los plugins
gulp.task('import_plugins_styles', () => {
    return gulp.src('./src/core/plugins/**/*.css')
        .pipe(postcss([
            autoprefixer,
        ]))
        .pipe(concat('plugins.css'))
        .pipe(gulp.dest('./dist/css/'))
});

// Importar los estilos base
gulp.task('import_base_styles', () => {
    return gulp.src('./src/core/design/base.css')
        .pipe(postcss([
            tailwindcss,
            autoprefixer,
        ]))
        .pipe(concat('base.css'))
        .pipe(gulp.dest('./dist/css/'))
});

// Importar los estilos del framework
gulp.task('import_framework_styles', () => {
    return gulp.src('./src/core/design/framework.css')
        .pipe(postcss([
            tailwindcss,
            autoprefixer,
        ]))
        .pipe(concat('framework.css'))
        .pipe(gulp.dest('./dist/css/'))
});

gulp.task('import_styles', gulp.series(['import_components_styles', 'import_plugins_styles', 'import_base_styles', 'import_framework_styles']))


// --------------------------------------------------------------------------------------------
// ---- Importar las hojas de scripts  --------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Importar los scripts de los plugins
gulp.task('import_plugins_scripts', () => {
    return gulp.src('./src/core/plugins/**/*.js')
        .pipe(concat('plugins.js'))
        .pipe(gulp.dest('./dist/js/'))
});

// Importar los scripts de los componentes
gulp.task('import_components_scripts', () => {
    return gulp.src('./src/app/components/**/*.js')
        .pipe(concat('components.js'))
        .pipe(gulp.dest('./dist/js/'))
        .pipe(browserSync.stream());
});

gulp.task('import_scripts', gulp.series(['import_plugins_scripts', 'import_components_scripts']))



// --------------------------------------------------------------------------------------------
// ---- Creacion de las paginas html ----------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Compilación de Pug a Html
gulp.task('compile_pug', () => {
    return gulp.src('./src/app/pages/**/*.pug')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream());
});


// Inyección de CDNs
gulp.task('inject_cdns', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(inject(gulp.src(['./dist/**/*.js', './dist/**/*.css'], { read: false }), { relative: true }))
        .pipe(gulp.dest('./dist'))
});

gulp.task('import_pages', gulp.series(['compile_pug', 'inject_cdns']));


// --------------------------------------------------------------------------------------------
// ---- Importacion de los recursos -----------------------------------------------------------
// --------------------------------------------------------------------------------------------


// Manejo de las fuentes web
gulp.task('import_font', () => {
    return gulp.src('./src/assets/fonts/*')
        .pipe(gulp.dest('./dist/'))
});

// Limpiar las fuentes - Browsersync
gulp.task('clean_font', () => {
    return gulp.src('./dist/**/*.{ttf,woff,woff2}')
        .pipe(clean())
});

// Manejo del favicon
gulp.task('import_favicon', () => {
    return gulp.src('./src/assets/images/favicons/**')
        .pipe(gulp.dest('./dist/favicons/'))
});

// Limpiar los favicons - Browsersync
gulp.task('clean_favicon', () => {
    return gulp.src('./dist/favicons/*')
        .pipe(clean())
});

// Minificado de las imagenes jpg y png
gulp.task('import_images', () => {
    return gulp.src(['./src/assets/images/x1/*.{png,jpg,jpeg,svg}', './src/assets/images/x2/*.{png,jpg,jpeg,svg}', './src/assets/images/sprites/**/*.{png,jpg,jpeg,svg}'])
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

// Limpiar las imagenes - Browsersync
gulp.task('clean_images', () => {
    return gulp.src('./dist/images/*')
        .pipe(clean())
});

// Conversión de imagenes webp
gulp.task('convert_images_webp', () => {
    return gulp.src(['./src/assets/images/x1/*.{png,jpg,jpeg,svg}', './src/assets/images/x2/*.{png,jpg,jpeg,svg}'])
        .pipe(imagemin([
            webp({ quality: 100 })
        ]))
        .pipe(extReplace('.webp'))
        .pipe(gulp.dest('./dist/images/'))
})

// Manejo de los Videos locales
gulp.task('import_video', () => {
    return gulp.src('./src/assets/videos/**')
        .pipe(gulp.dest('./dist/videos/'))
});

// Limpiar los videos - Browsersync
gulp.task('clean_video', () => {
    return gulp.src('./dist/videos/*')
        .pipe(clean())
});

gulp.task('import_assets', gulp.series(['import_font', 'import_favicon', 'import_images', 'convert_images_webp', 'import_video']));

gulp.task('base64_css', () => {
    return gulp.src('./dist/css/components.css')
        .pipe(base64())
        .pipe(gulp.dest('./dist/css/'))
});

gulp.task('base64_html', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(base64())
        .pipe(gulp.dest('./dist/'));
});

// Creación de sitemap
gulp.task('create_sitemap', () => {
    return gulp.src(sitemapConfig.pages)
        .pipe(sitemap({
            fileName: sitemapConfig.fileName,
            siteUrl: sitemapConfig.siteUrl,
            changefreq: sitemapConfig.changefreq,
            priority: sitemapConfig.priority,
            images: sitemapConfig.images
        }))
        .pipe(gulp.dest('./dist/'));
});

// Importar el archivo htaccess
gulp.task('import_htaccess', () => {
    return gulp.src('./src/core/server/.htaccess')
        .pipe(gulp.dest('./dist/'))
});


// --------------------------------------------------------------------------------------------
// ---- Servidor con Browsersync -----------------------------------------------------------
// --------------------------------------------------------------------------------------------


gulp.task('server', () => {

    browserSync.init({
        server: './dist/'
    });

    gulp.watch('./src/app/components/**/*.css', gulp.series(['import_components_styles', 'base64_css']));
    gulp.watch('./src/app/components/**/*.js', gulp.series(['import_components_scripts']));
    gulp.watch('./src/app/**/*.pug', gulp.series(['compile_pug', 'base64_html', 'inject_cdns']));
    gulp.watch('./src/assets/fonts/*', gulp.series(['clean_font', 'import_font']));
    gulp.watch('./src/core/server/.htaccess', gulp.series(['import_htaccess']));
    gulp.watch('./src/assets/images/favicons/*', gulp.series(['clean_favicon','import_favicon']));
    gulp.watch('./src/assets/images/**/*.{jpg,jpeg,png,svg}', gulp.series(['clean_images', 'import_images', 'convert_images_webp']));
    gulp.watch('./src/assets/videos/**/*.{mp4,webp}', gulp.series(['clean_video', 'import_video']));

});



// --------------------------------------------------------------------------------------------
// ----- Configuración para Producción --------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Crear el directorio generator
gulp.task('create_generator', () => {
    return gulp.src('./src/')
        .pipe(gulp.dest('./src/core/generator/'))
});

// Limpiar la carpeta generator
gulp.task('clean_generator', () => {
    return gulp.src('./src/core/generator/*')
        .pipe(clean())
});

// Importar las hojas principales
gulp.task('prepare_assets', () => {
    return gulp.src(['./dist/css/*', './dist/js/*'])
        .pipe(gulp.dest('./src/core/generator/assets/'))
});

// Eliminar las carpetas css y js
gulp.task('delete_sheets', () => {
    return gulp.src(['./dist/css/', './dist/js/'])
        .pipe(clean())
});

// Realizar la purga de los estilos del framework
gulp.task('prepare_framework', () => {
    return gulp.src('./src/core/generator/assets/framework.css')
        .pipe(concat('framework_purge.css'))
        .pipe(purgecss({
            content: ['./dist/**/*.html']
        }))
        .pipe(gulp.dest('./src/core/generator/bundle/'));
});

// Importar el resto de las hojas de estilos
gulp.task('prepare_styles', () => {
    return gulp.src(['./src/core/generator/assets/*.css', '!./src/core/generator/assets/framework.css'])
        .pipe(concat('all_styles.css'))
        .pipe(gulp.dest('./src/core/generator/bundle/'));
});

// Generación de la hoja de estilos maestra
gulp.task('generate_master_stylesheet', () => {
    return gulp.src(['./src/core/generator/bundle/all_styles.css', './src/core/generator/bundle/framework_purge.css'])
        .pipe(concat(projectConfig.cssFilename))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist/'));
});

// Generación de la hoja de scripts maestra
gulp.task('generate_master_scripts', () => {
    return gulp.src('./src/core/generator/assets/*.js')
        .pipe(concat(projectConfig.jsFilename))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'))
});

// Inyección de los archivos maestros
gulp.task('inject_master_files', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(inject(gulp.src(['./dist/**/*.js', './dist/**/*.css'], { read: false }), { relative: true }))
        .pipe(gulp.dest('./dist/'))
});

// Generación de CSS Critico
gulp.task('generate_critical', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(critical({
            base: 'dist/',
            inline: true,
            css: [
                `dist/${projectConfig.cssFilename}`
            ]
        }))
        .pipe(gulp.dest('./dist/'));
});

// Minificación de los archivos html
gulp.task('minify_html', () => {
    return gulp.src('./dist/**/*.html')
        .pipe(strip({ ignore: /url\([\w\s:\/=\-\+;,]*\)/g }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./dist/'));
});


// --------------------------------------------------------------------------------------------
// ----- Tareas principales  ------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

gulp.task('dev', gulp.series(['create_folders', 'import_styles', 'import_scripts', 'import_pages', 'import_assets', 'create_sitemap', 'import_htaccess', 'base64_css', 'base64_html']));
gulp.task('build', gulp.series(['create_generator', 'clean_generator', 'prepare_assets', 'delete_sheets', 'prepare_framework', 'prepare_styles', 'generate_master_stylesheet', 'generate_master_scripts', 'inject_master_files', 'generate_critical', 'minify_html']))