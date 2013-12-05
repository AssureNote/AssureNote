///<reference path='./Plugin.ts'/>
var AssureNote;
(function (AssureNote) {
    var EditorUtil = (function () {
        function EditorUtil(textarea/*codemirror*/ , selector, CSS) {
            this.textarea = textarea;
            this.selector = selector;
            this.CSS = CSS;
            $(this.textarea.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            $(selector).css(CSS);
            //$(selector).css({ display: "none" });
        }
        EditorUtil.prototype.EnableEditorCallback = function () {
            $(this.selector).css({ display: "block" });
            return null;
        };

        EditorUtil.prototype.DisableEditorCallback = function () {
            return null;
        };
        return EditorUtil;
    })();
    AssureNote.EditorUtil = EditorUtil;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
