// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');

// Importing all the Gulp-related packages we want to use
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const prettify = require('postcss-prettify')
var replace = require('gulp-replace');


// File paths
const files = { 
    jadePath: './src/*.jade',
    scssPath: './src/*.sass',
    jsPath: './src/*.js',
    assetPath: './assets/**/*.*'
}

// Jade task: compiles *.jade file into *.html
function jadeTask(){    
    return src(files.jadePath)
        .pipe(pug({
            locals: {
                'var': 'local variable'
            },
            pretty: true
        }))
        .pipe(dest('dist')
    );
}

// Sass task: compiles the style.scss file into style.css
function scssTask(){    
    return src(files.scssPath)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass({indentedSyntax: true})) // compile SCSS to CSS
        .pipe(postcss([ autoprefixer(), cssnano(), prettify() ])) // PostCSS plugins
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(dest('dist')
    ); // put final CSS in dist folder
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask(){
    return src([
        files.jsPath
        //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
        ])
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(dest('dist')
    );
}

// Cachebust
function cacheBustTask(){
    var cbString = new Date().getTime();
    return src(['index.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(dest('.'));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask(){
    watch([files.scssPath, files.scssPath],
        {interval: 1000, usePolling: true}, //Makes docker work
        series(
            parallel(scssTask, jadeTask),
            //cacheBustTask
        )
    );    
}

function copyTask(){
    return src(files.assetPath, {base: './assets'})
        .pipe(dest('dist/assets')
    );
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
    parallel(scssTask, jadeTask, copyTask), 
    //cacheBustTask,
    watchTask
);
