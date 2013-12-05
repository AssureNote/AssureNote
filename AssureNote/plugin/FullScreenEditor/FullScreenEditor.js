///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var FullScreenEditorPlugin = (function (_super) {
        __extends(FullScreenEditorPlugin, _super);
        function FullScreenEditorPlugin(AssureNoteApp, textarea/*CodeMirror*/ , selector) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.textarea = textarea;
            this.selector = selector;
            this.HasMenuBarButton = true;
            this.HasEditor = true;
            this.EditorUtil = new AssureNote.EditorUtil(textarea, selector, {
                position: "absolute",
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            });
        }
        FullScreenEditorPlugin.prototype.EnableEditor = function (WGSN) {
            this.textarea.setValue(WGSN);
            var callback = this.EditorUtil.EnableEditorCallback();
            if (callback) {
                callback();
            }
        };

        FullScreenEditorPlugin.prototype.DisableEditor = function () {
            return null;
        };

        FullScreenEditorPlugin.prototype.CreateMenuBarButton = function () {
            var _this = this;
            return new AssureNote.MenuBarButton("fullscreeneditor-id", "images/editor.png", "fullscreeneditor", function (event, TargetView) {
                var Writer = new StringWriter();
                TargetView.Model.FormatSubNode(1, Writer);
                _this.EnableEditor(Writer.toString());
                console.log(Writer.toString());
            });
        };
        return FullScreenEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.FullScreenEditorPlugin = FullScreenEditorPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=FullScreenEditor.js.map
