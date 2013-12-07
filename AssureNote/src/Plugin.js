///<reference path="./MenuBar.ts" />
///<reference path='../d.ts/jquery.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var Plugin = (function () {
        function Plugin() {
            this.HasMenuBarButton = false;
            this.HasEditor = false;
        }
        Plugin.prototype.ExecCommand = function (AssureNote, Args) {
        };

        Plugin.prototype.Display = function (PluginPanel, GSNDoc, Label) {
        };

        Plugin.prototype.CreateMenuBarButton = function (NodeView) {
            //return new MenuBarButton("sample-id", "images/sample.png", "sample", (TargetView: NodeView) => {
            //});
            return null;
        };

        Plugin.prototype.EditorEnableCallback = function () {
            return null;
        };

        Plugin.prototype.EditorDisableCallback = function () {
            return null;
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
            this.PluginMap[Name] = Plugin;
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
        return PluginManager;
    })();
    AssureNote.PluginManager = PluginManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Plugin.js.map
