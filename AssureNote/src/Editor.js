///<reference path='./Plugin.ts'/>
var AssureNote;
(function (AssureNote) {
    var Editor = (function () {
        function Editor(AssureNoteApp, selector, EditorPlugin) {
            this.AssureNoteApp = AssureNoteApp;
            this.selector = selector;
            this.EditorPlugin = EditorPlugin;
            $(selector).css({ display: 'none', opacity: '1.0' });
        }
        Editor.prototype.EnableEditor = function () {
        };

        Editor.prototype.DisableEditor = function () {
        };
        return Editor;
    })();
    AssureNote.Editor = Editor;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
