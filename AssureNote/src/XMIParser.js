var AssureNote;
(function (AssureNote) {
    var DCaseLink = (function () {
        function DCaseLink(source, target) {
            this.source = source;
            this.target = target;
        }
        return DCaseLink;
    })();
    var XMIParser = (function () {
        function XMIParser(Record) {
            this.Record = Record;
            this.contents = {};
            this.nodes = {};
            this.links = {};
            this.Text2NodeTypeMap = { "GSN.Goal": 0 /* Goal */, "GSN.Strategy": 2 /* Strategy */, "GSN.Context": 1 /* Context */, "GSN.Solution": 3 /* Evidence */ };
            this.Doc = new AssureNote.GSNDoc(this.Record);

            // TODO: set real date
            this.Record.AddHistory(0, "unknown", "converter", "2013-12-09T13:16:18+0900", "-", this.Doc);
        }
        XMIParser.prototype.MakeTree = function (Id) {
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

        XMIParser.prototype.Parse = function (XMLData) {
            var _this = this;
            var IsRootNode = true;

            var $XML = $(XMLData);

            $XML.find("argumentElement").each(function (index, elem) {
                var ID = elem.getAttribute("xmi:id");
                _this.contents[ID] = elem.getAttribute("content");
            });

            $XML.find("children").each(function (index, elem) {
                var NodeType = elem.getAttribute("type");
                var ID = elem.getAttribute("xmi:id");
                var ContentID = elem.getAttribute("element");

                if (IsRootNode) {
                    _this.RootNodeId = ID;
                    IsRootNode = false;
                }
                var Type = _this.Text2NodeTypeMap[NodeType];
                var node = new AssureNote.GSNNode(_this.Doc, null, Type, NodeType.charAt(4), AssureNote.AssureNoteUtils.GenerateUID(), null);
                node.NodeDoc = _this.contents[ContentID] || "";
                _this.nodes[ID] = node;
            });

            $XML.find("edges").each(function (index, elem) {
                var LinkId = elem.getAttribute("xmi:id");
                var SourceNodeId = elem.getAttribute("source");
                var TargetNodeId = elem.getAttribute("target");
                _this.links[LinkId] = new DCaseLink(SourceNodeId, TargetNodeId);
            });

            this.Doc.TopNode = this.MakeTree(this.RootNodeId);
            this.Doc.RenumberAll();
        };
        return XMIParser;
    })();
    AssureNote.XMIParser = XMIParser;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=XMIParser.js.map
