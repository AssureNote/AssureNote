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
///<reference path='../d.ts/codemirror.d.ts'/>

///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>
///<reference path='../plugin/SingleNodeEditor/SingleNodeEditor.ts'/>

module AssureNote {
    /**
        @class AssureNote.PictgramPanel
    */

    export class PictgramPanel {
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

        CurrentDoc: GSNDoc;// Convert to caseview
        private FocusedLabel: string;// A label pointed out or clicked.
        // We do not use FocusedView but FocusedLabel to make it modular.

        constructor(public AssureNoteApp: AssureNoteApp) {
            this.SVGLayer = <SVGGElement>(<any>document.getElementById("svg-layer"));
            this.EventMapLayer = <HTMLDivElement>(document.getElementById("eventmap-layer"));
            this.ContentLayer = <HTMLDivElement>(document.getElementById("content-layer"));
            this.ControlLayer = <HTMLDivElement>(document.getElementById("control-layer"));
            this.Viewport = new ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ControlLayer);
            this.LayoutEngine = new SimpleLayoutEngine(this.AssureNoteApp);

            var Bar = new NodeMenu(AssureNoteApp);
            var Tooltip: Tooltip = new AssureNote.Tooltip(AssureNoteApp);
            this.ContentLayer.addEventListener("click", (event: MouseEvent) => {
                var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
                this.AssureNoteApp.DebugP("click:" + Label);
                this.ChangeFocusedLabel(Label);
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                if (Tooltip.IsEnable) {
                    Tooltip.Remove();
                }
                event.preventDefault();
            });

            this.EventMapLayer.addEventListener("pointerdown", (event: MouseEvent) => {
                this.ChangeFocusedLabel(null);
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                if (Tooltip.IsEnable) {
                    Tooltip.Remove();
                }
            });

            this.ContentLayer.addEventListener("contextmenu", (event: MouseEvent) => {
                var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = this.ViewMap[Label];
                if (NodeView != null) {
                    this.ChangeFocusedLabel(Label);
                    if (Bar.IsEnable) {
                        Bar.Remove();
                    }
                    if (Tooltip.IsEnable) {
                        Tooltip.Remove();
                    }
                    if (this.AssureNoteApp.SocketManager.IsEditable(NodeView.Model.UID)) {
                        var Buttons = this.AssureNoteApp.PluginManager.GetMenuBarButtons(NodeView);
                        Bar.Create(this.ViewMap[Label], this.ControlLayer, Buttons);
                    } else {
                        (<any>$).notify("Warning:Other user edits this node!", "warn");
                    }
                } else {
                    this.FocusedLabel = null;
                }
                event.preventDefault();
            });

            this.ContentLayer.addEventListener("dblclick", (event: MouseEvent) => {
                var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = this.ViewMap[Label];
                this.AssureNoteApp.DebugP("double click:" + Label);
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                if (Tooltip.IsEnable) {
                    Tooltip.Remove();
                }
                this.AssureNoteApp.ExecDoubleClicked(NodeView);
                this.AssureNoteApp.SocketManager.FoldNode({"IsFolded": NodeView.IsFolded, "UID": NodeView.Model.UID});
                event.preventDefault();
            });

            this.CmdLine = new CommandLine();
            this.Search = new Search(AssureNoteApp);

            // Following event handler is a little dirty. We need refactoring.

