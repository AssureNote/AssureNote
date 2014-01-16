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

        public GetDisplayName(): string {
            return "";
        }

        public Invoke(CommandName: string, ForcusedView: NodeView, Params: any[]) {
        }
    }

    export class CommandMissingCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public Invoke(CommandName: string, Target: NodeView, Params: any[]) {
            var Label = CommandName.toUpperCase();
            if (this.App.PictgramPanel.ViewMap == null) {
                this.App.DebugP("Jump is diabled.");
                return;
            }
            var Node = this.App.PictgramPanel.ViewMap[Label];
            if (CommandName == "" && Node == null) {
                Label = this.App.PictgramPanel.FocusedLabel;
                Node = this.App.PictgramPanel.ViewMap[Label];
            }
            if (Node != null) {
                if ($("#" + Label.replace(/\./g, "\\.")).length > 0) { //FIXME use IsVisible
                    this.App.PictgramPanel.Viewport.SetCameraPosition(Node.GetCenterGX(), Node.GetCenterGY());
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

        public GetDisplayName(): string {
            return "Save";
        }

        public Invoke(CommandName: string, Target: NodeView, Params: any[]) {
            var Filename: string = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
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

    }

    export class SaveSVGCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["saveassvg", "save-as-svg"];
        }

        public GetDisplayName(): string {
            return "Save As SVG";
        }

        public Invoke(CommandName: string, Target: NodeView, Params: any[]) {
            var Filename: string = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".svg");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToSVG(this.App.PictgramPanel.MasterView), Filename);
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

        public Invoke(CommandName: string, FocusedView: NodeView, Params: any[]) {
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

        public Invoke(CommandName: string, FocusedView: NodeView, Params: any[]) {
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

        public Invoke(CommandName: string, FocusedView: NodeView, Params: any[]) {
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

        public Invoke(CommandName: string, FocusedView: NodeView, Params: any[]) {
            if (Params.length > 0) {
                this.App.PictgramPanel.Viewport.SetCameraScale(<number><any>Params[0] - 0);
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

        public Invoke(CommandName: string, FocusedView: NodeView, Params: any[]) {
            $("#file-open-dialog").change((e: Event) => {
                var target = e.target || e.srcElement;
                this.App.LoadFiles(<any>(<HTMLInputElement>target).files);
            });
            $("#file-open-dialog").click();
        }
    }

    export class HelpCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["help"];
        }

        public GetDisplayName(): string {
            return "Help";
        }

        public Invoke(CommandName: string, FocusedView: NodeView, Params: any[]) {
            // TODO Impl interface like "GetHelpString" to all commands and collect message by it.
            (<any>$("#help-modal")).modal();
        }
    }

    export class UploadCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["upload"];
        }

        public GetDisplayName(): string {
            return "Upload";
        }

        public Invoke(CommandName: string, FocusedView: NodeView, Params: any[]) {
            AssureNoteUtils.postJsonRPC("upload", {/*TODO*/}, (result: any) => {
                console.log(result);
                //TODO
            });
        }
    }

}
