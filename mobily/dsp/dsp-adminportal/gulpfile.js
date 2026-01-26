// Include gulp
var gulp = require('gulp');

// Include plugins
var del = require('del'),
    gutil = require('gulp-util'),
    htmlmin = require('gulp-htmlmin'),
    nano = require('gulp-cssnano'),
    usemin = require('gulp-usemin'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    concat = require("gulp-concat"),
    imagemin = require('gulp-imagemin'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    jsonminify = require('gulp-jsonminify'),
    rev = require('gulp-rev'),
    connect = require('gulp-connect'),
    tar = require('gulp-tar'),
    gzip = require('gulp-gzip'),
    gulpNgConfig = require('gulp-ng-config'),
    argv = require('yargs').argv,
    merge = require('merge-stream'),
    serveStatic = require('serve-static'),
    gulp_ssh = require('gulp-ssh');

var applicationName = 'dsp-adminportal';

var bases = {
    src: 'src',
    dist: 'dist',
    tmp: 'tmp'
};

const uglifyOptions = {
    output: {
        max_line_len: 250000
    }
};

// Clean dist
gulp.task('clean', function () {
    return del([bases.dist, applicationName + '*.tar.gz', bases.tmp]);
});

// Analyzes all javascript files.
gulp.task('jshint', function () {
    return gulp.src([bases.src + '/index.js', bases.src + '/app.js', bases.src + '/common/*.js', bases.src + '/app/**/*.js'])
        .pipe(jshint({
            evil: true
        }))
        .pipe(jshint.reporter(stylish));
});

// Detects build expressions in main html files and replaces them with processed files.
gulp.task('usemin-main', ['clean', 'config'], function () {
    return gulp.src(bases.src + '/*.html')
        .pipe(usemin({
            html: [function () {
                return htmlmin({collapseWhitespace: true});
            }],
            css: [nano({zindex: false}), rev()],
            small_libjs: [ngAnnotate(), uglify(uglifyOptions), rev()],
            libjs: [ngAnnotate(), uglify(uglifyOptions), rev()],
            index_js: [ngAnnotate(), uglify(uglifyOptions), rev()],
            app_js: [ngAnnotate(), uglify(uglifyOptions), rev()]
        }))
        .pipe(gulp.dest(bases.dist));
});

// Minify and copy html files.
gulp.task('minify-view-htmls', ['clean', 'config'], function () {
    return gulp.src(bases.src + '/app/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(bases.dist));
});

// Images
gulp.task('images', ['clean', 'config'], function () {
    var imgSrc = bases.src + '/img/**/*',
        imgDst = bases.dist + '/img';

    return gulp.src(imgSrc)
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst));
});

// Copy images.
gulp.task('copy-style-img', ['minify-view-htmls'], function () {
    return gulp.src([bases.src + '/css/*.gif']).pipe(gulp.dest(bases.dist + '/styles'));
});
gulp.task('copy-img', ['minify-view-htmls'], function () {
    return gulp.src([bases.src + '/img/**/*']).pipe(gulp.dest(bases.dist + '/img'));
});

// Copy i18n internationalization files.
gulp.task('copy-i18n', ['minify-view-htmls'], function () {
    return gulp.src(['i18n/**/*']).pipe(jsonminify()).pipe(gulp.dest(bases.dist + '/i18n'));
});

// Copy html5 javascript files.
gulp.task('copy-html5-js', ['minify-view-htmls'], function () {
    return gulp.src([bases.src + '/html5/**/*']).pipe(jsonminify()).pipe(gulp.dest(bases.dist + '/js'));
});

// Copy bootstrap and font-awesome fonts.
gulp.task('copy-fonts', ['minify-view-htmls'], function () {
    return gulp.src(['bower_components/font-awesome/fonts/**/*', 'bower_components/bootstrap/fonts/**/*', bases.src + '/css/google-fonts/**/*']).pipe(gulp.dest(bases.dist + '/fonts'));
});

// Copy files to destination.
gulp.task('copy', ['copy-style-img', 'copy-img', 'copy-i18n', 'copy-html5-js', 'copy-fonts']);

// Takes the config json file and creates an angularjs module that contains the configuration constants.
gulp.task('config', function () {
    return gulp.src('./src/app-config.json')
        .pipe(gulpNgConfig('adminportal.config', {
            //constants: {}
        }))
        .pipe(gulp.dest('./src/'))
});

var fastDist = function () {
    return gulp.src(bases.src + '/*.html')
        .pipe(usemin({
            html: [],
            css: [rev()],
            small_libjs: [rev()],
            libjs: [rev()],
            index_js: [rev()],
            app_js: [rev()]
        }))
        .pipe(gulp.dest(bases.tmp));
};

// Only concatanates libraries and scripts.
gulp.task('fast-dist', ['clean', 'config'], function () {
    return fastDist();
});
gulp.task('fast-dist-watch', function () {
    del([bases.tmp + '/*.js']).then(paths => {
        return fastDist();
    });
});

// Raise a web server.
gulp.task('connect', ['fast-dist'], function () {
    return connect.server({
        root: bases.src,
        host: "0.0.0.0",
        port: 8080,
        middleware: function (connect) {
            return [
                connect().use('/adminportal/i18n', serveStatic('i18n')),
                connect().use('/adminportal/fonts', serveStatic('bower_components/font-awesome/fonts')),
                connect().use('/adminportal/fonts', serveStatic('bower_components/bootstrap/fonts')),
                connect().use('/adminportal/fonts', serveStatic(bases.src + '/css/google-fonts')),
                connect().use('/adminportal/js', serveStatic(bases.src + '/html5')),
                connect().use('/adminportal/img', serveStatic(bases.src + '/img')),
                connect().use('/adminportal/styles', serveStatic(bases.src + '/css')),
                connect().use('/adminportal', serveStatic(bases.src + '/app')),
                connect().use('/adminportal', serveStatic(bases.tmp))
            ];
        }
    });
});

// Watch
gulp.task('watch', ['connect'], function () {
    return gulp.watch([bases.src + '/**/*.html', bases.src + '/**/*.js', bases.src + '/**/*.css'], ['fast-dist-watch']);
});

// Rise a server and watch tasks
gulp.task('server', ['clean', 'config', 'fast-dist', 'connect', 'watch']);

// Build Task
gulp.task('build', ['clean', 'config', 'usemin-main', 'minify-view-htmls', 'copy']);

// Compress distribution
gulp.task('compress', ['build'], function () {
    return gulp.src([bases.dist + '/**/*', bases.dist + '/**/.*'])
        .pipe(tar(applicationName + '-' + ((new Date()).getTime()) + '.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('.'));
});

// Default Task
gulp.task('default', ['build', 'compress']);

var remoteConfig = [];

gulp.task('setup', ['compress'], function () {
    try {
        var deployConfig = require("./deployConfig.json");
    } catch (e) {
        console.error("deployConfig.json not found");
        process.exit(1);
    }
    if (argv.cluster == undefined) {
        console.error("indicate a cluster with --cluster parameter");
        process.exit(1);
    }

    if (deployConfig[argv.cluster] == undefined) {
        console.error("cluster " + argv.cluster + " not found");
        console.error("possible candidates: " + Object.keys(deployConfig).join(", "));
        process.exit(1);
    }

    for (var i in deployConfig[argv.cluster]) {
        var deploymentDirectory = deployConfig[argv.cluster][i].deploymentDirectory;
        if (deploymentDirectory == "" || deploymentDirectory == false || deploymentDirectory == "~" || deploymentDirectory == "." || deploymentDirectory == ".." || deploymentDirectory == "/") {
            console.error("deploymentDirectory of " + i + ". cluster on " + argv.cluster + " possibly malfunctioned: " + deployConfig[argv.cluster][i].deploymentDirectory);
            process.exit(1);
        }
        remoteConfig[i] = {
            gulpSSH: new gulp_ssh({
                ignoreErrors: false,
                sshConfig: deployConfig[argv.cluster][i].sshConfig
            }),
            tmpDirectory: deployConfig[argv.cluster][i].tmpDirectory,
            deploymentDirectory: deployConfig[argv.cluster][i].deploymentDirectory
        };
    }

});

gulp.task('scp', ['setup'], function () {
    var tasks = [];
    for (var i in remoteConfig) {
        tasks.push(gulp
            .src(['*.tar.gz'])
            .pipe(remoteConfig[i].gulpSSH.dest(remoteConfig[i].tmpDirectory)));
    }
    return merge(tasks);
});

gulp.task('create-the-remote-directory', ['scp', 'setup'], function () {
    var tasks = [];
    for (var i in remoteConfig) {
        gutil.log('Try to create remote directory just in case.');

        var command = 'mkdir -p ' + remoteConfig[i].deploymentDirectory; // Try to create remote directory just in case.

        var username = remoteConfig[i].gulpSSH.options.sshConfig.username;
        if (username !== 'root') {
            command = 'sudo ' + command;
        }

        tasks.push(remoteConfig[i].gulpSSH.exec(command));
    }
    return merge(tasks);
});

gulp.task('backup-the-old-portals', ['create-the-remote-directory'], function () {
    var tasks = [];
    for (var i in remoteConfig) {
        gutil.log('Backup the old portal deployment.');

        var command = 'cp -r ' + remoteConfig[i].deploymentDirectory + ' ' + remoteConfig[i].deploymentDirectory + '-`date +"%Y-%m-%dT%H-%M"`'; // Backup the old portal deployment.

        var username = remoteConfig[i].gulpSSH.options.sshConfig.username;
        if (username !== 'root') {
            command = 'sudo ' + command;
        }

        tasks.push(remoteConfig[i].gulpSSH.exec(command));
    }
    return merge(tasks);
});

gulp.task('remove-the-old-backups', ['backup-the-old-portals'], function () {
    var tasks = [];
    for (var i in remoteConfig) {
        gutil.log('Remove the the old backups and left only latest 2 deployments.');

        var command = 'rm -rf `ls -td ' + remoteConfig[i].deploymentDirectory + '* | awk \'NR>3\'`'; // Remove the the old backups and left only latest 2 deployments.

        var username = remoteConfig[i].gulpSSH.options.sshConfig.username;
        if (username !== 'root') {
            command = 'sudo ' + command;
        }

        tasks.push(remoteConfig[i].gulpSSH.exec(command));
    }
    return merge(tasks);
});

gulp.task('clean-the-deployment-directory', ['remove-the-old-backups'], function () {
    var tasks = [];
    for (var i in remoteConfig) {
        gutil.log('Clean the deployment directory.');

        var command = 'rm -rf ' + remoteConfig[i].deploymentDirectory + '/* && mkdir -p ' + remoteConfig[i].deploymentDirectory; // Clean the deployment directory.

        var username = remoteConfig[i].gulpSSH.options.sshConfig.username;
        if (username !== 'root') {
            command = 'sudo ' + command;
        }

        tasks.push(remoteConfig[i].gulpSSH.exec(command));
    }
    return merge(tasks);
});

gulp.task('extract-the-new-portal', ['clean-the-deployment-directory'], function () {
    var tasks = [];
    for (var i in remoteConfig) {
        gutil.log('Extract the new portal codes.');

        var command = 'tar -xzf `ls -td ' + remoteConfig[i].tmpDirectory + '/' + applicationName + '-*.tar.gz | awk \'NR==1\'` -C ' + remoteConfig[i].deploymentDirectory; // Extract the new portal codes.

        var username = remoteConfig[i].gulpSSH.options.sshConfig.username;
        if (username !== 'root') {
            command = 'sudo ' + command;
        }

        tasks.push(remoteConfig[i].gulpSSH.exec(command));
    }
    return merge(tasks);
});

gulp.task('remove-the-temporary-file', ['extract-the-new-portal'], function () {
    var tasks = [];
    for (var i in remoteConfig) {
        gutil.log('Remove the temporary file.');

        var command = 'rm -rf ' + remoteConfig[i].tmpDirectory + '/' + applicationName + '-*.tar.gz'; // Remove the temporary file.

        var username = remoteConfig[i].gulpSSH.options.sshConfig.username;
        if (username !== 'root') {
            command = 'sudo ' + command;
        }

        tasks.push(remoteConfig[i].gulpSSH.exec(command));
    }
    return merge(tasks);
});

gulp.task('deploy-portals', ['remove-the-temporary-file'], function () {
    var tasks = [];
    for (var i in remoteConfig) {
        var command = 'echo "";ls -lrtd ' + remoteConfig[i].deploymentDirectory + '*';

        tasks.push(remoteConfig[i].gulpSSH.exec(command).on('data', function (data) {
            console.log(data._contents.toString());
        }));
    }
    return merge(tasks);
});

gulp.task('deploy', ['build', 'compress', 'setup', 'scp', 'deploy-portals']);
