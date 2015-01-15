// ***************************************************************************
// Copyright (c) 2014, AssureNote project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// *  Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// *  Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// **************************************************************************
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
            this.ShouldReLayoutFlag = true;
            this.Label = Model.GetLabel();
            this.NodeDoc = Model.NodeDoc;
            this.IsVisible = true;
            this.IsFoldedFlag = false;
            this.Status = 0 /* TreeEditable */;
            if (IsRecursive && Model.SubNodeList != null) {
                for (var i = 0; i < Model.SubNodeList.length; i++) {
                    var SubNode = Model.SubNodeList[i];
                    var SubView = new NodeView(SubNode, IsRecursive);
                    if (SubNode.NodeType == 6 /* Assumption */ || SubNode.NodeType == 7 /* Exception */) {
                        // Layout Engine allowed to move a node left-side
                        this.AppendLeftNode(SubView);
                    } else if (SubNode.NodeType == 1 /* Context */ || SubNode.NodeType == 5 /* Justification */) {
                        // Layout Engine allowed to move a node left-side
                        this.AppendRightNode(SubView);
                    } else {
                        this.AppendChild(SubView);
                    }
                }
            }
        }
        NodeView.prototype.IsFolded = function () {
            return this.IsFoldedFlag;
        };

        NodeView.prototype.SetIsFolded = function (Flag) {
            if (this.IsFoldedFlag != Flag) {
                this.SetShouldReLayout(true);
            }
            this.IsFoldedFlag = Flag;
        };

        NodeView.prototype.SetShouldReLayout = function (Flag) {
            if (!this.ShouldReLayoutFlag && Flag && this.Parent) {
                this.Parent.SetShouldReLayout(true);
            }
            this.ShouldReLayoutFlag = Flag;
        };

        NodeView.prototype.ShouldReLayout = function () {
            return this.ShouldReLayoutFlag;
        };

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
                this.Shape = AssureNote.ShapeFactory.CreateShape(this);
            }
            return this.Shape;
        };

        NodeView.prototype.SetShape = function (Shape) {
            if (this.Shape) {
                this.Shape.NodeView = null;
            }
            if (Shape) {
                Shape.NodeView = this;
            }
            this.Shape = Shape;
        };

        /**
        Global X: Scale-independent and transform-independent X distance from leftside of the top goal.
        @return always 0 if this is top goal.
        */
        NodeView.prototype.GetGX = function () {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].X;
            }
            if (this.Parent == null) {
                return this.RelativeX;
            }
            return this.Parent.GetGX() + this.RelativeX;
        };

        /**
        Global Y: Scale-independent and transform-independent Y distance from top of the top goal.
        @eturn always 0 if this is top goal.
        */
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

        /**
        Scale-independent and transform-independent distance from leftside of GSN.
        @return always (0, 0) if this is top goal.
        */
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

        /**
        Append content elements of this node to layer fragments.
        */
        NodeView.prototype.Render = function (DivFrag, SvgNodeFrag, SvgConnectionFrag) {
            this.Shape.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
        };

        /**
        Try to reuse shape.
        */
        NodeView.prototype.SaveFlags = function (OldViewMap) {
            var OldView = OldViewMap[this.Model.GetLabel()];
            if (OldView) {
                this.IsFoldedFlag = OldView.IsFoldedFlag;
                this.Status = OldView.Status;

                var IsContentChanged = this.NodeDoc != OldView.NodeDoc;
                var IsTypeChanged = this.GetNodeType() != OldView.GetNodeType();
                var IsMonitorOrNotChanged = this.IsMonitorNode() != OldView.IsMonitorNode();

                if (IsContentChanged || IsTypeChanged || OldView.HasParameter() || IsMonitorOrNotChanged) {
                    this.GetShape().SetColorStyle(OldView.GetShape().GetColorStyle());
                } else {
                    this.SetShape(OldView.GetShape());
                }
            }

            for (var i = 0; this.Children && i < this.Children.length; i++) {
                this.Children[i].SaveFlags(OldViewMap);
            }
            for (var i = 0; this.Left && i < this.Left.length; i++) {
                this.Left[i].SaveFlags(OldViewMap);
            }
            for (var i = 0; this.Right && i < this.Right.length; i++) {
                this.Right[i].SaveFlags(OldViewMap);
            }
        };

        NodeView.prototype.GetConnectorPosition = function (Dir, GlobalPosition) {
            var P = this.Shape.GetConnectorPosition(Dir);
            P.X += GlobalPosition.X;
            P.Y += GlobalPosition.Y;
            return P;
        };

        /**
        Update DOM node position by the position that layout engine caluculated
        */
        NodeView.prototype.UpdateNodePosition = function (AnimationCallbacks, Duration, ScreenRect, UnfoldBaseNode) {
            var _this = this;
            Duration = Duration || 0;
            if (!this.IsVisible) {
                return;
            }
            var UpdateSubNode = function (SubNode) {
                var Base = UnfoldBaseNode;
                if (!Base && SubNode.Shape.WillFadein()) {
                    Base = _this;
                }
                if (Base && Duration > 0) {
                    SubNode.Shape.SetFadeinBasePosition(Base.Shape.GetGXCache(), Base.Shape.GetGYCache());
                    SubNode.UpdateNodePosition(AnimationCallbacks, Duration, ScreenRect, Base);
                } else {
                    SubNode.UpdateNodePosition(AnimationCallbacks, Duration, ScreenRect);
                }
            };

            var GlobalPosition = this.GetGlobalPosition();
            this.Shape.MoveTo(AnimationCallbacks, GlobalPosition.X, GlobalPosition.Y, Duration, ScreenRect);

            var ArrowDirections = [3 /* Bottom */, 2 /* Right */, 0 /* Left */];
            var SubNodeTypes = [this.Children, this.Right, this.Left];
            for (var i = 0; i < 3; ++i) {
                var P1 = this.GetConnectorPosition(ArrowDirections[i], GlobalPosition);
                var ArrowToDirection = AssureNote.ReverseDirection(ArrowDirections[i]);
                this.ForEachVisibleSubNode(SubNodeTypes[i], function (SubNode) {
                    var P2 = SubNode.GetConnectorPosition(ArrowToDirection, SubNode.GetGlobalPosition());
                    UpdateSubNode(SubNode);
                    SubNode.Shape.MoveArrowTo(AnimationCallbacks, P1, P2, ArrowDirections[i], Duration, ScreenRect);
                    SubNode.ParentDirection = AssureNote.ReverseDirection(ArrowDirections[i]);
                });
            }
        };

        NodeView.prototype.ForEachVisibleSubNode = function (SubNodes, Action) {
            if (SubNodes != null && !this.IsFoldedFlag) {
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
                    if (Action(SubNodes[i]) === false) {
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

        /**
        Clear position cache and enable to fading in when the node re-appearing.
        This method should be called after the node became invibible or the node never fade in.
        */
        NodeView.prototype.ClearAnimationCache = function (Force) {
            if (Force || !this.IsVisible) {
                this.GetShape().ClearAnimationCache();
            }
            if (Force || this.IsFoldedFlag) {
                this.ForEachAllSubNodes(function (SubNode) {
                    SubNode.ClearAnimationCache(true);
                });
            } else {
                this.ForEachAllSubNodes(function (SubNode) {
                    SubNode.ClearAnimationCache(false);
                });
            }
        };

        NodeView.prototype.HasSideNode = function () {
            return (this.Left != null && this.Left.length > 0) || (this.Right != null && this.Right.length > 0);
        };

        NodeView.prototype.HasChildren = function () {
            return (this.Children != null && this.Children.length > 0);
        };

        NodeView.prototype.AddColorStyle = function (ColorStyle) {
            this.Shape.AddColorStyle(ColorStyle);
        };

        NodeView.prototype.RemoveColorStyle = function (ColorStyle) {
            this.Shape.RemoveColorStyle(ColorStyle);
        };

        NodeView.prototype.IsInRect = function (Target) {
            // While animation playing, cached position(visible position) != this.position(logical position)
            var GXC = this.Shape.GetGXCache();
            var GYC = this.Shape.GetGYCache();
            var Pos;
            if (GXC != null && GYC != null) {
                Pos = new AssureNote.Point(GXC, GYC);
            } else {
                Pos = this.GetGlobalPosition();
            }
            if (Pos.X > Target.X + Target.Width || Pos.Y > Target.Y + Target.Height) {
                return false;
            }
            Pos.X += this.Shape.GetNodeWidth();
            Pos.Y += this.Shape.GetNodeHeight();
            if (Pos.X < Target.X || Pos.Y < Target.Y) {
                return false;
            }
            return true;
        };

        NodeView.prototype.IsConnectorInRect = function (Target) {
            if (!this.Parent) {
                return false;
            }
            var PA;
            var PB;
            if (this.Shape.GetGXCache() != null && this.Shape.GetGYCache() != null) {
                PA = this.Shape.GetArrowP1Cache();
                PB = this.Shape.GetArrowP2Cache();
            } else {
                PA = this.GetConnectorPosition(this.ParentDirection, this.GetGlobalPosition());
                PB = this.Parent.GetConnectorPosition(AssureNote.ReverseDirection(this.ParentDirection), this.Parent.GetGlobalPosition());
            }
            var Pos = new AssureNote.Point(Math.min(PA.X, PB.X), Math.min(PA.Y, PB.Y));
            if (Pos.X > Target.X + Target.Width || Pos.Y > Target.Y + Target.Height) {
                return false;
            }
            Pos.X = Math.max(PA.X, PB.X);
            Pos.Y = Math.max(PA.Y, PB.Y);
            if (Pos.X < Target.X || Pos.Y < Target.Y) {
                return false;
            }
            return true;
        };

        NodeView.prototype.HasParameter = function () {
            return this.NodeDoc.match(/\[([^\[\]]*)\]/) != null;
        };

        NodeView.prototype.IsMonitorNode = function () {
            var ThisModel = this.Model;
            if (!ThisModel.IsEvidence()) {
                return false;
            }

            var GoalModel = ThisModel.GetUpperNearestGoal();
            var ContextModel = null;

            for (var i = 0; i < GoalModel.SubNodeList.length; i++) {
                var BroutherModel = GoalModel.SubNodeList[i];
                if (BroutherModel.IsContext()) {
                    ContextModel = BroutherModel;
                    break;
                }
            }
            if (ContextModel) {
                var TagMap = ContextModel.GetTagMapWithLexicalScope();
                if (TagMap) {
                    var Location = TagMap["Location"];
                    var Condition = TagMap["Condition"];
                    if (Location && Condition) {
                        return true;
                    }
                }
            }
            return false;
        };
        NodeView.GlobalPositionCache = null;
        return NodeView;
    })();
    AssureNote.NodeView = NodeView;

    (function (EditStatus) {
        EditStatus[EditStatus["TreeEditable"] = 0] = "TreeEditable";
        EditStatus[EditStatus["SingleEditable"] = 1] = "SingleEditable";
        EditStatus[EditStatus["Locked"] = 2] = "Locked";
    })(AssureNote.EditStatus || (AssureNote.EditStatus = {}));
    var EditStatus = AssureNote.EditStatus;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=NodeView.js.map
