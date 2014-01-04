///<reference path='AssureNote.ts'/>

module AssureNote {
    export class Command {
        constructor(public App: AssureNote.AssureNoteApp) {
        }

        public GetCommandLineNames(): string[] {
            return [];
        }

        public GetDisplayName(): string {
            return "";
        }

        public Invoke(ForcusedView: NodeView, Params: any[]) {

        }
    }

    export class CommandMissingCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public Invoke(Target: NodeView, Params: any[]) {
        }
    }

    export class SaveCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["w"];
        }

        public GetDisplayName(): string {
            return "Save";
        }

        public Invoke(Target: NodeView, Params: any[]) {
            var Filename: string = Params.length > 0 ? Params[0] : this.App.WGSNName
            var Extention = Filename.split(".").pop();
            var StringToWrite: string = "";
            switch (Extention) {
                case "dcase_model":
                    StringToWrite = this.ConvertToDCaseXML(this.App.MasterRecord.GetLatestDoc().TopNode);
                    break;
                default:
                    if (Extention != "wgsn") {
                        Extention = "wgsn";
                        Filename += ".wgsn";
                    }
                    var Writer = new StringWriter();
                    this.App.MasterRecord.FormatRecord(Writer);
                    StringToWrite = Writer.toString()
                    break;
            }
            AssureNote.AssureNoteUtils.SaveAs(StringToWrite, Filename);
        }

        ConvertToDCaseXML(root: GSNNode): string {
            var dcaseNS = "http://www.dependable-os.net/2013/11/dcase_model/";
            var xsiNS = "http://www.w3.org/2001/XMLSchema-instance";

            var DCaseArgumentXML = document.createElementNS(dcaseNS, "dcase:Argument");
            DCaseArgumentXML.setAttribute("xmlns:dcase", dcaseNS);
            DCaseArgumentXML.setAttribute("xmlns:xsi", xsiNS);
            DCaseArgumentXML.setAttribute("id", "_6A0EENScEeKCdP-goLYu9g");

            var NodeFragment = document.createDocumentFragment();
            var LinkFragment = document.createDocumentFragment();

            function NodeTypeToString(type: GSNType): string {
                switch (type) {
                    case GSNType.Goal:
                        return "Goal";
                    case GSNType.Strategy:
                        return "Strategy";
                    case GSNType.Evidence:
                        return "Evidence";
                    case GSNType.Context:
                        return "Context";
                    default:
                        return "";
                }
            }

            var linkIdCounter: number = 0;

            function CreateNewLinkId(): string {
                linkIdCounter++;
                return "LINK_" + linkIdCounter;
            }

            function convert(node: GSNNode): void {
                var Label = node.GetLabel();

                var NodeXML = document.createElementNS(dcaseNS, "rootBasicNode");
                NodeXML.setAttribute("xsi:type", "dcase:" + NodeTypeToString(node.NodeType));
                NodeXML.setAttribute("id", Label); // label is also regarded as id in AssureNote
                NodeXML.setAttribute("name", Label);
                NodeXML.setAttribute("desc", node.NodeDoc.replace(/^\s*(.*?)\s*$/, "$1").replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;"));

                NodeFragment.appendChild(NodeXML);

                if (node.ParentNode != null && node != root) {
                    var linkId: string = CreateNewLinkId();
                    var ParentLable: string = node.ParentNode.GetLabel();
                    var LinkXML: Element = document.createElementNS(dcaseNS, "rootBasicLink");
                    if (node.NodeType == GSNType.Context) {
                        LinkXML.setAttribute("xsi:type", "dcase:InContextOf");
                    } else {
                        LinkXML.setAttribute("xsi:type", "dcase:SupportedBy");
                    }
                    LinkXML.setAttribute("id", linkId);
                    LinkXML.setAttribute("name", linkId);
                    LinkXML.setAttribute("source", "#" + ParentLable);
                    LinkXML.setAttribute("target", "#" + Label);

                    LinkFragment.appendChild(LinkXML);
                }
                if (node.SubNodeList) {
                    for (var i: number = 0; i < node.SubNodeList.length; i++) {
                        convert(node.SubNodeList[i]);
                    }
                }
            }

            convert(root);

            DCaseArgumentXML.appendChild(NodeFragment);
            DCaseArgumentXML.appendChild(LinkFragment);

            var DummyNode = document.createElement("div");
            DummyNode.appendChild(DCaseArgumentXML);
            return '<?xml version="1.0" encoding="UTF-8"?>\n' + DummyNode.innerHTML.replace(/>/g, ">\n").replace(/&amp;#x/g, "&#x");
        }
    }

    export class NewCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["new"];
        }

        public GetDisplayName(): string {
            return "New";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            if (Params.length > 0) {
                this.App.LoadNewWGSN(Params[0], "* G1");
            } else {
                var Name = prompt("Enter the file name");
                if (Name != null) {
                    if (Name == "") {
                        Name = "default.wgsn";
                    }
                    this.App.LoadNewWGSN(Name, "* G1");
                }
            }
        }
    }

    export class UnfoldAllCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["unfoldAll", "unfold-all"];
        }

        public GetDisplayName(): string {
            return "Unfold All";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            var TopView = this.App.PictgramPanel.MasterView;
            var unfoldAll = (TargetView: NodeView) => {
                TargetView.IsFolded = false;
                TargetView.ForEachVisibleChildren((SubNode: NodeView) => {
                    unfoldAll(SubNode);
                });
            };
            unfoldAll(TopView);
            this.App.PictgramPanel.Draw();
        }
    }

    export class SetColorCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["setcolor", "set-color"];
        }

        public GetDisplayName(): string {
            return "Set Color...";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            if (Params.length > 1) {
                var TargetLabel = Params[0];
                var Color = Params[1];
                if (this.App.PictgramPanel.ViewMap == null) {
                    console.log("'set color' is disabled.");
                } else {
                    var Node = this.App.PictgramPanel.ViewMap[TargetLabel];
                    if (Node != null) {
                        $("#" + TargetLabel + " h4").css("background-color", Color);
                    }
                }
            }
        }
    }

    export class SetScaleCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["setscale", "set-scale"];
        }

        public GetDisplayName(): string {
            return "Set Scale...";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            if (Params.length > 0) {
                this.App.PictgramPanel.Viewport.SetScale(<number><any>Params[0] - 0);
            }
        }
    }

    export class OpenCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["e", "open"];
        }

        public GetDisplayName(): string {
            return "Open...";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            $("#file-open-dialog").change((e: Event) => {
                this.App.ProcessDroppedFiles(<any>(<HTMLInputElement>e.srcElement).files);
            });
            $("#file-open-dialog").click();
        }
    }
}