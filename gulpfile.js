// --------------------------------------------------------------------------------------------
// ----- Modulos Gulp -------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const sitemap = require('gulp-sitemap');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const extReplace = require('gulp-ext-replace');
const webp = require('imagemin-webp');
const postcss = require('gulp-postcss')
const critical = require('critical').stream;
const purgecss = require('gulp-purgecss');
const inject = require('gulp-inject');
const htmlmin = require('gulp-htmlmin');
const tailwindcss = require('tailwindcss');
const browserSync = require('browser-sync').create();


// --------------------------------------------------------------------------------------------
// ----- Configuración del Usuario ------------------------------------------------------------
// --------------------------------------------------------------------------------------------


// Configuración de los Plugins que se utilizaran en el proyecto
const pluginsRute = `./src/core/plugins/`;
const pluginsExtension = `/*.{js,css}`;

const plugins = [
    `${pluginsRute}blazy${pluginsExtension}`,
];


// Configuración de los Componentes que se utilizaran en el proyecto
const componentsRute = `./src/app/components/`;
const componentsExtension = `/*.{js,css}`;

const components = [
    `${componentsRute}headers/header_welcome${componentsExtension}`,
];


// Configuración del nombre de los archivos CSS y JS generados por el Framework Landstorm
const jsFilename = 'landstorm-cdn-script.js'; // Nombre del archivo maestro Javascript
const cssFilename = 'landstorm-cdn-stylesheet.css'; // Nombre del archivo maestro CSS


// Configuración del Sitemap
const sitemapUrl = 'https://landstorm.dev';
const sitemapFrequence = 'monthly'; // 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
const sitemapPriority = '1.0'; // 0.0 to 1.0




// --------------------------------------------------------------------------------------------
// ----- Crear y limpiar los directorios principales ------------------------------------------
// --------------------------------------------------------------------------------------------

// Crear la carpeta dist
gulp.task('create_dist', () => {
    return gulp.src(`./src/`)
        .pipe(gulp.dest(`./dist/`))
});

// Limpiar la carpeta dist
gulp.task('clean_dist', () => {
    return gulp.src(`./dist/*`)
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
});

gulp.task('import_scripts', gulp.series(['import_plugins_scripts', 'import_components_scripts']))



// --------------------------------------------------------------------------------------------
// ---- Creacion de las paginas html ----------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Compilación de Pug a Html
gulp.task('compile_pug', () => {
    return gulp.src(`./src/app/pages/**/*.pug`)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(`./dist/`))
        .pipe(browserSync.stream());
});


// Inyección de CDNs
gulp.task('inject_cdns', () => {
    return gulp.src(`./dist/**/*.html`)
        .pipe(inject(gulp.src([`./dist/**/*.js`, `./dist/**/*.css`], { read: false }), { relative: true }))
        .pipe(gulp.dest(`./dist`))
});

gulp.task('import_pages', gulp.series(['compile_pug', 'inject_cdns']));


// --------------------------------------------------------------------------------------------
// ---- Importacion de los recursos -----------------------------------------------------------
// --------------------------------------------------------------------------------------------


// Manejo de las fuentes web
gulp.task('import_font', () => {
    return gulp.src(`./src/assets/fonts/**`)
        .pipe(gulp.dest(`./dist/`))
});

// Manejo del favicon
gulp.task('import_favicon', () => {
    return gulp.src(`./src/assets/images/favicons/**`)
        .pipe(gulp.dest(`./dist/favicons/`))
});

// Minificado de las imagenes jpg y png
gulp.task('import_images', () => {
    return gulp.src([`./src/assets/images/x1/*.{png,jpg,jpeg}`, `./src/assets/images/x2/*.{png,jpg,jpeg}`])
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
        .pipe(gulp.dest(`./dist/images/`))
});

// Conversión de imagenes webp
gulp.task('convert_images_webp', () => {
    return gulp.src([`./src/assets/images/x1/*.{png,jpg,jpeg}`, `./src/assets/images/x2/*.{png,jpg,jpeg}`])
        .pipe(imagemin([
            webp({ quality: 100 })
        ]))
        .pipe(extReplace('.webp'))
        .pipe(gulp.dest(`./dist/images/`))
})

// Manejo de los Videos locales
gulp.task('import_video', () => {
    return gulp.src(`./src/assets/videos/**`)
        .pipe(gulp.dest(`./dist/videos/`))
});

gulp.task('import_assets', gulp.series(['import_font', 'import_favicon', 'import_images', 'convert_images_webp', 'import_video']));



