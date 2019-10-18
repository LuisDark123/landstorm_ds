// --------------------------------------------------------------------------------------------
// ----- Configuración del Usuario ------------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Folders 
const srcFolder = 'src';
const devFolder = 'review';
const distFolder = 'public';
const coreFolder = 'core';
const pluginsFolder = 'plugins';
const componentsFolder = 'components';
const generatorFolder = 'generator';
const frameworkFolder = 'framework';
const frameworkStylesFolder = 'styles';
const frameworkScriptsFolder = 'scripts';
const frameworkStylesCore = 'core.scss';
const pagesFolder = 'pages';
const fontsFolder = 'fonts';
const faviconsFolder = 'favicons';
const imagesFolder = 'images';
const videosFolder = 'videos';
const zipFolder = 'packages';


// Configuración del nombre de los archivos CSS y JS generados por el Framework Landstorm
const jsFilename = 'landstorm-cdn-script.js'; // Nombre del archivo maestro Javascript
const cssFilename = 'landstorm-cdn-stylesheet.css'; // Nombre del archivo maestro CSS
const zipFilename = 'cpanel.zip'

// Configuración de los Plugins que se utilizaran en el proyecto
const pluginsRute = `./${srcFolder}/${coreFolder}/${pluginsFolder}/`;
const pluginsExtension = `/*.{js,css}`;

const plugins = [
    `${pluginsRute}blazy${pluginsExtension}`,
    `${pluginsRute}plyr${pluginsExtension}`,
];

// Configuración de los Componentes que se utilizaran en el proyecto
const componentsRute = `./${srcFolder}/${coreFolder}/${componentsFolder}/`;
const componentsExtension = `/*.{js,scss}`;

const components = [
    `${componentsRute}videoplayers/videoplayer_vanilla${componentsExtension}`,
];

// Configuración del Sitemap
const sitemapUrl = 'https://landstorm.dev';
const sitemapFrequence = 'monthly'; // 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
const sitemapPriority = '1.0'; // 0.0 to 1.0


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


// Crear el directorio review
gulp.task('create_review', () => {
    return gulp.src(`./${srcFolder}/`)
        .pipe(gulp.dest(`./${devFolder}/`))
});

// Limpiar la carpeta review
gulp.task('clean_review', () => {
    return gulp.src(`./${devFolder}/*`)
        .pipe(clean())
});

gulp.task('setup_review', gulp.series(['create_review', 'clean_review']));

// Crear el directorio generator
gulp.task('create_generator', () => {
    return gulp.src(`./${srcFolder}/`)
        .pipe(gulp.dest(`./${generatorFolder}/`))
});

// Limpiar la carpeta generator
gulp.task('clean_generator', () => {
    return gulp.src(`./${generatorFolder}/*`)
        .pipe(clean())
});

gulp.task('setup_generator', gulp.series(['create_generator', 'clean_generator']));


// --------------------------------------------------------------------------
// Compilación de SASS y conversion a CSS del Framework
gulp.task('import_framework_styles', () => {
    return gulp.src(`./${srcFolder}/${coreFolder}/${frameworkFolder}/${frameworkStylesFolder}/${frameworkStylesCore}`)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('01-framework.css'))
        .pipe(gulp.dest(`./${devFolder}/`))
});

// Minificación y concatenación de JS del Framework
gulp.task('import_framework_scripts', () => {
    return gulp.src(`./${srcFolder}/${coreFolder}/${frameworkFolder}/${frameworkScriptsFolder}/**/*.js`)
        .pipe(concat('01-framework.js'))
        .pipe(uglify())
        .pipe(gulp.dest(`./${devFolder}/`))
});

// Importar el Framework a la carpeta review
gulp.task('setup_framework', gulp.series(['import_framework_styles', 'import_framework_scripts']))




// -----------------------------------------------------------------
// Importación de los Plugins
gulp.task('import_plugins', () => {
    return gulp.src(plugins)
        .pipe(gulp.dest(`./${generatorFolder}/plugins-pack/`))
});

// Generación de la hoja de estilos de los plugins
gulp.task('generate_plugin_styles', () => {
    return gulp.src(`./${generatorFolder}/plugins-pack/*.css`)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('03-plugins.css'))
        .pipe(gulp.dest(`./${devFolder}/`))
});

// Generación de los scripts de los plugins
gulp.task('generate_plugin_scripts', () => {
    return gulp.src(`./${generatorFolder}/plugins-pack/*.js`)
        .pipe(concat('03-plugins.js'))
        .pipe(uglify())
        .pipe(gulp.dest(`./${devFolder}/`))
});

// Generación e importación de los plugins
gulp.task('setup_plugins', gulp.series(['import_plugins', 'generate_plugin_styles', 'generate_plugin_scripts']));




