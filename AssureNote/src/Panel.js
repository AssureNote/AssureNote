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
            this.ViewPort = new AssureNote.ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ContentLayer);
            this.LayoutEngine = new AssureNote.SimpleLayoutEngine(this.AssureNoteApp);

            var Bar = new AssureNote.MenuBar(AssureNoteApp);
            this.ContentLayer.onclick = function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabel(event);
                _this.AssureNoteApp.DebugP("click:" + Label);
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null) {
                    _this.FocusedLabel = Label;
                    if (!Bar.IsEnable) {
                        Bar.Create(_this.ViewMap[Label], _this.ControlLayer);
                    }
                } else {
                    _this.FocusedLabel = null;
                }
                return false;
            };

            //FIXME
            this.EventMapLayer.onclick = function (event) {
                _this.FocusedLabel = null;
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
            };

            this.ContentLayer.ondblclick = function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabel(event);
                var NodeView = _this.ViewMap[Label];
                _this.AssureNoteApp.DebugP("double click:" + Label);
                return false;
            };

            this.CmdLine = new AssureNote.CommandLine();
            document.onkeydown = function (event) {
                if (!_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return false;
                }

                if (event.keyCode == 186) {
                    _this.CmdLine.Show();
                } else if (event.keyCode == 13 && _this.CmdLine.IsVisible && _this.CmdLine.IsEnable) {
                    _this.AssureNoteApp.ExecCommand(_this.CmdLine.GetValue());
                    _this.CmdLine.Hide();
                    _this.CmdLine.Clear();
                    return false;
                }
            };

            this.ContentLayer.onmouseover = function (event) {
                if (!_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                var Label = AssureNote.AssureNoteUtils.GetNodeLabel(event);
                if (Label) {
                    _this.AssureNoteApp.DebugP("mouseover:" + Label);
                }
            };

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
        }
        PictgramPanel.prototype.SetView = function (NodeView) {
            this.MasterView = NodeView;
            this.ViewMap = {};
            this.MasterView.UpdateViewMap(this.ViewMap);
        };

        PictgramPanel.prototype.DisplayPictgram = function () {
            this.AssureNoteApp.PluginPanel.Clear();
        };

        PictgramPanel.prototype.Draw = function (Label, wx, wy) {
            if (wx == null) {
                wx = 100;
            }
            if (wy == null) {
                wy = 100;
            }

            var TargetView = this.ViewMap[Label];
            if (TargetView == null) {
                TargetView = this.MasterView;
            }

            this.LayoutEngine.DoLayout(this, TargetView, wx, wy);
            TargetView.SetDocumentPosition(wx, wy);
        };

        PictgramPanel.prototype.Redraw = function () {
            this.Draw(this.FocusedLabel, this.FocusedWx, this.FocusedWy);
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
            this.Editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
                lineNumbers: false,
                mode: "text/x-asn",
                lineWrapping: true
            });
            $('#editor-wrapper').css({ display: 'none', opacity: '1.0' });
        }
        PluginPanel.prototype.Clear = function () {
        };
        return PluginPanel;
    })();
    AssureNote.PluginPanel = PluginPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Panel.js.map
