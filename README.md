# Landstorm Developer System

Es un sistema gratuito para desarrolladores web que genera un entorno de desarrollo específicamente para sitios web estáticos construidos a partir de componentes en pug, librerías javascript y el framework css nativo de landstorm.

Esta construido con Gulp mediante tareas para realizar la construcción del sitio en desarrollo y en producción.


## Instalación de Gulp y dependencias

```bash
npm install --save-dev gulp gulp-cli gulp-watch gulp-inject gulp-concat gulp-clean gulp-ext-replace gulp-htmlmin gulp-pug gulp-sass gulp-clean-css gulp-purgecss gulp-autoprefixer gulp-uglify gulp-imagemin gulp-sitemap gulp-gh-pages critical node-sass browser-sync imagemin-webp
```

## Subir el proyecto a producción en Github Pages
```bash
git subtree push --prefix dist origin gh-pages
```

## Lista de comandos
### gulp dev
Genera un directorio con todos los archivos procesados de la carpeta src para inicializar un entorno de desarrollo.

### gulp build
Genera un directorio con todos los archivos minificados y listos para ser desplegados en producción.

### gulp server
Habilita un servidor con browsersync para trabajar en tiempo real con el desarrollo del sitio web.