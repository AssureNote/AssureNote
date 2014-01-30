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


module AssureNote {

    class DCaseLink {
        constructor(public source: string, public target: string) { }
    }

    export class DCaseModelXMLParser {
        private Doc: GSNDoc;
        private nodes: { [index: string]: GSNNode } = {};
        private links: { [index: string]: DCaseLink } = {};
        private Text2NodeTypeMap: any = { "Goal": GSNType.Goal, "Strategy": GSNType.Strategy, "Context": GSNType.Context, "Pattern": GSNType.Context, "Evidence": GSNType.Evidence };
        private RootNodeId: string;

        constructor(private Record: GSNRecord) {
            this.Doc = new GSNDoc(this.Record);
            // TODO: set real date
            this.Record.AddHistory(0, "unknown", "converter", "2013-12-09T13:16:18+0900", "-", this.Doc);
        }

        MakeTree(Id: string): GSNNode {
            var ThisNode: GSNNode = this.nodes[Id];

            for (var LinkId in this.links) {
                var link: DCaseLink = this.links[LinkId];

                if (link.source == Id || link.target == Id) {
                    var ChildNodeId: string;
                    if (link.source == Id) {
                        ChildNodeId = link.target;
                    } else {
                        ChildNodeId = link.source;
                    }
                    delete this.links[LinkId];
                    var ChildNode: GSNNode = this.nodes[ChildNodeId];
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
        }

        Parse(XMLData: string): void {
            var IsRootNode: boolean = true;

            var $XML = $(XMLData);

            $XML.find("rootBasicNode").each((index: any, elem: Element) => {
                var XSIType: string = elem.getAttribute("xsi\:type");

                var NodeType: string = XSIType.split(":").pop();
                var Id: string = elem.getAttribute("id");
                var Statement: string = elem.getAttribute("desc");

                if (IsRootNode) {
                    this.RootNodeId = Id;
                    IsRootNode = false;
                }
                var Type = this.Text2NodeTypeMap[NodeType];
                var node: GSNNode = new GSNNode(this.Doc, null, Type, NodeType.charAt(0), AssureNoteUtils.GenerateUID(), null);
                node.NodeDoc = Statement;
                this.nodes[Id] = node;
            });

            $XML.find("rootBasicLink").each((index: any, elem: Element) => {
                var LinkId: any = elem.getAttribute("id");
                var SourceNodeId: string = elem.getAttribute("source").substring(1); // #abc -> abc
                var TargetNodeId: string = elem.getAttribute("target").substring(1); // #abc -> abc
                this.links[LinkId] = new DCaseLink(SourceNodeId, TargetNodeId);
            });
            this.Doc.TopNode = this.MakeTree(this.RootNodeId);
            this.Doc.RenumberAll();
        }
    }
}
