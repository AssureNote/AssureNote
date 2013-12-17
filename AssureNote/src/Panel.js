///<reference path='./AssureNote.ts'/>
///<reference path='./CommandLine.ts'/>
///<reference path='./SearchNode.ts'/>
///<reference path='./LayoutEngine.ts'/>
///<reference path='./Editor.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>
///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>
var AssureNote;
(function (AssureNote) {
    var PictgramPanel = (function () {
        function PictgramPanel(AssureNoteApp) {
            var _this = this;
            this.AssureNoteApp = AssureNoteApp;
            this.SVGLayer = (document.getElementById("svg-layer"));
            this.EventMapLayer = (document.getElementById("eventmap-layer"));
            this.ContentLayer = (document.getElementById("content-layer"));
            this.ControlLayer = (document.getElementById("control-layer"));
            this.Viewport = new AssureNote.ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ControlLayer);
            this.LayoutEngine = new AssureNote.SimpleLayoutEngine(this.AssureNoteApp);

            var Bar = new AssureNote.MenuBar(AssureNoteApp);
            this.ContentLayer.addEventListener("click", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabel(event);
                _this.AssureNoteApp.DebugP("click:" + Label);
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null) {
                    _this.FocusedLabel = Label;
                    if (!Bar.IsEnable) {
                        var Buttons = _this.AssureNoteApp.PluginManager.GetMenuBarButtons(NodeView);
                        Bar.Create(_this.ViewMap[Label], _this.ControlLayer, Buttons);
                    }
                } else {
                    _this.FocusedLabel = null;
                }
                return false;
            });

            //FIXME
            this.EventMapLayer.addEventListener("pointerdown", function (event) {
                _this.FocusedLabel = null;
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
            });

            this.ContentLayer.addEventListener("dblclick", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabel(event);
                var NodeView = _this.ViewMap[Label];
                _this.AssureNoteApp.DebugP("double click:" + Label);
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                _this.AssureNoteApp.ExecDoubleClicked(NodeView);
                return false;
            });

            this.CmdLine = new AssureNote.CommandLine();
            this.Search = new AssureNote.Search(AssureNoteApp);
            document.addEventListener("keydown", function (event) {
                if (!_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                console.log(event.keyCode);
                switch (event.keyCode) {
                    case 58:
                        if (window.navigator.userAgent.toLowerCase().match("firefox").length == 0) {
                            break;
                        }
                    case 186:
                        _this.CmdLine.Show();
                        break;
                    case 191:
                        _this.CmdLine.Show();
                        break;
                    case 219:
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
                            _this.CmdLine.Hide();
                            _this.CmdLine.Clear();
                            return false;
                        }
                        break;
                }
            });

            this.ContentLayer.addEventListener("mouseover", function (event) {
                if (!_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                var Label = AssureNote.AssureNoteUtils.GetNodeLabel(event);
                if (Label) {
                    //this.AssureNoteApp.DebugP("mouseover:"+Label);
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
                    _this.AssureNoteApp.ProcessDroppedFiles(((event.originalEvent).dataTransfer).files);
                    return false;
                }
            });

            this.Viewport.ScrollManager.OnDragged = function (Viewport) {
                var HitBoxCenter = new AssureNote.Point(Viewport.GXFromPageX(Viewport.GetPageCenterX()), Viewport.GYFromPageY(Viewport.GetHeight() / 3));
                _this.MasterView.TraverseVisibleNode(function (Node) {
                    if (Node.IsFolded) {
                        var DX = HitBoxCenter.X - Node.GetCenterGX();
                        var DY = HitBoxCenter.Y - Node.GetCenterGY();
                        console.log(new AssureNote.Point(DX, DY));
                        if (DX * DX + DY * DY < 150 * 150) {
                            _this.AssureNoteApp.ExecDoubleClicked(Node);
                        }
                        return false;
                    }
                });
            };
        }
        PictgramPanel.prototype.SetFoldedAllGoalNode = function (NodeView) {
            var _this = this;
            NodeView.ForEachVisibleChildren(function (SubNode) {
                _this.SetFoldedAllGoalNode(SubNode);
                if (SubNode.GetNodeType() == GSNType.Goal && SubNode.Children != null) {
                    if (SubNode.Children.length != 1 || SubNode.Children[0].GetNodeType() != GSNType.Evidence) {
                        SubNode.IsFolded = true;
                    }
                }
            });
        };

        PictgramPanel.prototype.SetView = function (NodeView) {
            this.MasterView = NodeView;
            this.ViewMap = {};
            this.MasterView.UpdateViewMap(this.ViewMap);
        };

        PictgramPanel.prototype.DisplayPictgram = function () {
            this.AssureNoteApp.PluginPanel.Clear();
        };

        PictgramPanel.prototype.AppendCSSAnimationDefinition = function (Definitions) {
            var Id = "GSNNodeAnimationDefinition";
            if (PictgramPanel.GSNNodeAnimationDefinitionMaster == null) {
                PictgramPanel.GSNNodeAnimationDefinitionMaster = document.createElement("style");
                PictgramPanel.GSNNodeAnimationDefinitionMaster.id = Id;
                PictgramPanel.GSNNodeAnimationDefinitionMaster.type = "text/css";
            }
            var StyleElement = PictgramPanel.GSNNodeAnimationDefinitionMaster.cloneNode();
            StyleElement.innerHTML = Definitions.join("\n");
            var OldDefinition = document.getElementById(Id);
            if (OldDefinition) {
                OldDefinition.parentElement.removeChild(OldDefinition);
            }
            document.head.appendChild(StyleElement);
        };

        PictgramPanel.prototype.Draw = function (Label, wx, wy, Duration) {
            this.Clear();
            var TargetView = this.ViewMap[Label];

            if (TargetView == null) {
                TargetView = this.MasterView;
            }
            this.LayoutEngine.DoLayout(this, TargetView);
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";
            AssureNote.NodeView.SetGlobalPositionCacheEnabled(true);

            var CSSAnimationBuffer = [];
            TargetView.UpdateDocumentPosition(Duration, CSSAnimationBuffer);
            this.AppendCSSAnimationDefinition(CSSAnimationBuffer);

            TargetView.ClearAnimationCache();

            AssureNote.NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";

            if (wx != null && wy != null) {
                this.Viewport.SetOffset(wx, wy);
            }
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
                mode: "text/x-asn",
                lineWrapping: true
            });

            this.FullScreenEditor = new AssureNote.FullScreenEditorPlugin(AssureNoteApp, textarea, '#editor-wrapper');
            AssureNoteApp.PluginManager.SetPlugin("open", this.FullScreenEditor);
        }
        PluginPanel.prototype.Clear = function () {
        };
        return PluginPanel;
    })();
    AssureNote.PluginPanel = PluginPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Panel.js.map
