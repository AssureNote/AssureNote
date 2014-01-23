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
        Color: ColorStyle;
        Parent: NodeView;
        Left: NodeView[] = null;
        Right: NodeView[] = null;
        Children: NodeView[] = null;
        Shape: GSNShape = null;

        constructor(public Model: GSNNode, IsRecursive: boolean) {
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

        SaveFoldedFlag(OldViewMap: { [index: string]: NodeView }): void {
            if (OldViewMap[this.Model.GetLabel()]) {
                this.IsFolded = OldViewMap[this.Model.GetLabel()].IsFolded;
            }

            for (var i = 0; this.Children && i < this.Children.length; i++) {
                this.Children[i].SaveFoldedFlag(OldViewMap);
            }
        }

        private GetConnectorPosition(Dir: Direction, GlobalPosition: Point): Point {
            var P = this.Shape.GetConnectorPosition(Dir);
            P.X += GlobalPosition.X;
            P.Y += GlobalPosition.Y;
            return P;
        }

        private MoveArrowTo(P1: Point, P2: Point, Dir: Direction, Duration?: number) {
            this.Shape.MoveArrowTo(P1, P2, Dir, Duration || 0);
        }

        UpdateDocumentPosition(Duration?: number): void {
            if (!this.IsVisible) {
                return
            }
            AssureNoteApp.Assert(this.Shape != null);
            var GlobalPosition = this.GetGlobalPosition();
            this.Shape.MoveTo(GlobalPosition.X, GlobalPosition.Y, Duration);
            var P1 = this.GetConnectorPosition(Direction.Bottom, GlobalPosition);
            this.ForEachVisibleChildren((SubNode: NodeView) => {
                var P2 = SubNode.GetConnectorPosition(Direction.Top, SubNode.GetGlobalPosition());
                SubNode.MoveArrowTo(P1, P2, Direction.Bottom, Duration);
                SubNode.UpdateDocumentPosition(Duration);
            });
            P1 = this.GetConnectorPosition(Direction.Right, GlobalPosition);
            this.ForEachVisibleRightNodes((SubNode: NodeView) => {
                var P2 = SubNode.GetConnectorPosition(Direction.Left, SubNode.GetGlobalPosition());
                SubNode.MoveArrowTo(P1, P2, Direction.Left, Duration);
                SubNode.UpdateDocumentPosition(Duration);
            });
            P1 = this.GetConnectorPosition(Direction.Left, GlobalPosition);
            this.ForEachVisibleLeftNodes((SubNode: NodeView) => {
                var P2 = SubNode.GetConnectorPosition(Direction.Right, SubNode.GetGlobalPosition());
                SubNode.MoveArrowTo(P1, P2, Direction.Right, Duration);
                SubNode.UpdateDocumentPosition(Duration);
            });
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

        ChangeColorStyle(ColorStyle: string): void {
            this.Shape.ChangeColorStyle(ColorStyle);
        }

        AddColorStyle(ColorStyle: string): void {
            this.Shape.AddColorStyle(ColorStyle);
        }

        RemoveColorStyle(ColorStyle: string): void {
            this.Shape.RemoveColorStyle(ColorStyle);
        }
    }
}
