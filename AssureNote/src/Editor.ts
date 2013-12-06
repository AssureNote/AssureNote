///<reference path='./Plugin.ts'/>

module AssureNote {
    export class EditorUtil {
        constructor(public AssureNoteApp: AssureNoteApp, public textarea: any/*codemirror*/, public selector: string, public CSS: any) {
            $(this.textarea.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            $(selector).css(CSS);
            $(selector).css({ display: "none" });
        }

        EnableEditor(WGSN: string, Node: GSNNode): void {
            this.AssureNoteApp.PluginPanel.IsVisible = false;
            this.textarea.setValue(WGSN);
            var self = this;
            $(this.selector).css({ display: "block" }).on("keydown", function (e: JQueryEventObject) {
                console.log("editor");
                console.log(e.keyCode);
                if (e.keyCode == 27 /* Esc */) {
                    e.stopPropagation();
                    $(self.selector).blur();
                }
            }).on("blur", function (e: JQueryEventObject) {
                e.stopPropagation();
                self.DisableEditor(Node);
            });
            this.textarea.refresh();
        }

        DisableEditor(Node: GSNNode): void {

            var WGSN: string = this.textarea.getValue();

            var NewNode: GSNNode = Node.ReplaceSubNodeAsText(WGSN);
            this.AssureNoteApp.PictgramPanel.Draw(NewNode.GetLabel(), null, null);

            this.AssureNoteApp.PluginPanel.IsVisible = true;
            $(this.selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            var self = this;
            setTimeout(function() {
                $(self.selector).removeClass();
                $(self.selector).css({ display: "none" });
            }, 1300);
            return null;
        }
    }
}
