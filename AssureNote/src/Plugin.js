///<reference path="./MenuBar.ts" />
///<reference path='../d.ts/jquery.d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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

        Plugin.prototype.CreateMenuBarButton = function () {
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

    var SamplePlugin = (function (_super) {
        __extends(SamplePlugin, _super);
        function SamplePlugin() {
            _super.call(this);
            this.HasMenuBarButton = true;
        }
        SamplePlugin.prototype.CreateMenuBarButton = function () {
            return new AssureNote.MenuBarButton("sample-id", "images/copy.png", "sample", function (event, TargetView) {
                alert(TargetView.Label);
            });
        };
        return SamplePlugin;
    })(Plugin);
    AssureNote.SamplePlugin = SamplePlugin;

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

        PluginManager.prototype.GetMenuBarButtons = function () {
            var _this = this;
            var ret = [];
            $.each(this.PluginMap, function (key, value) {
                if (value.HasMenuBarButton) {
                    _this.AssureNoteApp.DebugP("Menu: key=" + key);
                    ret.push(value.CreateMenuBarButton());
                }
            });
            return ret;
        };
        return PluginManager;
    })();
    AssureNote.PluginManager = PluginManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Plugin.js.map
