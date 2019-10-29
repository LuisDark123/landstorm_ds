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
const critical = require('critical').stream;
const purgecss = require('gulp-purgecss');
const inject = require('gulp-inject');
const htmlmin = require('gulp-htmlmin');
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
const componentsExtension = `/*.{js,scss}`;

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
// ----- Gulp Tasks ---------------------------------------------------------------------------
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

gulp.task('create_basic_folders', gulp.series(['create_dist', 'clean_dist', 'create_generator', 'clean_generator']));




// Compilación de SASS y conversion a CSS del Framework
gulp.task('import_framework_styles', () => {
    return gulp.src(`./src/core/framework/styles/*.scss`)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('01-framework.css'))
        .pipe(gulp.dest(`./dist/`))
        .pipe(browserSync.stream());
});

// Minificación y concatenación de JS del Framework
gulp.task('import_framework_scripts', () => {
    return gulp.src(`./src/core/framework/**/*.js`)
        .pipe(concat('01-framework.js'))
        .pipe(gulp.dest(`./dist/`))
        .pipe(browserSync.stream());
});

gulp.task('import_framework', gulp.series(['import_framework_styles', 'import_framework_scripts']))




// Importación de los componentes seleccionados
gulp.task('import_components_assets', () => {
    return gulp.src(components)
        .pipe(gulp.dest(`./src/core/generator/bundle-components/`))
});

// Generación de la hoja de estilos de los componentes
gulp.task('generate_component_styles', () => {
    return gulp.src(`./src/core/generator/bundle-components/*.scss`)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('02-components.css'))
        .pipe(gulp.dest(`./dist/`))
        .pipe(browserSync.stream());
});

// Generación de los scripts de los componentes
gulp.task('generate_component_scripts', () => {
    return gulp.src(`./src/core/generator/bundle-components/*.js`)
        .pipe(concat('02-components.js'))
        .pipe(uglify())
        .pipe(gulp.dest(`./dist/`))
        .pipe(browserSync.stream());
});

gulp.task('import_components', gulp.series(['import_components_assets', 'generate_component_styles', 'generate_component_scripts']));




// Importación de los Plugins
gulp.task('import_plugins_assets', () => {
    return gulp.src(plugins)
        .pipe(gulp.dest(`./src/core/generator/bundle-plugins/`))
});

// Generación de la hoja de estilos de los plugins
gulp.task('generate_plugin_styles', () => {
    return gulp.src(`./src/core/generator/bundle-plugins/*.css`)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('03-plugins.css'))
        .pipe(gulp.dest(`./dist/`))
});

// Generación de los scripts de los plugins
gulp.task('generate_plugin_scripts', () => {
    return gulp.src(`./src/core/generator/bundle-plugins/*.js`)
        .pipe(concat('03-plugins.js'))
        .pipe(uglify())
        .pipe(gulp.dest(`./dist/`))
});

gulp.task('import_plugins', gulp.series(['import_plugins_assets', 'generate_plugin_styles', 'generate_plugin_scripts']));




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


// Servidor con Browsersync
gulp.task('server', () => {

    browserSync.init({
        server: `./dist/`
    });

    gulp.watch(`./src/core/framework/**/*.scss`, gulp.parallel(['import_framework_styles']));
    gulp.watch(`./src/core/framework/**/*.js`, gulp.parallel(['import_framework_scripts']));
    gulp.watch(`./src/app/components/**/*.scss`, gulp.series(['import_components_assets', 'generate_component_styles']));
    gulp.watch(`./src/app/components/**/*.js`, gulp.series(['import_components_assets', 'generate_component_scripts']));
    gulp.watch(`./src/app/**/*.pug`, gulp.parallel(['import_pages']));
});


gulp.task('dev', gulp.series(['create_basic_folders', 'import_framework', 'import_components', 'import_plugins', 'import_pages', 'import_pages', 'import_assets']));





// --------------------------------------------------------------------------------------------
// ----- Configuración para Producción --------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Crear la carpeta deploy
gulp.task('create_deploy', () => {
    return gulp.src(`./src/`)
        .pipe(gulp.dest(`./src/core/generator/deploy/`))
});

// Limpiar la carpeta deploy
gulp.task('clean_deploy', () => {
    return gulp.src(`./src/core/generator//deploy/*`)
        .pipe(clean())
});

// Importar los archivos html
gulp.task('prepare_html', () => {
    return gulp.src(`./dist/**/*.html`)
        .pipe(gulp.dest(`./src/core/generator/deploy/`));
});

// Realizar la purga de los estilos del framework
gulp.task('prepare_framework', () => {
    return gulp.src(`./dist/01-framework.css`)
        .pipe(concat('framework_purge.css'))
        .pipe(autoprefixer())
        .pipe(purgecss({
            content: [`./dist/**/*.html`]
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./src/core/generator/deploy/`));
});

// Importar los scripts del framework, los componentes y los plugins
gulp.task('prepare_js_files', () => {
    return gulp.src(`./dist/**/*.js`)
        .pipe(gulp.dest(`./src/core/generator/deploy/`))
});

// Importar los estilos de los componentes y los plugins
gulp.task('prepare_addons', () => {
    return gulp.src([`./dist/*.css`, `!./dist/01-framework.css`])
        .pipe(concat('addons_styles.css'))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./src/core/generator/deploy/`));
});

// Generación de la hoja de estilos maestra
gulp.task('generate_master_stylesheet', () => {
    return gulp.src([`./src/core/generator/deploy/framework_purge.css`, `./src/core/generator/deploy/addons_styles.css`])
        .pipe(concat(cssFilename))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./dist/`));
});

// Generación de la hoja de scripts maestra
gulp.task('generate_master_scripts', () => {
    return gulp.src(`./src/core/generator/deploy/*.js`)
        .pipe(concat(jsFilename))
        .pipe(uglify())
        .pipe(gulp.dest(`./dist/`))
});

// Generación de las paginas maestras
gulp.task('generate_master_html', () => {
    return gulp.src(`./src/core/generator/deploy/**/*.html`)
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

gulp.task('build', gulp.series(['create_deploy', 'clean_deploy', 'prepare_html', 'prepare_framework', 'prepare_js_files', 'prepare_addons', 'clean_dist', 'import_assets', 'generate_master_stylesheet', 'generate_master_scripts', 'generate_master_html', 'inject_master_files', 'minify_html', 'minify_html', 'create_sitemap']));