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

module AssureNote {

    export class NodeView {
        IsVisible: boolean;
        IsFolded: boolean;
        Label: string;
        NodeDoc: string;
        RelativeX: number = 0; // relative x from parent node
        RelativeY: number = 0; // relative y from parent node
        Parent: NodeView;
        Left: NodeView[] = null;
        Right: NodeView[] = null;
        Children: NodeView[] = null;
        Shape: GSNShape = null;
        Status: EditStatus;

        constructor(public Model: GSNNode, IsRecursive: boolean) {
            this.Label = Model.GetLabel();
            this.NodeDoc = Model.NodeDoc;
            this.IsVisible = true;
            this.IsFolded = false;
            this.Status   = EditStatus.TreeEditable;
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

        UpdateViewMap(ViewMap: { [index: string]: NodeView }): void {
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
        }

        AppendChild(SubNode: NodeView): void {
            if (this.Children == null) {
                this.Children = [];
            }
            this.Children.push(SubNode);
            SubNode.Parent = this;
        }

        AppendLeftNode(SubNode: NodeView): void {
            if (this.Left == null) {
                this.Left = [];
            }
            this.Left.push(SubNode);
            SubNode.Parent = this;
        }

        AppendRightNode(SubNode: NodeView): void {
            if (this.Right == null) {
                this.Right = [];
            }
            this.Right.push(SubNode);
            SubNode.Parent = this;
        }

        GetShape(): GSNShape {
            if (this.Shape == null) {
                this.Shape = AssureNoteUtils.CreateGSNShape(this);
            }
            return this.Shape;
        }

        UpdateShape(): GSNShape {
            this.Shape = AssureNoteUtils.CreateGSNShape(this);
            return this.Shape;
        }

        // Global X: Scale-independent and transform-independent X distance from leftside of the top goal.
        // Return always 0 if this is top goal.
        GetGX(): number {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].X;
            }
            if (this.Parent == null) {
                return this.RelativeX;
            }
            return this.Parent.GetGX() + this.RelativeX;
        }

