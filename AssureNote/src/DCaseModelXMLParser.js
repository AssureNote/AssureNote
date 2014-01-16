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
///<reference path='AssureNoteParser.ts'/>
var AssureNote;
(function (AssureNote) {
    var DCaseLink = (function () {
        function DCaseLink(source, target) {
            this.source = source;
            this.target = target;
        }
        return DCaseLink;
    })();

    var DCaseModelXMLParser = (function () {
        function DCaseModelXMLParser(Record) {
            this.Record = Record;
            this.nodes = {};
            this.links = {};
            this.Text2NodeTypeMap = { "Goal": 0 /* Goal */, "Strategy": 2 /* Strategy */, "Context": 1 /* Context */, "Pattern": 1 /* Context */, "Evidence": 3 /* Evidence */ };
            this.Doc = new AssureNote.GSNDoc(this.Record);

            // TODO: set real date
            this.Record.AddHistory(0, "unknown", "converter", "2013-12-09T13:16:18+0900", "-", this.Doc);
        }
        DCaseModelXMLParser.prototype.MakeTree = function (Id) {
            var ThisNode = this.nodes[Id];

            for (var LinkId in this.links) {
                var link = this.links[LinkId];

                if (link.source == Id || link.target == Id) {
                    var ChildNodeId;
                    if (link.source == Id) {
                        ChildNodeId = link.target;
                    } else {
                        ChildNodeId = link.source;
                    }
                    delete this.links[LinkId];
                    var ChildNode = this.nodes[ChildNodeId];
                    if (ThisNode.SubNodeList == null) {
                        ThisNode.SubNodeList = [ChildNode];
                    } else {
                        ThisNode.SubNodeList.push(ChildNode);
                    }
                    ChildNode.ParentNode = ThisNode;
                    this.MakeTree(ChildNodeId);
                }
            }

            return ThisNode;
        };

        DCaseModelXMLParser.prototype.Parse = function (XMLData) {
            var _this = this;
            var IsRootNode = true;

            var $XML = $(XMLData);

            $XML.find("rootBasicNode").each(function (index, elem) {
                var XSIType = elem.getAttribute("xsi\:type");

                var NodeType = XSIType.split(":").pop();
                var Id = elem.getAttribute("id");
                var Statement = elem.getAttribute("desc");
                var Label = elem.getAttribute("name");

                if (IsRootNode) {
                    _this.RootNodeId = Id;
                    IsRootNode = false;
                }
                while (Label.charAt(0).search(/[A-Za-z]/) == 0)
                    Label = Label.substr(1); // G1.1 -> 1.1
                console.log(Label);
                var Type = _this.Text2NodeTypeMap[NodeType];
                var node = new AssureNote.GSNNode(_this.Doc, null, Type, NodeType.charAt(0), AssureNote.AssureNoteUtils.GenerateUID(), null);
                node.NodeDoc = Statement;
                _this.nodes[Id] = node;

                /* TODO Need to remove this code */
                node.ParentNode = new AssureNote.GSNNode(null, null, 0 /* Goal */, null, -1, null);
            });

            $XML.find("rootBasicLink").each(function (index, elem) {
                var LinkId = elem.getAttribute("id");
                var SourceNodeId = elem.getAttribute("source").substring(1);
                var TargetNodeId = elem.getAttribute("target").substring(1);
                _this.links[LinkId] = new DCaseLink(SourceNodeId, TargetNodeId);
            });
            this.Doc.TopNode = this.MakeTree(this.RootNodeId);
            this.Doc.RenumberAll();
        };
        return DCaseModelXMLParser;
    })();
    AssureNote.DCaseModelXMLParser = DCaseModelXMLParser;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=DCaseModelXMLParser.js.map