//-------------------------------------------------------------------------
// Importación de los componentes seleccionados
gulp.task('import_components', () => {
    return gulp.src(components)
        .pipe(gulp.dest(`./${generatorFolder}/components-pack/`))
});

// Generación de la hoja de estilos de los plugins
gulp.task('generate_component_styles', () => {
    return gulp.src(`./${generatorFolder}/components-pack/*.scss`)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('02-components.css'))
        .pipe(gulp.dest(`./${devFolder}/`))
});

// Generación de los scripts de los plugins
gulp.task('generate_component_scripts', () => {
    return gulp.src(`./${generatorFolder}/components-pack/*.js`)
        .pipe(concat('02-components.js'))
        .pipe(uglify())
        .pipe(gulp.dest(`./${devFolder}/`))
});

gulp.task('setup_components', gulp.series(['import_components', 'generate_component_styles', 'generate_component_scripts']));




//-----------------------------------------------------------------
// Compilación de Pug a Html
gulp.task('compile_pug', () => {
    return gulp.src(`./${srcFolder}/${coreFolder}/${pagesFolder}/**/*.pug`)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(`./${devFolder}/`))
});

// Inyección de CDNs
gulp.task('inject_scripts', () => {
    return gulp.src(`./${devFolder}/**/*.html`)
        .pipe(inject(gulp.src([`./${devFolder}/**/*.js`, `./${devFolder}/**/*.css`], { read: false }), { relative: true }))
        .pipe(gulp.dest(`./${devFolder}`))
});

gulp.task('setup_pages', gulp.series(['compile_pug', 'inject_scripts']));




//-----------------------------------------------------------------------
// Manejo de las fuentes web
gulp.task('font', () => {
    return gulp.src(`./${srcFolder}/${fontsFolder}/**`)
        .pipe(gulp.dest(`./${devFolder}/`))
});

// Manejo del favicon
gulp.task('favicon', () => {
    return gulp.src(`./${srcFolder}/${faviconsFolder}/**`)
        .pipe(gulp.dest(`./${devFolder}/${faviconsFolder}/`))
});

// Minificado de las imagenes jpg y png
gulp.task('img', () => {
    return gulp.src([`./${srcFolder}/${imagesFolder}/x1/*.{png,jpg,jpeg}`, `./${srcFolder}/${imagesFolder}/x2/*.{png,jpg,jpeg}`])
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
        .pipe(gulp.dest(`./${devFolder}/${imagesFolder}/`))
});

// Conversión de imagenes webp
gulp.task('img_webp', () => {
    return gulp.src([`./${srcFolder}/${imagesFolder}/x1/*.{png,jpg,jpeg}`, `./${srcFolder}/${imagesFolder}/x2/*.{png,jpg,jpeg}`])
        .pipe(imagemin([
            webp({ quality: 100 })
        ]))
        .pipe(extReplace('.webp'))
        .pipe(gulp.dest(`./${devFolder}/${imagesFolder}/`))
})

// Manejo de los Videos locales
gulp.task('video', () => {
    return gulp.src(`./${srcFolder}/${videosFolder}/**`)
        .pipe(gulp.dest(`./${devFolder}/${videosFolder}/`))
});

gulp.task('setup_assets', gulp.series(['font', 'favicon', 'img', 'img_webp', 'video']));


gulp.task('start', gulp.series(['setup_review', 'setup_generator', 'setup_framework', 'setup_components', 'setup_plugins', 'setup_pages', 'setup_assets']));





// --------------------------------------------------------------------------------------------
// ----- Configuración para Producción --------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Crear el directorio public
gulp.task('create_public', () => {
    return gulp.src(`./${srcFolder}/`)
        .pipe(gulp.dest(`./${distFolder}/`))
});

// Limpiar la carpeta public
gulp.task('clean_public', () => {
    return gulp.src(`./${distFolder}/*`)
        .pipe(clean());
});

// Generación de la carpeta public
gulp.task('build_public', gulp.series(['create_public', 'clean_public']));


// Crear el directorio bundle en generator
gulp.task('create_bundle', () => {
    return gulp.src(`./${srcFolder}/`)
        .pipe(gulp.dest(`./${generatorFolder}/bundle/`))
});

// Limpiar la carpeta public
gulp.task('clean_bundle', () => {
    return gulp.src(`./${generatorFolder}/bundle/*`)
        .pipe(clean());
});

// Generación de la carpeta public
gulp.task('build_bundle', gulp.series(['create_bundle', 'clean_bundle']));

// ---------------------------------------------------------------------------
// Importar los archivos html
gulp.task('prepare_html', () => {
  return gulp.src(`./${devFolder}/**/*.html`)
    .pipe(gulp.dest(`./${distFolder}/`));
});

