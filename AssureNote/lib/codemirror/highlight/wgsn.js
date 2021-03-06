CodeMirror.defineMode("wgsn", function(cmCfg, modeCfg) {
    var MatchVariables = function(str) {

    }
    var mode = {};
    mode.token = function(stream, state) {
    if (stream.sol() && stream.eatWhile("*")) {
        return 'highlight-asterisks';
    }

    if (stream.match(/\[[^\[\]]*\]/)) {
        return 'highlight-variable';
    }

    if (stream.string.indexOf('*') == 0 && stream.match(/\&[^\s]*/)) {
        return 'highlight-uid';
    } 

    if (stream.match('::')) {
        return 'highlight-tag';
    }

    var tagidx = stream.string.indexOf('::');
    if (tagidx != -1 && stream.sol()) {
        while(stream.pos < tagidx) {
            stream.next();
        }
        return 'highlight-tag-key';
    }

    if (tagidx != -1 && stream.start == tagidx + 2) {
        stream.skipToEnd();
        return 'highlight-tag-value';
    }
  
    stream.next();
    return null;
    }
    return mode;
});
