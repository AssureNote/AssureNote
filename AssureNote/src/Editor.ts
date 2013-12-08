///<reference path='./Plugin.ts'/>

module AssureNote {
	export class EditorUtil {
		Element: JQuery;
		StopEventFlag: boolean;

		constructor(public AssureNoteApp: AssureNoteApp, public TextArea: any/*codemirror*/, public Selector: string, public CSS: any) {
			this.StopEventFlag = false;
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
					if (!this.StopEventFlag) {
						this.StopEventFlag = true;
						this.Element.blur();
					}
                }
            }).on("blur", (e: JQueryEventObject) => {
				e.stopPropagation();
				e.preventDefault();
                this.DisableEditor(NodeView);
            });
            this.TextArea.refresh();
        }

		private FindMergeTopModel(Node: GSNNode, TargetLabel: string): GSNNode {
			if (Node.GetLabel() == TargetLabel) {
				return Node;
			}
			for (var i = 0; i < Node.NonNullSubNodeList().size(); i++) {
				var SubNode = Node.NonNullSubNodeList().get(i);
				var FindNode = this.FindMergeTopModel(SubNode, TargetLabel);
				if (FindNode != null) {
					return FindNode;
				}
			}
		}

		private CopyNodeInfo(OriginNode: GSNNode, NewNode: GSNNode): void {
			OriginNode.Digest = NewNode.Digest;
			OriginNode.NodeDoc = NewNode.NodeDoc;
			OriginNode.HasTag = NewNode.HasTag;
			OriginNode.TagMap = NewNode.TagMap;
		}

		private MergeModel(OriginNode: GSNNode, NewNode: GSNNode): void {
			var MergeTopNode = this.FindMergeTopModel(OriginNode, NewNode.GetLabel());
			var MergeParentNode = MergeTopNode.ParentNode;
			for (var i = 0; i < MergeParentNode.NonNullSubNodeList().size(); i++) {
				var SubNode = MergeParentNode.NonNullSubNodeList().get(i);
				if (SubNode.Digest == MergeTopNode.Digest) {
					MergeParentNode.SubNodeList[i] = NewNode;
					NewNode.ParentNode = MergeParentNode;
				}
			}
		}

		DisableEditor(OldNodeView: NodeView): void {
            var Node: GSNNode = OldNodeView.Model;
            var WGSN: string = this.TextArea.getValue();

            //var NewNode: GSNNode = Node.ReplaceSubNodeAsText(WGSN);
			var Reader: StringReader = new StringReader(WGSN);
			var Parser: ParserContext = new ParserContext(null, null);
			var NewNode = Parser.ParseNode(Reader, null);
			this.AssureNoteApp.MasterRecord.OpenEditor("todo", "todo", null, "test"); //FIXME input user name
			var TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
			if (TopGoal.GetLabel() == NewNode.GetLabel()) {
				this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal = NewNode;
				TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
			} else {
				this.MergeModel(TopGoal, NewNode);
			}
            //OldNodeView.Update(TopGoal, this.AssureNoteApp.PictgramPanel.ViewMap);
			this.AssureNoteApp.PictgramPanel.SetView(new NodeView(TopGoal, true));
			this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);

			this.AssureNoteApp.PluginPanel.IsVisible = true;
			this.AssureNoteApp.MasterRecord.CloseEditor();
            $(this.Selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            setTimeout(() => {
                this.Element.removeClass();
				this.Element.css({ display: "none" });
				this.StopEventFlag = false;
            }, 1300);
            return null;
        }
    }
}
