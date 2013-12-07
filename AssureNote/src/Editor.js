///<reference path='./Plugin.ts'/>
var AssureNote;
(function (AssureNote) {
    var EditorUtil = (function () {
        function EditorUtil(AssureNoteApp, TextArea/*codemirror*/ , Selector, CSS) {
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
            this.TextArea.setValue(WGSN);
            this.Element.css({ display: "block" }).on("keydown", function (e) {
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    $(_this.Selector).blur();
                }
            }).on("blur", function (e) {
                e.stopPropagation();
                _this.DisableEditor(NodeView);
            });
            this.TextArea.refresh();
        };

        EditorUtil.prototype.DisableEditor = function (OldNodeView) {
            var Node = OldNodeView.Model;
            var WGSN = this.TextArea.getValue();

            var NewNode = Node.ReplaceSubNodeAsText(WGSN);
            OldNodeView.Update(NewNode, this.AssureNoteApp.PictgramPanel.ViewMap);
            this.AssureNoteApp.PictgramPanel.Draw(this.AssureNoteApp.PictgramPanel.MasterView.Model.GetLabel(), null, null);

            this.AssureNoteApp.PluginPanel.IsVisible = true;
            $(this.Selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            var self = this;
            setTimeout(function () {
                $(self.Selector).removeClass();
                $(self.Selector).css({ display: "none" });
            }, 1300);
            return null;
        };
        return EditorUtil;
    })();
    AssureNote.EditorUtil = EditorUtil;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
