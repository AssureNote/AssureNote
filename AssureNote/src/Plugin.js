///<reference path="./MenuBar.ts" />
///<reference path='../d.ts/jquery.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var Plugin = (function () {
        function Plugin() {
            this.HasMenuBarButton = false;
            this.HasEditor = false;
            this.HasDoubleClicked = false;
        }
        Plugin.prototype.ExecCommand = function (AssureNote, Args) {
        };

        Plugin.prototype.Display = function (PluginPanel, GSNDoc, Label) {
        };

        Plugin.prototype.ExecDoubleClicked = function (NodeView) {
        };

        Plugin.prototype.CreateMenuBarButton = function (NodeView) {
            return null;
        };

        Plugin.prototype.EditorEnableCallback = function () {
            return null;
        };

        Plugin.prototype.EditorDisableCallback = function () {
            return null;
        };

        Plugin.prototype.RenderHTML = function (NodeDoc, Model) {
            /* Do nothing */
            return NodeDoc;
        };
        return Plugin;
    })();
    AssureNote.Plugin = Plugin;

    //export class SamplePlugin extends Plugin {
    //	constructor() {
    //		super();
    //		this.HasMenuBarButton = true;
    //	}
    //	CreateMenuBarButton(): MenuBarButton {
    //		return new MenuBarButton("sample-id", "images/copy.png", "sample", (event: Event, TargetView: NodeView) => {
    //			alert(TargetView.Label);
    //		});
    //	}
    //}
    var PluginManager = (function () {
        function PluginManager(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.PluginMap = {};
        }
        PluginManager.prototype.SetPlugin = function (Name, Plugin) {
            if (!this.PluginMap[Name]) {
                this.PluginMap[Name] = Plugin;
            } else {
                this.AssureNoteApp.DebugP("Plugin " + name + " already defined.");
            }
        };

        PluginManager.prototype.GetPanelPlugin = function (Name, Label) {
            //TODO change plugin by Label
            return this.PluginMap[Name];
        };

        PluginManager.prototype.GetCommandPlugin = function (Name) {
            return this.PluginMap[Name];
        };

        PluginManager.prototype.GetMenuBarButtons = function (TargetView) {
            var _this = this;
            var ret = [];
            $.each(this.PluginMap, function (key, value) {
                if (value.HasMenuBarButton) {
                    _this.AssureNoteApp.DebugP("Menu: key=" + key);
                    var Button = value.CreateMenuBarButton(TargetView);
                    if (Button != null) {
                        ret.push(Button);
                    }
                }
            });
            return ret;
        };

        PluginManager.prototype.GetDoubleClicked = function () {
            var ret = null;

            //FIXME Editing mode
            $.each(this.PluginMap, function (key, value) {
                if (value.HasDoubleClicked) {
                    ret = value;
                    return false;
                }
            });
            return ret;
        };

        PluginManager.prototype.InvokeHTMLRenderPlugin = function (NodeDoc, Model) {
            $.each(this.PluginMap, function (key, value) {
                NodeDoc = value.RenderHTML(NodeDoc, Model);
            });
            return NodeDoc;
        };
        return PluginManager;
    })();
    AssureNote.PluginManager = PluginManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Plugin.js.map
