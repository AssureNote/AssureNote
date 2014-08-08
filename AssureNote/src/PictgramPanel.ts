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

///<reference path='./Panel.ts'/>
///<reference path='./SearchNode.ts'/>
///<reference path='./LayoutEngine.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>

///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>
///<reference path='../plugin/SingleNodeEditor/SingleNodeEditor.ts'/>

///<reference path='./CommandLine.ts'/>
///<reference path='./Editor.ts'/>

module AssureNote {
    /**
        @class AssureNote.PictgramPanel
        @extends AssureNote.Panel
    */
    export class PictgramPanel extends Panel {
        LayoutEngine: LayoutEngine;
        SVGLayerBox: SVGSVGElement;
        SVGLayer: SVGGElement;
        SVGLayerConnectorGroup: SVGGElement;
        SVGLayerNodeGroup: SVGGElement;
        EventMapLayer: HTMLDivElement;
        ContentLayer: HTMLDivElement;
        ControlLayer: HTMLDivElement;
        HiddenNodeBuffer: DocumentFragment;
        Viewport: ViewportManager;
        ViewMap: { [index: string]: NodeView };
        TopNodeView: NodeView;
        CmdLine: CommandLine;
        ContextMenu: NodeMenu;
        NodeTooltip: Tooltip;

        OnScreenNodeMap: { [index: string]: NodeView } = {};
        HiddenNodeMap: { [index: string]: NodeView } = {};

        CurrentDoc: GSNDoc;// Convert to caseview
        private FocusedLabel: string;// A label pointed out or clicked.
        // We do not use FocusedView but FocusedLabel to make it modular.

        private FoldingAnimationTask = new AssureNote.AnimationFrameTask();
        
        constructor(public App: AssureNoteApp) {
            super(App);
            this.SVGLayerBox = <SVGSVGElement>(<Element>document.getElementById("svglayer-box"));
            this.SVGLayer = AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayerConnectorGroup = AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayerNodeGroup = AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayer.appendChild(this.SVGLayerConnectorGroup);
            this.SVGLayer.appendChild(this.SVGLayerNodeGroup);
            this.SVGLayer.id = "svg-layer";
            this.SVGLayer.setAttribute("transform", "translate(0,0)");
            this.SVGLayerBox.appendChild(this.SVGLayer);
            this.HiddenNodeBuffer = document.createDocumentFragment();
            this.EventMapLayer = <HTMLDivElement>(document.getElementById("eventmap-layer"));
            this.ContentLayer = <HTMLDivElement>(document.getElementById("content-layer"));
            this.ControlLayer = <HTMLDivElement>(document.getElementById("control-layer"));
            this.Viewport = new ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ControlLayer);
            this.LayoutEngine = new SimpleLayoutEngine(this.App);

            this.Viewport.AddEventListener("cameramove", () => {
                this.UpdateHiddenNodeList();
            });

            this.ContextMenu = new NodeMenu(App);
            this.NodeTooltip = new AssureNote.Tooltip(App);

            this.ContentLayer.addEventListener("click", (event: MouseEvent) => {
                var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
                this.App.DebugP("click:" + Label);
                if (this.IsActive()) {
                    this.ChangeFocusedLabel(Label);
                } else {
                    this.App.SocketManager.Emit("focusednode", Label);
                }
                if (this.ContextMenu.IsEnable) {
                    this.ContextMenu.Remove();
                }
                if (this.NodeTooltip.IsEnable) {
                    this.NodeTooltip.Remove();
                }
                if (this.App.NodeCountPanel.IsVisible) {
                    this.App.NodeCountPanel.Update();
                }
                event.stopPropagation();
                event.preventDefault();
            });

            this.EventMapLayer.addEventListener("pointerdown", (event: MouseEvent) => {
                if (this.IsActive()) {
                    this.ChangeFocusedLabel(null);
                }
            });

            this.ContentLayer.addEventListener("contextmenu", (event: MouseEvent) => {
                var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = this.ViewMap[Label];
                if (NodeView != null) {
                    this.ChangeFocusedLabel(Label);
                    switch (NodeView.Status) {
                        case EditStatus.TreeEditable:
                            var Buttons = this.App.PluginManager.GetMenuBarButtons(NodeView);
                            this.ContextMenu.Create(this.ViewMap[Label], this.ControlLayer, Buttons);
                            break;
                        case EditStatus.SingleEditable:
                            var Buttons = this.App.PluginManager.GetMenuBarButtons(NodeView);
                            this.ContextMenu.Create(this.ViewMap[Label], this.ControlLayer, Buttons);
                            break;
                        case EditStatus.Locked:
                            (<any>$).notify("Warning: currently edited", 'warn');
                            break;
                    }
                } else {
                    this.FocusedLabel = null;
                }
                event.preventDefault();
            });

