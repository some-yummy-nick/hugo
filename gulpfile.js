const gulp = require("gulp"),
	{ spawn } = require('child_process'),
	flatten = require("gulp-flatten"),
	postcss = require("gulp-postcss"),
	cssImport = require("postcss-import"),
	cssnext = require("postcss-cssnext"),
	cssNested = require("postcss-nested"),
	hugoBin = require("hugo-bin"),
	browserSync = require("browser-sync").create();
	$ = require("gulp-load-plugins")({
		pattern: ["*"],
		scope: ["devDependencies"]
	});

// Hugo arguments
const hugoArgsDefault = ["-d", "../dist", "-s", "site", "-v"];
const hugoArgsPreview = ["--buildDrafts", "--buildFuture"];
const paths = {
	styles: {
		src: 'src/scss/style.scss',
		all: 'src/scss/**/*.scss',
		build: 'dist/css'
	},
	js: {
		index: 'src/js/*.js',
		plugins: 'src/plugins/*.js',
		libs: 'src/libs/*.js',
		all: 'src/**/*.js',
		build: 'dist/js',
	},
	img:{
		src: 'src/img/*.+(jpg|JPG|png)',
		build:"./dist/img"
	}

};
// Development tasks
gulp.task("hugo", cb => buildSite(cb));
gulp.task("hugo-preview", cb => buildSite(cb, hugoArgsPreview));

// Run server tasks
gulp.task("server", ["hugo", "scss", "css", "fonts", "videos", "images"], cb =>
	runServer(cb)
);

gulp.task(
	"server-preview",
	["hugo-preview", "scss", "css", "fonts", "videos", "images"],
	cb => runServer(cb)
);

// Build/production tasks
gulp.task("build", ["scss", "css", "fonts", "videos", "images"], cb =>
	buildSite(cb, [], "production")
);

gulp.task("build-preview", ["css", "fonts", "videos", "images"], cb =>
	buildSite(cb, hugoArgsPreview, "production")
);

// Compile scss
gulp.task("scss", () =>
	gulp
		.src(paths.styles.src)
		.pipe($.sassGlob({
			ignorePaths: [
				"src/styles/utils/**",
				"src/styles/base/**",
			]
		}))
		.pipe($.sass())
		.pipe($.autoprefixer({
			cascade: false,
			grid: true
		}))
		.pipe($.cleanCss({
			level: 2
		}))
		.pipe($.postcss([
			require('css-declaration-sorter')({
				order: 'smacss'
			}),
			require("postcss-easysprites")({
				imagePath: "src/img/",
				spritePath: "src/img/"
			}),
			require("css-mqpacker")({
				sort: sortMediaQueries
			})
		]))
		.pipe(gulp.dest(paths.styles.build))
		.pipe(browserSync.stream())
);

// Compile CSS with PostCSS
gulp.task("css", () =>
	gulp
		.src("./src/css/*.css")
		.pipe(
			postcss([
				cssImport({ from: "./src/css/main.css" }),
				cssNested(),
				cssnext()
			])
		)
		.pipe(gulp.dest("./dist/css"))
		.pipe(browserSync.stream())
);

// Move all fonts in a flattened directory
gulp.task("fonts", () =>
	gulp
		.src("./src/fonts/**/*")
		.pipe(flatten())
		.pipe(gulp.dest("./dist/fonts"))
		.pipe(browserSync.stream())
);

// Move all videos in a flattened directory
gulp.task("videos", () =>
	gulp
		.src("./src/videos/**/*")
		.pipe(gulp.dest("./dist/videos"))
		.pipe(browserSync.stream())
);

// Move all images in a flattened directory
gulp.task("images", () =>
	gulp.src(paths.images.src)
		.pipe($.cache($.tinypng('BLZpO1PPn1JhAC0IBa8ncwiTmWm93ySw')))
		.pipe(gulp.dest(paths.images.build))
		.pipe(browserSync.stream())
);

// Development server with browsersync
function runServer() {
	browserSync.init({
		server: {
			notify: false,
			tunnel: "hugo",
			open: false,
			baseDir: "./dist"
		}
	});
	gulp.watch(paths.js.all, browserSync.reload);
	gulp.watch(paths.styles.all, ["scss"]);
	gulp.watch("./src/css/**/*.css", ["css"]);
	gulp.watch("./src/fonts/**/*", ["fonts"]);
	gulp.watch("./src/img/**/*", ["images"]);
	gulp.watch("./src/videos/**/*", ["videos"]);
	gulp.watch("./site/**/*", ["hugo"]);
}

/**
 * Run hugo and build the site
 */
function buildSite(cb, options, environment = "development") {
	const args = options ? hugoArgsDefault.concat(options) : hugoArgsDefault;

	process.env.NODE_ENV = environment;

	return spawn(hugoBin, args, { stdio: "inherit" }).on("close", code => {
		if (code === 0) {
			browserSync.reload();
			cb();
		} else {
			browserSync.notify("Hugo build failed :(");
			cb("Hugo build failed");
		}
	});
}

function isMax(mq) {
	return /max-width/.test(mq);
}

function isMin(mq) {
	return /min-width/.test(mq);
}

function sortMediaQueries(a, b) {

	let A = a.replace(/\D/g, '');

	let B = b.replace(/\D/g, '');

	if (isMax(a) && isMax(b)) {

		return B - A;

	} else if (isMin(a) && isMin(b)) {

		return A - B;

	} else if (isMax(a) && isMin(b)) {

		return 1;

	} else if (isMin(a) && isMax(b)) {

		return -1;

	}

	return 1;

}