// --------------------------------------------------------------------------------------------
// ---- Servidor con Browsersync -----------------------------------------------------------
// --------------------------------------------------------------------------------------------


gulp.task('server', () => {

    browserSync.init({
        server: `./dist/`
    });

    gulp.watch(`./src/app/components/**/*.css`, gulp.series(['import_component_assets', 'generate_component_styles', 'generate_base_stylesheet']));
    gulp.watch(`./src/app/components/**/*.js`, gulp.series(['import_component_assets', 'generate_component_scripts', 'generate_base_script']));
    gulp.watch(`./src/app/**/*.pug`, gulp.parallel(['import_pages']));

});





// --------------------------------------------------------------------------------------------
// ----- Configuración para Producción --------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Crear el directorio generator
gulp.task('create_generator', () => {
    return gulp.src(`./src/`)
        .pipe(gulp.dest(`./src/core/generator/`))
});

// Limpiar la carpeta generator
gulp.task('clean_generator', () => {
    return gulp.src(`./src/core/generator/*`)
        .pipe(clean())
});

// Importar los archivos html
gulp.task('prepare_html', () => {
    return gulp.src(`./dist/**/*.html`)
        .pipe(gulp.dest(`./src/core/generator/`));
});

// Realizar la purga de los estilos del framework
gulp.task('prepare_framework', () => {
    return gulp.src(`./dist/css/framework.css`)
        .pipe(concat('framework_purge.css'))
        .pipe(purgecss({
            content: [`./dist/**/*.html`]
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./src/core/generator/`));
});

// Importar el resto de las hojas de estilos
gulp.task('prepare_styles', () => {
    return gulp.src([`./dist/css/*.css`, `!./dist/css/framework.css`])
        .pipe(concat('all_styles.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./src/core/generator/`));
});

// Importar todos los scripts de dist
gulp.task('prepare_js_files', () => {
    return gulp.src(`./dist/js/*.js`)
        .pipe(gulp.dest(`./src/core/generator/`))
});

// Generación de la hoja de estilos maestra
gulp.task('generate_master_stylesheet', () => {
    return gulp.src([`./src/core/generator/all_styles.css`, `./src/core/generator/framework_purge.css`])
        .pipe(concat(cssFilename))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./dist/`));
});

// Generación de la hoja de scripts maestra
gulp.task('generate_master_scripts', () => {
    return gulp.src(`./src/core/generator/*.js`)
        .pipe(concat(jsFilename))
        .pipe(uglify())
        .pipe(gulp.dest(`./dist/`))
});

// Generación de las paginas maestras
gulp.task('generate_master_html', () => {
    return gulp.src(`./src/core/generator/**/*.html`)
        .pipe(gulp.dest(`./dist/`));
});

// Inyección de los archivos maestros
gulp.task('inject_master_files', () => {
    return gulp.src(`./dist/**/*.html`)
        .pipe(inject(gulp.src([`./dist/**/*.js`, `./dist/**/*.css`], { read: false }), { relative: true }))
        .pipe(gulp.dest(`./dist/`))
});

// Generación de CSS Critico
gulp.task('generate_critical', () => {
    return gulp
        .src(`./dist/**/*.html`)
        .pipe(critical({
            base: `dist/`,
            inline: true,
            css: [
                `dist/${cssFilename}`
            ]
        }))
        .pipe(gulp.dest(`./dist/`));
});

// Minificación de los archivos html
gulp.task('minify_html', () => {
    return gulp.src(`./dist/**/*.html`)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(`./dist/`));
});

// Creación de sitemap
gulp.task('create_sitemap', () => {
    return gulp.src(`./dist/**/*.html`)
        .pipe(sitemap({
            siteUrl: sitemapUrl,
            changefreq: sitemapFrequence,
            priority: sitemapPriority,
            images: true
        }))
        .pipe(gulp.dest(`./dist/`));
});



// --------------------------------------------------------------------------------------------
// ----- Tareas principales  ------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

gulp.task('dev', gulp.series(['create_folders', 'import_styles', 'import_scripts', 'import_pages', 'import_assets', ]));
gulp.task('build', gulp.series(['create_generator', 'clean_generator', 'prepare_html', 'prepare_framework', 'prepare_js_files', 'prepare_styles', 'clean_dist', 'import_assets', 'generate_master_stylesheet', 'generate_master_scripts', 'generate_master_html', 'inject_master_files', 'minify_html', 'create_sitemap']));