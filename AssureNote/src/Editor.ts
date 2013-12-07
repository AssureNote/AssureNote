///<reference path='./Plugin.ts'/>

module AssureNote {
	export class EditorUtil {
		Element: JQuery;
        constructor(public AssureNoteApp: AssureNoteApp, public TextArea: any/*codemirror*/, public Selector: string, public CSS: any) {
            $(this.TextArea.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
			});
			this.Element = $(Selector);
            this.Element.css(CSS);
            this.Element.css({ display: "none" });
        }

        EnableEditor(WGSN: string, NodeView: NodeView): void {
            var Model = NodeView.Model;
            this.AssureNoteApp.PluginPanel.IsVisible = false;
            this.TextArea.setValue(WGSN);
            this.Element.css({ display: "block" }).on("keydown", (e: JQueryEventObject) => {
                //this.AssureNoteApp.DebugP("editor");
                //this.AssureNoteApp.DebugP(e.keyCode);
                if (e.keyCode == 27 /* Esc */) {
                    e.stopPropagation();
                    $(this.Selector).blur();
                }
            }).on("blur", (e: JQueryEventObject) => {
                e.stopPropagation();
                this.DisableEditor(NodeView);
            });
            this.TextArea.refresh();
        }

        DisableEditor(OldNodeView: NodeView): void {
            var Node: GSNNode = OldNodeView.Model;
            var WGSN: string = this.TextArea.getValue();

            var NewNode: GSNNode = Node.ReplaceSubNodeAsText(WGSN);
            OldNodeView.Update(NewNode, this.AssureNoteApp.PictgramPanel.ViewMap);
            this.AssureNoteApp.PictgramPanel.Draw(this.AssureNoteApp.PictgramPanel.MasterView.Model.GetLabel(), null, null);

            this.AssureNoteApp.PluginPanel.IsVisible = true;
            $(this.Selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            var self = this;
            setTimeout(function() {
                $(self.Selector).removeClass();
                $(self.Selector).css({ display: "none" });
            }, 1300);
            return null;
        }
    }
}
