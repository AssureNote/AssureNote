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
                TargetView.IsFolded = TargetView.IsFolded != true;
                var wx0 = TargetView.GetGx();
                var wy0 = TargetView.GetGy();
                _this.AssureNoteApp.PictgramPanel.Draw();
                var wx1 = TargetView.GetGx();
                var wy1 = TargetView.GetGy();
                var ViewPort = _this.AssureNoteApp.PictgramPanel.ViewPort;
                var OffX0 = ViewPort.GetOffsetX();
                var OffY0 = ViewPort.GetOffsetY();
                ViewPort.SetOffset(OffX0 + wx1 - wx0, OffY0 + wy1 - wy0);
            });
        };
        return FoldingViewSwitchPlugin;
    })(AssureNote.Plugin);
    AssureNote.FoldingViewSwitchPlugin = FoldingViewSwitchPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=FoldingViewSwitch.js.map
