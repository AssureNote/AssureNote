///<reference path='./Plugin.ts'/>
var AssureNote;
(function (AssureNote) {
    var EditorUtil = (function () {
        function EditorUtil(AssureNoteApp, textarea/*codemirror*/ , selector, CSS) {
            this.AssureNoteApp = AssureNoteApp;
            this.textarea = textarea;
            this.selector = selector;
            this.CSS = CSS;
            $(this.textarea.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            $(selector).css(CSS);
            $(selector).css({ display: "none" });
        }
        EditorUtil.prototype.EnableEditor = function (WGSN, Node) {
            this.AssureNoteApp.PluginPanel.IsVisible = false;
            this.textarea.setValue(WGSN);
            var self = this;
            $(this.selector).css({ display: "block" }).on("keydown", function (e) {
                console.log("editor");
                console.log(e.keyCode);
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    $(self.selector).blur();
                }
            }).on("blur", function (e) {
                e.stopPropagation();
                self.DisableEditor(Node);
            });
            this.textarea.refresh();
        };

        EditorUtil.prototype.DisableEditor = function (Node) {
            var WGSN = this.textarea.getValue();

            var NewNode = Node.ReplaceSubNodeAsText(WGSN);
            this.AssureNoteApp.PictgramPanel.Draw(NewNode.GetLabel(), null, null);

            this.AssureNoteApp.PluginPanel.IsVisible = true;
            $(this.selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            var self = this;
            setTimeout(function () {
                $(self.selector).removeClass();
                $(self.selector).css({ display: "none" });
            }, 1300);
            return null;
        };
        return EditorUtil;
    })();
    AssureNote.EditorUtil = EditorUtil;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
