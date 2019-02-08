const gulp = require('gulp');
const uglify = require('gulp-uglify-es').default

gulp.task('default', () =>
    gulp.src('dist/rxfeign.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/'))
);