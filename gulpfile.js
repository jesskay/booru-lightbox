const gulp = require("gulp");
const mergeJson = require("gulp-merge-json");
const template = require("gulp-template");
const concat = require("gulp-concat")
const sass = require("gulp-sass");
const clean = require("gulp-clean");
const fs = require("fs");
const merge = require("merge2");
const pkg = require('./package.json');

const transforms = require('./lib/transforms');

gulp.task('build:meta', function() {
  return gulp.src("meta/**/*.json")
    .pipe(mergeJson({ "fileName": "booru-lightbox.meta.js", "concatArrays": true }))
    .pipe(transforms.userscript())
    .pipe(template({ pkg: pkg }, { interpolate: /<%=([\s\S]+?)%>/g }))
    .pipe(gulp.dest("build/"));
});

gulp.task('build:userscript', ['build:meta'], function() {
  let sources = gulp.src(["src/index.js", "src/*.js", "src/sites/**/*.js"]);
  let settings = gulp.src("src/settings.json")
    .pipe(transforms.trim())
    .pipe(transforms.wrap("Booru.settings = ", ";"));
  let styles = gulp.src(["src/style/**/*.scss"])
    .pipe(sass({ "outputStyle": "compressed" }).on("error", sass.logError))
    .pipe(transforms.jsWrap());

  let header = fs.readFileSync("build/booru-lightbox.meta.js");

  return merge(sources, settings, styles)
    .pipe(transforms.fileHeaders())
    .pipe(transforms.trim())
    .pipe(concat("booru-lightbox.user.js", { "newLine": "\n\n" }))
    .pipe(template({ pkg: pkg }, { interpolate: /<%=([\s\S]+?)%>/g }))
    .pipe(transforms.wrap(`${header}\n`, "\n\nBooru.run();"))
    .pipe(gulp.dest("build/"));
});

gulp.task('clean', function() {
    return gulp.src('build', { "read": false })
      .pipe(clean());
});

gulp.task("watch", function() {
  gulp.watch(['src/**/*', "meta/**/*"], ['build:userscript']);
})

gulp.task('build', ['build:userscript']);
gulp.task('default', ['build']);
