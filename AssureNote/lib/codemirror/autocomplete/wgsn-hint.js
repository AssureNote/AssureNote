(function() {
  "use strict";

  var WORD = /[\w$]+/, RANGE = 500;

  var KEYWORDS = ["Goal", "G", "Strategy", "S", "Context", "C", "Evidence", "E",
                  "Undeveloped", "Rebuttal",
                  "Presume",
                  "Location", "Condition"];

  CodeMirror.registerHelper("hint", "wgsn", function(editor, options) {
    var word = options && options.word || WORD;
    var range = options && options.range || RANGE;
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    var start = cur.ch, end = start;
    while (end < curLine.length && word.test(curLine.charAt(end))) ++end;
    while (start && word.test(curLine.charAt(start - 1))) --start;
    var curWord = start != end && curLine.slice(start, end);
    var list = [], seen = {};
    if(curWord == false) {
        list = [].concat(KEYWORDS);
    }
    for(var i = 0; i < KEYWORDS.length; i++) {
        if(KEYWORDS[i].indexOf(curWord) == 0) {
            list.push(KEYWORDS[i]);
        }
    }
    return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
  });
})();
