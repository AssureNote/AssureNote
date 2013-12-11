var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var LayoutEngine = (function () {
        function LayoutEngine(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
        }
        //FIXME Rename
        LayoutEngine.prototype.DoLayout = function (PictgramPanel, NodeView) {
            //TODO
        };
        return LayoutEngine;
    })();
    AssureNote.LayoutEngine = LayoutEngine;

    var SimpleLayoutEngine = (function (_super) {
        __extends(SimpleLayoutEngine, _super);
        function SimpleLayoutEngine(AssureNoteApp) {
            _super.call(this, AssureNoteApp);
            this.AssureNoteApp = AssureNoteApp;
        }
        SimpleLayoutEngine.prototype.Render = function (ThisNode, DivFrag, SvgNodeFrag, SvgConnectionFrag) {
            var _this = this;
            if (ThisNode.IsVisible) {
                ThisNode.GetShape().PrerenderContent();
                ThisNode.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
                if (!ThisNode.IsFolded) {
                    ThisNode.ForEachVisibleAllSubNodes(function (SubNode) {
                        _this.Render(SubNode, DivFrag, SvgNodeFrag, SvgConnectionFrag);
                    });
                }
            }
        };

        SimpleLayoutEngine.prototype.DoLayout = function (PictgramPanel, NodeView) {
            var DivFragment = document.createDocumentFragment();
            var SvgNodeFragment = document.createDocumentFragment();
            var SvgConnectionFragment = document.createDocumentFragment();

            this.Render(NodeView, DivFragment, SvgNodeFragment, SvgConnectionFragment);

            PictgramPanel.ContentLayer.appendChild(DivFragment);
            PictgramPanel.SVGLayer.appendChild(SvgConnectionFragment);
            PictgramPanel.SVGLayer.appendChild(SvgNodeFragment);

            this.Layout(NodeView);
        };

        SimpleLayoutEngine.prototype.Layout = function (ThisNode) {
            var _this = this;
            if (!ThisNode.IsVisible) {
                return;
            }
            var Shape = ThisNode.GetShape();
            Shape.FitSizeToContent();
            var TreeLeftX = 0;
            var ThisNodeWidth = Shape.GetNodeWidth();
            var TreeWidth = ThisNodeWidth;
            var TreeHeight = Shape.GetNodeHeight();
            if (ThisNode.Left != null) {
                var OffsetX = 0;
                var OffsetY = -SimpleLayoutEngine.ContextMargin;
                ThisNode.ForEachVisibleLeftNodes(function (SubNode) {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += SimpleLayoutEngine.ContextMargin;
                    SubNode.RelativeX = -(SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.DefaultMargin);
                    OffsetY += SubNode.Shape.GetNodeHeight();
                });
                if (OffsetY > 0) {
                    TreeWidth += OffsetX;
                    TreeLeftX = -OffsetX;
                    if (OffsetY > TreeHeight) {
                        TreeHeight = OffsetY;
                    }
                }
            }
            if (ThisNode.Right != null) {
                var OffsetX = 0;
                var OffsetY = -SimpleLayoutEngine.ContextMargin;
                ThisNode.ForEachVisibleRightNodes(function (SubNode) {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += SimpleLayoutEngine.ContextMargin;
                    SubNode.RelativeX = (SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, SimpleLayoutEngine.DefaultMargin + SubNode.Shape.GetNodeWidth());
                    OffsetY += SubNode.Shape.GetNodeHeight();
                });
                if (OffsetY > 0) {
                    TreeWidth += OffsetX;
                    if (OffsetY > TreeHeight) {
                        TreeHeight = OffsetY;
                    }
                }
            }
            var HeadWidth = TreeWidth + -TreeLeftX;
            Shape.SetHeadSize(HeadWidth, TreeHeight);
            TreeHeight += SimpleLayoutEngine.LevelMargin;
            var ChildrenTopWidth = 0;
            var ChildrenBottomWidth = 0;
            var ChildrenHeight = 0;
            var FoldedNodeRun = [];
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                var IsLastChildFolded = false;
                ThisNode.ForEachVisibleChildren(function (SubNode) {
                    _this.Layout(SubNode);
                    var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                    var ChildHeadWidth = SubNode.Shape.GetHeadWidth();
                    var ChildHeadLeftSideMargin = -SubNode.Shape.GetTreeLeftX() + SubNode.Shape.GetHeadLeftX();
                    var ChildHeadRightX = ChildHeadLeftSideMargin + ChildHeadWidth;
                    var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                    var Margin = SimpleLayoutEngine.TreeMargin;

                    //var DoCompaction = true;
                    var IsUndeveloped = SubNode.Children == null || SubNode.Children.length == 0;
                    var IsFolded = SubNode.IsFolded || IsUndeveloped;

                    if (IsFolded) {
                        SubNode.RelativeX = ChildrenTopWidth;
                        ChildrenTopWidth = ChildrenTopWidth + SubNode.Shape.GetNodeWidth() + Margin;
                        FoldedNodeRun.push(SubNode);
                    } else {
                        if (IsLastChildFolded) {
                            var WidthDiff = ChildrenTopWidth - ChildrenBottomWidth;
                            if (WidthDiff < ChildHeadLeftSideMargin) {
                                SubNode.RelativeX = ChildrenBottomWidth;
                                ChildrenTopWidth = ChildrenBottomWidth + ChildHeadRightX + Margin;
                                ChildrenBottomWidth = ChildrenBottomWidth + ChildTreeWidth + Margin;
                                if (SubNode.RelativeX == 0) {
                                    for (var i = 0; i < FoldedNodeRun.length; i++) {
                                        FoldedNodeRun[i].RelativeX += ChildHeadLeftSideMargin - WidthDiff;
                                    }
                                } else {
                                    var FoldedRunMargin = (ChildHeadLeftSideMargin - WidthDiff) / (FoldedNodeRun.length + 1);
                                    for (var i = 0; i < FoldedNodeRun.length; i++) {
                                        FoldedNodeRun[i].RelativeX += FoldedRunMargin * (i + 1);
                                    }
                                }
                            } else {
                                SubNode.RelativeX = ChildrenTopWidth - ChildHeadLeftSideMargin;
                                ChildrenBottomWidth = ChildrenTopWidth + ChildTreeWidth - ChildHeadLeftSideMargin + Margin;
                                ChildrenTopWidth = ChildrenTopWidth + ChildHeadWidth + Margin;
                            }
                        } else {
                            var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth);
                            SubNode.RelativeX = ChildrenWidth;
                            ChildrenTopWidth = ChildrenWidth + ChildHeadRightX + Margin;
                            ChildrenBottomWidth = ChildrenWidth + ChildTreeWidth + Margin;
                        }
                        FoldedNodeRun = [];
                        SubNode.RelativeX += -SubNode.Shape.GetTreeLeftX();
                    }
                    SubNode.RelativeY = TreeHeight;

                    IsLastChildFolded = IsFolded;
                    ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
                    //console.log("T" + ChildrenTopWidth + ", B" + ChildrenBottomWidth);
                });

                var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth) - SimpleLayoutEngine.TreeMargin;
                var Shift = (ChildrenWidth - ThisNodeWidth) / 2;
                TreeLeftX = Math.min(TreeLeftX, -Shift);
                ThisNode.ForEachVisibleChildren(function (SubNode) {
                    SubNode.RelativeX -= Shift;
                });

                TreeHeight += ChildrenHeight;
                TreeWidth = Math.max(ChildrenWidth, HeadWidth);
            }
            Shape.SetTreeUpperLeft(TreeLeftX, 0);
            Shape.SetTreeSize(TreeWidth, TreeHeight);
            //console.log(ThisNode.Label + ": " + (<any>ThisNode.Shape).TreeBoundingBox.toString());
        };
        SimpleLayoutEngine.DefaultMargin = 32;
        SimpleLayoutEngine.ContextMargin = 10;
        SimpleLayoutEngine.LevelMargin = 64;
        SimpleLayoutEngine.TreeMargin = 12;
        return SimpleLayoutEngine;
    })(LayoutEngine);
    AssureNote.SimpleLayoutEngine = SimpleLayoutEngine;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=LayoutEngine.js.map