            this.ContentLayer.addEventListener("dblclick", (event: MouseEvent) => {
                var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = this.ViewMap[Label];
                this.App.DebugP("double click:" + Label);
                if (this.ContextMenu.IsEnable) {
                    this.ContextMenu.Remove();
                }
                if (this.NodeTooltip.IsEnable) {
                    this.NodeTooltip.Remove();
                }
                this.App.ExecDoubleClicked(NodeView);
                event.stopPropagation();
                event.preventDefault();
            });

            this.CmdLine = new CommandLine(App);

            var ToolTipFocusedLabel = null;
            this.ContentLayer.addEventListener("mouseover", (event: MouseEvent) => {
                if (this.App.FullScreenEditorPanel.IsActive()) {
                    return;
                }
                var Label = AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = this.ViewMap[Label];
                if (NodeView != null && ToolTipFocusedLabel != Label) {
                    ToolTipFocusedLabel = Label;
                    var Tooltips = this.App.PluginManager.GetTooltipContents(NodeView);
                    this.NodeTooltip.Create(NodeView, this.ControlLayer, Tooltips);
                }
            });

            this.ContentLayer.addEventListener("mouseleave", (event: MouseEvent) => {
                /* We use mouseleave event instead of mouseout since mouseout/mouseenter fires
                   every time the pointer enters the sub-element of ContentLayer.
                   Mouseleave can prevent this annoying event firing. */
                if (this.NodeTooltip.IsEnable) {
                    this.NodeTooltip.Remove();
                    ToolTipFocusedLabel = null;
                }
            });

            var DragHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (this.IsActive()) {
                    event.dataTransfer.dropEffect = "move";
                } else {
                    event.dataTransfer.dropEffect = "none";
                }
            };
            document.addEventListener("dragenter", DragHandler, true);
            document.addEventListener("dragover", DragHandler, true);
            document.addEventListener("dragleave", DragHandler, true);
            document.addEventListener("drop", (event: DragEvent) => {
                event.stopPropagation();
                event.preventDefault();
                if (this.IsActive()) {
                    this.App.LoadFiles(event.dataTransfer.files);
                }
            }, true);

            //if(history.pushState) {
            //    window.addEventListener('popstate', (event: Event) => {
            //        this.App.LoadDefaultWGSN();
            //    });
            //}

