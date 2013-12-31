///<reference path='./Plugin.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>

module AssureNote {
    export class EditorUtil {
        Element: JQuery;

        constructor(public AssureNoteApp: AssureNoteApp, public TextArea: CodeMirror.Editor, public Selector: string, public CSS: any) {
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
            (<any>this.TextArea).setValue(WGSN);
            this.TextArea.focus();
            this.Element.off("blur");
            this.Element.off("keydown");
            this.Element.css({ display: "block" }).on("keydown", (e: JQueryEventObject) => {
                this.TextArea.focus();
                if (e.keyCode == 27 /* Esc */) {
                    e.stopPropagation();
                    this.Element.blur();
                }
            }).on("blur", (e: JQueryEventObject) => {
                e.stopPropagation();
                e.preventDefault();
                this.DisableEditor(NodeView);
            });
            this.TextArea.refresh();
        }

        DisableEditor(OldNodeView: NodeView): void {
            var WGSN: string = (<any>this.TextArea).getValue();

            //Create a new GSNDoc
            //TODO input user name
            this.AssureNoteApp.MasterRecord.OpenEditor("todo", "todo", null, "test");
            var Node: GSNNode = this.AssureNoteApp.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
            var NewNode: GSNNode = Node.ReplaceSubNodeAsText(WGSN);
            console.log(NewNode);

            if (NewNode) {
                var TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
                TopGoal.RenumberGoal(1, 2);
                var NewNodeView: NodeView = new NodeView(TopGoal, true);
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
            setTimeout(() => {
                this.Element.removeClass();
                this.Element.css({ display: "none" });
                //this.StopEventFlag = false;
            }, 1300);
            return null;
        }
    }
}
