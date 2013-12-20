///<reference path='./AssureNote.ts'/>
///<reference path='./AssureNoteUtils.ts'/>
///<reference path='./CommandLine.ts'/>
///<reference path='./SearchNode.ts'/>
///<reference path='./LayoutEngine.ts'/>
///<reference path='./Editor.ts'/>
///<reference path='./GSNShape.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>
///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>
var AssureNote;
(function (AssureNote) {
    var NodeView = (function () {
        function NodeView(Model, IsRecursive) {
            this.Model = Model;
            this.RelativeX = 0;
            this.RelativeY = 0;
            this.Left = null;
            this.Right = null;
            this.Children = null;
            this.Shape = null;
            this.Label = Model.GetLabel();
            this.NodeDoc = Model.NodeDoc;
            this.IsVisible = true;
            this.IsFolded = false;
            if (IsRecursive && Model.SubNodeList != null) {
                for (var i = 0; i < Model.SubNodeList.length; i++) {
                    var SubNode = Model.SubNodeList[i];
                    var SubView = new NodeView(SubNode, IsRecursive);
                    if (SubNode.NodeType == GSNType.Context) {
                        // Layout Engine allowed to move a node left-side
                        this.AppendRightNode(SubView);
                    } else {
                        this.AppendChild(SubView);
                    }
                }
            }
        }
        NodeView.prototype.UpdateViewMap = function (ViewMap) {
            ViewMap[this.Label] = this;
            if (this.Left != null) {
                for (var i = 0; i < this.Left.length; i++) {
                    this.Left[i].UpdateViewMap(ViewMap);
                }
            }
            if (this.Right != null) {
                for (var i = 0; i < this.Right.length; i++) {
                    this.Right[i].UpdateViewMap(ViewMap);
                }
            }
            if (this.Children != null) {
                for (var i = 0; i < this.Children.length; i++) {
                    this.Children[i].UpdateViewMap(ViewMap);
                }
            }
        };

        NodeView.prototype.AppendChild = function (SubNode) {
            if (this.Children == null) {
                this.Children = [];
            }
            this.Children.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.AppendLeftNode = function (SubNode) {
            if (this.Left == null) {
                this.Left = [];
            }
            this.Left.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.AppendRightNode = function (SubNode) {
            if (this.Right == null) {
                this.Right = [];
            }
            this.Right.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.GetShape = function () {
            if (this.Shape == null) {
                this.Shape = AssureNote.AssureNoteUtils.CreateGSNShape(this);
            }
            return this.Shape;
        };

        NodeView.prototype.UpdateShape = function () {
            this.Shape = AssureNote.AssureNoteUtils.CreateGSNShape(this);
            return this.Shape;
        };

        // Global X: Scale-independent and transform-independent X distance from leftside of the top goal.
        // Return always 0 if this is top goal.
        NodeView.prototype.GetGX = function () {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].X;
            }
            if (this.Parent == null) {
                return this.RelativeX;
            }
            return this.Parent.GetGX() + this.RelativeX;
        };

        // Global Y: Scale-independent and transform-independent Y distance from top of the top goal.
        // Return always 0 if this is top goal.
        NodeView.prototype.GetGY = function () {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Y;
            }
            if (this.Parent == null) {
                return this.RelativeY;
            }
            return this.Parent.GetGY() + this.RelativeY;
        };

        // Global center X/Y: Node center position
        NodeView.prototype.GetCenterGX = function () {
            return this.GetGX() + this.Shape.GetNodeWidth() * 0.5;
        };

        NodeView.prototype.GetCenterGY = function () {
            return this.GetGY() + this.Shape.GetNodeHeight() * 0.5;
        };

        NodeView.SetGlobalPositionCacheEnabled = function (State) {
            if (State && NodeView.GlobalPositionCache == null) {
                NodeView.GlobalPositionCache = {};
            } else if (!State) {
                NodeView.GlobalPositionCache = null;
            }
        };

        // Scale-independent and transform-independent distance from leftside of GSN.
        // Return always (0, 0) if this is top goal.
        NodeView.prototype.GetGlobalPosition = function () {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Clone();
            }
            if (this.Parent == null) {
                return new AssureNote.Point(this.RelativeX, this.RelativeY);
            }
            var ParentPosition = this.Parent.GetGlobalPosition();
            ParentPosition.X += this.RelativeX;
            ParentPosition.Y += this.RelativeY;
            if (NodeView.GlobalPositionCache != null) {
                NodeView.GlobalPositionCache[this.Label] = ParentPosition.Clone();
            }
            return ParentPosition;
        };

        NodeView.prototype.GetNodeType = function () {
            return this.Model.NodeType;
        };

        NodeView.prototype.Render = function (DivFrag, SvgNodeFrag, SvgConnectionFrag) {
            this.Shape.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
        };

        NodeView.prototype.SaveFoldedFlag = function (OldViewMap) {
            if (OldViewMap[this.Model.GetLabel()]) {
                this.IsFolded = OldViewMap[this.Model.GetLabel()].IsFolded;
            }

            for (var i = 0; this.Children && i < this.Children.length; i++) {
                this.Children[i].SaveFoldedFlag(OldViewMap);
            }
        };

        NodeView.prototype.GetConnectorPosition = function (Dir, GlobalPosition) {
            var P = this.Shape.GetConnectorPosition(Dir);
            P.X += GlobalPosition.X;
            P.Y += GlobalPosition.Y;
            return P;
        };

        NodeView.prototype.SetArrowPosition = function (P1, P2, Dir, Duration) {
            this.Shape.SetArrowPosition(P1, P2, Dir, Duration);
        };

        NodeView.prototype.UpdateDocumentPosition = function (Duration, CSSAnimationBuffer) {
            if (!this.IsVisible) {
                return;
            }
            AssureNote.AssureNoteApp.Assert((this.Shape != null));
            var GlobalPosition = this.GetGlobalPosition();
            this.Shape.SetPosition(GlobalPosition.X, GlobalPosition.Y, Duration, CSSAnimationBuffer);
            var P1 = this.GetConnectorPosition(AssureNote.Direction.Bottom, GlobalPosition);
            this.ForEachVisibleChildren(function (SubNode) {
                var P2 = SubNode.GetConnectorPosition(AssureNote.Direction.Top, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, AssureNote.Direction.Bottom, Duration);
                SubNode.UpdateDocumentPosition(Duration, CSSAnimationBuffer);
            });
            P1 = this.GetConnectorPosition(AssureNote.Direction.Right, GlobalPosition);
            this.ForEachVisibleRightNodes(function (SubNode) {
                var P2 = SubNode.GetConnectorPosition(AssureNote.Direction.Left, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, AssureNote.Direction.Left, Duration);
                SubNode.UpdateDocumentPosition(Duration, CSSAnimationBuffer);
            });
            P1 = this.GetConnectorPosition(AssureNote.Direction.Left, GlobalPosition);
            this.ForEachVisibleLeftNodes(function (SubNode) {
                var P2 = SubNode.GetConnectorPosition(AssureNote.Direction.Right, SubNode.GetGlobalPosition());
                SubNode.SetArrowPosition(P1, P2, AssureNote.Direction.Right, Duration);
                SubNode.UpdateDocumentPosition(Duration, CSSAnimationBuffer);
            });
        };

        NodeView.prototype.ForEachVisibleSubNode = function (SubNodes, Action) {
            if (SubNodes != null && !this.IsFolded) {
                for (var i = 0; i < SubNodes.length; i++) {
                    if (SubNodes[i].IsVisible) {
                        if (Action(SubNodes[i]) === false) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        NodeView.prototype.ForEachVisibleChildren = function (Action) {
            this.ForEachVisibleSubNode(this.Children, Action);
        };

        NodeView.prototype.ForEachVisibleRightNodes = function (Action) {
            this.ForEachVisibleSubNode(this.Right, Action);
        };

        NodeView.prototype.ForEachVisibleLeftNodes = function (Action) {
            this.ForEachVisibleSubNode(this.Left, Action);
        };

        NodeView.prototype.ForEachVisibleAllSubNodes = function (Action) {
            if (this.ForEachVisibleSubNode(this.Left, Action) && this.ForEachVisibleSubNode(this.Right, Action) && this.ForEachVisibleSubNode(this.Children, Action))
                return true;
            return false;
        };

        NodeView.prototype.TraverseVisibleNode = function (Action) {
            Action(this);
            this.ForEachVisibleAllSubNodes(function (SubNode) {
                SubNode.TraverseVisibleNode(Action);
            });
        };

        NodeView.prototype.ForEachSubNode = function (SubNodes, Action) {
            if (SubNodes != null) {
                for (var i = 0; i < SubNodes.length; i++) {
                    if (!Action(SubNodes[i])) {
                        return false;
                    }
                }
            }
            return true;
        };

        NodeView.prototype.ForEachAllSubNodes = function (Action) {
            if (this.ForEachSubNode(this.Left, Action) && this.ForEachSubNode(this.Right, Action) && this.ForEachSubNode(this.Children, Action))
                return true;
            return false;
        };

        NodeView.prototype.TraverseNode = function (Action) {
            if (Action(this) === false)
                return false;
            if (this.ForEachAllSubNodes(function (SubNode) {
                return SubNode.TraverseNode(Action);
            }))
                return true;
            return false;
        };

        NodeView.prototype.ClearAnimationCache = function (Force) {
            if (Force || !this.IsVisible) {
                this.GetShape().ClearAnimationCache();
            }
            if (Force || this.IsFolded) {
                this.ForEachAllSubNodes(function (SubNode) {
                    SubNode.ClearAnimationCache(true);
                });
            } else {
                this.ForEachAllSubNodes(function (SubNode) {
                    SubNode.ClearAnimationCache();
                });
            }
        };
        NodeView.GlobalPositionCache = null;
        return NodeView;
    })();
    AssureNote.NodeView = NodeView;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=NodeView.js.map
