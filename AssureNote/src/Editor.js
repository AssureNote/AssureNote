///<reference path='./Plugin.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var EditorUtil = (function () {
        function EditorUtil(AssureNoteApp, TextArea, Selector, CSS) {
            this.AssureNoteApp = AssureNoteApp;
            this.TextArea = TextArea;
            this.Selector = Selector;
            this.CSS = CSS;
            $(this.TextArea.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            this.Element = $(Selector);
            this.Element.css(CSS);
            this.Element.css({ display: "none" });
        }
        EditorUtil.prototype.EnableEditor = function (WGSN, NodeView) {
            var _this = this;
            var Model = NodeView.Model;
            this.AssureNoteApp.PluginPanel.IsVisible = false;
            (this.TextArea).setValue(WGSN);
            this.TextArea.focus();
            this.Element.off("blur");
            this.Element.off("keydown");
            this.Element.css({ display: "block" }).on("keydown", function (e) {
                _this.TextArea.focus();
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    _this.Element.blur();
                }
            }).on("blur", function (e) {
                e.stopPropagation();
                e.preventDefault();
                _this.DisableEditor(NodeView);
            });
            this.TextArea.refresh();
        };

        EditorUtil.prototype.DisableEditor = function (OldNodeView) {
            var _this = this;
            var WGSN = (this.TextArea).getValue();

            //Create a new GSNDoc
            //TODO input user name
            this.AssureNoteApp.MasterRecord.OpenEditor("todo", "todo", null, "test");
            var Node = this.AssureNoteApp.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.GetLabel());
            var NewNode = Node.ReplaceSubNodeAsText(WGSN);
            console.log(NewNode);

            if (NewNode) {
                var TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
                var NewNodeView = new NodeView(TopGoal, true);
                NewNodeView.SaveFoldedFlag(this.AssureNoteApp.PictgramPanel.ViewMap);
                this.AssureNoteApp.PictgramPanel.SetView(NewNodeView);
                this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);

                this.AssureNoteApp.PluginPanel.IsVisible = true;

                /* TODO resolve conflict */
                this.AssureNoteApp.SocketManager.UpdateWGSN();
            }
            this.AssureNoteApp.MasterRecord.CloseEditor();
            $(this.Selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            setTimeout(function () {
                _this.Element.removeClass();
                _this.Element.css({ display: "none" });
                //this.StopEventFlag = false;
            }, 1300);
            return null;
        };
        return EditorUtil;
    })();
    AssureNote.EditorUtil = EditorUtil;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
