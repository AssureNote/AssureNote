///<reference path='./Plugin.ts'/>
var AssureNote;
(function (AssureNote) {
    var Editor = (function () {
        function Editor(AssureNoteApp, EditorPlugin) {
            this.AssureNoteApp = AssureNoteApp;
            this.EditorPlugin = EditorPlugin;
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
