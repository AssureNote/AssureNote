module.exports = function(grunt) {

    grunt.initConfig({
    	yuidoc: {
            compile: {
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
            compile: {
                files: {
                    'index.html': './index.jade'
                }
            }

        },

        //TODO use grunt-typescript (@compile_list cannot use in grunt-typescript)
        exec: {
            typescript: {
                cmd: 'tsc @compile_list --module "commonjs" --sourcemap'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('default', ['jade:compile', 'exec:typescript']);
};
