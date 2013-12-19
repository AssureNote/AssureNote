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

        //Deprecated!!
        EditorUtil.prototype.MakeMap = function (Node, NodeMap) {
            NodeMap[Node.GetLabel()] = Node;
            for (var i = 0; i < Node.NonNullSubNodeList().length; i++) {
                var SubNode = Node.NonNullSubNodeList().get(i);
                this.MakeMap(SubNode, NodeMap);
            }
        };

        //Deprecated!!
        EditorUtil.prototype.CopyNodesInfo = function (OldNodeMap, NewNodeMap, NewDoc) {
            var NewNodeLabels = Object.keys(NewNodeMap);
            for (var j = 0; j < NewNodeLabels.length; j++) {
                var Label = NewNodeLabels[j];
                var NewNodeModel = NewNodeMap[Label];
                var OldNodeModel = OldNodeMap[Label];
                if (OldNodeMap[Label] != null) {
                    NewNodeModel.BaseDoc = OldNodeModel.BaseDoc;
                    NewNodeModel.Created = OldNodeModel.Created;

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
        };

        //Deprecated!!
        EditorUtil.prototype.MergeModel = function (OriginNode, NewNode, NewDoc) {
            var OldNodeMap = {};
            this.MakeMap(OriginNode, OldNodeMap);
            var MergeTopNode = OldNodeMap[NewNode.GetLabel()];
            var MergeParentNode = MergeTopNode.ParentNode;

            var NewNodeMap = {};
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
        };

        EditorUtil.prototype.DisableEditor = function (OldNodeView) {
            var _this = this;
            var WGSN = (this.TextArea).getValue();

            //Create a new GSNDoc
            //TODO input user name
            this.AssureNoteApp.MasterRecord.OpenEditor("todo", "todo", null, "test");
            var Node = this.AssureNoteApp.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.GetLabel());
            var NewNode = Node.ReplaceSubNodeAsText(WGSN);

            var TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopGoal;
            var NewNodeView = new AssureNote.NodeView(TopGoal, true);
            NewNodeView.SaveFoldedFlag(this.AssureNoteApp.PictgramPanel.ViewMap);
            this.AssureNoteApp.PictgramPanel.SetView(NewNodeView);
            this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);

            this.AssureNoteApp.PluginPanel.IsVisible = true;
            this.AssureNoteApp.MasterRecord.CloseEditor();

            /* TODO resolve conflict */
            this.AssureNoteApp.SocketManager.UpdateWGSN();

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
