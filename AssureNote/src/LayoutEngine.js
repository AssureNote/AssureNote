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
        LayoutEngine.prototype.DoLayout = function (PictgramPanel, NodeView, wx, wy) {
            //TODO
        };
        return LayoutEngine;
    })();
    AssureNote.LayoutEngine = LayoutEngine;

    AssureNote.DefaultMargin = 32;
    AssureNote.ContextMargin = 10;
    AssureNote.LevelMargin = 32;
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

        SimpleLayoutEngine.prototype.DoLayout = function (PictgramPanel, NodeView, wx, wy) {
            this.Layout(NodeView);

            var DivFragment = document.createDocumentFragment();
            var SvgNodeFragment = document.createDocumentFragment();
            var SvgConnectionFragment = document.createDocumentFragment();

            var list = Object.keys(PictgramPanel.ViewMap);
            for (var i = 0; i < list.length; i++) {
                var View = PictgramPanel.ViewMap[list[i]];
                View.Render(DivFragment, SvgNodeFragment, SvgConnectionFragment);
                //View.Resize();
            }

            PictgramPanel.ContentLayer.appendChild(DivFragment);
            PictgramPanel.SVGLayer.appendChild(SvgConnectionFragment);
            PictgramPanel.SVGLayer.appendChild(SvgNodeFragment);
        };

        SimpleLayoutEngine.prototype.Layout = function (ThisNode) {
            if (!ThisNode.IsVisible) {
                return;
            }
            var Shape = ThisNode.GetShape();
            var TreeLeftX = 0;
            var TreeWidth = this.GetNodeWidth(ThisNode);
            var TreeHeight = this.GetNodeHeight(ThisNode);
            if (ThisNode.Left != null) {
                var OffsetX = 0;
                var OffsetY = -AssureNote.ContextMargin;
                for (var i = 0; i < ThisNode.Left.length; i++) {
                    var SubNode = ThisNode.Left[i];
                    if (SubNode.IsVisible) {
                        OffsetY += AssureNote.ContextMargin;
                        SubNode.RelativeX = -(this.GetNodeWidth(SubNode) + AssureNote.DefaultMargin);
                        SubNode.RelativeY = OffsetY;
                        OffsetX = Math.max(0, this.GetNodeWidth(SubNode) + AssureNote.DefaultMargin);
                        OffsetY += this.GetNodeHeight(SubNode);
                    }
                }
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
                for (var i = 0; i < ThisNode.Right.length; i++) {
                    var SubNode = ThisNode.Right[i];
                    if (SubNode.IsVisible) {
                        OffsetY += AssureNote.ContextMargin;
                        SubNode.RelativeX = (this.GetNodeWidth(ThisNode) + AssureNote.DefaultMargin);
                        SubNode.RelativeY = OffsetY;
                        OffsetX = Math.max(0, AssureNote.DefaultMargin + this.GetNodeWidth(SubNode));
                        OffsetY += this.GetNodeHeight(SubNode);
                    }
                }
                if (OffsetY > 0) {
                    TreeWidth += OffsetX;
                    if (OffsetY > TreeHeight) {
                        TreeHeight = OffsetY;
                    }
                }
            }
            TreeHeight += AssureNote.LevelMargin;
            var ChildrenWidth = 0;
            var ChildrenHeight = 0;
            var VisibleChildCount = 0;
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                for (var i = 0; i < ThisNode.Children.length; i++) {
                    var SubNode = ThisNode.Children[i];
                    if (SubNode.IsVisible) {
                        this.Layout(SubNode);
                        var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                        var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                        SubNode.RelativeX = ChildrenWidth;
                        SubNode.RelativeY = TreeHeight;
                        ChildrenWidth += ChildTreeWidth + AssureNote.TreeMargin;
                        ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
                        VisibleChildCount++;
                    }
                }
                ChildrenWidth -= AssureNote.TreeMargin;

                var HeadWidth = VisibleChildCount == 1 ? TreeWidth : this.GetNodeWidth(ThisNode);
                var Shift = (ChildrenWidth - this.GetNodeWidth(ThisNode)) / 2;
                TreeLeftX = Math.min(TreeLeftX, -Shift);
                for (var i = 0; i < ThisNode.Children.length; i++) {
                    var SubNode = ThisNode.Children[i];
                    if (SubNode.IsVisible) {
                        SubNode.RelativeX -= Shift;
                        SubNode.RelativeX += -SubNode.Shape.GetTreeLeftX();
                    }
                }
            }
            Shape.SetTreeUpperLeft(TreeLeftX, 0);
            Shape.SetTreeSize(Math.max(ChildrenWidth, TreeWidth + -TreeLeftX), TreeHeight + ChildrenHeight);
            console.log(ThisNode.Label + ": " + (ThisNode.Shape).TreeBoundingBox.toString());
        };
        return SimpleLayoutEngine;
    })(LayoutEngine);
    AssureNote.SimpleLayoutEngine = SimpleLayoutEngine;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=LayoutEngine.js.map
