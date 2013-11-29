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
        LayoutEngine.prototype.DoLayout = function (PictgramPanel, Label, wx, wy) {
            //TODO
        };
        return LayoutEngine;
    })();
    AssureNote.LayoutEngine = LayoutEngine;

    var OldLayoutEngine = (function (_super) {
        __extends(OldLayoutEngine, _super);
        function OldLayoutEngine(AssureNoteApp) {
            _super.call(this, AssureNoteApp);
            this.AssureNoteApp = AssureNoteApp;
        }
        //FIXME Rename
        OldLayoutEngine.prototype.DoLayout = function (PictgramPanel, Label, wx, wy) {
            var Viewer = new AssureNote.CaseViewer(this.AssureNoteApp.Case, this.AssureNoteApp.OldPluginManager, new AssureNote.ServerAPI("", "", ""), PictgramPanel.ViewPort);
            Viewer.Draw();
            var TopView = Viewer.ViewMap[Viewer.ElementTop.Label];
            Viewer.Screen.SetCaseCenter(TopView.AbsX, TopView.AbsY, TopView.HTMLDoc);
        };
        return OldLayoutEngine;
    })(LayoutEngine);
    AssureNote.OldLayoutEngine = OldLayoutEngine;

    AssureNote.DefaultWidth = 96;
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
        SimpleLayoutEngine.prototype.GetHeight = function (Node) {
            return 72;
        };

        //var ChildView = this.ViewMap[Element.Children[i].Label];
        //if (ContextIndex == i) {
        //	var p1 = ParentView.GetAbsoluteConnectorPosition(Direction.Right);
        //	var p2 = ChildView.GetAbsoluteConnectorPosition(Direction.Left);
        //	var y = Math.min(p1.y, p2.y);
        //	p1.y = y;
        //	p2.y = y;
        //	ChildView.SetArrowPosition(p1, p2, Direction.Left);
        //	ChildView.IsArrowWhite = true;
        //} else {
        //	var p1 = ParentView.GetAbsoluteConnectorPosition(Direction.Bottom);
        //	var p2 = ChildView.GetAbsoluteConnectorPosition(Direction.Top);
        //	ChildView.SetArrowPosition(p1, p2, Direction.Bottom);
        //			}
        SimpleLayoutEngine.prototype.SetAbsolutePosition = function (NodeView, wx, wy) {
            NodeView.Shape.SetPosition(wx, wy);

            //NodeView.Shape.SetArrowPosition(
            var Children = NodeView.Children;
            if (Children == null) {
                return;
            }
            var x = wx;
            var y = wy + NodeView.Shape.Height;
            for (var i = 0; i < Children.length; i++) {
                this.SetAbsolutePosition(Children[i], x, y);
                x += Children[i].Shape.Width;
                var p1 = NodeView.GetAbsoluteConnectorPosition(AssureNote.Direction.Bottom);
                var p2 = Children[i].GetAbsoluteConnectorPosition(AssureNote.Direction.Top);
                Children[i].SetArrowPosition(p1, p2, AssureNote.Direction.Bottom);
            }
        };

        SimpleLayoutEngine.prototype.DoLayout = function (PictgramPanel, Label, wx, wy) {
            var NodeView = this.AssureNoteApp.GSNView.GetNode(Label);
            this.Layout(NodeView, NodeView.Shape);
            this.SetAbsolutePosition(NodeView, wx, wy);
        };

        SimpleLayoutEngine.prototype.Layout = function (ThisNode, Shape) {
            if (ThisNode.IsVisible) {
                var ParentWidth = AssureNote.DefaultWidth;
                var ParentHeight = this.GetHeight(ThisNode);
                if (ThisNode.Left != null) {
                    var OffsetGyLeft = 0;
                    for (var i = 0; i < ThisNode.Left.length; i++) {
                        var Node = ThisNode.Left[i];
                        if (Node.IsVisible) {
                            Node.OffsetGx = -(AssureNote.DefaultWidth + AssureNote.DefaultMargin);
                            Node.OffsetGy = OffsetGyLeft;
                            OffsetGyLeft + (Node.GetShape().GetHeight() + AssureNote.ContextMargin);
                        }
                    }
                    if (OffsetGyLeft > 0) {
                        ParentWidth += (AssureNote.DefaultWidth + AssureNote.DefaultMargin);
                        if (OffsetGyLeft > ParentHeight) {
                            ParentHeight = OffsetGyLeft;
                        }
                    }
                }
                if (ThisNode.Right != null) {
                    var OffsetGyRight = 0;
                    for (var i = 0; i < ThisNode.Right.length; i++) {
                        var Node = ThisNode.Right[i];
                        if (Node.IsVisible) {
                            Node.OffsetGx += (AssureNote.DefaultWidth + AssureNote.DefaultMargin);
                            Node.OffsetGy = OffsetGyRight;
                            OffsetGyRight + (Node.Shape.GetHeight() + AssureNote.ContextMargin);
                        }
                    }
                    if (OffsetGyRight > 0) {
                        ParentWidth += (AssureNote.DefaultWidth + AssureNote.DefaultMargin);
                        if (OffsetGyRight > ParentHeight) {
                            ParentHeight = OffsetGyRight;
                        }
                    }
                }
                var ChildrenWidth = 0;
                ParentHeight += AssureNote.LevelMargin;
                Shape.Height = ParentHeight;
                if (ThisNode.Children != null) {
                    for (var i = 0; i < ThisNode.Children.length; i++) {
                        var Node = ThisNode.Children[i];
                        if (Node.IsVisible) {
                            var SubShape = Node.GetShape();
                            this.Layout(Node, SubShape);
                            Node.OffsetGx = ChildrenWidth;
                            Node.OffsetGy = ParentHeight;
                            ChildrenWidth += (SubShape.Width + AssureNote.TreeMargin);
                            if (ParentHeight + SubShape.Height > Shape.Height) {
                                Shape.Height = ParentHeight + SubShape.Height;
                            }
                        }
                    }
                    for (var i = 0; i < ThisNode.Children.length; i++) {
                        var Node = ThisNode.Children[i];
                        if (Node.IsVisible) {
                            Node.OffsetGx -= (ChildrenWidth / 2);
                        }
                    }
                }
                Shape.Width = (ChildrenWidth > ParentWidth) ? ChildrenWidth : ParentWidth;
            }
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
