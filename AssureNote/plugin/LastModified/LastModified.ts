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

module AssureNote {
    export class LastModifiedPlugin extends Plugin {
        constructor(public AssureNoteApp: AssureNoteApp) {
            super();
        }

        RenderHTML(NodeDoc: string, Model: GSNNode): string {
            var Author: string = Model.LastModified.Author;
            if (Author && Author != 'unknown') {
                var icon_user: HTMLSpanElement = document.createElement('span');
                icon_user.className = 'glyphicon glyphicon-user';
                var icon_time: HTMLSpanElement = document.createElement('span');
                icon_time.className = 'glyphicon glyphicon-time';
                var span: HTMLSpanElement = document.createElement('span');

                /* Due to Evidence and Strategy's shape. */
                span.className = 'node-author';
                if (Model.IsEvidence()) {
                    span.className = span.className + ' node-author-evidence';
                } else if (Model.IsStrategy()) {
                    span.className = span.className + ' node-author-strategy';
                }
                span.textContent = Author + '&nbsp';
                var small = document.createElement('small');
                small.innerHTML = icon_time.outerHTML + '&nbsp' + AssureNoteUtils.FormatDate(Model.LastModified.Date)
                span.innerHTML = icon_user.outerHTML + span.textContent + small.outerHTML;
                return NodeDoc + span.outerHTML;
            } else {
                return NodeDoc;
            }
        }

        CreateElement(Prefix: string, History: GSNHistory): HTMLLIElement {
            var li = document.createElement('li');
            if (History.Author == 'unknown') {
                li.innerHTML = Prefix + ' at ' + AssureNoteUtils.FormatDateTime(History.Date);
            } else {
                li.innerHTML = Prefix + ' by <b>' + History.Author + '</b> at ' + AssureNoteUtils.FormatDateTime(History.Date);
            }
            return li;
        }

        CreateTooltipContents(NodeView: NodeView): HTMLLIElement[]{
            var ret: HTMLLIElement[] = [];
            var isFirst = true;
            NodeView.Model.GetNodeHistoryList().forEach(History => {
                if (History.Author != 'unknown') {
                    ret.push(this.CreateElement(isFirst ? "Created" : "Modified", History));;
                }
                isFirst = false;
            });
            return ret;
        }
    }
}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var LastModifiedPlugin = new AssureNote.LastModifiedPlugin(App);
    App.PluginManager.SetPlugin("LastModified", LastModifiedPlugin);
});
