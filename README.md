# Landstorm Developer System

Es un sistema gratuito para desarrolladores web que genera un entorno de desarrollo específicamente para sitios web estáticos construidos a partir de componentes en pug, librerías javascript y el framework css nativo de landstorm.

Esta construido con Gulp mediante tareas para realizar la construcción del sitio en desarrollo y en producción.


## Instalación de Gulp y dependencias

```bash
npm install -g gulp
npm install --save-dev gulp-cli gulp-watch gulp-inject gulp-concat gulp-clean gulp-ext-replace gulp-zip gulp-htmlmin gulp-pug gulp-sass gulp-clean-css gulp-purgecss gulp-autoprefixer gulp-uglify gulp-imagemin gulp-sitemap critical node-sass browser-sync imagemin-webp
```

## Lista de comandos
### gulp dev
Genera un directorio con todos los archivos procesados de la carpeta src para inicializar un entorno de desarrollo.

### gulp build
Genera un directorio con todos los archivos minificados y listos para ser desplegados en producción.

### gulp server
Habilita un servidor con browsersync para trabajar en tiempo real con el desarrollo del sitio web.