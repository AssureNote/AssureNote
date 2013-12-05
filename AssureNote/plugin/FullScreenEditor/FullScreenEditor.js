///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
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
        function FullScreenEditorPlugin() {
            _super.call(this);
            this.HasMenuBarButton = true;
            this.HasEditor = true;
        }
        FullScreenEditorPlugin.prototype.EditorEnableCallback = function () {
            return null;
        };

        FullScreenEditorPlugin.prototype.EditorDisableCallback = function () {
            return null;
        };

        FullScreenEditorPlugin.prototype.CreateMenuBarButton = function () {
            return new AssureNote.MenuBarButton("fullscreeneditor", "images/editor.png", "fullscreeneditor", function (event, TargetView) {
                var Writer = new StringWriter();
                TargetView.Model.FormatSubNode(1, Writer);
                console.log(Writer.toString());
            });
        };
        return FullScreenEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.FullScreenEditorPlugin = FullScreenEditorPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=FullScreenEditor.js.map
