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

    AssureNote.DefaultMargin = 32;
    AssureNote.ContextMargin = 10;
    AssureNote.LevelMargin = 64;
    AssureNote.TreeMargin = 12;

    var SimpleLayoutEngine = (function (_super) {
        __extends(SimpleLayoutEngine, _super);
        function SimpleLayoutEngine(AssureNoteApp) {
            _super.call(this, AssureNoteApp);
            this.AssureNoteApp = AssureNoteApp;
        }
        SimpleLayoutEngine.prototype.GetNodeWidth = function (Node) {
            return Node.GetShape().GetNodeWidth();
        };

        SimpleLayoutEngine.prototype.GetNodeHeight = function (Node) {
            return Node.GetShape().GetNodeHeight();
        };

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
            var TreeWidth = this.GetNodeWidth(ThisNode);
            var TreeHeight = this.GetNodeHeight(ThisNode);
            if (ThisNode.Left != null) {
                var OffsetX = 0;
                var OffsetY = -AssureNote.ContextMargin;
                ThisNode.ForEachVisibleLeftNodes(function (SubNode) {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += AssureNote.ContextMargin;
                    SubNode.RelativeX = -(_this.GetNodeWidth(SubNode) + AssureNote.DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, _this.GetNodeWidth(SubNode) + AssureNote.DefaultMargin);
                    OffsetY += _this.GetNodeHeight(SubNode);
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
                var OffsetY = -AssureNote.ContextMargin;
                ThisNode.ForEachVisibleRightNodes(function (SubNode) {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += AssureNote.ContextMargin;
                    SubNode.RelativeX = (_this.GetNodeWidth(ThisNode) + AssureNote.DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, AssureNote.DefaultMargin + _this.GetNodeWidth(SubNode));
                    OffsetY += _this.GetNodeHeight(SubNode);
                });
                if (OffsetY > 0) {
                    TreeWidth += OffsetX;
                    if (OffsetY > TreeHeight) {
                        TreeHeight = OffsetY;
                    }
                }
            }
<<<<<<< HEAD
            TreeHeight += SimpleLayoutEngine.LevelMargin;

=======
            TreeHeight += AssureNote.LevelMargin;
>>>>>>> parent of e436183... move mergen constants to static field
            var ChildrenWidth = 0;
            var ChildrenHeight = 0;
            var VisibleChildCount = 0;
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                var TopRightX = 0;
                var BottomRightX = 0;
                ThisNode.ForEachVisibleChildren(function (SubNode) {
                    _this.Layout(SubNode);
                    var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                    SubNode.RelativeY = TreeHeight;
<<<<<<< HEAD
=======
                    ChildrenWidth += ChildTreeWidth + AssureNote.TreeMargin;
>>>>>>> parent of e436183... move mergen constants to static field
                    ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
                    var ChildNodeWidth = SubNode.Shape.GetNodeWidth();
                    var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                    if (SubNode.IsFolded || SubNode.Children != null) {
                        SubNode.RelativeX = TopRightX;
                        TopRightX += ChildTreeWidth + SimpleLayoutEngine.TreeMargin;
                    } else {
                        var TopLeftWidth = (SubNode.Left != null) ? ChildNodeWidth : 0;
                        TopLeftWidth += SimpleLayoutEngine.ContextMargin;
                        if (TopRightX + ChildNodeWidth > BottomRightX + (ChildTreeWidth / 2)) {
                            BottomRightX = TopRightX;
                        }
                        SubNode.RelativeX = BottomRightX;
                        TopRightX = BottomRightX;
                        BottomRightX += ChildTreeWidth + SimpleLayoutEngine.TreeMargin;
                        var TopWidth = ChildNodeWidth;
                        if (SubNode.Left != null) {
                            TopWidth += ChildNodeWidth + SimpleLayoutEngine.ContextMargin;
                        }
                        if (SubNode.Left != null) {
                            TopWidth += ChildNodeWidth + SimpleLayoutEngine.ContextMargin;
                        }
                        TopRightX = BottomRightX - TopWidth;
                    }
                    VisibleChildCount++;
                });
<<<<<<< HEAD
                ChildrenWidth = Math.max(TopRightX, BottomRightX);
=======
                ChildrenWidth -= AssureNote.TreeMargin;

>>>>>>> parent of e436183... move mergen constants to static field
                var HeadWidth = VisibleChildCount == 1 ? TreeWidth : this.GetNodeWidth(ThisNode);
                var Shift = (ChildrenWidth - this.GetNodeWidth(ThisNode)) / 2;
                TreeLeftX = Math.min(TreeLeftX, -Shift);
                ThisNode.ForEachVisibleChildren(function (SubNode) {
                    SubNode.RelativeX -= Shift;
                    SubNode.RelativeX += -SubNode.Shape.GetTreeLeftX();
                });
            }

            //var ChildrenWidth = 0;
            //var ChildrenHeight = 0;
            //var VisibleChildCount = 0;
            //if (ThisNode.Children != null && ThisNode.Children.length > 0) {
            //    ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
            //        this.Layout(SubNode);
            //        var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
            //        var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
            //        SubNode.RelativeX = ChildrenWidth;
            //        SubNode.RelativeY = TreeHeight;
            //        ChildrenWidth += ChildTreeWidth + SimpleLayoutEngine.TreeMargin;
            //        ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
            //        VisibleChildCount++;
            //    });
            //    ChildrenWidth -= SimpleLayoutEngine.TreeMargin;
            //    // FIXME: compaction algorithm
            //    for (var i = 0; i < ThisNode.Children.length - 1; i++) {
            //        var LeftSubNode = ThisNode.Children[i];
            //        if (LeftSubNode.IsFolded) {
            //            LeftSubNode
            //        }
            //        var RightSubNode = ThisNode.Children[i + 1];
            //        LeftSubNode.Shape.GetTreeWidth();
            //        if (LeftSubNode.IsFolded == RightSubNode.IsFolded) {
            //            continue;
            //        }
            //        if (LeftSubNode.IsFolded) {
            //            var W = RightSubNode.GetShape().GetNodeWidth();
            //            if (RightSubNode.Left != null) {
            //                W = W * 1.5 + SimpleLayoutEngine.ContextMargin;
            //            } else {
            //                W += SimpleLayoutEngine.ContextMargin;
            //            }
            //            var Shift = RightSubNode.GetShape().GetTreeWidth() / 2 - W;
            //            for (var j = i + 1; j < ThisNode.Children.length; j++) {
            //                ThisNode.Children[j].RelativeX -= Shift;
            //            }
            //            //ChildrenWidth -= Shift;
            //        }
            //        if (RightSubNode.IsFolded) {
            //            var W = LeftSubNode.GetShape().GetNodeWidth();
            //            if (LeftSubNode.Right != null) {
            //                W = W * 1.5 + SimpleLayoutEngine.ContextMargin;
            //            } else {
            //                W += SimpleLayoutEngine.ContextMargin;
            //            }
            //            var Shift = RightSubNode.GetShape().GetTreeWidth() / 2 - W;
            //            for (var j = i + 1; j < ThisNode.Children.length; j++) {
            //                ThisNode.Children[j].RelativeX += Shift;
            //            }
            //            //ChildrenWidth -= Shift;
            //        }
            //    }
            //    var HeadWidth = VisibleChildCount == 1 ? TreeWidth : this.GetNodeWidth(ThisNode);
            //    var Shift = (ChildrenWidth - this.GetNodeWidth(ThisNode)) / 2;
            //    TreeLeftX = Math.min(TreeLeftX, -Shift);
            //    ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
            //        SubNode.RelativeX -= Shift;
            //        SubNode.RelativeX += -SubNode.Shape.GetTreeLeftX();
            //    });
            //}
            Shape.SetTreeUpperLeft(TreeLeftX, 0);
            Shape.SetTreeSize(Math.max(ChildrenWidth, TreeWidth + -TreeLeftX), TreeHeight + ChildrenHeight);
            console.log(ThisNode.Label + ": " + (ThisNode.Shape).TreeBoundingBox.toString());
        };
        return SimpleLayoutEngine;
    })(LayoutEngine);
    AssureNote.SimpleLayoutEngine = SimpleLayoutEngine;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=LayoutEngine.js.map
