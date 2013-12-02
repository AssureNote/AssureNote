var AssureNote;
(function (AssureNote) {
    var Plugin = (function () {
        function Plugin() {
        }
        Plugin.prototype.ExecCommand = function (AssureNote, Args) {
        };

        Plugin.prototype.Display = function (PluginPanel, GSNDoc, Label) {
        };
        return Plugin;
    })();
    AssureNote.Plugin = Plugin;

    var PluginManager = (function () {
        function PluginManager(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            //Editor, etc.
        }
        PluginManager.prototype.GetPanelPlugin = function (Name, Label) {
            return null;
        };

        PluginManager.prototype.GetCommandPlugin = function (CommandLine) {
            return null;
        };
        return PluginManager;
    })();
    AssureNote.PluginManager = PluginManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Plugin.js.map
