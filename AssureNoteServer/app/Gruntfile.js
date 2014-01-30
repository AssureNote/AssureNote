module.exports = function(grunt) {

    grunt.initConfig({
    	yuidoc: {
            compile: {
                name: 'AssureNote Server',
                description: 'AssureNote Server auto-generated document',
                version: '0.0.1',
                url: 'https://github.com/AssureNote/AssureNote',
                options: {
                    linkNatives: 'true',
                    attributesEmit: 'true',
                    selleck: 'true',
                    paths: '.',
                    outdir: '../doc'
                }
    		}
    	},

        //TODO use grunt-typescript (@compile_list cannot use in grunt-typescript)
        exec: {
            typescript: {
                cmd: 'tsc @compile_list --module "commonjs"'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('default', ['exec:typescript']);
};
