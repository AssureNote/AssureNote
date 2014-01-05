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
            this.Text2NodeTypeMap = { "Goal": GSNType.Goal, "Strategy": GSNType.Strategy, "Context": GSNType.Context, "Pattern": GSNType.Context, "Evidence": GSNType.Evidence };
            this.Doc = new GSNDoc(this.Record);

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
                var UID = Math.floor(Math.random() * 2147483647);
                var node = new GSNNode(_this.Doc, null, _this.Text2NodeTypeMap[NodeType], Label, index, UID, null);
                node.NodeDoc = Statement;
                _this.nodes[Id] = node;

                /* TODO Need to remove this code */
                node.ParentNode = new GSNNode(null, null, GSNType.Goal, null, null, -1, null);
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
