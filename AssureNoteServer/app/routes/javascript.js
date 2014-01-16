///<reference path='../DefinitelyTyped/node/node.d.ts'/>
var CONFIG = require('config');

exports.config = function (req, res) {
    var params = { basepath: CONFIG.assurenote.basepath };
    res.set('Content-type', 'text/javascript');
    res.render('javascript/config', params);
};