// Realizar la purga de los estilos del framework
gulp.task('prepare_framework', () => {
    return gulp.src(`./${devFolder}/01-framework.css`)
        .pipe(concat('framework_purge.css'))
        .pipe(autoprefixer())
        .pipe(purgecss({
            content: [`./${devFolder}/**/*.html`]
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./${generatorFolder}/bundle/`));
});

// Importar los scripts del framework, los componentes y los plugins
gulp.task('prepare_js_files', () => {
    return gulp.src(`./${devFolder}/*.js`)
        .pipe(gulp.dest(`./${generatorFolder}/bundle/`))
});

// Importar los estilos de los componentes y los plugins
gulp.task('prepare_addons', () => {
    return gulp.src([`./${devFolder}/02-components.css`, `./${devFolder}/03-plugins.css`])
        .pipe(concat('addons_styles.css'))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./${generatorFolder}/bundle/`));
});

// Generación de la hoja de estilos maestra
gulp.task('generate_master_stylesheet', () => {
    return gulp.src([`./${generatorFolder}/bundle/framework_purge.css`, `./${generatorFolder}/bundle/addons_styles.css`])
        .pipe(concat(cssFilename))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest(`./${distFolder}/`));
});

// Generación de la hoja de scripts maestra
gulp.task('generate_master_scripts', () => {
    return gulp.src(`./${generatorFolder}/bundle/*.js`)
        .pipe(concat(jsFilename))
        .pipe(uglify())
        .pipe(gulp.dest(`./${distFolder}/`))
});

// Inyección de los archivos maestros
gulp.task('inject_master_files', () => {
    return gulp.src(`./${distFolder}/**/*.html`)
        .pipe(inject(gulp.src([`./${distFolder}/**/*.js`, `./${distFolder}/**/*.css`], { read: false }), { relative: true }))
        .pipe(gulp.dest(`./${distFolder}/`))
});

// Generación de CSS Critico
gulp.task('generate_critical', () => {
    return gulp
        .src(`./${distFolder}/**/*.html`)
        .pipe(critical({
            base: `${distFolder}/`,
            inline: true,
            css: [
                `${distFolder}/landstorm-cdn-stylesheet.css`
            ]
        }))
        .pipe(gulp.dest(`./${distFolder}/`));
});

// Minificación de los archivos html
gulp.task('minify_html', () => {
    return gulp.src(`./${distFolder}/**/*.html`)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(`./${distFolder}/`));
});

gulp.task('build_web', gulp.series(['prepare_html', 'prepare_framework', 'prepare_js_files', 'prepare_addons', 'generate_master_stylesheet', 'generate_master_scripts', 'inject_master_files', 'generate_critical', 'minify_html']))

//-----------------------------------------------------------------------
// Manejo de las fuentes web
gulp.task('prepare_fonts', () => {
    return gulp.src(`./${devFolder}/*.{ttf,woff,woff2}`)
        .pipe(gulp.dest(`./${distFolder}/`))
});

// Manejo del favicon
gulp.task('prepare_favicon', () => {
    return gulp.src(`./${devFolder}/${faviconsFolder}/**`)
        .pipe(gulp.dest(`./${distFolder}/${faviconsFolder}/`))
});

gulp.task('prepare_images', () => {
    return gulp.src(`./${devFolder}/${imagesFolder}/**`)
        .pipe(gulp.dest(`./${distFolder}/${imagesFolder}/`))
});

gulp.task('prepare_video', () => {
    return gulp.src(`./${devFolder}/${videosFolder}/**`)
        .pipe(gulp.dest(`./${distFolder}/${videosFolder}/`))
});

gulp.task('build_assets', gulp.series(['prepare_fonts', 'prepare_favicon', 'prepare_images', 'prepare_video']))

// Creación de sitemap
gulp.task('sitemap', () => {
    return gulp.src(`./${distFolder}/**/*.html`)
        .pipe(sitemap({
            siteUrl: sitemapUrl,
            changefreq: sitemapFrequence,
            priority: sitemapPriority,
            images: true
        }))
        .pipe(gulp.dest(`./${distFolder}/`));
});

// Crear un zip
gulp.task('zip', () => {
    return gulp.src(`./${distFolder}/**`)
        .pipe(zip(`${zipFilename}`))
        .pipe(gulp.dest(`./${zipFolder}/`))
})

// Empaquetar todo para subirlo a producción :)
gulp.task('build', gulp.series(['build_public', 'build_bundle', 'build_web', 'build_assets', 'sitemap', 'zip',]));

// Configuración del Watch
gulp.task('watch', () => {
    gulp.watch(['./src/pages/**/*.pug', './src/javascripts/**/*.js', './src/sass/**/*.scss'], gulp.series(['inject_scripts']));
});