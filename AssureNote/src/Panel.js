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
            this.LayoutEngine = new AssureNote.OldLayoutEngine(this.AssureNoteApp);

            this.ContentLayer.onclick = function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabel(event);
                _this.AssureNoteApp.DebugP(Label);
                return false;
            };

            this.ContentLayer.ondblclick = function (ev) {
            };
            var CmdLine = new AssureNote.CommandLine();
            document.onkeydown = function (ev) {
                if (!_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return false;
                }

                if (ev.keyCode == 186) {
                    CmdLine.Show();
                } else if (ev.keyCode == 13 && CmdLine.IsEnable()) {
                    _this.AssureNoteApp.ExecCommand(CmdLine.GetValue());
                    CmdLine.Hide();
                    CmdLine.Clear();
                    return false;
                }
                //else {
                //	cmdline += String.fromCharCode(ev.keyCode);
                //}
            };
            this.ContentLayer.onmouseover = function (event) {
                if (_this.AssureNoteApp.PluginPanel.IsVisible) {
                    return;
                }
                if (AssureNote.AssureNoteUtils.GetNodeLabel(event)) {
                }
            };

            var DragHandler = function (e) {
                if (_this.AssureNoteApp.PluginPanel.IsVisible) {
                    e.stopPropagation();
                    e.preventDefault();
                    //return false;
                }
            };
            $(this.EventMapLayer).on('dragenter', function (e) {
                console.log("o");
            }).on('dragover', DragHandler).on('dragleave', DragHandler).on('drop', function (event) {
                if (_this.AssureNoteApp.PluginPanel.IsVisible) {
                    event.stopPropagation();
                    event.preventDefault();
                    _this.AssureNoteApp.ProcessDroppedFiles(((event.originalEvent).dataTransfer).files);
                    return false;
                }
            });
        }
        PictgramPanel.prototype.DisplayPictgram = function () {
            this.AssureNoteApp.PluginPanel.Clear();
        };

        PictgramPanel.prototype.Draw = function (Label, wx, wy) {
            this.LayoutEngine.Do(this, Label, wx, wy);
        };

        PictgramPanel.prototype.DisplayPluginPanel = function (PluginName, Label) {
            var Plugin = this.AssureNoteApp.PluginManager.GetPanelPlugin(PluginName, Label);
            Plugin.Display(this.AssureNoteApp.PluginPanel, this.AssureNoteApp.FixMeModel, Label);
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
            this.Editor.setSize("300px", "200px");
            $('#editor-wrapper').css({ display: 'none', opacity: '1.0' });
        }
        PluginPanel.prototype.Clear = function () {
        };
        return PluginPanel;
    })();
    AssureNote.PluginPanel = PluginPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Panel.js.map
