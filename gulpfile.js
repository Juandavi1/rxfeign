const {task, src, dest} = require('gulp');
const uglify = require('gulp-uglify');

task('default', () =>
    src('dist/rxfeign.js')
        .pipe(uglify())
        .pipe(dest('dist'))
);