        // Global Y: Scale-independent and transform-independent Y distance from top of the top goal.
        // Return always 0 if this is top goal.
        GetGY(): number {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Y;
            }
            if (this.Parent == null) {
                return this.RelativeY;
            }
            return this.Parent.GetGY() + this.RelativeY;
        }

        // Global center X/Y: Node center position
        GetCenterGX(): number {
            return this.GetGX() + this.Shape.GetNodeWidth() * 0.5;
        }

        GetCenterGY(): number {
            return this.GetGY() + this.Shape.GetNodeHeight() * 0.5;
        }

        // For memorization
        private static GlobalPositionCache: { [index: string]: Point } = null;
        public static SetGlobalPositionCacheEnabled(State: boolean) {
            if (State && NodeView.GlobalPositionCache == null) {
                NodeView.GlobalPositionCache = {};
            } else if (!State) {
                NodeView.GlobalPositionCache = null;
            }
        }

        // Scale-independent and transform-independent distance from leftside of GSN.
        // Return always (0, 0) if this is top goal.
        private GetGlobalPosition(): Point {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Clone();
            }
            if (this.Parent == null) {
                return new Point(this.RelativeX, this.RelativeY);
            }
            var ParentPosition = this.Parent.GetGlobalPosition();
            ParentPosition.X += this.RelativeX;
            ParentPosition.Y += this.RelativeY;
            if (NodeView.GlobalPositionCache != null) {
                NodeView.GlobalPositionCache[this.Label] = ParentPosition.Clone();
            }
            return ParentPosition;
        }

        GetNodeType(): GSNType {
            return this.Model.NodeType;
        }

        Render(DivFrag: DocumentFragment, SvgNodeFrag: DocumentFragment, SvgConnectionFrag: DocumentFragment): void {
            this.Shape.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
        }

        SaveFlags(OldViewMap: { [index: string]: NodeView }): void {
            var OldView = OldViewMap[this.Model.GetLabel()];
            if (OldView) {
                this.IsFolded = OldView.IsFolded;
                this.Status = OldView.Status;
                this.GetShape().SetColorStyle(OldView.GetShape().GetColorStyle());
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
        }

        private GetConnectorPosition(Dir: Direction, GlobalPosition: Point): Point {
            var P = this.Shape.GetConnectorPosition(Dir);
            P.X += GlobalPosition.X;
            P.Y += GlobalPosition.Y;
            return P;
        }

        UpdateDocumentPosition(AnimationCallbacks?: Function[], Duration?: number, ScreenRect?: Rect, PositionBaseNode?: NodeView): void {
            Duration = Duration || 0;
            if (!this.IsVisible) {
                return
            }
            var UpdateSubNode = (SubNode: NodeView) => {
                var Base = PositionBaseNode;
                if (!Base && SubNode.Shape.WillFadein()) {
                    Base = this;
                }
                if (Base && Duration > 0) {
                    SubNode.Shape.SetFadeinBasePosition(Base.Shape.GetGXCache(), Base.Shape.GetGYCache());
                    SubNode.UpdateDocumentPosition(AnimationCallbacks, Duration, ScreenRect, Base);
                } else {
                    SubNode.UpdateDocumentPosition(AnimationCallbacks, Duration, ScreenRect);
                }
            }

            var GlobalPosition = this.GetGlobalPosition();
            this.Shape.MoveTo(AnimationCallbacks, GlobalPosition.X, GlobalPosition.Y, Duration, ScreenRect);

            var ArrowDirections = [Direction.Bottom, Direction.Right, Direction.Left];
            var SubNodeTypes = [this.Children, this.Right, this.Left];
            for (var i = 0; i < 3; ++i) {
                var P1 = this.GetConnectorPosition(ArrowDirections[i], GlobalPosition);
                var ArrowToDirection = ReverseDirection(ArrowDirections[i]);
                this.ForEachVisibleSubNode(SubNodeTypes[i], (SubNode: NodeView) => {
                    var P2 = SubNode.GetConnectorPosition(ArrowToDirection, SubNode.GetGlobalPosition());
                    UpdateSubNode(SubNode);
                    SubNode.Shape.MoveArrowTo(AnimationCallbacks, P1, P2, ArrowDirections[i], Duration, ScreenRect);
                });
            }
        }

        private ForEachVisibleSubNode(SubNodes: NodeView[], Action: (NodeView) => any): boolean {
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
        }

        ForEachVisibleChildren(Action: (SubNode: NodeView) => any): void {
            this.ForEachVisibleSubNode(this.Children, Action);
        }

        ForEachVisibleRightNodes(Action: (SubNode: NodeView) => any): void {
            this.ForEachVisibleSubNode(this.Right, Action);
        }

        ForEachVisibleLeftNodes(Action: (SubNode: NodeView) => any): void {
            this.ForEachVisibleSubNode(this.Left, Action);
        }

        ForEachVisibleAllSubNodes(Action: (SubNode: NodeView) => any): boolean {
            if (this.ForEachVisibleSubNode(this.Left, Action) &&
                this.ForEachVisibleSubNode(this.Right, Action) &&
                this.ForEachVisibleSubNode(this.Children, Action)) return true;
            return false;
        }

        TraverseVisibleNode(Action: (SubNode: NodeView) => any): void {
            Action(this);
            this.ForEachVisibleAllSubNodes((SubNode: NodeView) => { SubNode.TraverseVisibleNode(Action); });
        }

        private ForEachSubNode(SubNodes: NodeView[], Action: (NodeView) => any): boolean {
            if (SubNodes != null) {
                for (var i = 0; i < SubNodes.length; i++) {
                    if (Action(SubNodes[i]) === false) {
                        return false;
                    }
                }
            }
            return true;
        }

        ForEachAllSubNodes(Action: (SubNode: NodeView) => any): boolean {
            if (this.ForEachSubNode(this.Left, Action) &&
                this.ForEachSubNode(this.Right, Action) &&
                this.ForEachSubNode(this.Children, Action)) return true;
            return false;
        }

        TraverseNode(Action: (SubNode: NodeView) => any): boolean {
            if (Action(this) === false) return false;
            if (this.ForEachAllSubNodes((SubNode: NodeView) => { return SubNode.TraverseNode(Action); })) return true;
            return false;
        }

        ClearAnimationCache(Force?: boolean): void {
            if (Force || !this.IsVisible) {
                this.GetShape().ClearAnimationCache();
            }
            if (Force || this.IsFolded) {
                this.ForEachAllSubNodes((SubNode: NodeView) => {
                    SubNode.ClearAnimationCache(true);
                });
            }
            else {
                this.ForEachAllSubNodes((SubNode: NodeView) => {
                    SubNode.ClearAnimationCache(false);
                });
            }
        }

        HasSideNode(): boolean {
            return (this.Left != null && this.Left.length > 0) || (this.Right != null && this.Right.length > 0)
        }

        HasChildren(): boolean {
            return (this.Children != null && this.Children.length > 0);
        }

        AddColorStyle(ColorStyle: string): void {
            this.Shape.AddColorStyle(ColorStyle);
        }

        RemoveColorStyle(ColorStyle: string): void {    
            this.Shape.RemoveColorStyle(ColorStyle);
        }
    }

    export enum EditStatus {
        TreeEditable, SingleEditable, Locked
    }
}
