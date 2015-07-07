/**
 * Grunt config file.
 *
 * Relies on package.json to get additional information.
 *
 * Before run:
 * - npm install
 * - bower install
 *
 * Run one of the following commands:
 * grunt
 * grunt lint
 * grunt test
 * grunt build
 */

/*jshint node: true */
module.exports = function (grunt) {
  'use strict';

  var config = {
    // Source files location.
    src: 'src',
    // Build files location.
    build: 'build',
    // Array of utility files that are not a part of distribution, but should also
    // be processed (linted etc.).
    utilFiles: [
      'Gruntfile.js',
      'test/*.js',
      'test/unit/*.js'
    ],
    // Test files location.
    test: 'test'
  };

  // Expand app files from source dir if they were not specified in config.
  config.appFiles = config.appFiles || grunt.file.expand(config.src + '/*');
  // Define output filename as a first available file, or 'app' if no files.
  config.outputName = (config.outputName || config.appFiles[0].replace(config.src + '/', '').replace('.js', '') + '.js' || 'app.js');
  // Merge all files.
  config.files = config.utilFiles.concat(config.appFiles);

  // Load requried tasks.
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-compare-size');
  grunt.loadNpmTasks('grunt-git-authors');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.initConfig({
    // Get additional information.
    pkg: grunt.file.readJSON('package.json'),

    // JSHint and JSLint.
    jshint: {
      options: {
        jshintrc: true
      },
      // Run on all files.
      all: config.files
    },

    // Use 'connect plugin' to start ad-hoc server for tasks like qunit.
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.'
        }
      }
    },

    // Run QUnit.
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/' + config.test + '/index.html'
          ]
        }
      }
    },

    replace: {
      build: {
        options: {
          patterns: [
            {
              match: 'title',
              replacement: '<%= pkg.title %>'
            }, {
              match: 'description',
              replacement: '<%= pkg.description %>'
            }, {
              match: 'version',
              replacement: '<%= pkg.version %>'
            }, {
              match: 'author_name',
              replacement: '<%= pkg.author.name %>'
            }, {
              match: 'author_email',
              replacement: '<%= pkg.author.email %>'
            }, {
              match: 'license',
              replacement: '<%= pkg.license %>'
            }
          ]
        },
        files: [
          {
            src: [
              config.src + '/*'
            ],
            dest: config.build + '/' + config.outputName
          }
        ]
      }
    },
    // Uglify output.
    uglify: {
      options: {
        banner: '/* <%= pkg.title %> v.<%= pkg.version %> <%= pkg.homepage %> | License: <%= pkg.license %> */'
      },
      build: {
        files: [{
          src: config.build + '/*.js',
          dest: config.build + '/' + config.outputName.replace('.js', '.min.js')
        }]
      }
    },

    // Compare size of uglified files.
    compare_size: {
      files: grunt.file.expand(config.build + '**/*')
    }
  });

  // Register tasks.
  //
  // Run all tasks by default.
  grunt.registerTask('default', ['jshint', 'test', 'build', 'compare_size']);
  // Run code quality check.
  grunt.registerTask('lint', ['jshint']);
  // Run tests.
  grunt.registerTask('test', ['connect', 'qunit']);
  // Build distribution.
  grunt.registerTask('build', ['replace', 'uglify']);
};