            document.addEventListener("keydown", (event: KeyboardEvent) => {
                if (!this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                switch (event.keyCode) {
                    case 58: /*: in Firefox*/
                        if (window.navigator.userAgent.toLowerCase().match("firefox").length == 0) {
                            break;
                        }
                    case 186: /*:*/
                    case 191: /*/*/
                    case 219: /*@*/
                        if (this.Search.IsSearching()) {
                            this.Search.ResetParam();
                        }
                        this.CmdLine.Show();
                        break;
                    case 13: /*Enter*/
                        if (this.CmdLine.IsVisible && this.CmdLine.IsEnable) {
                            var ParsedCommand = new CommandParser();
                            ParsedCommand.Parse(this.CmdLine.GetValue());
                            if (ParsedCommand.GetMethod() == "search") {
                                this.Search.Search(this.MasterView, ParsedCommand.GetArgs()[0]);
                            }
                            this.AssureNoteApp.ExecCommand(ParsedCommand);
                            this.CmdLine.AddHistory(ParsedCommand.GetRawString());
                            this.CmdLine.Hide();
                            this.CmdLine.Clear();
                            event.preventDefault();
                        } else if (!this.CmdLine.IsVisible && this.Search.IsSearching()) {
                            this.Search.SearchNext(this.MasterView, event.shiftKey);
                        }
                        break;
                    case 27: /*Esc*/
                        if (this.Search.IsSearching()) {
                            this.Search.ResetParam();
                        }
                        if (this.CmdLine.IsVisible) {
                            this.CmdLine.Hide();
                            this.CmdLine.Clear();
                        }
                        break;
                    case 37: /*left*/
                        if (!this.CmdLine.IsVisible) {
                            this.MoveToNearestNode(Direction.Left);
                        }
                        break;
                    case 38: /*up*/
                        if (this.CmdLine.IsVisible) {
                            this.CmdLine.ShowPrevHistory();
                        } else {
                            this.MoveToNearestNode(Direction.Top);
                        }
                        break;
                    case 39: /*right*/
                        if (!this.CmdLine.IsVisible) {
                            this.MoveToNearestNode(Direction.Right);
                        }
                        break;
                    case 40: /*down*/
                        if (this.CmdLine.IsVisible) {
                            this.CmdLine.ShowNextHistory();
                        } else {
                            this.MoveToNearestNode(Direction.Bottom);
                        }
                        break;
                    case 72: /*h*/
                        if (!this.CmdLine.IsVisible) {
                            this.MoveToNearestNode(Direction.Left);
                        }
                        break;
                    case 74: /*j*/
                        if (!this.CmdLine.IsVisible) {
                            this.MoveToNearestNode(Direction.Bottom);
                        }
                        break;
                    case 75: /*k*/
                        if (!this.CmdLine.IsVisible) {
                            this.MoveToNearestNode(Direction.Top);
                        }
                        break;
                    case 76: /*l*/
                        if (!this.CmdLine.IsVisible) {
                            this.MoveToNearestNode(Direction.Right);
                        }
                        break;
                    case 70: /*f*/
                        if (!this.CmdLine.IsVisible) {
                            var FoldCommand = this.AssureNoteApp.FindCommandByCommandLineName("fold");
                            if (FoldCommand && this.FocusedLabel) {
                                FoldCommand.Invoke(null, [this.FocusedLabel]);
                            }
                        }
                        break;
                    case 65: /*a*/
                    case 73: /*i*/
                        if (!this.CmdLine.IsVisible) {
                            var FoldCommand = this.AssureNoteApp.FindCommandByCommandLineName("edit");
                            if (FoldCommand && this.FocusedLabel) {
                                FoldCommand.Invoke(null, [this.FocusedLabel]);
                            }
                        }
                        break;
                    case 8: /*BackSpace*/
                        if(this.CmdLine.IsVisible && this.CmdLine.IsEmpty()) {
                            this.CmdLine.Hide();
                            this.CmdLine.Clear();
                            event.preventDefault();
                            break;
                        }
                        break;
                }
            });

            var ToolTipFocusedLabel = null;
            this.ContentLayer.addEventListener("mouseover", (event: MouseEvent) => {
                if (!this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                var Label = AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = this.ViewMap[Label];
                if (NodeView != null && ToolTipFocusedLabel != Label) {
                    ToolTipFocusedLabel = Label;
                    var Tooltips = this.AssureNoteApp.PluginManager.GetTooltipContents(NodeView);
                    Tooltip.Create(NodeView, this.ControlLayer, Tooltips);
                }
            });

            this.ContentLayer.addEventListener("mouseleave", (event: MouseEvent) => {
                /* We use mouseleave event instead of mouseout since mouseout/mouseenter fires
                   every time the pointer enters the sub-element of ContentLayer.
                   Mouseleave can prevent this annoying event firing. */
                if (!this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }

                if (Tooltip.IsEnable) {
                    Tooltip.Remove();
                    ToolTipFocusedLabel = null;
                }
            });

            var DragHandler = (e) => {
                if (this.AssureNoteApp.PluginPanel.IsVisible) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            };
            $(this.EventMapLayer)
                .on('dragenter', DragHandler)
                .on('dragover', DragHandler)
                .on('dragleave', DragHandler)
                .on('drop', (event: JQueryEventObject) => {
                    if (this.AssureNoteApp.PluginPanel.IsVisible) {
                        event.stopPropagation();
                        event.preventDefault();
                        this.AssureNoteApp.LoadFiles((<any>(<any>event.originalEvent).dataTransfer).files);
                    }
                });

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
                            this.AssureNoteApp.ExecDoubleClicked(Node);
                            this.AssureNoteApp.SocketManager.FoldNode({"IsFolded": Node.IsFolded, "UID": Node.Model.UID});
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

        /**
            @method MoveToNearestNode
            @param {AssureNote.Direction} Dir 
        */
        MoveToNearestNode(Dir: Direction): void {
            var NextNode = this.FocusedLabel ? this.FindNearestNode(this.ViewMap[this.FocusedLabel], Dir) : this.MasterView;
            if (NextNode != null) {
                this.ChangeFocusedLabel(NextNode.Label);
                this.Viewport.MoveTo(NextNode.GetCenterGX(), NextNode.GetCenterGY(), this.Viewport.GetCameraScale(), 50);
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
            AssureNoteUtils.UpdateHash(Label);
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

        DisplayPictgram(): void {
            this.AssureNoteApp.PluginPanel.Clear();
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
            NodeView.SetGlobalPositionCacheEnabled(true);

            TargetView.UpdateDocumentPosition(Duration);
            TargetView.ClearAnimationCache();

            NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
        }

        private Clear(): void {
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";
            for (var i = this.ContentLayer.childNodes.length - 1; i >= 0; i--) {
                this.ContentLayer.removeChild(this.ContentLayer.childNodes[i]);
            }
            for (var i = this.SVGLayer.childNodes.length - 1; i >= 0; i--) {
                this.SVGLayer.removeChild(this.SVGLayer.childNodes[i]);
            }
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
        }

        DisplayPluginPanel(PluginName: string, Label?: string): void {
            var Plugin = this.AssureNoteApp.PluginManager.GetPanelPlugin(PluginName, Label);
            Plugin.Display(this.AssureNoteApp.PluginPanel, this.AssureNoteApp.MasterRecord.GetLatestDoc(), Label);
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

        //TODO
        NavigateUp(): void { }
        NavigateDown(): void { }
        NavigateLeft(): void { }
        NavigateRight(): void { }
        NavigateHome(): void { }

    }

    export class PluginPanel {
        FullScreenEditor: Plugin;
        SingleNodeEditor: Plugin;
        IsVisible: boolean = true;

        constructor(public AssureNoteApp: AssureNoteApp) {
            var textarea = CodeMirror.fromTextArea(<HTMLTextAreaElement>document.getElementById('editor'), {
                lineNumbers: true,
                mode: 'wgsn',
                lineWrapping: true,
            });
            this.FullScreenEditor = new FullScreenEditorPlugin(AssureNoteApp, textarea, '#editor-wrapper');
            $("#plugin-layer").on('mousewheel', (event: MouseWheelEvent) => { event.stopPropagation(); });

            textarea = CodeMirror.fromTextArea(<HTMLTextAreaElement>document.getElementById('singlenode-editor'), {
                lineNumbers: false,
                mode: 'wgsn',
                lineWrapping: true,
            });
            this.SingleNodeEditor = new SingleNodeEditorPlugin(AssureNoteApp, textarea, '#singlenode-editor-wrapper');
            AssureNoteApp.PluginManager.SetPlugin("open-single", this.SingleNodeEditor);
            AssureNoteApp.PluginManager.SetPlugin("open", this.FullScreenEditor);
        }

        Clear(): void {
        }
    }

    export class Pane {
        IsEnable: boolean;
        constructor(public AssureNoteApp: AssureNoteApp) { }

        Create(NodeView: NodeView, ControlLayer: HTMLDivElement, contents: any) {
            /* Do nothing */
        }

        Remove(): void {
        }
    }
}
