/*global module:false, require:false, process:false*/
module.exports = (grunt) => {
	'use strict';

	require('time-grunt')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Used for Sauce Labs. Creates a server for the
		// unit tests to be served from.
		connect: {
			server: {
				options: {
					port: 9999,
					hostname: '*'
				}
			}
		},

		// Runs the QUnit unit tests in multiple browsers automatically.
		'saucelabs-qunit': {
			all: {
				options: {
					username: 'sceditor',
					key: () => process.env.SCEDITOR_SAUCE_KEY,
					urls: ['http://127.0.0.1:9999/tests/unit/index.html'],
					tunnelTimeout: 5,
					build: process.env.TRAVIS_JOB_ID ||
						('Local ' + (new Date()).toISOString()),
					concurrency: 5,
					browsers: grunt.file.readJSON('browsers.json'),
					'max-duration': 120,
					sauceConfig: {
						'video-upload-on-pass': false
					},
					testname: 'SCEditor QUnit tests'
				}
			}
		},

		// Runs the unit tests
		qunit: {
			all: ['tests/unit/index.html']
		},

		// Style checking of JS code using ESLint
		eslint: {
			source: {
				src: ['src/**/*.js'],
				options: {
					configFile: '.eslintrc.json'
				}
			},
			tests: {
				src: ['tests/**/*.js', '!tests/libs/**/*.js'],
				options: {
					configFile: 'tests/.eslintrc.json'
				}
			},
			translations: {
				src: 'languages/**/*.js',
				options: {
					configFile: 'languages/.eslintrc.json'
				}
			}
		},

		// Removes all the old files from the distributable directory
		clean: {
			build: ['minified/'],
			dist: ['dist/']
		},

		// Copy files into the distributable directory ready to be compressed
		// into the ZIP archive
		copy: {
			dist: {
				files: [
					{
						expand: true,
						src: ['minified/**'],
						dest: 'dist/'
					},
					{
						expand: true,
						src: ['languages/**'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/',
						src: ['plugins/**.js'],
						dest: 'dist/development/'
					},
					{
						expand: true,
						cwd: 'src/',
						src: 'jquery.sceditor.default.css',
						dest: 'dist/development/'
					},
					{
						expand: true,
						cwd: 'src/themes/icons/',
						src: '*.png',
						dest: 'dist/development/themes/'
					},
					{
						expand: true,
						cwd: 'src/themes/icons/',
						src: 'monocons/**',
						dest: 'dist/development/themes/'
					},
					{
						expand: true,
						src: 'README.md',
						dest: 'dist/'
					},
					{
						expand: true,
						src: 'MIT.txt',
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'distributable/data/',
						src: 'example.html',
						dest: 'dist/'
					},
					{
						expand: true,
						src: 'emoticons/**',
						dest: 'dist/'
					}
				]
			},
			build: {
				//TODO: icons
				files: [
					{
						expand: true,
						cwd: 'src/themes/icons/',
						src: '*.png',
						dest: 'minified/themes/'
					},
					{
						expand: true,
						cwd: 'src/themes/icons/',
						src: 'monocons/**',
						dest: 'minified/themes/'
					}
				]
			}
		},
		//TODO: Improve webpack compression
		// Convert modules into a single JS file
		webpack: {
			build: {
				entry: './src/jquery.sceditor.js',
				output: {
					path: __dirname + '/minified/',
					filename: 'jquery.sceditor.min.js'
				},
				externals: {
					jquery: 'jQuery'
				},
				mode: 'production'
			},
			dist: {
				entry: './src/jquery.sceditor.js',
				output: {
					path: __dirname + '/dist/development/',
					filename: 'jquery.sceditor.js'
				},
				externals: {
					jquery: 'jQuery'
				},
				mode: 'none'
			}
		},

		// Create the XHTML and BBCode bundled JS files
		concat: {
			dist: {
				options: {
					separator: ';'
				},
				files: {
					'dist/development/jquery.sceditor.bbcode.js': [
						'dist/development/jquery.sceditor.js',
						'src/plugins/bbcode.js'
					],
					'dist/development/jquery.sceditor.xhtml.js': [
						'dist/development/jquery.sceditor.js',
						'src/plugins/xhtml.js'
					]
				}
			}
		},

		// Minify the JavaScript
		uglify: {
			build: {
				options: {
					warnings: true,
					compress: true,
					mangle: true,
					banner: '/* SCEditor v<%= pkg.version %> | ' +
					'(C) 2017, Sam Clarke | sceditor.com/license */\n'
				},
				files: [
					{
						src: 'minified/jquery.sceditor.min.js',
						dest: 'minified/jquery.sceditor.min.js'
					},
					{
						src: [
							'minified/jquery.sceditor.min.js',
							'src/plugins/bbcode.js'
						],
						dest: 'minified/jquery.sceditor.bbcode.min.js'
					},
					{
						src: [
							'minified/jquery.sceditor.min.js',
							'src/plugins/xhtml.js'
						],
						dest: 'minified/jquery.sceditor.xhtml.min.js'
					},
					{
						expand: true,
						filter: 'isFile',
						cwd: 'src/',
						src: ['plugins/**.js'],
						dest: 'minified/'
					}
				]
			}
		},

		// Convert the less CSS theme files into CSS
		less: {
			build: {
				options: {
					paths: ['src/themes/'],
					cleancss: true
				},
				files: [
					{
						expand: true,
						filter: 'isFile',
						cwd: 'src/themes/',
						src: ['*'],
						dest: 'minified/themes/',
						ext: '.min.css'
					}
				]
			},
			dist: {
				options: {
					paths: ['src/themes/'],
					cleancss: true
				},
				files: [
					{
						expand: true,
						filter: 'isFile',
						cwd: 'src/themes/',
						src: ['*'],
						dest: 'dist/development/themes/',
						ext: '.css'
					}
				]
			}
		},

		// Manage CSS vendor prefixes
		postcss: {
			build: {
				options: {
					processors: [
						require('autoprefixer')({
							browsers: [
								'last 4 versions',
								'ie 6',
								'ie 7',
								'ie 8',
								'ie 9'
							]
						})
					]
				},
				expand: true,
				flatten: true,
				src: 'minified/themes/*.css',
				dest: 'minified/themes/'
			}
		},

		// Compress the WYSIWYG CSS
		cssmin: {
			build: {
				files: [
					{
						'minified/jquery.sceditor.default.min.css': [
							'src/jquery.sceditor.default.css'
						]
					},
					{
						expand: true,
						cwd: 'minified/themes',
						src: ['*.min.css'],
						dest: 'minified/themes',
						ext: '.min.css'
					}
				]
			}
		},

		// Creates the distributable ZIP file
		compress: {
			dist: {
				options: {
					archive: 'distributable/sceditor-<%= pkg.version %>.zip'
				},
				files: [
					{
						expand: true,
						cwd: 'dist/',
						src: ['**']
					}
				]
			}
		},
	});

	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-saucelabs');
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-eslint');

	grunt.registerTask('default', ['test']);

	// Sauce Labs. Runs the QUnit tests in multiple browsers automatically.
	grunt.registerTask('sauce', ['connect', 'saucelabs-qunit']);

	// Lints the JS and runs the unit tests
	grunt.registerTask('test', ['eslint', 'qunit']);

	// Lints JS, runs unit tests and then runs unit tests via Sauce Labs.
	grunt.registerTask('full-test', ['test', 'sauce']);

	// Minifies the source
	grunt.registerTask('build', [
		'clean:build',
		'copy:build',
		'webpack:build',
		'uglify:build',
		'less:build',
		'postcss:build',
		'cssmin:build'
	]);

	// Creates the simplified distributable ZIP
	grunt.registerTask('release', [
		'test',
		'build',
		'clean:dist',
		'webpack:dist',
		'concat:dist',
		'copy:dist',
		'less:dist',
		'compress:dist',
		'clean:dist'
	]);

	// Creates a directory containing the contents of
	// the release ZIP but without compressing it
	grunt.registerTask('dist', [
		'test',
		'build',
		'clean:dist',
		'webpack:dist',
		'concat:dist',
		'copy:dist',
		'less:dist',
	]);

	// Update dev dependencies
	grunt.registerTask('dev-upd', ['devUpdate:main']);
};