            this.Viewport.ScrollManager.OnDragged = (Viewport: ViewportManager) => {
                if (!this.TopNodeView) {
                    return;
                }
                var HitBoxCenter = new Point(Viewport.GXFromPageX(Viewport.GetPageCenterX()), Viewport.GYFromPageY(Viewport.GetPageHeight() / 3));
                this.TopNodeView.TraverseVisibleNode((Node: NodeView) => {
                    if (Node.IsFolded()) {
                        var DX = HitBoxCenter.X - Node.GetCenterGX();
                        var DY = HitBoxCenter.Y - Node.GetCenterGY();
                        var R = 150 / this.Viewport.GetCameraScale();
                        if (DX * DX + DY * DY < R * R) {
                            this.App.ExecCommandByName("fold", Node.Label);
                            return false;
                        }
                    }
                });
            };
            this.Viewport.ScrollManager.OnStartDrag = (Viewport: ViewportManager) => {
                $("#auto-expand-area").stop(true, true).show(100);
                (<any>$(".dropdown.open > .dropdown-toggle")).dropdown("toggle");
            };
            this.Viewport.ScrollManager.OnEndDrag = (Viewport: ViewportManager) => {
                $("#auto-expand-area").stop(true, true).hide(100);
            };
        }

        OnKeyDown(Event: KeyboardEvent): void {
            var Label: string;
            var handled = true;
            switch (Event.keyCode) {
                case 58: /*: in Firefox*/
                case 186: /*:*/
                case 191: /*/*/
                case 219: /*@*/
                    if (this.App.NodeListPanel.IsVisiting()) {
                        this.App.NodeListPanel.FinishVisit();
                    }
                    this.CmdLine.Activate();
                    break;
                case 27: /*Esc*/
                    if (this.App.NodeListPanel.IsVisiting()) {
                        this.App.NodeListPanel.FinishVisit();
                    }
                    if (this.App.HistoryPanel.IsVisible) {
                        this.App.HistoryPanel.Hide();
                    }
                    if (this.App.NodeCountPanel.IsVisible) {
                        this.App.NodeCountPanel.Hide();
                    }
                    Event.preventDefault();
                    break;
                case 13: /*Enter*/
                    if (this.App.NodeListPanel.IsVisiting()) {
                        this.App.NodeListPanel.VisitNext(event.shiftKey);
                    } else {
                        if (this.FocusedLabel) {
                            this.App.ExecCommandByName((Event.shiftKey ? "edit" : "singleedit"), this.FocusedLabel);
                        }
                    }
                    Event.preventDefault();
                    break;
                case 72: /*h*/
                case 37: /*left*/
                    this.NavigateLeft();
                    Event.preventDefault();
                    break;
                case 74: /*j*/
                case 40: /*down*/
                    this.NavigateDown();
                    Event.preventDefault();
                    break;
                case 75: /*k*/
                case 38: /*up*/
                    var Moved = this.NavigateUp();
                    if (!Moved && this.FocusedLabel) {
                        this.NavigateParent();
                    }
                    Event.preventDefault();
                    break;
                case 76: /*l*/
                case 39: /*right*/
                    this.NavigateRight();
                    Event.preventDefault();
                    break;
                case 36: /*home*/
                    this.NavigateHome();
                    Event.preventDefault();
                    break;
                case 32: /*space*/
                case 70: /*f*/
                    if (this.FocusedLabel) {
                        this.App.ExecCommandByName("fold", this.FocusedLabel);
                    }
                    Event.preventDefault();
                    break;
                case 65: /*a*/
                case 73: /*i*/
                    if (this.FocusedLabel) {
                        this.App.ExecCommandByName((Event.shiftKey ? "edit" : "singleedit"), this.FocusedLabel);
                    }
                    Event.preventDefault();
                    break;
                case 187: /*+*/
                    if (Event.shiftKey) {
                        this.App.ExecCommandByName("set-scale", (this.Viewport.GetCameraScale() + 0.1));
                    }
                    Event.preventDefault();
                    break;
                case 189: /*-*/
                    if (Event.shiftKey) {
                        this.App.ExecCommandByName("set-scale", (this.Viewport.GetCameraScale() - 0.1));
                    }
                    Event.preventDefault();
                    break;
                case 67: /*c*/
                    if (Event.shiftKey || Event.ctrlKey) {
                        if (this.FocusedLabel) {
                            this.App.ExecCommandByName("copy", this.GetFocusedLabel());
                        }
                    }
                    Event.preventDefault();
                    break;
                case 86: /*v*/
                    if (Event.shiftKey || Event.ctrlKey) {
                        if (this.FocusedLabel) {
                            this.App.ExecCommandByName("paste", this.GetFocusedLabel());
                        }
                    }
                    Event.preventDefault();
                    break;
                case 89: /*y*/
                    if (Event.shiftKey || Event.ctrlKey) {
                        this.App.ExecCommandByName("redo");
                    }
                    Event.preventDefault();
                    break;
                case 90: /*z*/
                    if (Event.shiftKey || Event.ctrlKey) {
                        this.App.ExecCommandByName("undo");
                    }
                    Event.preventDefault();
                    break;
                default:
                    handled = false;
                    break;
            }
            if (handled) {
                Event.stopPropagation();
            }
        }

        OnActivate(): void {
            this.Viewport.IsPointerEnabled = true;
        }

        OnDeactivate(): void {
            this.Viewport.IsPointerEnabled = false;
        }

        /**
            @method MoveToNearestNode
            @param {AssureNote.Direction} Dir 
        */
        MoveToNearestNode(Dir: Direction): boolean {
            var NextNode = this.FindNearestNode(this.ViewMap[this.FocusedLabel], Dir);
            if (NextNode) {
                this.FocusAndMoveToNode(NextNode);
            }
            return !!NextNode;
        }

        /**
            @method FocusAndMoveToNode
        */
        FocusAndMoveToNode(Node: NodeView): void;
        FocusAndMoveToNode(Label: string): void;
        FocusAndMoveToNode(Node: any): void {
            if (Node != null) {
                var NextNode: NodeView = Node.constructor == String ? this.ViewMap[Node] : Node;
                if (NextNode != null) {
                    this.ChangeFocusedLabel(NextNode.Label);
                    this.Viewport.MoveTo(NextNode.GetCenterGX(), NextNode.GetCenterGY(), this.Viewport.GetCameraScale(), 50);
                }
            }
        }

        /**
            @method FindNearestNode
            @param {AssureNote.NodeView} CenterNode. If null is given, Camera position is used instead of the node.
            @param {AssureNote.Direction} Dir 
            @return {AssureNote.NodeView} Found node. If no node is found, null is retured.
        */
        FindNearestNode(CenterNode: NodeView, Dir: Direction): NodeView {
            var RightLimitVectorX: number = 1;
            var RightLimitVectorY: number = 1;
            var LeftLimitVectorX: number = 1;
            var LeftLimitVectorY: number = 1;

            switch (Dir) {
                case Direction.Right:
                    LeftLimitVectorY = -1;
                    break;
                case Direction.Left:
                    RightLimitVectorX = -1;
                    RightLimitVectorY = -1;
                    LeftLimitVectorX = -1;
                    break;
                case Direction.Top:
                    RightLimitVectorY = -1;
                    LeftLimitVectorX = -1;
                    LeftLimitVectorY = -1;
                    break;
                case Direction.Bottom:
                    RightLimitVectorX = -1;
                    break;
            }
            var NearestNode: NodeView = null;
            var CurrentMinimumDistanceSquere = Infinity;
            var CX = CenterNode ? CenterNode.GetCenterGX() : this.Viewport.GetCameraGX();
            var CY = CenterNode ? CenterNode.GetCenterGY() : this.Viewport.GetCameraGY();
            this.TopNodeView.TraverseVisibleNode((Node: NodeView) => {
                var DX = Node.GetCenterGX() - CX;
                var DY = Node.GetCenterGY() - CY;
                var DDotR = DX * RightLimitVectorX + DY * RightLimitVectorY;
                var DDotL = DX * LeftLimitVectorX + DY * LeftLimitVectorY;
                if (DDotR > 0 && DDotL > 0) {
                    var DistanceSquere = DX * DX + DY * DY;
                    if (DistanceSquere < CurrentMinimumDistanceSquere) {
                        CurrentMinimumDistanceSquere = DistanceSquere;
                        NearestNode = Node;
                    }
                }
            });
            return NearestNode;
        }

        /**
           @method FoldDeepSubGoals
           @param {NodeView} NodeView
        */
        FoldDeepSubGoals(NodeView: NodeView): void {
            NodeView.ForEachVisibleChildren((SubNode: NodeView) => {
                this.FoldDeepSubGoals(SubNode);
                if (SubNode.GetNodeType() == GSNType.Goal && SubNode.Children != null) {
                    if (SubNode.Children.length != 1 || SubNode.Children[0].GetNodeType() != GSNType.Evidence) {
                        SubNode.SetIsFolded(true);
                    }
                }
            });
        }

        /**
           @method ChangeFocusedLabel
           @param {string} Label If label is null, there is no focused label.
        */
        ChangeFocusedLabel(Label: string): void {
            this.App.SocketManager.Emit("focusednode", Label);
            AssureNoteUtils.UpdateHash(Label);
            if (this.ContextMenu.IsEnable) {
                this.ContextMenu.Remove();
            }
            if (this.NodeTooltip.IsEnable) {
                this.NodeTooltip.Remove();
            }
            if (Label == null) {
                var oldNodeView = this.ViewMap[this.FocusedLabel];
                if (oldNodeView != null) {
                    oldNodeView.RemoveColorStyle(ColorStyle.Highlight);
                }
                this.FocusedLabel = null;
                return;
            }
            var NodeView = this.ViewMap[Label];
            if (NodeView != null) {
                var oldNodeView = this.ViewMap[this.FocusedLabel];
                if (oldNodeView != null) {
                    oldNodeView.RemoveColorStyle(ColorStyle.Highlight);
                }
                this.FocusedLabel = Label;
                NodeView.AddColorStyle(ColorStyle.Highlight);
            }
        }

        GetFocusedLabel(): string {
            return this.FocusedLabel;
        }

        HasMonitorNode(): boolean {
            for(var Label in this.ViewMap) {
                var View = this.ViewMap[Label];
                if(View.IsMonitorNode()) {
                    return true;
                }
            }
            return false;
        }

        DrawGSN(Node: GSNNode): void {
            var NewNodeView: NodeView = new NodeView(Node, true);
            this.InitializeView(NewNodeView);
            this.Draw();
        }

        InitializeView(NodeView: NodeView): void {
            this.TopNodeView = NodeView;
            this.ViewMap = {};
            this.TopNodeView.UpdateViewMap(this.ViewMap);
        }

        Draw(Label?: string, Duration?: number, FixedNode?: NodeView): void {
            var t0 = AssureNoteUtils.GetTime();
            this.Clear();
            var t1 = AssureNoteUtils.GetTime();
            //console.log("Clear: " + (t1 - t0));
            var TargetView = this.ViewMap[Label];

            if (TargetView == null) {
                TargetView = this.TopNodeView;
            }

            var FixedNodeGX0: number;
            var FixedNodeGY0: number;
            var FixedNodeDX: number;
            var FixedNodeDY: number;
            if (FixedNode) {
                FixedNodeGX0 = FixedNode.GetGX();
                FixedNodeGY0 = FixedNode.GetGY();
            }

            this.LayoutEngine.DoLayout(this, TargetView);
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";

            //GSNShape.__Debug_Animation_SkippedNodeCount = 0;
            //GSNShape.__Debug_Animation_TotalNodeCount = 0;

            this.FoldingAnimationTask.Cancel(true);

            NodeView.SetGlobalPositionCacheEnabled(true);
            var FoldingAnimationCallbacks: Function[] = [];

            var ScreenRect = this.Viewport.GetPageRectInGxGy();
            if (FixedNode) {
                FixedNodeDX = FixedNode.GetGX() - FixedNodeGX0;
                FixedNodeDY = FixedNode.GetGY() - FixedNodeGY0;
                if (FixedNodeDX > 0) {
                    ScreenRect.Width += FixedNodeDX;
                } else {
                    ScreenRect.Width -= FixedNodeDX;
                    ScreenRect.X += FixedNodeDX;
                }
                var Scale = this.Viewport.GetCameraScale();
                var Task = this.Viewport.CreateMoveTaskFunction(FixedNodeDX, FixedNodeDY, Scale, Duration);
                if (Task) {
                    FoldingAnimationCallbacks.push(Task);
                } else {
                    FoldingAnimationCallbacks.push(() => { this.UpdateHiddenNodeList(); });
                }
            } else {
                FoldingAnimationCallbacks.push(() => { this.UpdateHiddenNodeList(); });
            }

            var t2 = AssureNoteUtils.GetTime();
            TargetView.UpdateNodePosition(FoldingAnimationCallbacks, Duration, ScreenRect);
            TargetView.ClearAnimationCache();
            var t3 = AssureNoteUtils.GetTime();
            //console.log("Update: " + (t3 - t2));
            this.FoldingAnimationTask.StartMany(Duration, FoldingAnimationCallbacks);

            var Shape = TargetView.GetShape();
            this.Viewport.CameraLimitRect = new Rect(Shape.GetTreeLeftLocalX() - 100, -100, Shape.GetTreeWidth() + 200, Shape.GetTreeHeight() + 200);

            var PageRect = this.Viewport.GetPageRectInGxGy();
            this.TopNodeView.TraverseVisibleNode((Node: NodeView) => {
                if (Node.IsInRect(PageRect)) {
                    this.OnScreenNodeMap[Node.Label] = Node;
                } else {
                    this.HiddenNodeMap[Node.Label] = Node;
                    this.HiddenNodeBuffer.appendChild(Node.Shape.Content);
                    this.HiddenNodeBuffer.appendChild(Node.Shape.ShapeGroup);
                }
            });

            NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
            //console.log("Animation: " + GSNShape.__Debug_Animation_TotalNodeCount + " nodes moved, " +
            //    GSNShape.__Debug_Animation_SkippedNodeCount + " nodes skipped. reduce rate = " +
            //    GSNShape.__Debug_Animation_SkippedNodeCount / GSNShape.__Debug_Animation_TotalNodeCount);
        }

        public ForceAppendAllOutOfScreenNode() {
            var UpdateArrow = (Node: NodeView) => {
                if (Node.Parent) {
                    var Arrow = Node.Shape.ArrowPath;
                    if (Arrow.parentNode != this.HiddenNodeBuffer) {
                        this.HiddenNodeBuffer.appendChild(Arrow);
                    }
                }
            };
            for (var Label in this.HiddenNodeMap) {
                var Node = this.HiddenNodeMap[<string>Label];
                delete this.HiddenNodeMap[<string>Label];
                this.OnScreenNodeMap[<string>Label] = Node;
                this.ContentLayer.appendChild(Node.Shape.Content);
                this.SVGLayerNodeGroup.appendChild(Node.Shape.ShapeGroup);
                UpdateArrow(Node);
            }
        }

        private UpdateHiddenNodeList() {
            NodeView.SetGlobalPositionCacheEnabled(true);
            var PageRect = this.Viewport.GetPageRectInGxGy();
            var UpdateArrow = (Node: NodeView) => {
                if (Node.Parent) {
                    var Arrow = Node.Shape.ArrowPath;
                    if (Node.IsConnectorInRect(PageRect)) {
                        if (Arrow.parentNode != this.SVGLayerConnectorGroup) {
                            this.SVGLayerConnectorGroup.appendChild(Arrow);
                        }
                    } else {
                        if (Arrow.parentNode != this.HiddenNodeBuffer) {
                            this.HiddenNodeBuffer.appendChild(Arrow);
                        }
                    }
                }
            };
            for (var Label in this.OnScreenNodeMap) {
                var Node = this.OnScreenNodeMap[<string>Label];
                if (!Node.IsInRect(PageRect)) {
                    delete this.OnScreenNodeMap[<string>Label];
                    this.HiddenNodeMap[<string>Label] = Node;
                    this.HiddenNodeBuffer.appendChild(Node.Shape.Content);
                    this.HiddenNodeBuffer.appendChild(Node.Shape.ShapeGroup);
                }
                UpdateArrow(Node);
            }
            for (var Label in this.HiddenNodeMap) {
                var Node = this.HiddenNodeMap[<string>Label];
                if (Node.IsInRect(PageRect)) {
                    delete this.HiddenNodeMap[<string>Label];
                    this.OnScreenNodeMap[<string>Label] = Node;
                    this.ContentLayer.appendChild(Node.Shape.Content);
                    this.SVGLayerNodeGroup.appendChild(Node.Shape.ShapeGroup);
                }
                UpdateArrow(Node);
            }
            NodeView.SetGlobalPositionCacheEnabled(false);
            ////console.log("Visible:Hidden = " + Object.keys(this.OnScreenNodeMap).length + ":" + Object.keys(this.HiddenNodeMap).length);
        }

        private Clear(): void {
            document.getElementById("assure-note").style.display = "none";
            this.ContentLayer.innerHTML = "";
            this.SVGLayer.removeChild(this.SVGLayerConnectorGroup);
            this.SVGLayer.removeChild(this.SVGLayerNodeGroup);
            this.SVGLayerConnectorGroup = AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayerNodeGroup = AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayer.appendChild(this.SVGLayerConnectorGroup);
            this.SVGLayer.appendChild(this.SVGLayerNodeGroup);
            this.Viewport.SVGLayer = this.SVGLayer;
            this.HiddenNodeMap = {};
            this.OnScreenNodeMap = {};
            this.HiddenNodeBuffer = document.createDocumentFragment();
            document.getElementById("assure-note").style.display = "";
        }

        DisplayPluginPanel(PluginName: string, Label?: string): void {
            var Plugin = this.App.PluginManager.GetPanelPlugin(PluginName, Label);
            Plugin.Display(this.App.FullScreenEditorPanel, this.App.MasterRecord.GetLatestDoc(), Label);
        }

        GetFocusedView(): NodeView {
            if (this.ViewMap) {
                return this.ViewMap[this.FocusedLabel];
            }
            return null;
        }

        GetNodeViewFromUID(UID: number): NodeView {
            for (var i in this.ViewMap) {
                if (this.ViewMap[i].Model.UID == UID) return this.ViewMap[i];
            }
            return null;
        }

        NavigateUp(): boolean {
            return this.MoveToNearestNode(Direction.Top);
        }
        NavigateDown(): boolean {
            return this.MoveToNearestNode(Direction.Bottom);
        }
        NavigateLeft(): boolean {
            return this.MoveToNearestNode(Direction.Left);
        }
        NavigateRight(): boolean {
            return this.MoveToNearestNode(Direction.Right);
        }
        NavigateHome(): void {
            this.FocusAndMoveToNode(this.TopNodeView);
        }
        NavigateParent(): void {
            if (this.FocusedLabel) {
                var Parent = this.ViewMap[this.FocusedLabel].Parent;
                if (Parent) {
                    this.FocusAndMoveToNode(this.ViewMap[this.FocusedLabel].Parent);
                    return;
                }
            }
            this.FocusAndMoveToNode(this.TopNodeView);
        }

    }
}
