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
    function Xor(a, b) {
        return (a || b) && !(a && b);
    }

    var FoldingViewSwitchPlugin = (function (_super) {
        __extends(FoldingViewSwitchPlugin, _super);
        function FoldingViewSwitchPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.HasMenuBarButton = true;
        }
        FoldingViewSwitchPlugin.prototype.CreateMenuBarButton = function () {
            var _this = this;
            return new AssureNote.MenuBarButton("folded-id", "images/copy.png", "fold", function (event, TargetView) {
                TargetView.ForEachVisibleAllSubNodes(function (SubNode) {
                    SubNode.IsFolded = Xor(SubNode.IsFolded, true);
                });
                _this.AssureNoteApp.PictgramPanel.Draw(TargetView.Label, null, null);
            });
        };
        return FoldingViewSwitchPlugin;
    })(AssureNote.Plugin);
    AssureNote.FoldingViewSwitchPlugin = FoldingViewSwitchPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=FoldingViewSwitch.js.map
