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
                var Label: string = elem.getAttribute("name");

                if (IsRootNode) {
                    this.RootNodeId = Id;
                    IsRootNode = false;
                }
                var UID: number = Math.floor(Math.random() * 2147483647);
                var node: GSNNode = new GSNNode(this.Doc, null, this.Text2NodeTypeMap[NodeType], Label, index, UID, null);
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