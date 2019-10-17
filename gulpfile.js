// --------------------------------------------------------------------------------------------
// ----- Configuración del Usuario ------------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Configuración del Sitemap
const sitemapUrl = 'https://landstorm.dev';
const sitemapFrequence = 'monthly'; // 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
const sitemapPriority = '1.0'; // 0.0 to 1.0


// Configuración del nombre de los archivos CSS y JS generados por el Framework Landstorm
const jsFilename = 'landstorm-cdn-script.js'; // Nombre del archivo maestro Javascript
const cssFilename = 'landstorm-cdn-stylesheet.css'; // Nombre del archivo maestro CSS


// Configuración de los Plugins que se utilizaran en el proyecto
const plugins = [
    './src/core/plugins/blazy/*.{js,css}',
    './src/core/plugins/plyr/*.{js,css}',
];

// Configuración de los Componentes que se utilizaran en el proyecto
const components = [
    './src/core/components/videoplayers/videoplayer_vanilla/*.{js,scss}'
];

// Folders 


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
    return gulp.src('./src/')
        .pipe(gulp.dest('./review/'))
});

// Limpiar la carpeta review
gulp.task('clean_review', () => {
    return gulp.src('./review/*')
        .pipe(clean())
});

gulp.task('setup_review', gulp.series(['create_review', 'clean_review']));

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

gulp.task('setup_generator', gulp.series(['create_generator', 'clean_generator']));


// --------------------------------------------------------------------------
// Compilación de SASS y conversion a CSS del Framework
gulp.task('import_framework_styles', () => {
    return gulp.src('./src/core/framework/styles/core.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('01-framework.css'))
        .pipe(gulp.dest('./review/'))
});

// Minificación y concatenación de JS del Framework
gulp.task('import_framework_scripts', () => {
    return gulp.src('./src/core/framework/scripts/**/*.js')
        .pipe(concat('01-framework.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./review/'))
});

// Importar el Framework a la carpeta review
gulp.task('setup_framework', gulp.series(['import_framework_styles', 'import_framework_scripts']))




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
        .pipe(concat('03-plugins.css'))
        .pipe(gulp.dest('./review/'))
});

// Generación de los scripts de los plugins
gulp.task('generate_plugin_scripts', () => {
    return gulp.src('./generator/plugins-pack/*.js')
        .pipe(concat('03-plugins.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./review/'))
});

// Generación e importación de los plugins
gulp.task('setup_plugins', gulp.series(['import_plugins', 'generate_plugin_styles', 'generate_plugin_scripts']));




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
        .pipe(concat('02-components.css'))
        .pipe(gulp.dest('./review/'))
});

// Generación de los scripts de los plugins
gulp.task('generate_component_scripts', () => {
    return gulp.src('./generator/components-pack/*.js')
        .pipe(concat('02-components.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./review/'))
});

gulp.task('setup_components', gulp.series(['import_components', 'generate_component_styles', 'generate_component_scripts']));




//-----------------------------------------------------------------
// Compilación de Pug a Html
gulp.task('compile_pug', () => {
    return gulp.src('./src/core/pages/**/*.pug')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('./review/'))
});

// Inyección de CDNs
gulp.task('inject_scripts', () => {
    return gulp.src('./review/**/*.html')
        .pipe(inject(gulp.src(['./review/**/*.js', './review/**/*.css'], { read: false }), { relative: true }))
        .pipe(gulp.dest('./review'))
});

gulp.task('setup_pages', gulp.series(['compile_pug', 'inject_scripts']));




//-----------------------------------------------------------------------
// Manejo de las fuentes web
gulp.task('font', () => {
    return gulp.src('./src/fonts/**')
        .pipe(gulp.dest('./review/'))
});

// Manejo del favicon
gulp.task('favicon', () => {
    return gulp.src('./src/favicons/**')
        .pipe(gulp.dest('./review/favicons/'))
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
        .pipe(gulp.dest('./review/images/'))
});

// Conversión de imagenes webp
gulp.task('img_webp', () => {
    return gulp.src(['./src/images/**/*.{png,jpg,jpeg}'])
        .pipe(imagemin([
            webp({ quality: 100 })
        ]))
        .pipe(extReplace('.webp'))
        .pipe(gulp.dest('./review/images/'))
})

// Manejo de los Videos locales
gulp.task('video', () => {
    return gulp.src('./src/videos/**')
        .pipe(gulp.dest('./review/videos/'))
});

gulp.task('setup_assets', gulp.series(['font', 'favicon', 'img', 'img_webp', 'video']));


gulp.task('start', gulp.series(['setup_review', 'setup_generator', 'setup_framework', 'setup_components', 'setup_plugins', 'setup_pages', 'setup_assets']));





// --------------------------------------------------------------------------------------------
// ----- Configuración para Producción --------------------------------------------------------
// --------------------------------------------------------------------------------------------

// Crear el directorio public
gulp.task('create_public', () => {
    return gulp.src('./src/')
        .pipe(gulp.dest('./public/'))
});

