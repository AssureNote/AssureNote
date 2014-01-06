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
    var ToDoPlugin = (function (_super) {
        __extends(ToDoPlugin, _super);
        function ToDoPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        ToDoPlugin.prototype.RenderSVG = function (ShapeGroup, NodeView) {
            var TagMap = NodeView.Model.GetTagMap();
            if (TagMap && (TagMap.get('TODO') || TagMap.get('TODO') == '')) {
                NodeView.ChangeColorStyle(AssureNote.ColorStyle.ToDo);
                //ShapeGroup.setAttribute('class', 'assurenote-todo');
            }
        };
        return ToDoPlugin;
    })(AssureNote.Plugin);
    AssureNote.ToDoPlugin = ToDoPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=ToDo.js.map
