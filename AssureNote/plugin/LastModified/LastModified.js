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
var AssureNote;
(function (AssureNote) {
    var LastModifiedPlugin = (function (_super) {
        __extends(LastModifiedPlugin, _super);
        function LastModifiedPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        LastModifiedPlugin.prototype.RenderHTML = function (NodeDoc, Model) {
            var Author = Model.LastModified.Author;
            if (Author && Author != 'unknown') {
                var icon_user = document.createElement('span');
                icon_user.className = 'glyphicon glyphicon-user';
                var icon_time = document.createElement('span');
                icon_time.className = 'glyphicon glyphicon-time';
                var span = document.createElement('span');

                /* Due to Evidence and Strategy's shape. */
                span.className = 'node-author';
                if (Model.IsEvidence()) {
                    span.className = span.className + ' node-author-evidence';
                } else if (Model.IsStrategy()) {
                    span.className = span.className + ' node-author-strategy';
                }
                span.textContent = Author + '&nbsp';
                var small = document.createElement('small');
                small.innerHTML = icon_time.outerHTML + '&nbsp' + AssureNote.AssureNoteUtils.FormatDate(Model.LastModified.DateString);
                span.innerHTML = icon_user.outerHTML + span.textContent + small.outerHTML;
                return NodeDoc + span.outerHTML;
            } else {
                return NodeDoc;
            }
        };

        LastModifiedPlugin.prototype.CreateTooltipContents = function (NodeView) {
            var res = [];
            var li = null;

            var nodeHistory = Array();
            var modifieds = this.AssureNoteApp.MasterRecord.HistoryList;
            var hashKey = modifieds[NodeView.Model.LastModified.Rev].Doc.NodeMap.keySet();
            var prevNode = null;
            var currentNode = null;

            for (var node_i = 0; node_i < modifieds[NodeView.Model.LastModified.Rev].Doc.NodeMap.size(); node_i++) {
                if (NodeView.Model.UID.toString() == hashKey[node_i]) {
                    for (var history_i = NodeView.Model.Created.Rev + 1; history_i <= NodeView.Model.LastModified.Rev; history_i++) {
                        if (history_i == NodeView.Model.Created.Rev + 1) {
                            prevNode = modifieds[history_i].Doc.NodeMap.hash[hashKey[node_i]];
                        }
                        if (history_i != NodeView.Model.Created.Rev + 1) {
                            currentNode = modifieds[history_i].Doc.NodeMap.hash[hashKey[node_i]];
                            if (!currentNode.LastModified.EqualsHistory(prevNode.LastModified)) {
                                nodeHistory.push(currentNode.LastModified);
                            }
                            prevNode = currentNode;
                        }
                    }
                }
            }

            if (NodeView.Model.Created.Author != 'unknown') {
                li = document.createElement('li');
                li.innerHTML = 'Created by <b>' + NodeView.Model.Created.Author + '</b> ' + NodeView.Model.Created.DateString;
                res.push(li);
            }
            for (var i = 0; i < nodeHistory.length; i++) {
                if (nodeHistory[i].Author != 'unknown') {
                    li = document.createElement('li');
                    li.innerHTML = 'Modified by <b>' + nodeHistory[i].Author + '</b> ' + nodeHistory[i].DateString;
                    res.push(li);
                }
            }
            if (NodeView.Model.LastModified.Author != 'unknown') {
                li = document.createElement('li');
                li.innerHTML = 'Last modified by <b>' + NodeView.Model.LastModified.Author + '</b> ' + NodeView.Model.LastModified.DateString;
                res.push(li);
            }

            return res;
        };
        return LastModifiedPlugin;
    })(AssureNote.Plugin);
    AssureNote.LastModifiedPlugin = LastModifiedPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var LastModifiedPlugin = new AssureNote.LastModifiedPlugin(App);
    App.PluginManager.SetPlugin("LastModified", LastModifiedPlugin);
});
//# sourceMappingURL=LastModified.js.map
