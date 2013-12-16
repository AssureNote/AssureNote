///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var VariableInterpolationPlugin = (function (_super) {
        __extends(VariableInterpolationPlugin, _super);
        function VariableInterpolationPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        VariableInterpolationPlugin.prototype.Supplant = function (str, map) {
            return str.replace(/\[([^\[\]]*)\]/g, function (v, b) {
                var res = map[b];
                return typeof res === 'string' || typeof res === 'number' ? res : v;
            });
        };
        return VariableInterpolationPlugin;
    })(AssureNote.Plugin);
    AssureNote.VariableInterpolationPlugin = VariableInterpolationPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=VariableInterpolation.js.map
