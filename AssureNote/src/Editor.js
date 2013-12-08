///<reference path='./Plugin.ts'/>
var AssureNote;
(function (AssureNote) {
    var EditorUtil = (function () {
        function EditorUtil(AssureNoteApp, TextArea/*codemirror*/ , Selector, CSS) {
            this.AssureNoteApp = AssureNoteApp;
            this.TextArea = TextArea;
            this.Selector = Selector;
            this.CSS = CSS;
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
        EditorUtil.prototype.EnableEditor = function (WGSN, NodeView) {
            var _this = this;
            var Model = NodeView.Model;
            this.AssureNoteApp.PluginPanel.IsVisible = false;
            this.TextArea.setValue(WGSN);
            this.Element.css({ display: "block" }).on("keydown", function (e) {
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    if (!_this.StopEventFlag) {
                        _this.StopEventFlag = true;
                        _this.Element.blur();
                    }
                }
            }).on("blur", function (e) {
                e.stopPropagation();
                e.preventDefault();
                _this.DisableEditor(NodeView);
            });
            this.TextArea.refresh();
        };

        EditorUtil.prototype.FindMergeTopModel = function (Node, TargetLabel) {
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
        };

        EditorUtil.prototype.CopyNodeInfo = function (OriginNode, NewNode) {
            OriginNode.Digest = NewNode.Digest;
            OriginNode.NodeDoc = NewNode.NodeDoc;
            OriginNode.HasTag = NewNode.HasTag;
            OriginNode.TagMap = NewNode.TagMap;
        };

        EditorUtil.prototype.MergeModel = function (OriginNode, NewNode) {
            var MergeTopNode = this.FindMergeTopModel(OriginNode, NewNode.GetLabel());
            var MergeParentNode = MergeTopNode.ParentNode;
            for (var i = 0; i < MergeParentNode.NonNullSubNodeList().size(); i++) {
                var SubNode = MergeParentNode.NonNullSubNodeList().get(i);
                if (SubNode.Digest == MergeTopNode.Digest) {
                    MergeParentNode.SubNodeList[i] = NewNode;
                    NewNode.ParentNode = MergeParentNode;
                }
            }
        };

        EditorUtil.prototype.DisableEditor = function (OldNodeView) {
            var _this = this;
            var Node = OldNodeView.Model;
            var WGSN = this.TextArea.getValue();

            //var NewNode: GSNNode = Node.ReplaceSubNodeAsText(WGSN);
            var Reader = new StringReader(WGSN);
            var Parser = new ParserContext(null, null);
            var NewNode = Parser.ParseNode(Reader, null);
            this.AssureNoteApp.MasterRecord.OpenEditor("todo", "todo", null, "test");
            var TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
            if (TopGoal.GetLabel() == NewNode.GetLabel()) {
                this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal = NewNode;
                TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
            } else {
                this.MergeModel(TopGoal, NewNode);
            }

            //OldNodeView.Update(TopGoal, this.AssureNoteApp.PictgramPanel.ViewMap);
            this.AssureNoteApp.PictgramPanel.SetView(new AssureNote.NodeView(TopGoal, true));
            this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);

            this.AssureNoteApp.PluginPanel.IsVisible = true;
            this.AssureNoteApp.MasterRecord.CloseEditor();
            $(this.Selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            setTimeout(function () {
                _this.Element.removeClass();
                _this.Element.css({ display: "none" });
                _this.StopEventFlag = false;
            }, 1300);
            return null;
        };
        return EditorUtil;
    })();
    AssureNote.EditorUtil = EditorUtil;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
