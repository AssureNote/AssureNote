///<reference path='PluginManager.ts'/>
///<reference path='CaseViewer.ts'/>
///<reference path='CaseModel.ts'/>
///<reference path='Api.ts'/>
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

    //export class OldLayoutEngine extends LayoutEngine {
    //	constructor(public AssureNoteApp: AssureNoteApp) {
    //		super(AssureNoteApp);
    //	}
    //	//FIXME Rename
    //	DoLayout(PictgramPanel: PictgramPanel, Label: string, wx: number, wy: number) {
    //		var Viewer = new CaseViewer(this.AssureNoteApp.Case, this.AssureNoteApp.OldPluginManager, new ServerAPI("", "", ""), PictgramPanel.ViewPort);
    //		Viewer.Draw();
    //		var TopView = Viewer.ViewMap[Viewer.ElementTop.Label];
    //		Viewer.Screen.SetCaseCenter(TopView.AbsX, TopView.AbsY, TopView.HTMLDoc);
    //	}
    //}
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
            var DivFragment = document.createDocumentFragment();
            var SvgNodeFragment = document.createDocumentFragment();
            var SvgConnectionFragment = document.createDocumentFragment();

            var list = Object.keys(PictgramPanel.ViewMap);
            for (var i = 0; i < list.length; i++) {
                var View = PictgramPanel.ViewMap[list[i]];
                View.GetShape().PrerenderContent();
                View.Render(DivFragment, SvgNodeFragment, SvgConnectionFragment);
            }

            PictgramPanel.ContentLayer.appendChild(DivFragment);
            PictgramPanel.SVGLayer.appendChild(SvgConnectionFragment);
            PictgramPanel.SVGLayer.appendChild(SvgNodeFragment);
            this.Layout(NodeView);
        };

        SimpleLayoutEngine.prototype.Layout = function (ThisNode) {
            if (!ThisNode.IsVisible) {
                return;
            }
            var Shape = ThisNode.GetShape();
            Shape.Resize();

            //Shape.PrerenderContent();
            var TreeLeftX = 0;
            var TreeWidth = this.GetNodeWidth(ThisNode);
            var TreeHeight = this.GetNodeHeight(ThisNode);
            if (ThisNode.Left != null) {
                var OffsetX = 0;
                var OffsetY = -AssureNote.ContextMargin;
                for (var i = 0; i < ThisNode.Left.length; i++) {
                    var SubNode = ThisNode.Left[i];
                    if (SubNode.IsVisible) {
                        SubNode.GetShape().Resize();
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
                        SubNode.GetShape().Resize();
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

    //Deperecated
    var LayoutPortrait = (function () {
        function LayoutPortrait(ViewMap, Element, x, y, ElementWidth) {
            this.ElementWidth = 50;
            this.X_MARGIN = 200;
            this.Y_MARGIN = 150;
            this.Y_ADJUSTMENT_MARGIN = 50;
            this.Y_NODE_MARGIN = 205;
            this.Y_NODE_ADJUSTMENT_MARGIN = 70;
            this.X_CONTEXT_MARGIN = 200;
            this.X_OVER_MARGIN = 700;
            this.X_FOOT_MARGIN = 100;
            this.X_MULTI_ELEMENT_MARGIN = 20;
            this.footelement = [];
            this.contextId = -1;
            this.footelement = [];
            this.contextId = -1;
            this.ElementWidth = ElementWidth;
            this.ViewMap = ViewMap;
            this.ViewMap[Element.Label].AbsY += y;
            this.X_MARGIN = ElementWidth + 50;
            this.X_CONTEXT_MARGIN = ElementWidth + 50;
        }
        LayoutPortrait.prototype.LayoutAllView = function (Element, x, y) {
            this.Traverse(Element, x, y);
            this.SetFootElementPosition();
            this.SetAllElementPosition(Element);
        };

        LayoutPortrait.prototype.UpdateContextElementPosition = function (ContextElement) {
            var ContextView = this.ViewMap[ContextElement.Label];
            var ParentView = ContextView.ParentShape;
            ContextView.IsArrowWhite = true;
            ContextView.AbsX = (ParentView.AbsX + this.X_CONTEXT_MARGIN);
            if (ParentView.Source.Type == AssureNote.NodeType.Evidence) {
                var ContextHeight = ContextView.HTMLDoc.Height;
                var ParentHeight = ParentView.HTMLDoc.Height;
                var HeightDiffAve = (ParentHeight - ContextHeight) / 2;
                ContextView.AbsY = ParentView.AbsY + HeightDiffAve;
            } else {
                ContextView.AbsY = ParentView.AbsY;
            }
        };

        LayoutPortrait.prototype.SetAllElementPosition = function (Element) {
            var n = Element.Children.length;
            var ParentView = this.ViewMap[Element.Label];
            var ContextIndex = Element.GetContextIndex();
            if (n == 0) {
                if (Element.Type == AssureNote.NodeType.Goal) {
                    (ParentView.SVGShape).SetUndevelolpedSymbolPosition(ParentView.GetAbsoluteConnectorPosition(AssureNote.Direction.Bottom));
                }
                return;
            }

            if (n == 1 && ContextIndex == 0) {
                this.UpdateContextElementPosition(Element.Children[0]);
            } else {
                var xPositionSum = 0;

                for (var i = 0; i < n; i++) {
                    this.SetAllElementPosition(Element.Children[i]);
                    if (ContextIndex != i) {
                        xPositionSum += this.ViewMap[Element.Children[i].Label].AbsX;
                    }
                }

                if (ContextIndex == -1) {
                    ParentView.AbsX = xPositionSum / n;
                } else {
                    ParentView.AbsX = xPositionSum / (n - 1);
                    this.UpdateContextElementPosition(Element.Children[ContextIndex]);
                }
            }

            for (var i = 0; i < n; i++) {
                var ChildView = this.ViewMap[Element.Children[i].Label];
                if (ContextIndex == i) {
                    var p1 = ParentView.GetAbsoluteConnectorPosition(AssureNote.Direction.Right);
                    var p2 = ChildView.GetAbsoluteConnectorPosition(AssureNote.Direction.Left);
                    var y = Math.min(p1.y, p2.y);
                    p1.y = y;
                    p2.y = y;
                    ChildView.SetArrowPosition(p1, p2, AssureNote.Direction.Left);
                    ChildView.IsArrowWhite = true;
                } else {
                    var p1 = ParentView.GetAbsoluteConnectorPosition(AssureNote.Direction.Bottom);
                    var p2 = ChildView.GetAbsoluteConnectorPosition(AssureNote.Direction.Top);
                    ChildView.SetArrowPosition(p1, p2, AssureNote.Direction.Bottom);
                }
            }
        };

        LayoutPortrait.prototype.CalculateMinPosition = function (ElementList) {
            if (ElementList[0].Type == AssureNote.NodeType.Context) {
                var xPosition = this.ViewMap[ElementList[1].Label].AbsX;
            } else {
                var xPosition = this.ViewMap[ElementList[0].Label].AbsX;
            }
            var xPosition = this.ViewMap[ElementList[0].Label].AbsX;
            var n = ElementList.length;
            for (var i = 0; i < n; i++) {
                if (ElementList[i].Type == AssureNote.NodeType.Context) {
                    continue;
                }
                if (xPosition > this.ViewMap[ElementList[i].Label].AbsX) {
                    xPosition = this.ViewMap[ElementList[i].Label].AbsX;
                }
            }
            return xPosition;
        };

        LayoutPortrait.prototype.CalculateMaxPosition = function (ElementList) {
            if (ElementList[0].Type == AssureNote.NodeType.Context) {
                var xPosition = this.ViewMap[ElementList[1].Label].AbsX;
            } else {
                var xPosition = this.ViewMap[ElementList[0].Label].AbsX;
            }

            var n = ElementList.length;
            for (var i = 0; i < n; i++) {
                var ChildView = this.ViewMap[ElementList[i].Label];
                if (ElementList[i].Type == AssureNote.NodeType.Context) {
                    continue;
                }
                if (xPosition < ChildView.AbsX) {
                    xPosition = ChildView.AbsX;
                }
            }
            return xPosition;
        };

        LayoutPortrait.prototype.GetSameParentLabel = function (PreviousNodeView, CurrentNodeView) {
            var PreviousParentShape = PreviousNodeView.ParentShape;
            var CurrentParentShape = CurrentNodeView.ParentShape;
            var PreviousParentArray = [];
            var CurrentParentArray = [];

            while (PreviousParentShape != null) {
                PreviousParentArray.push(PreviousParentShape.Source.Label);
                PreviousParentShape = PreviousParentShape.ParentShape;
            }
            while (CurrentParentShape != null) {
                CurrentParentArray.push(CurrentParentShape.Source.Label);
                CurrentParentShape = CurrentParentShape.ParentShape;
            }
            var PreviousParentLength = PreviousParentArray.length;
            var CurrentParentLength = CurrentParentArray.length;
            for (var i = 0; i < PreviousParentLength; i++) {
                for (var j = 0; j < CurrentParentLength; j++) {
                    if (PreviousParentArray[i] == CurrentParentArray[j]) {
                        return PreviousParentArray[i];
                    }
                }
            }
            return null;
        };

        LayoutPortrait.prototype.HasContextinParentNode = function (PreviousNodeView, SameParentLabel) {
            var PreviousParentShape = PreviousNodeView.ParentShape;
            while (PreviousParentShape != null) {
                if (PreviousParentShape.Source.Label == SameParentLabel) {
                    break;
                }
                if (PreviousParentShape.Source.GetContextIndex() != -1) {
                    return true;
                }
                PreviousParentShape = PreviousParentShape.ParentShape;
            }
            return false;
        };

        LayoutPortrait.prototype.SetFootElementPosition = function () {
            var n = this.footelement.length;
            for (var i = 0; i < n; i++) {
                var PreviousNodeView = this.ViewMap[this.footelement[i - 1]];
                var CurrentNodeView = this.ViewMap[this.footelement[i]];
                CurrentNodeView.AbsX = 0;
                if (i != 0) {
                    var SameParentLabel = this.GetSameParentLabel(PreviousNodeView, CurrentNodeView);
                    var HasContext = this.HasContextinParentNode(PreviousNodeView, SameParentLabel);
                    if ((PreviousNodeView.ParentShape.Source.Label != CurrentNodeView.ParentShape.Source.Label) && HasContext) {
                        var PreviousParentChildren = PreviousNodeView.ParentShape.Source.Children;
                        var Min_xPosition = this.CalculateMinPosition(PreviousParentChildren);
                        var Max_xPosition = this.CalculateMaxPosition(PreviousParentChildren);
                        var HalfChildrenWidth = (Max_xPosition - Min_xPosition) / 2;
                        if (HalfChildrenWidth > (this.X_CONTEXT_MARGIN - this.X_MULTI_ELEMENT_MARGIN)) {
                            CurrentNodeView.AbsX += this.X_MULTI_ELEMENT_MARGIN;
                        } else {
                            CurrentNodeView.AbsX += this.X_CONTEXT_MARGIN - HalfChildrenWidth;
                        }
                    }
                    if (PreviousNodeView.Source.GetContextIndex() != -1 && (CurrentNodeView.AbsX - PreviousNodeView.AbsX) < this.X_MARGIN) {
                        CurrentNodeView.AbsX += this.X_MARGIN;
                    }

                    CurrentNodeView.AbsX += (PreviousNodeView.AbsX + this.X_MARGIN);
                    if (CurrentNodeView.AbsX - PreviousNodeView.AbsX > this.X_OVER_MARGIN) {
                        CurrentNodeView.AbsX -= this.X_MARGIN;
                    }
                }
            }
            return;
        };

        LayoutPortrait.prototype.Traverse = function (Element, x, y) {
            if ((Element.Children.length == 0 && Element.Type != AssureNote.NodeType.Context) || (Element.Children.length == 1 && Element.Children[0].Type == AssureNote.NodeType.Context)) {
                this.footelement.push(Element.Label);
                return;
            }

            var i = 0;
            i = Element.GetContextIndex();
            if (i != -1) {
                var ContextView = this.ViewMap[Element.Children[i].Label];
                var ParentView = ContextView.ParentShape;
                var h1 = ContextView.HTMLDoc.Height;
                var h2 = ParentView.HTMLDoc.Height;
                var h = (h1 - h2) / 2;
                ContextView.AbsX += x;
                ContextView.AbsY += (y - h);
                ContextView.AbsX += this.X_CONTEXT_MARGIN;
                this.EmitChildrenElement(Element, ParentView.AbsX, ParentView.AbsY, i, ((this.Y_MARGIN > Math.abs(h1 - h2)) ? h2 : Math.abs(h1 - h2)));
            } else {
                var h2 = 0;
                var CurrentView = this.ViewMap[Element.Label];
                h2 = CurrentView.HTMLDoc.Height;
                this.EmitChildrenElement(Element, x, y, i, h2);
            }
        };

        LayoutPortrait.prototype.EmitChildrenElement = function (Node, x, y, ContextId, h) {
            var n = Node.Children.length;
            var MaxYPostition = 0;
            for (var i = 0; i < n; i++) {
                var ElementView = this.ViewMap[Node.Children[i].Label];
                var j = Node.Children[i].GetContextIndex();
                var ContextHeight = 0;
                if (j != -1) {
                    ContextHeight = this.ViewMap[Node.Children[i].Children[j].Label].HTMLDoc.Height;
                }
                if (ContextId == i) {
                    continue;
                } else {
                    var height = (ContextHeight > ElementView.HTMLDoc.Height) ? ContextHeight : ElementView.HTMLDoc.Height;
                    var ParentElementView = this.ViewMap[Node.Label];
                    ElementView.AbsY = y;
                    ElementView.AbsY = y + this.Y_MARGIN + h;
                    MaxYPostition = (ElementView.AbsY > MaxYPostition) ? ElementView.AbsY : MaxYPostition;
                    this.Traverse(Node.Children[i], ElementView.AbsX, ElementView.AbsY);
                }
            }
            for (var i = 0; i < n; i++) {
                var ElementView = this.ViewMap[Node.Children[i].Label];
                if (ContextId == i) {
                    continue;
                } else {
                    ElementView.AbsY = MaxYPostition;
                }
            }
            return;
        };
        return LayoutPortrait;
    })();
    AssureNote.LayoutPortrait = LayoutPortrait;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=LayoutEngine.js.map
