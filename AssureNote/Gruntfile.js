module.exports = function(grunt) {

    grunt.initConfig({
        yuidoc: {
            build: {
                name: 'AssureNote',
                description: 'AssureNote auto-generated document',
                version: '0.0.1',
                url: 'https://github.com/AssureNote/AssureNote',
                options: {
                    linkNatives: 'true',
                    attributesEmit: 'true',
                    selleck: 'true',
                    paths: './src',
                    outdir: './doc',
                }
            }
        },

        jade: {
            build: {
                files: {
                    'index.html': './index.jade'
                },
                options: {
                    pretty: true
                }
            },

            spec_build: {
                files: {
                    'test/SpecRunner.html': 'test/SpecRunner.jade'
                }
            }
        },

        //TODO use grunt-typescript (@compile_list cannot use in grunt-typescript)
        exec: {
            typescript: {
                cmd: 'tsc @compile_list --module "commonjs" --sourcemap'
            },
            typescript_release: {
                cmd: 'tsc @compile_list --module "commonjs" --removeComments --out build/AssureNote.js'
            }
        },

        open: {
            spec_chrome: {
                path: 'test/SpecRunner.html',
                app: 'Google Chrome'
            },

            spec_firefox: {
                path: 'test/SpecRunner.html',
                app: 'Firefox'
            }
        },

        typescript: {
            spec_build: {
                src: ['test/MainSpec.ts'],
                options: {
                    sourcemap: true,
                    module: 'commonjs',
                    comments: true
                }
            }
        },
        uglify: {
            build: {
                files: {
                    'build/AssureNote.min.js': ['build/AssureNote.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jade:build', 'exec:typescript']);
    grunt.registerTask('release', ['jade:build', 'exec:typescript_release', 'uglify:build']);
    grunt.registerTask('test', ['typescript:spec_build', 'jade:spec_build', 'open:spec_chrome']);
};
