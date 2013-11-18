///<reference path='src/Api.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/PluginManager.ts'/>
var AssureNote;
(function (AssureNote) {
    var GSNRecord = (function () {
        function GSNRecord() {
        }
        GSNRecord.prototype.Parse = function (file) {
        };
        return GSNRecord;
    })();
    AssureNote.GSNRecord = GSNRecord;

    var GSNDoc = (function () {
        function GSNDoc() {
        }
        return GSNDoc;
    })();
    AssureNote.GSNDoc = GSNDoc;

    var GSNNode = (function () {
        function GSNNode() {
        }
        return GSNNode;
    })();
    AssureNote.GSNNode = GSNNode;

    var Navigator = (function () {
        function Navigator() {
        }
        Navigator.prototype.Display = function (Label, Wx, Wy) {
            //TODO
        };

        Navigator.prototype.Redraw = function () {
            this.Display(this.CurrentLabel, this.CurrentWx, this.CurrentWy);
        };

        Navigator.prototype.NavigateUp = function () {
        };
        Navigator.prototype.NavigateDown = function () {
        };
        Navigator.prototype.NavigateLeft = function () {
        };
        Navigator.prototype.NavigateRight = function () {
        };
        Navigator.prototype.NavigateHome = function () {
        };
        return Navigator;
    })();
    AssureNote.Navigator = Navigator;

    var ColorStyle = (function () {
        function ColorStyle() {
        }
        return ColorStyle;
    })();
    AssureNote.ColorStyle = ColorStyle;

    var NodeView = (function () {
        function NodeView() {
        }
        NodeView.prototype.GetGx = function () {
            if (this.Parent == null) {
                return this.OffsetGx;
            }
            return this.GetGx() + this.OffsetGx;
        };

        NodeView.prototype.GetGy = function () {
            if (this.Parent == null) {
                return this.OffsetGy;
            }
            return this.GetGy() + this.OffsetGy;
        };

        NodeView.prototype.Layout = function (LayoutEngine) {
            LayoutEngine.Layout(this);
            this.OffsetGx = LayoutEngine.Width / 2;
            this.OffsetGy = AssureNote.LevelMargin;
        };

        NodeView.prototype.DisplayContent = function (Content) {
            if (this.IsVisible) {
            }
        };
        return NodeView;
    })();
    AssureNote.NodeView = NodeView;
})(AssureNote || (AssureNote = {}));

$(function () {
    var AssureNoteApp = new AssureNote.AssureNoteApp();
});
//# sourceMappingURL=index.js.map
