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

///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />


module AssureNote {
    export class VariableInterpolationPlugin extends Plugin {
        constructor(public AssureNoteApp: AssureNoteApp) {
            super();
        }

        Style(str: string, cls: string): string {
            console.log('Match: ' + str);
            var div: HTMLSpanElement = document.createElement('span');
            div.className = cls;
            div.textContent = str;
            return div.outerHTML;
        }

        private static ReferenceRegExp = /\[([^\[\]]*)\]/g;

        Supplant(str: string, LabelMap: any, TagMap: any) {
            return str.replace(VariableInterpolationPlugin.ReferenceRegExp,
                ((v: string, ...params: string[]) => {
                    var b = params[0];
                    var value = TagMap[b];
                    while (TagMap[value]) {
                        value = TagMap[value];
                    }
                    if ((typeof value === 'string' && value != '') || typeof value === 'number') {
                        return this.Style(value, 'node-variable');
                    }
                    value = LabelMap[b];
                    while (LabelMap[value]) {
                        value = LabelMap[value];
                    }
                    if (typeof value === 'string' && value != '') {
                        return this.Style(value, 'node-variable');
                    }
                    return this.Style(v, 'node-variable-undefined');
                })
            );
        }

        RenderHTML(NodeDoc: string, Model: GSNNode): string {
            if (Model.HasTagOrLabelReference) {
                var Map = Model.GetTagMapWithLexicalScope();
                var LabelMap = Model.BaseDoc.GetLabelMap();
                return this.Supplant(NodeDoc, LabelMap, Map ? Map : {});
            }
            return NodeDoc;
        }
    }
}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var VariableInterpolationPlugin = new AssureNote.VariableInterpolationPlugin(App);
    App.PluginManager.SetPlugin("variableinterpolation", VariableInterpolationPlugin);
});
