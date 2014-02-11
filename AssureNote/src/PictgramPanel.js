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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./Panel.ts'/>
///<reference path='./SearchNode.ts'/>
///<reference path='./LayoutEngine.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>
///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>
///<reference path='../plugin/SingleNodeEditor/SingleNodeEditor.ts'/>
///<reference path='./CommandLine.ts'/>
///<reference path='./Editor.ts'/>
var AssureNote;
(function (AssureNote) {
    /**
    @class AssureNote.PictgramPanel
    @extends AssureNote.Panel
    */
    var PictgramPanel = (function (_super) {
        __extends(PictgramPanel, _super);
        function PictgramPanel(App) {
            var _this = this;
            _super.call(this, App);
            this.App = App;
            // We do not use FocusedView but FocusedLabel to make it modular.
            this.FoldingAnimationTask = new AssureNote.AnimationFrameTask();
            this.SVGLayer = document.getElementById("svg-layer");
            this.EventMapLayer = (document.getElementById("eventmap-layer"));
            this.ContentLayer = (document.getElementById("content-layer"));
            this.ControlLayer = (document.getElementById("control-layer"));
            this.Viewport = new AssureNote.ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ControlLayer);
            this.LayoutEngine = new AssureNote.SimpleLayoutEngine(this.App);

            this.ContextMenu = new AssureNote.NodeMenu(App);
            this.NodeTooltip = new AssureNote.Tooltip(App);

            this.ContentLayer.addEventListener("click", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                _this.App.DebugP("click:" + Label);
                if (_this.IsActive()) {
                    _this.ChangeFocusedLabel(Label);
                } else {
                    _this.App.SocketManager.Emit("focusednode", Label);
                }
                if (_this.ContextMenu.IsEnable) {
                    _this.ContextMenu.Remove();
                }
                if (_this.NodeTooltip.IsEnable) {
                    _this.NodeTooltip.Remove();
                }
                event.preventDefault();
            });

            this.EventMapLayer.addEventListener("pointerdown", function (event) {
                if (_this.IsActive()) {
                    _this.ChangeFocusedLabel(null);
                }
            });

            this.ContentLayer.addEventListener("contextmenu", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null) {
                    _this.ChangeFocusedLabel(Label);
                    switch (NodeView.Status) {
                        case 0 /* TreeEditable */:
                            var Buttons = _this.App.PluginManager.GetMenuBarButtons(NodeView);
                            _this.ContextMenu.Create(_this.ViewMap[Label], _this.ControlLayer, Buttons);
                            break;
                        case 1 /* SingleEditable */:
                            var Buttons = _this.App.PluginManager.GetMenuBarButtons(NodeView);
                            _this.ContextMenu.Create(_this.ViewMap[Label], _this.ControlLayer, Buttons);
                            break;
                        case 2 /* Locked */:
                            $.notify("Warning: currently edited", 'warn');
                            break;
                    }
                } else {
                    _this.FocusedLabel = null;
                }
                event.preventDefault();
            });

            this.ContentLayer.addEventListener("dblclick", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                _this.App.DebugP("double click:" + Label);
                if (_this.ContextMenu.IsEnable) {
                    _this.ContextMenu.Remove();
                }
                if (_this.NodeTooltip.IsEnable) {
                    _this.NodeTooltip.Remove();
                }
                _this.App.ExecDoubleClicked(NodeView);
                event.preventDefault();
            });

            this.CmdLine = new AssureNote.CommandLine(App);
            this.Search = new AssureNote.SearchResultNodeList(this);

            var ToolTipFocusedLabel = null;
            this.ContentLayer.addEventListener("mouseover", function (event) {
                if (_this.App.FullScreenEditorPanel.IsActive()) {
                    return;
                }
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null && ToolTipFocusedLabel != Label) {
                    ToolTipFocusedLabel = Label;
                    var Tooltips = _this.App.PluginManager.GetTooltipContents(NodeView);
                    _this.NodeTooltip.Create(NodeView, _this.ControlLayer, Tooltips);
                }
            });

            this.ContentLayer.addEventListener("mouseleave", function (event) {
                /* We use mouseleave event instead of mouseout since mouseout/mouseenter fires
                every time the pointer enters the sub-element of ContentLayer.
                Mouseleave can prevent this annoying event firing. */
                if (_this.NodeTooltip.IsEnable) {
                    _this.NodeTooltip.Remove();
                    ToolTipFocusedLabel = null;
                }
            });

            var DragHandler = function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (_this.IsActive()) {
                    event.dataTransfer.dropEffect = "move";
                } else {
                    event.dataTransfer.dropEffect = "none";
                }
            };
            document.addEventListener("dragenter", DragHandler, true);
            document.addEventListener("dragover", DragHandler, true);
            document.addEventListener("dragleave", DragHandler, true);
            document.addEventListener("drop", function (event) {
                event.stopPropagation();
                event.preventDefault();
                if (_this.IsActive()) {
                    _this.App.LoadFiles(event.dataTransfer.files);
                }
            }, true);

            //if(history.pushState) {
            //    window.addEventListener('popstate', (event: Event) => {
            //        this.App.LoadDefaultWGSN();
            //    });
            //}
            this.Viewport.ScrollManager.OnDragged = function (Viewport) {
                if (!_this.MasterView) {
                    return;
                }
                var HitBoxCenter = new AssureNote.Point(Viewport.GXFromPageX(Viewport.GetPageCenterX()), Viewport.GYFromPageY(Viewport.GetPageHeight() / 3));
                _this.MasterView.TraverseVisibleNode(function (Node) {
                    if (Node.IsFolded) {
                        var DX = HitBoxCenter.X - Node.GetCenterGX();
                        var DY = HitBoxCenter.Y - Node.GetCenterGY();
                        var R = 150 / _this.Viewport.GetCameraScale();
                        if (DX * DX + DY * DY < R * R) {
                            _this.App.ExecDoubleClicked(Node);
                        }
                        return false;
                    }
                });
            };
            this.Viewport.ScrollManager.OnStartDrag = function (Viewport) {
                $("#auto-expand-area").show(100);
                $(".dropdown.open > .dropdown-toggle").dropdown("toggle");
            };
            this.Viewport.ScrollManager.OnEndDrag = function (Viewport) {
                $("#auto-expand-area").hide(100);
            };
        }
        PictgramPanel.prototype.OnKeyDown = function (Event) {
            var Label;
            var handled = true;
            switch (Event.keyCode) {
                case 58:
                case 186:
                case 191:
                case 219:
                    if (this.Search.IsVisiting()) {
                        this.Search.FinishVisit();
                    }
                    this.CmdLine.Activate();
                    break;
                case 27:
                    if (this.Search.IsVisiting()) {
                        this.Search.FinishVisit();
                        Event.preventDefault();
                    }
                    if (this.App.HistoryPanel) {
                        this.App.HistoryPanel.Hide();
                    }
                    break;
                case 13:
                    if (this.Search.IsVisiting()) {
                        this.Search.VisitNext(event.shiftKey);
                        Event.preventDefault();
                    }
                    break;
                case 72:
                case 37:
                    this.NavigateLeft();
                    Event.preventDefault();
                    break;
                case 74:
                case 40:
                    this.NavigateDown();
                    Event.preventDefault();
                    break;
                case 75:
                case 38:
                    this.NavigateUp();
                    Event.preventDefault();
                    break;
                case 76:
                case 39:
                    this.NavigateRight();
                    Event.preventDefault();
                    break;
                case 36:
                    this.NavigateHome();
                    Event.preventDefault();
                    break;
                case 70:
                    if (!this.CmdLine.IsVisible) {
                        var EditCommand = this.App.FindCommandByCommandLineName("fold");
                        if (EditCommand && this.FocusedLabel) {
                            EditCommand.Invoke(null, [this.FocusedLabel]);
                        }
                    }
                    Event.preventDefault();
                    break;
                case 65:
                case 73:
                    var EditCommand = this.App.FindCommandByCommandLineName(Event.shiftKey ? "edit" : "singleedit");
                    if (EditCommand && this.FocusedLabel) {
                        EditCommand.Invoke(null, [this.FocusedLabel]);
                    }
                    Event.preventDefault();
                    break;
                case 187:
                    var Command = this.App.FindCommandByCommandLineName("set-scale");
                    if (Command && Event.shiftKey) {
                        Command.Invoke(null, [this.Viewport.GetCameraScale() + 0.1]);
                    }
                    Event.preventDefault();
                    break;
                case 189:
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
        };

        PictgramPanel.prototype.OnActivate = function () {
            this.Viewport.IsPointerEnabled = true;
        };

        PictgramPanel.prototype.OnDeactivate = function () {
            this.Viewport.IsPointerEnabled = false;
        };

        /**
        @method MoveToNearestNode
        @param {AssureNote.Direction} Dir
        */
        PictgramPanel.prototype.MoveToNearestNode = function (Dir) {
            var NextNode = this.FocusedLabel ? this.FindNearestNode(this.ViewMap[this.FocusedLabel], Dir) : this.MasterView;
            this.FocusAndMoveToNode(NextNode);
        };

        PictgramPanel.prototype.FocusAndMoveToNode = function (Node) {
            if (Node != null) {
                var NextNode = Node.constructor == String ? this.ViewMap[Node] : Node;
                if (NextNode != null) {
                    this.ChangeFocusedLabel(NextNode.Label);
                    this.Viewport.MoveTo(NextNode.GetCenterGX(), NextNode.GetCenterGY(), this.Viewport.GetCameraScale(), 50);
                }
            }
        };

        /**
        @method FindNearestNode
        @param {AssureNote.NodeView} CenterNode
        @param {AssureNote.Direction} Dir
        @return {AssureNote.NodeView} Found node. If no node is found, null is retured.
        */
        PictgramPanel.prototype.FindNearestNode = function (CenterNode, Dir) {
            if (!CenterNode) {
                return null;
            }
            var RightLimitVectorX = 1;
            var RightLimitVectorY = 1;
            var LeftLimitVectorX = 1;
            var LeftLimitVectorY = 1;

            switch (Dir) {
                case 2 /* Right */:
                    LeftLimitVectorY = -1;
                    break;
                case 0 /* Left */:
                    RightLimitVectorX = -1;
                    RightLimitVectorY = -1;
                    LeftLimitVectorX = -1;
                    break;
                case 1 /* Top */:
                    RightLimitVectorY = -1;
                    LeftLimitVectorX = -1;
                    LeftLimitVectorY = -1;
                    break;
                case 3 /* Bottom */:
                    RightLimitVectorX = -1;
                    break;
            }
            var NearestNode = null;
            var CurrentMinimumDistanceSquere = Infinity;
            this.MasterView.TraverseVisibleNode(function (Node) {
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
        };

        /**
        @method FoldDeepSubGoals
        @param {NodeView} NodeView
        */
        PictgramPanel.prototype.FoldDeepSubGoals = function (NodeView) {
            var _this = this;
            NodeView.ForEachVisibleChildren(function (SubNode) {
                _this.FoldDeepSubGoals(SubNode);
                if (SubNode.GetNodeType() == 0 /* Goal */ && SubNode.Children != null) {
                    if (SubNode.Children.length != 1 || SubNode.Children[0].GetNodeType() != 3 /* Evidence */) {
                        SubNode.IsFolded = true;
                    }
                }
            });
        };

        /**
        @method ChangeFocusedLabel
        @param {string} Label If label is null, there is no focused label.
        */
        PictgramPanel.prototype.ChangeFocusedLabel = function (Label) {
            this.App.SocketManager.Emit("focusednode", Label);
            AssureNote.AssureNoteUtils.UpdateHash(Label);
            if (this.ContextMenu.IsEnable) {
                this.ContextMenu.Remove();
            }
            if (this.NodeTooltip.IsEnable) {
                this.NodeTooltip.Remove();
            }
            if (Label == null) {
                var oldNodeView = this.ViewMap[this.FocusedLabel];
                if (oldNodeView != null) {
                    oldNodeView.RemoveColorStyle(AssureNote.ColorStyle.Highlight);
                }
                this.FocusedLabel = null;
                return;
            }
            var NodeView = this.ViewMap[Label];
            if (NodeView != null) {
                var oldNodeView = this.ViewMap[this.FocusedLabel];
                if (oldNodeView != null) {
                    oldNodeView.RemoveColorStyle(AssureNote.ColorStyle.Highlight);
                }
                this.FocusedLabel = Label;
                NodeView.AddColorStyle(AssureNote.ColorStyle.Highlight);
            }
        };

        PictgramPanel.prototype.GetFocusedLabel = function () {
            return this.FocusedLabel;
        };

        PictgramPanel.prototype.InitializeView = function (NodeView) {
            this.MasterView = NodeView;
            this.ViewMap = {};
            this.MasterView.UpdateViewMap(this.ViewMap);
        };

        PictgramPanel.prototype.Draw = function (Label, Duration) {
            this.Clear();
            var TargetView = this.ViewMap[Label];

            if (TargetView == null) {
                TargetView = this.MasterView;
            }
            this.LayoutEngine.DoLayout(this, TargetView);
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";

            this.FoldingAnimationTask.Cancel(true);

            AssureNote.NodeView.SetGlobalPositionCacheEnabled(true);
            var FoldingAnimationCallbacks = [];

            TargetView.UpdateDocumentPosition(FoldingAnimationCallbacks, Duration, this.Viewport.GetPageRectInGxGy());
            TargetView.ClearAnimationCache();
            this.FoldingAnimationTask.StartMany(Duration, FoldingAnimationCallbacks);

            var Shape = TargetView.GetShape();
            this.Viewport.CameraLimitRect = new AssureNote.Rect(Shape.GetTreeLeftLocalX() - 100, -100, Shape.GetTreeWidth() + 200, Shape.GetTreeHeight() + 200);

            AssureNote.NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
        };

        PictgramPanel.prototype.Clear = function () {
            this.ContentLayer.innerHTML = "";
            this.SVGLayer.style.display = "none";
            for (var i = this.SVGLayer.childNodes.length - 1; i >= 0; i--) {
                this.SVGLayer.removeChild(this.SVGLayer.childNodes[i]);
            }
            this.SVGLayer.style.display = "";
        };

        PictgramPanel.prototype.DisplayPluginPanel = function (PluginName, Label) {
            var Plugin = this.App.PluginManager.GetPanelPlugin(PluginName, Label);
            Plugin.Display(this.App.FullScreenEditorPanel, this.App.MasterRecord.GetLatestDoc(), Label);
        };

        PictgramPanel.prototype.GetFocusedView = function () {
            if (this.ViewMap) {
                return this.ViewMap[this.FocusedLabel];
            }
            return null;
        };

        PictgramPanel.prototype.GetNodeViewFromUID = function (UID) {
            for (var i in this.ViewMap) {
                if (this.ViewMap[i].Model.UID == UID)
                    return this.ViewMap[i];
            }
            return null;
        };

        PictgramPanel.prototype.NavigateUp = function () {
            this.MoveToNearestNode(1 /* Top */);
        };
        PictgramPanel.prototype.NavigateDown = function () {
            this.MoveToNearestNode(3 /* Bottom */);
        };
        PictgramPanel.prototype.NavigateLeft = function () {
            this.MoveToNearestNode(0 /* Left */);
        };
        PictgramPanel.prototype.NavigateRight = function () {
            this.MoveToNearestNode(2 /* Right */);
        };
        PictgramPanel.prototype.NavigateHome = function () {
            this.FocusAndMoveToNode(this.MasterView);
        };
        return PictgramPanel;
    })(AssureNote.Panel);
    AssureNote.PictgramPanel = PictgramPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=PictgramPanel.js.map
