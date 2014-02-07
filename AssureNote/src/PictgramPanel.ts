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
        SVGLayer: SVGGElement;
        EventMapLayer: HTMLDivElement;
        ContentLayer: HTMLDivElement;
        ControlLayer: HTMLDivElement;
        Viewport: ViewportManager;
        ViewMap: { [index: string]: NodeView };
        MasterView: NodeView;
        CmdLine: CommandLine;
        Search: Search;
        ContextMenu: NodeMenu;
        NodeTooltip: Tooltip;

        CurrentDoc: GSNDoc;// Convert to caseview
        private FocusedLabel: string;// A label pointed out or clicked.
        // We do not use FocusedView but FocusedLabel to make it modular.

        private FoldingAnimationTask = new AssureNote.AnimationFrameTask();
        
        constructor(public App: AssureNoteApp) {
            super(App);
            this.SVGLayer = <SVGGElement>(<Element>document.getElementById("svg-layer"));
            this.EventMapLayer = <HTMLDivElement>(document.getElementById("eventmap-layer"));
            this.ContentLayer = <HTMLDivElement>(document.getElementById("content-layer"));
            this.ControlLayer = <HTMLDivElement>(document.getElementById("control-layer"));
            this.Viewport = new ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ControlLayer);
            this.LayoutEngine = new SimpleLayoutEngine(this.App);

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
                event.preventDefault();
            });

            this.CmdLine = new CommandLine(App);
            this.Search = new Search(App);

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

            this.Viewport.ScrollManager.OnDragged = (Viewport: ViewportManager) => {
                if (!this.MasterView) {
                    return;
                }
                var HitBoxCenter = new Point(Viewport.GXFromPageX(Viewport.GetPageCenterX()), Viewport.GYFromPageY(Viewport.GetPageHeight() / 3));
                this.MasterView.TraverseVisibleNode((Node: NodeView) => {
                    if (Node.IsFolded) {
                        var DX = HitBoxCenter.X - Node.GetCenterGX();
                        var DY = HitBoxCenter.Y - Node.GetCenterGY();
                        var R = 150 / this.Viewport.GetCameraScale();
                        if (DX * DX + DY * DY < R * R) {
                            this.App.ExecDoubleClicked(Node);
                        }
                        return false;
                    }
                });
            };
            this.Viewport.ScrollManager.OnStartDrag = (Viewport: ViewportManager) => {
                $("#auto-expand-area").show(100);
                (<any>$(".dropdown.open > .dropdown-toggle")).dropdown("toggle");
            };
            this.Viewport.ScrollManager.OnEndDrag = (Viewport: ViewportManager) => {
                $("#auto-expand-area").hide(100);
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
                    if (this.Search.IsSearching()) {
                        this.Search.EndSearch();
                    }
                    this.CmdLine.Activate();
                    break;
                case 27: /*Esc*/
                    if (this.Search.IsSearching()) {
                        this.Search.EndSearch();
                        Event.preventDefault();
                    }
                    if (this.App.HistoryPanel) {
                        this.App.HistoryPanel.Hide();
                    }
                    break;
                case 13: /*Enter*/
                    if (this.Search.IsSearching()) {
                        this.Search.SearchNext(this.MasterView, event.shiftKey);
                        Event.preventDefault();
                    }
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
                    this.NavigateUp();
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
                case 70: /*f*/
                    if (!this.CmdLine.IsVisible) {
                        var EditCommand = this.App.FindCommandByCommandLineName("fold");
                        if (EditCommand && this.FocusedLabel) {
                            EditCommand.Invoke(null, [this.FocusedLabel]);
                        }
                    }
                    Event.preventDefault();
                    break;
                case 65: /*a*/
                case 73: /*i*/
                    var EditCommand = this.App.FindCommandByCommandLineName(Event.shiftKey ? "edit" : "singleedit");
                    if (EditCommand && this.FocusedLabel) {
                        EditCommand.Invoke(null, [this.FocusedLabel]);
                    }
                    Event.preventDefault();
                    break;
                case 187: /*+*/
                    var Command = this.App.FindCommandByCommandLineName("set-scale");
                    if (Command && Event.shiftKey) {
                        Command.Invoke(null, [this.Viewport.GetCameraScale() + 0.1]);
                    }
                    Event.preventDefault();
                    break;
                case 189: /*-*/
                    var Command = this.App.FindCommandByCommandLineName("set-scale");
                    if (Command && Event.shiftKey) {
                        Command.Invoke(null, [this.Viewport.GetCameraScale() - 0.1]);
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
        MoveToNearestNode(Dir: Direction): void {
            var NextNode = this.FocusedLabel ? this.FindNearestNode(this.ViewMap[this.FocusedLabel], Dir) : this.MasterView;
            this.FocusAndMoveToNode(NextNode);
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
            @param {AssureNote.NodeView} CenterNode
            @param {AssureNote.Direction} Dir 
            @return {AssureNote.NodeView} Found node. If no node is found, null is retured.
        */
        FindNearestNode(CenterNode: NodeView, Dir: Direction): NodeView {
            if (!CenterNode) {
                return null;
            }
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
            this.MasterView.TraverseVisibleNode((Node: NodeView) => {
                var DX = Node.GetCenterGX() - CenterNode.GetCenterGX();
                var DY = Node.GetCenterGY() - CenterNode.GetCenterGY();
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
                        SubNode.IsFolded = true;
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

        InitializeView(NodeView: NodeView): void {
            this.MasterView = NodeView;
            this.ViewMap = {};
            this.MasterView.UpdateViewMap(this.ViewMap);
        }

        Draw(Label?: string, Duration?: number): void {
            this.Clear();
            var TargetView = this.ViewMap[Label];

            if (TargetView == null) {
                TargetView = this.MasterView;
            }
            this.LayoutEngine.DoLayout(this, TargetView);
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";

            this.FoldingAnimationTask.Cancel(true);

            NodeView.SetGlobalPositionCacheEnabled(true);
            var FoldingAnimationCallbacks = [];

            TargetView.UpdateDocumentPosition(FoldingAnimationCallbacks, Duration);
            TargetView.ClearAnimationCache();
            this.FoldingAnimationTask.StartMany(Duration, FoldingAnimationCallbacks);

            var Shape = TargetView.GetShape();
            this.Viewport.CameraLimitRect = new Rect(Shape.GetTreeLeftLocalX() - 100, -100, Shape.GetTreeWidth() + 200, Shape.GetTreeHeight() + 200);

            NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
        }

        private Clear(): void {
            this.ContentLayer.innerHTML = "";
            this.SVGLayer.style.display = "none";
            for (var i = this.SVGLayer.childNodes.length - 1; i >= 0; i--) {
                this.SVGLayer.removeChild(this.SVGLayer.childNodes[i]);
            }
            this.SVGLayer.style.display = "";
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

        NavigateUp(): void {
            this.MoveToNearestNode(Direction.Top);
        }
        NavigateDown(): void {
            this.MoveToNearestNode(Direction.Bottom);
        }
        NavigateLeft(): void {
            this.MoveToNearestNode(Direction.Left);
        }
        NavigateRight(): void {
            this.MoveToNearestNode(Direction.Right);
        }
        NavigateHome(): void {
            this.FocusAndMoveToNode(this.MasterView);
        }

    }
}
