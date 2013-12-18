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

        private MakeMap(Node: GSNNode, NodeMap: { [index: string]: GSNNode }): void {
            NodeMap[Node.GetLabel()] = Node;
            for (var i = 0; i < Node.NonNullSubNodeList().length; i++) {
                var SubNode = Node.NonNullSubNodeList().get(i);
                this.MakeMap(SubNode, NodeMap);
            }
        }

        private CopyNodesInfo(OldNodeMap: { [index: string]: GSNNode },
            NewNodeMap: { [index: string]: GSNNode }, NewDoc: GSNDoc
            ): void {
                var NewNodeLabels = Object.keys(NewNodeMap);
                for (var j = 0; j < NewNodeLabels.length; j++) {
                    var Label = NewNodeLabels[j];
                    var NewNodeModel = NewNodeMap[Label];
                    var OldNodeModel = OldNodeMap[Label];
                    if (OldNodeMap[Label] != null) {
                        NewNodeModel.BaseDoc = OldNodeModel.BaseDoc;
                        NewNodeModel.Created = OldNodeModel.Created;
                        //NewNodeModel.GoalLevel = OldNodeModel.GoalLevel;
                        if (NewNodeModel.Digest == OldNodeModel.Digest) {
                            NewNodeModel.LastModified = OldNodeModel.LastModified;
                        } else {
                            NewNodeModel.LastModified = NewDoc.DocHistory;
                        }
                    } else {
                        NewNodeModel.BaseDoc = NewDoc;
                        NewNodeModel.Created = NewDoc.DocHistory;
                        //NewNodeModel.GoalLevel = NewNodeModel.ParentNode.GoalLevel; //FIXME
                        NewNodeModel.LastModified = NewDoc.DocHistory;
                    }
                }
        }

        private MergeModel(OriginNode: GSNNode, NewNode: GSNNode, NewDoc: GSNDoc): void {

            var OldNodeMap = <{ [index: string]: GSNNode }>{};
            this.MakeMap(OriginNode, OldNodeMap);
            var MergeTopNode = OldNodeMap[NewNode.GetLabel()];
            var MergeParentNode = MergeTopNode.ParentNode;

            var NewNodeMap = <{ [index: string]: GSNNode }>{};
            this.MakeMap(NewNode, NewNodeMap);

            for (var i = 0; i < MergeParentNode.SubNodeList.length; i++) {
                var SubNode = MergeParentNode.SubNodeList[i];
                if (SubNode.GetLabel() == MergeTopNode.GetLabel()) {
                    this.CopyNodesInfo(OldNodeMap, NewNodeMap, NewDoc);
                    MergeParentNode.SubNodeList[i] = NewNode;
                    NewNode.ParentNode = MergeParentNode;
                    return;
                }
            }
        }

        DisableEditor(OldNodeView: NodeView): void {
            var Node: GSNNode = OldNodeView.Model;
            var WGSN: string = (<any>this.TextArea).getValue();

            //TODO input user name
            this.AssureNoteApp.MasterRecord.OpenEditor("todo", "todo", null, "test");
            var NewNode: GSNNode = Node.ReplaceSubNodeAsText(WGSN);

            //var Reader: StringReader = new StringReader(WGSN);
            var NewDoc = this.AssureNoteApp.MasterRecord.EditingDoc;
            //var Parser: ParserContext = new ParserContext(null, null);
            //var NewNode = Parser.ParseNode(Reader, null);

            var TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
            if (TopGoal.GetLabel() == NewNode.GetLabel()) {
                var OldNodeMap = <{ [index: string]: GSNNode }>{};
                this.MakeMap(TopGoal, OldNodeMap);
                var NewNodeMap = <{ [index: string]: GSNNode }>{};
                this.MakeMap(NewNode, NewNodeMap);

                this.CopyNodesInfo(OldNodeMap, NewNodeMap, NewDoc);
                this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal = NewNode;
                TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
            } else {
                this.MergeModel(TopGoal, NewNode, NewDoc);
            }
            //OldNodeView.Update(TopGoal, this.AssureNoteApp.PictgramPanel.ViewMap);
            this.AssureNoteApp.PictgramPanel.SetView(new NodeView(TopGoal, true));
            this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);

            this.AssureNoteApp.PluginPanel.IsVisible = true;
            this.AssureNoteApp.MasterRecord.CloseEditor();

            /* TODO resolve conflict */
            this.AssureNoteApp.SocketManager.UpdateWGSN();

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
