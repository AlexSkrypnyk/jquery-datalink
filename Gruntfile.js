/*jshint node: true */
module.exports = function (grunt) {

  'use strict';

  var files = [
    'jquery.datalink.js',
    'Gruntfile.js',
    'test/*.js',
    'test/unit/*.js'
  ];

  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-compare-size');
  grunt.loadNpmTasks('grunt-git-authors');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Copy only required files from bower_components to required dirs.
    // Not a part of 'default' task.
    bowercopy: {
      all: {
        options: {
          // Write to 'external' dir.
          destPrefix: 'external'
        },
        files: {
          'qunit/qunit.js': 'qunit/qunit/qunit.js',
          'qunit/qunit.css': 'qunit/qunit/qunit.css',
          'qunit/LICENSE.txt': 'qunit/LICENSE.txt',

          'jquery-1.6.0/jquery.js': 'jquery-1.6.0/jquery.js',
          'jquery-1.6.0/MIT-LICENSE.txt': 'jquery-1.6.0/MIT-LICENSE.txt',

          'jquery-1.6.1/jquery.js': 'jquery-1.6.1/jquery.js',
          'jquery-1.6.1/MIT-LICENSE.txt': 'jquery-1.6.1/MIT-LICENSE.txt',

          'jquery-1.6.2/jquery.js': 'jquery-1.6.2/jquery.js',
          'jquery-1.6.2/MIT-LICENSE.txt': 'jquery-1.6.2/MIT-LICENSE.txt',

          'jquery-1.6.3/jquery.js': 'jquery-1.6.3/jquery.js',
          'jquery-1.6.3/MIT-LICENSE.txt': 'jquery-1.6.3/MIT-LICENSE.txt',

          'jquery-1.6.4/jquery.js': 'jquery-1.6.4/jquery.js',
          'jquery-1.6.4/MIT-LICENSE.txt': 'jquery-1.6.4/MIT-LICENSE.txt',

          'jquery-1.7.0/jquery.js': 'jquery-1.7.0/jquery.js',
          'jquery-1.7.0/MIT-LICENSE.txt': 'jquery-1.7.0/MIT-LICENSE.txt',

          'jquery-1.7.1/jquery.js': 'jquery-1.7.1/jquery.js',
          'jquery-1.7.1/MIT-LICENSE.txt': 'jquery-1.7.1/MIT-LICENSE.txt',

          'jquery-1.7.2/jquery.js': 'jquery-1.7.2/jquery.js',
          'jquery-1.7.2/MIT-LICENSE.txt': 'jquery-1.7.2/MIT-LICENSE.txt'
        }
      }
    },

    // JSHint and JSLint.
    jshint: {
      options: {
        jshintrc: true
      },
      // Run on all files.
      all: files
    },

    // Run QUnit.
    qunit: {
      files: 'test/index.html'
    },

    // Uglify output.
    uglify: {
      options: {
        banner: '/*! jQuery datalink v@<%= pkg.version %> http://github.com/jquery/jquery-datalink | License: GPL v2 (http://www.gnu.org/licenses/old-licenses/gpl-2.0.html) */'
      },
      build: {
        src: 'dist/jquery.datalink.js',
        dest: 'dist/jquery.datalink.min.js'
      }
    },

    // Compare size of uglified files.
    compare_size: {
      files: ['dist/jquery.datalink.js', 'dist/jquery.datalink.min.js']
    }
  });

  /**
   * Git date of the latest commit.
   */
  function git_date(fn) {
    grunt.util.spawn({
      cmd: 'git',
      args: ['log', '-1', '--pretty=format:%ad']
    }, function (error, result) {
      if (error) {
        grunt.log.error(error);
        return fn(error);
      }

      fn(null, result);
    });
  }

  /**
   * Replace tokens in source code.
   */
  grunt.registerTask('max', function () {
    var dist = 'dist/jquery.datalink.js',
      done = this.async(),
      version = grunt.config('pkg.version'),
      homepage = grunt.config('pkg.homepage');


    if (process.env.COMMIT) {
      version += ' ' + process.env.COMMIT;
    }

    git_date(function (error, date) {
      if (error) {
        return done(false);
      }

      grunt.file.copy(dist.replace('dist/', ''), dist, {
        process: function (source) {
          return source
            .replace(/@VERSION/g, version)
            .replace(/@HOMEPAGE/g, homepage)
            .replace(/@DATE/g, date);
        }
      });

      done();
    });
  });

  grunt.registerTask('testswarm', function (commit, configFile) {
    var testswarm = require('testswarm'),
      config = grunt.file.readJSON(configFile).jquerycolor;
    config.jobName = 'jQuery datalink commit #<a href="https://github.com/jquery/jquery-datalink/commit/' + commit + '">' + commit.substr(0, 10) + '</a>';
      config['runNames[]'] = 'jQuery datalink';
    config['runUrls[]'] = config.testUrl + commit + '/test/index.html';
    config['browserSets[]'] = ['popular'];
    testswarm({
      url: config.swarmUrl,
      pollInterval: 10000,
      timeout: 1000 * 60 * 30,
      done: this.async()
    }, config);
  });

  grunt.registerTask('manifest', function () {
    var pkg = grunt.config('pkg');
    grunt.file.write('datalink.jquery.json', JSON.stringify({
      name: 'color',
      title: pkg.title,
      description: pkg.description,
      keywords: pkg.keywords,
      version: pkg.version,
      author: {
        name: pkg.author.name
      },
      licenses: pkg.licenses.map(function (license) {
        return license.url.replace('master', pkg.version);
      }),
      bugs: pkg.bugs,
      homepage: pkg.homepage,
      docs: pkg.homepage,
      dependencies: {
        jquery: '>=1.6'
      }
    }, null, '\t'));
  });

  // Register default, init and build tasks.
  grunt.registerTask('default', ['jshint', 'qunit', 'build', 'compare_size']);
  grunt.registerTask('init', ['bowercopy']);
  grunt.registerTask('build', ['max', 'uglify']);
};
