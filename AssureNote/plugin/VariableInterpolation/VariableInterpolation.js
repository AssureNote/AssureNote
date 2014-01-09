// ***************************************************************************
// Copyright (c) 2014, AssureNote project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// *  Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// *  Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// **************************************************************************
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />
var AssureNote;
(function (AssureNote) {
    var VariableInterpolationPlugin = (function (_super) {
        __extends(VariableInterpolationPlugin, _super);
        function VariableInterpolationPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        VariableInterpolationPlugin.prototype.Style = function (str, cls) {
            console.log('Match: ' + str);
            var div = document.createElement('span');
            div.className = cls;
            div.textContent = str;
            return div.outerHTML;
        };

        VariableInterpolationPlugin.prototype.Supplant = function (str, LabelMap, TagMap) {
            var _this = this;
            return str.replace(/\[([^\[\]]*)\]/g, function (v, b) {
                var value = TagMap[b];
                if ((typeof value === 'string' && value != '') || typeof value === 'number') {
                    return _this.Style(value, 'node-variable');
                }
                value = LabelMap[b];
                if (typeof value === 'string' && value != '') {
                    return _this.Style(value, 'node-variable');
                }
                return _this.Style(v, 'node-variable-undefined');
            });
        };

        VariableInterpolationPlugin.prototype.RenderHTML = function (NodeDoc, Model) {
            var Map = Model.GetTagMapWithLexicalScope();
            var LabelMap = Model.BaseDoc.GetLabelMap();
            return this.Supplant(NodeDoc, LabelMap.hash, Map ? Map.hash : {});
        };
        return VariableInterpolationPlugin;
    })(AssureNote.Plugin);
    AssureNote.VariableInterpolationPlugin = VariableInterpolationPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var VariableInterpolationPlugin = new AssureNote.VariableInterpolationPlugin(App);
    App.PluginManager.SetPlugin("variableinterpolation", VariableInterpolationPlugin);
});
//# sourceMappingURL=VariableInterpolation.js.map
