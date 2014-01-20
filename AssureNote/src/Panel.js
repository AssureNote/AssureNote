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
var AssureNote;
(function (AssureNote) {
    var PictgramPanel = (function () {
        function PictgramPanel(AssureNoteApp) {
            var _this = this;
            this.AssureNoteApp = AssureNoteApp;
            this.SVGLayer = document.getElementById("svg-layer");
            this.EventMapLayer = (document.getElementById("eventmap-layer"));
            this.ContentLayer = (document.getElementById("content-layer"));
            this.ControlLayer = (document.getElementById("control-layer"));
            this.Viewport = new AssureNote.ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ControlLayer);
            this.LayoutEngine = new AssureNote.SimpleLayoutEngine(this.AssureNoteApp);

            var Bar = new AssureNote.NodeMenu(AssureNoteApp);
            var Tooltip = new AssureNote.Tooltip(AssureNoteApp);
            this.ContentLayer.addEventListener("click", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                _this.AssureNoteApp.DebugP("click:" + Label);
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                if (Tooltip.IsEnable) {
                    Tooltip.Remove();
                }
                event.preventDefault();
            });

            //FIXME
            this.EventMapLayer.addEventListener("pointerdown", function (event) {
                //this.FocusedLabel = null;
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                if (Tooltip.IsEnable) {
                    Tooltip.Remove();
                }
            });

            this.ContentLayer.addEventListener("contextmenu", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null) {
                    _this.FocusedLabel = Label;
                    if (Bar.IsEnable) {
                        Bar.Remove();
                    }
                    if (Tooltip.IsEnable) {
                        Tooltip.Remove;
                    }
                    var Buttons = _this.AssureNoteApp.PluginManager.GetMenuBarButtons(NodeView);
                    Bar.Create(_this.ViewMap[Label], _this.ControlLayer, Buttons);
                } else {
                    _this.FocusedLabel = null;
                }
                event.preventDefault();
            });

            this.ContentLayer.addEventListener("dblclick", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                _this.AssureNoteApp.DebugP("double click:" + Label);
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                if (Tooltip.IsEnable) {
                    Tooltip.Remove();
                }
                _this.AssureNoteApp.ExecDoubleClicked(NodeView);
                event.preventDefault();
            });

            this.CmdLine = new AssureNote.CommandLine();
            this.Search = new AssureNote.Search(AssureNoteApp);
            document.addEventListener("keydown", function (event) {
                if (!_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                switch (event.keyCode) {
                    case 58:
                        if (window.navigator.userAgent.toLowerCase().match("firefox").length == 0) {
                            break;
                        }
                    case 186:
                    case 191:
                    case 219:
                        if (_this.Search.IsSearching()) {
                            _this.Search.ResetParam();
                        }
                        _this.CmdLine.Show();
                        break;
                    case 13:
                        if (_this.CmdLine.IsVisible && _this.CmdLine.IsEnable) {
                            var ParsedCommand = new AssureNote.CommandParser();
                            ParsedCommand.Parse(_this.CmdLine.GetValue());
                            if (ParsedCommand.GetMethod() == "search") {
                                _this.Search.Search(_this.MasterView, ParsedCommand.GetArgs()[0]);
                            }
                            _this.AssureNoteApp.ExecCommand(ParsedCommand);
                            _this.CmdLine.AddHistory(ParsedCommand.GetRawString());
                            _this.CmdLine.Hide();
                            _this.CmdLine.Clear();
                            event.preventDefault();
                        } else if (!_this.CmdLine.IsVisible && _this.Search.IsSearching()) {
                            _this.Search.SearchNext(_this.MasterView, event.shiftKey);
                        }
                        break;
                    case 27:
                        if (_this.Search.IsSearching()) {
                            _this.Search.ResetParam();
                        }
                        if (_this.CmdLine.IsVisible) {
                            _this.CmdLine.Hide();
                            _this.CmdLine.Clear();
                        }
                        break;
                    case 38:
                        if (_this.CmdLine.IsVisible) {
                            _this.CmdLine.ShowPrevHistory();
                        }
                        break;
                    case 40:
                        if (_this.CmdLine.IsVisible) {
                            _this.CmdLine.ShowNextHistory();
                        }
                        break;
                    case 8:
                        if (_this.CmdLine.IsVisible && _this.CmdLine.IsEmpty()) {
                            _this.CmdLine.Hide();
                            _this.CmdLine.Clear();
                            event.preventDefault();
                            break;
                        }
                        break;
                }
            });

            this.ContentLayer.addEventListener("mouseover", function (event) {
                if (!_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null && _this.FocusedLabel != Label) {
                    _this.FocusedLabel = Label;
                    var Tooltips = _this.AssureNoteApp.PluginManager.GetTooltipContents(NodeView);
                    Tooltip.Create(NodeView, _this.ControlLayer, Tooltips);
                }
            });

            this.ContentLayer.addEventListener("mouseleave", function (event) {
                /* We use mouseleave event instead of mouseout since mouseout/mouseenter fires
                every time the pointer enters the sub-element of ContentLayer.
                Mouseleave can prevent this annoying event firing. */
                if (!_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                var Label = _this.FocusedLabel;
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null && Label == _this.FocusedLabel) {
                    _this.FocusedLabel = null;
                }
                if (Tooltip.IsEnable) {
                    Tooltip.Remove();
                }
            });

            var DragHandler = function (e) {
                if (_this.AssureNoteApp.PluginPanel.IsVisible) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            };
            $(this.EventMapLayer).on('dragenter', DragHandler).on('dragover', DragHandler).on('dragleave', DragHandler).on('drop', function (event) {
                if (_this.AssureNoteApp.PluginPanel.IsVisible) {
                    event.stopPropagation();
                    event.preventDefault();
                    _this.AssureNoteApp.LoadFiles(event.originalEvent.dataTransfer.files);
                }
            });

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
                            _this.AssureNoteApp.ExecDoubleClicked(Node);
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
        PictgramPanel.prototype.SetFoldedAllGoalNode = function (NodeView) {
            var _this = this;
            NodeView.ForEachVisibleChildren(function (SubNode) {
                _this.SetFoldedAllGoalNode(SubNode);
                if (SubNode.GetNodeType() == 0 /* Goal */ && SubNode.Children != null) {
                    if (SubNode.Children.length != 1 || SubNode.Children[0].GetNodeType() != 3 /* Evidence */) {
                        SubNode.IsFolded = true;
                    }
                }
            });
        };

        PictgramPanel.prototype.InitializeView = function (NodeView) {
            this.MasterView = NodeView;
            this.ViewMap = {};
            this.MasterView.UpdateViewMap(this.ViewMap);
        };

        PictgramPanel.prototype.DisplayPictgram = function () {
            this.AssureNoteApp.PluginPanel.Clear();
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
            AssureNote.NodeView.SetGlobalPositionCacheEnabled(true);

            TargetView.UpdateDocumentPosition(Duration);
            TargetView.ClearAnimationCache();

            AssureNote.NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
        };

        PictgramPanel.prototype.Clear = function () {
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
        };

        PictgramPanel.prototype.DisplayPluginPanel = function (PluginName, Label) {
            var Plugin = this.AssureNoteApp.PluginManager.GetPanelPlugin(PluginName, Label);
            Plugin.Display(this.AssureNoteApp.PluginPanel, this.AssureNoteApp.MasterRecord.GetLatestDoc(), Label);
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

        //TODO
        PictgramPanel.prototype.NavigateUp = function () {
        };
        PictgramPanel.prototype.NavigateDown = function () {
        };
        PictgramPanel.prototype.NavigateLeft = function () {
        };
        PictgramPanel.prototype.NavigateRight = function () {
        };
        PictgramPanel.prototype.NavigateHome = function () {
        };
        return PictgramPanel;
    })();
    AssureNote.PictgramPanel = PictgramPanel;

    var PluginPanel = (function () {
        function PluginPanel(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.IsVisible = true;
            var textarea = CodeMirror.fromTextArea(document.getElementById('editor'), {
                lineNumbers: true,
                mode: 'wgsn',
                lineWrapping: true
            });
            this.FullScreenEditor = new AssureNote.FullScreenEditorPlugin(AssureNoteApp, textarea, '#editor-wrapper');
            $("#plugin-layer").on('mousewheel', function (event) {
                event.stopPropagation();
            });

            textarea = CodeMirror.fromTextArea(document.getElementById('singlenode-editor'), {
                lineNumbers: false,
                mode: 'wgsn',
                lineWrapping: true
            });
            this.SingleNodeEditor = new AssureNote.SingleNodeEditorPlugin(AssureNoteApp, textarea, '#singlenode-editor-wrapper');
            AssureNoteApp.PluginManager.SetPlugin("open-single", this.SingleNodeEditor);
            AssureNoteApp.PluginManager.SetPlugin("open", this.FullScreenEditor);
        }
        PluginPanel.prototype.Clear = function () {
        };
        return PluginPanel;
    })();
    AssureNote.PluginPanel = PluginPanel;

    var Pane = (function () {
        function Pane(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
        }
        Pane.prototype.Create = function (NodeView, ControlLayer, contents) {
            /* Do nothing */
        };

        Pane.prototype.Remove = function () {
        };
        return Pane;
    })();
    AssureNote.Pane = Pane;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Panel.js.map
