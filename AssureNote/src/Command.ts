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

///<reference path='AssureNote.ts'/>

module AssureNote {
    export class Command {
        constructor(public App: AssureNote.AssureNoteApp) {
        }

        public GetCommandLineNames(): string[] {
            return [];
        }

        public Invoke(CommandName: string, Params: any[]) {
        }

        public GetHelpHTML(): string {
            return "<code>" + this.GetCommandLineNames().pop() + "</code>";
        }

        public CanUseOnViewOnlyMode(): boolean {
            return false;
        }
    }

    export class CommandMissingCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public Invoke(CommandName: string, Params: any[]) {
            if (CommandName == null) {
                return;
            }
            var Label = CommandName.toUpperCase();
            if (this.App.PictgramPanel.ViewMap == null) {
                this.App.DebugP("Jump is diabled.");
                return;
            }
            var Node = this.App.PictgramPanel.ViewMap[Label];
            if (CommandName == "" && Node == null) {
                Label = this.App.PictgramPanel.GetFocusedLabel();
                Node = this.App.PictgramPanel.ViewMap[Label];
            }
            if (Node != null) {
                if ($("#" + Label.replace(/\./g, "\\.")).length > 0) { //FIXME use IsVisible
                    this.App.PictgramPanel.Viewport.SetCameraPosition(Node.GetCenterGX(), Node.GetCenterGY());
                    this.App.PictgramPanel.ChangeFocusedLabel(Label);
                } else {
                    this.App.DebugP("Invisible node " + Label + " Selected.");
                }
                return;
            }
            this.App.DebugP("undefined command: " + CommandName);
        }
    }

    export class SaveCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["w", "save"];
        }

        public Invoke(CommandName: string, Params: any[]) {
            var Filename: string = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            var Extention = Filename.split(".").pop();
            var SaveCommand = this.App.FindCommandByCommandLineName("save-as-" + Extention);
            if (SaveCommand) {
                SaveCommand.Invoke(CommandName, Params);
                return;
            }
            var Writer = new StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Filename);
        }

        public GetHelpHTML(): string {
            return "<code>save [name]</code><br>Save editing GSN."
        }

        public CanUseOnViewOnlyMode(): boolean {
            return true;
        }
    }

    export class SaveWGSNCommand extends Command {
        constructor(public App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["save-as-wgsn", "SaveAsWgsn"];
        }

        public GetHelpHTML(): string {
            return "<code>" + this.GetCommandLineNames()[0] + " [name]</code><br>Save editing GSN as WGSN file.";
        }

        public Invoke(CommandName: string, Params: any[]) {
            var Filename: string = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            var Writer = new StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Filename);
        }

        public CanUseOnViewOnlyMode(): boolean {
            return true;
        }
    }

    export class SaveDCaseCommand extends Command {
        constructor(public App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["save-as-dcase_model", "SaveAsDCaseModel"];
        }

        public Invoke(CommandName: string, Params: any[]) {
            var Filename: string = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".dcase_model");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToDCaseXML(this.App.MasterRecord.GetLatestDoc().TopNode), Filename);
        }

        public GetHelpHTML(): string {
            return "<code>" + this.GetCommandLineNames()[0] + " [name]</code><br>Save editing GSN as dcase_model file.";
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

            function Convert(node: GSNNode): void {
                var Label: string = node.GetLabel();
                var UID: string = node.UID.toString();

                var NodeXML = document.createElementNS(dcaseNS, "rootBasicNode");
                NodeXML.setAttribute("xsi:type", "dcase:" + NodeTypeToString(node.NodeType));
                NodeXML.setAttribute("id", UID); // label is also regarded as id in AssureNote
                NodeXML.setAttribute("name", Label);
                NodeXML.setAttribute("desc", node.NodeDoc.replace(/^\s*(.*?)\s*$/, "$1").replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;"));

                NodeFragment.appendChild(NodeXML);

                if (node.ParentNode != null && node != root) {
                    var ParentUID: string = node.ParentNode.UID.toString();
                    var linkId: string = "LINK_" + ParentUID + "_" + UID;
                    var LinkXML: Element = document.createElementNS(dcaseNS, "rootBasicLink");
                    if (node.NodeType == GSNType.Context) {
                        LinkXML.setAttribute("xsi:type", "dcase:InContextOf");
                    } else {
                        LinkXML.setAttribute("xsi:type", "dcase:SupportedBy");
                    }
                    LinkXML.setAttribute("id", linkId);
                    LinkXML.setAttribute("name", linkId);
                    LinkXML.setAttribute("source", "#" + ParentUID);
                    LinkXML.setAttribute("target", "#" + UID);

                    LinkFragment.appendChild(LinkXML);
                }
                if (node.SubNodeList) {
                    for (var i: number = 0; i < node.SubNodeList.length; i++) {
                        Convert(node.SubNodeList[i]);
                    }
                }
            }

            Convert(root);

            DCaseArgumentXML.appendChild(NodeFragment);
            DCaseArgumentXML.appendChild(LinkFragment);

            var DummyNode = document.createElement("div");
            DummyNode.appendChild(DCaseArgumentXML);
            return '<?xml version="1.0" encoding="UTF-8"?>\n' + DummyNode.innerHTML.replace(/>/g, ">\n").replace(/&amp;#x/g, "&#x");
        }

        public CanUseOnViewOnlyMode(): boolean {
            return true;
        }
    }

    export class SaveSVGCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["saveassvg", "save-as-svg"];
        }

        public Invoke(CommandName: string, Params: any[]) {
            var Filename: string = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".svg");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToSVG(this.App.PictgramPanel.MasterView), Filename);
        }

        public GetHelpHTML(): string {
            return "<code>save-as-svg [name]</code><br>Save editing GSN as SVG file."
        }

        ConvertToSVG(TopView: NodeView): string {
            var SVG_NS = "http://www.w3.org/2000/svg";
            var $svg = $('<svg width="' + (TopView.Shape.GetTreeWidth() + 20) +  'px" height="' + (TopView.Shape.GetTreeHeight() + 20) + 'px" version="1.1" xmlns="' + SVG_NS + '">');
            $svg.append($("svg defs").clone(false));

            var $target = $(AssureNoteUtils.CreateSVGElement("g")).attr("transform", "translate(" + (10 -TopView.Shape.GetTreeLeftLocalX()) + " 10) scale(1)").appendTo($svg);
            TopView.TraverseVisibleNode((nodeView) => {
                var svg = nodeView.Shape.ShapeGroup;
                var connector: SVGPathElement = nodeView.Shape.ArrowPath;
                var SVGStyle = window.getComputedStyle(svg, null);
                var Style = window.getComputedStyle(nodeView.Shape.Content, null);
                var LableStyle = window.getComputedStyle($(nodeView.Shape.Content).find("h4")[0], null);

                $target.append($(svg).clone(false).attr({"fill": "none", "stroke": "#000000"}));
                if (nodeView != TopView) {
                    $target.append($(connector).clone(false));
                }

                var TextX = nodeView.GetGX() + parseInt(Style.paddingLeft);
                var TextY = nodeView.GetGY() + parseInt(Style.paddingTop);
                var LableDy = parseInt(LableStyle.marginTop) + parseInt(LableStyle.fontSize);
                var FirstLineDy = parseInt(LableStyle.marginBottom) + parseInt(LableStyle.lineHeight);
                var LineDy = parseInt(Style.lineHeight);
                var LineFontSize = parseInt(Style.fontSize);

                var $svgtext = $(AssureNoteUtils.CreateSVGElement("text"))
                    .attr({ x: TextX, y: TextY });

                function CreateTSpan(Text: string): JQuery {
                    return $(AssureNoteUtils.CreateSVGElement("tspan")).text(Text);
                }

                CreateTSpan(nodeView.Label).attr({ "x": TextX, dy: LableDy, "font-size": LableStyle.fontSize, "font-weight": "bold", "font-family": 'Arial, Meiryo' }).appendTo($svgtext);

                var MaxNumberOfCharInLine = 1 + ~~((nodeView.Shape.GetNodeWidth() - 2 * parseInt(Style.paddingLeft)) * 2 / LineFontSize);
                var firstLine = true;
                AssureNoteUtils.ForeachLine(nodeView.NodeDoc, MaxNumberOfCharInLine, (linetext) => {
                    CreateTSpan(linetext)
                        .attr({ x: TextX, dy: firstLine ? FirstLineDy : LineDy, "font-size": Style.fontSize, "font-family": 'Arial, Meiryo' })
                        .appendTo($svgtext);
                    firstLine = false;
                });

                $target.append($svgtext);
            });
            var $dummydiv = $("<div>").append($svg);
            var header = '<?xml version="1.0" standalone="no"?>\n' +
                '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
            var doc = header + $dummydiv.html();
            $svg.empty().remove();
            return doc;
        }

        public CanUseOnViewOnlyMode(): boolean {
            return true;
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

        public GetHelpHTML(): string {
            return "<code>new [name]</code><br>Create new file."
        }

        public Invoke(CommandName: string, Params: any[]) {
            var History: GSNHistory = new GSNHistory(0, this.App.GetUserName(), 'todo', null, 'test', null);
            var Writer: StringWriter = new StringWriter();
            TagUtils.FormatHistoryTag([History], 0, Writer);
            console.log(Writer.toString());
            var WGSN = Writer.toString() + 'Revision:: 0\n*G';
            if (Params.length > 0) {
                this.App.LoadNewWGSN(Params[0], WGSN);
            } else {
                var Name = prompt("Enter the file name");
                if (Name != null) {
                    if (Name == "") {
                        Name = "default.wgsn";
                    }
                    this.App.LoadNewWGSN(Name, WGSN);
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

        public GetHelpHTML(): string {
            return "<code>unfold-all</code><br>Unfold all folded Goals"
        }

        public Invoke(CommandName: string, Params: any[]) {
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

        public GetHelpHTML(): string {
            return "<code>set-color label color</code><br>Change node color."
        }

        public Invoke(CommandName: string, Params: any[]) {
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

        public GetHelpHTML(): string {
            return "<code>set-scale scale</code><br>Change scale."
        }

        public Invoke(CommandName: string, Params: any[]) {
            if (Params.length > 0) {
                this.App.PictgramPanel.Viewport.SetCameraScale(<number><any>Params[0] - 0);
            }
        }
    }

    export class CommitCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["commit"];
        }

        public GetHelpHTML(): string {
            return "<code>commit</code><br>Commit."
        }

        public Invoke(CommandName: string, Params: any[]) {
            var message: string = "Default message";
            if (Params.length >= 1) message = Params.join(" ");
            this.App.MasterRecord.Commit(message);
        }
    }

    export class OpenCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["e", "open"];
        }

        public GetHelpHTML(): string {
            return "<code>open</code><br>Open a file."
        }

        public Invoke(CommandName: string, Params: any[]) {
            $("#file-open-dialog").change((e: Event) => {
                var target = e.target || e.srcElement;
                this.App.LoadFiles((<HTMLInputElement>target).files);
            });
            $("#file-open-dialog").click();
        }
    }

    export class HelpCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["help", "?"];
        }

        public GetHelpHTML(): string {
            return "<code>help [name]</code><br>Show this message."
        }

        public Invoke(CommandName: string, Params: any[]) {
            var Helps: string[] = jQuery.map(this.App.Commands, (Command: Command, i: number): string => { return Command.GetHelpHTML(); }).sort();
            $("#help-modal ul").empty().append("<li>" + Helps.join("</li><li>") + "</li>");
            $("#help-modal .modal-body").css({ "overflow-y": "scroll", "height": this.App.PictgramPanel.Viewport.GetPageHeight() * 0.6 });
            (<any>$("#help-modal")).modal();
        }

        public CanUseOnViewOnlyMode(): boolean {
            return true;
        }
    }

    export class ShareCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["share"];
        }

        public GetHelpHTML(): string {
            return "<code>share</code><br>Share editing GSN to the server(online version only)."
        }

        public Invoke(CommandName: string, Params: any[]) {
            var Writer = new StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            this.App.SetLoading(true);
            AssureNoteUtils.postJsonRPC("upload", {content: Writer.toString()}, (result: any) => {
                window.location.href = Config.BASEPATH + "/file/" + result.fileId;
                //this.App.SetLoading(false);
                //if(history.pushState) {
                //    history.pushState({fileId: result.fileId}, "", Config.BASEPATH + "/file/" + result.fileId);
                //} else {
                //    window.location.href = Config.BASEPATH + "/file/" + result.fileId;
                //}
            }, ()=> {
                this.App.SetLoading(false);
            });
        }
    }

    export class SetGuestUserNameCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["set-user", "setuser"];
        }

        public Invoke(CommandName: string, Params: any[]) {
            var Name = Params[0];
            if (!Name || Name == '') {
                Name = prompt('Enter the new name for guest', '');
            }
            if (!Name || Name == '') {
                Name = 'Guest';
            }
            this.App.SetUserName(Name);
        }

        public GetHelpHTML(): string {
            return "<code>set-user [name]</code><br>Rename guest user."
        }

        public CanUseOnViewOnlyMode(): boolean {
            return true;
        }
    }
}
