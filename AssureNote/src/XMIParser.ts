module AssureNote {
    class DCaseLink {
        constructor(public source: string, public target: string) { }
    }
    export class XMIParser {
        private Doc: GSNDoc;
        private contents: { [index: string]: string } = {};
        private nodes: { [index: string]: GSNNode } = {};
        private links: { [index: string]: DCaseLink } = {};
        private Text2NodeTypeMap: any = { "GSN.Goal": GSNType.Goal, "GSN.Strategy": GSNType.Strategy, "GSN.Context": GSNType.Context, "GSN.Solution": GSNType.Evidence };
        private RootNodeId: string;

        constructor(private Record: GSNRecord) {
            this.Doc = new GSNDoc(this.Record);
            // TODO: set real date
            this.Record.AddHistory(0, "unknown", "converter", new Date(), "-", this.Doc);
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

            $XML.find("argumentElement").each((index: any, elem: Element) => {
                var ID = elem.getAttribute("xmi:id");
                this.contents[ID] = elem.getAttribute("content");
            });

            $XML.find("children").each((index: any, elem: Element) => {
                var NodeType: string = elem.getAttribute("type");
                var ID: string = elem.getAttribute("xmi:id");
                var ContentID: string = elem.getAttribute("element");

                if (IsRootNode) {
                    this.RootNodeId = ID;
                    IsRootNode = false;
                }
                var Type = this.Text2NodeTypeMap[NodeType];
                var node: GSNNode = new GSNNode(this.Doc, null, Type, NodeType.charAt(4), AssureNoteUtils.GenerateUID(), null);
                node.NodeDoc = this.contents[ContentID] || "";
                this.nodes[ID] = node;
            });

            $XML.find("edges").each((index: any, elem: Element) => {
                var LinkId: any = elem.getAttribute("xmi:id");
                var SourceNodeId: string = elem.getAttribute("source");
                var TargetNodeId: string = elem.getAttribute("target");
                this.links[LinkId] = new DCaseLink(SourceNodeId, TargetNodeId);
            });


            this.Doc.TopNode = this.MakeTree(this.RootNodeId);
            this.Doc.RenumberAll();
        }
    }
}