// Limpiar la carpeta public
gulp.task('clean_public', () => {
    return gulp.src('./public/*')
        .pipe(clean());
});

// Generación de la carpeta public
gulp.task('build_public', gulp.series(['create_public', 'clean_public']));


// Crear el directorio bundle en generator
gulp.task('create_bundle', () => {
    return gulp.src('./src/')
        .pipe(gulp.dest('./generator/bundle/'))
});

// Limpiar la carpeta public
gulp.task('clean_bundle', () => {
    return gulp.src('./generator/bundle/*')
        .pipe(clean());
});

// Generación de la carpeta public
gulp.task('build_bundle', gulp.series(['create_bundle', 'clean_bundle']));

// ---------------------------------------------------------------------------
// Importar los archivos html
gulp.task('prepare_html', () => {
  return gulp.src('./review/**/*.html')
    .pipe(gulp.dest('./public/'));
});

// Realizar la purga de los estilos del framework
gulp.task('prepare_framework', () => {
    return gulp.src('./review/01-framework.css')
        .pipe(concat('framework_purge.css'))
        .pipe(autoprefixer())
        .pipe(purgecss({
            content: ['./review/**/*.html']
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./generator/bundle/'));
});

// Importar los scripts del framework, los componentes y los plugins
gulp.task('prepare_js_files', () => {
    return gulp.src('./review/*.js')
        .pipe(gulp.dest('./generator/bundle/'))
});

// Importar los estilos de los componentes y los plugins
gulp.task('prepare_addons', () => {
    return gulp.src(['./review/02-components.css', './review/03-plugins.css'])
        .pipe(concat('addons_styles.css'))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./generator/bundle/'));
});

// Generación de la hoja de estilos maestra
gulp.task('generate_master_stylesheet', () => {
    return gulp.src(['./generator/bundle/framework_purge.css', './generator/bundle/addons_styles.css'])
        .pipe(concat(cssFilename))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./public/'));
});

// Generación de la hoja de scripts maestra
gulp.task('generate_master_scripts', () => {
    return gulp.src('./generator/bundle/*.js')
        .pipe(concat(jsFilename))
        .pipe(uglify())
        .pipe(gulp.dest('./public/'))
});

// Inyección de los archivos maestros
gulp.task('inject_master_files', () => {
    return gulp.src('./public/**/*.html')
        .pipe(inject(gulp.src(['./public/**/*.js', './public/**/*.css'], { read: false }), { relative: true }))
        .pipe(gulp.dest('./public/'))
});

// Generación de CSS Critico
gulp.task('generate_critical', () => {
    return gulp
        .src('./public/**/*.html')
        .pipe(critical({
            base: 'public/',
            inline: true,
            css: [
                'public/landstorm-cdn-stylesheet.css'
            ]
        }))
        .pipe(gulp.dest('./public/'));
});

// Minificación de los archivos html
gulp.task('minify_html', () => {
    return gulp.src('./public/**/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./public/'));
});

gulp.task('build_web', gulp.series(['prepare_html', 'prepare_framework', 'prepare_js_files', 'prepare_addons', 'generate_master_stylesheet', 'generate_master_scripts', 'inject_master_files', 'generate_critical', 'minify_html']))

//-----------------------------------------------------------------------
// Manejo de las fuentes web
gulp.task('prepare_fonts', () => {
    return gulp.src('./review/*.{ttf,woff,woff2}')
        .pipe(gulp.dest('./public/'))
});

// Manejo del favicon
gulp.task('prepare_favicon', () => {
    return gulp.src('./review/favicons/**')
        .pipe(gulp.dest('./public/favicons/'))
});

gulp.task('prepare_images', () => {
    return gulp.src('./review/images/**')
        .pipe(gulp.dest('./public/images/'))
});

gulp.task('prepare_video', () => {
    return gulp.src('./review/videos/**')
        .pipe(gulp.dest('./public/videos/'))
});

gulp.task('build_assets', gulp.series(['prepare_fonts', 'prepare_favicon', 'prepare_images', 'prepare_video']))

// Creación de sitemap
gulp.task('sitemap', () => {
    return gulp.src('./public/**/*.html')
        .pipe(sitemap({
            siteUrl: sitemapUrl,
            changefreq: sitemapFrequence,
            priority: sitemapPriority,
            images: true
        }))
        .pipe(gulp.dest('./public/'));
});

// Crear un zip
gulp.task('zip', () => {
    return gulp.src('./public/**')
        .pipe(zip('cpanel.zip'))
        .pipe(gulp.dest('./packages/'))
})

// Empaquetar todo para subirlo a producción :)
gulp.task('build', gulp.series(['build_public', 'build_bundle', 'build_web', 'build_assets', 'sitemap', 'zip',]));

// Configuración del Watch
gulp.task('watch', () => {
    gulp.watch(['./src/pages/**/*.pug', './src/javascripts/**/*.js', './src/sass/**/*.scss'], gulp.series(['inject_scripts']));
});