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
        VariableInterpolationPlugin.prototype.Style = function (str) {
            console.log('Match: ' + str);
            var div = document.createElement('span');
            div.className = 'node-variable';
            div.textContent = str;
            return div.outerHTML;
        };

        VariableInterpolationPlugin.prototype.Supplant = function (str, map) {
            var _this = this;
            return str.replace(/\[([^\[\]]*)\]/g, function (v, b) {
                var value = map[b];
                var res = typeof value === 'string' || typeof value === 'number' ? value : v;
                return _this.Style(res);
            });
        };

        VariableInterpolationPlugin.prototype.RenderHTML = function (NodeDoc) {
            return this.Supplant(NodeDoc, { age: 10 });
        };
        return VariableInterpolationPlugin;
    })(AssureNote.Plugin);
    AssureNote.VariableInterpolationPlugin = VariableInterpolationPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=VariableInterpolation.js.map
