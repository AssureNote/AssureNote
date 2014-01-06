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
        function FullScreenEditorPlugin(AssureNoteApp, textarea, selector) {
            var _this = this;
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.textarea = textarea;
            this.selector = selector;
            this.HasMenuBarButton = true;
            this.HasEditor = true;
            this.EditorUtil = new AssureNote.EditorUtil(AssureNoteApp, textarea, selector, {
                position: "fixed",
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            });
            CodeMirror.on(this.textarea, 'cursorActivity', function (doc) {
                return _this.MoveBackgroundNode(doc);
            });
        }
        FullScreenEditorPlugin.prototype.ExecCommand = function (AssureNoteApp, Args) {
            var Label;
            if (Args.length < 1) {
                Label = AssureNoteApp.MasterRecord.GetLatestDoc().TopNode.GetLabel();
            } else {
                Label = Args[0].toUpperCase();
            }
            var event = document.createEvent("UIEvents");
            var TargetView = AssureNoteApp.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                if (TargetView.GetNodeType() == GSNType.Strategy) {
                    AssureNoteApp.DebugP("Strategy " + Label + " cannot open FullScreenEditor.");
                    return;
                }
                var Writer = new StringWriter();
                TargetView.Model.FormatSubNode(1, Writer);
                this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
            } else {
                AssureNoteApp.DebugP(Label + " not found.");
            }
        };

        FullScreenEditorPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            var _this = this;
            if (NodeView.GetNodeType() == GSNType.Strategy) {
                return null;
            }
            return new AssureNote.MenuBarButton("fullscreeneditor-id", "images/editor.png", "fullscreeneditor", function (event, TargetView) {
                var Writer = new StringWriter();
                TargetView.Model.FormatSubNode(1, Writer);
                _this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
            });
        };

        /* This focuses on the node where the cursor of CodeMirror indicate */
        FullScreenEditorPlugin.prototype.MoveBackgroundNode = function (doc) {
            var UID = null;
            var line = doc.getCursor().line;
            while (line >= 0) {
                var LineString = doc.getLine(line);
                if (LineString.startsWith('*')) {
                    UID = WikiSyntax.ParseUID(LineString);
                    break;
                }
                line -= 1;
            }
            if (UID != null) {
                var Keys = Object.keys(this.AssureNoteApp.PictgramPanel.ViewMap);
                for (var i in Keys) {
                    var View = this.AssureNoteApp.PictgramPanel.ViewMap[Keys[i]];

                    if (View && View.Model && Lib.DecToHex(View.Model.UID) == UID) {
                        console.log(View.GetCenterGX() + ' ' + View.GetCenterGY());
                        this.AssureNoteApp.PictgramPanel.Viewport.SetCaseCenter(View.GetCenterGX(), View.GetCenterGY());
                    }
                }
            }
        };
        return FullScreenEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.FullScreenEditorPlugin = FullScreenEditorPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=FullScreenEditor.js.map
