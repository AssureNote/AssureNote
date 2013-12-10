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
            var _this = this;
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.HasMenuBarButton = true;

            this.FoldingAction = function (event, TargetView) {
                if (TargetView.GetNodeType() == GSNType.Strategy) {
                    if (TargetView.Children != null) {
                        for (var i = 0; i < TargetView.Children.length; i++) {
                            var SubView = TargetView.Children[i];
                            if (SubView.GetNodeType() == GSNType.Goal) {
                                SubView.IsFolded = true;
                            }
                        }
                    }
                } else {
                    TargetView.IsFolded = TargetView.IsFolded != true;
                }
                var TopGoalView = TargetView;
                while (TopGoalView.Parent != null) {
                    TopGoalView = TopGoalView.Parent;
                }
                var wx0 = TargetView.GetGx();
                var wy0 = TargetView.GetGy();
                _this.AssureNoteApp.PictgramPanel.Draw(TopGoalView.Label, null, null);
                var wx1 = TargetView.GetGx();
                var wy1 = TargetView.GetGy();
                var ViewPort = _this.AssureNoteApp.PictgramPanel.ViewPort;
                var OffX0 = ViewPort.GetOffsetX();
                var OffY0 = ViewPort.GetOffsetY();
                _this.AssureNoteApp.PictgramPanel.ViewPort.SetOffset(OffX0 + wx1 - wx0, OffY0 + wy1 - wy0);
            };
        }
        FoldingViewSwitchPlugin.prototype.ExecCommand = function (AssureNoteApp, Args) {
            if (Args.length < 1) {
                AssureNoteApp.DebugP("no args");
                return;
            }
            var Label = Args[0].toUpperCase();
            var event = document.createEvent("UIEvents");
            var TargetView = AssureNoteApp.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                var TargetType = TargetView.GetNodeType();
                if (TargetType != GSNType.Goal && TargetType != GSNType.Strategy) {
                    AssureNoteApp.DebugP("Only type 'Strategy' or 'Goal' can be allowed to fold.");
                    return;
                }
                this.FoldingAction(event, TargetView);
            } else {
                AssureNoteApp.DebugP(Label + " not found.");
            }
        };

        FoldingViewSwitchPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            if (NodeView.GetNodeType() != GSNType.Goal) {
                return null;
            }
            return new AssureNote.MenuBarButton("folded-id", "images/copy.png", "fold", this.FoldingAction);
        };
        return FoldingViewSwitchPlugin;
    })(AssureNote.Plugin);
    AssureNote.FoldingViewSwitchPlugin = FoldingViewSwitchPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=FoldingViewSwitch.js.map
