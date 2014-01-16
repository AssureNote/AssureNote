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
///<reference path='AssureNote.ts'/>
var AssureNote;
(function (AssureNote) {
    var Command = (function () {
        function Command(App) {
            this.App = App;
        }
        Command.prototype.GetCommandLineNames = function () {
            return [];
        };

        Command.prototype.GetDisplayName = function () {
            return "";
        };

        Command.prototype.Invoke = function (CommandName, ForcusedView, Params) {
        };
        return Command;
    })();
    AssureNote.Command = Command;

    var CommandMissingCommand = (function (_super) {
        __extends(CommandMissingCommand, _super);
        function CommandMissingCommand(App) {
            _super.call(this, App);
        }
        CommandMissingCommand.prototype.Invoke = function (CommandName, Target, Params) {
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
                if ($("#" + Label.replace(/\./g, "\\.")).length > 0) {
                    this.App.PictgramPanel.Viewport.SetCameraPosition(Node.GetCenterGX(), Node.GetCenterGY());
                } else {
                    this.App.DebugP("Invisible node " + Label + " Selected.");
                }
                return;
            }
            this.App.DebugP("undefined command: " + CommandName);
        };
        return CommandMissingCommand;
    })(Command);
    AssureNote.CommandMissingCommand = CommandMissingCommand;

    var SaveCommand = (function (_super) {
        __extends(SaveCommand, _super);
        function SaveCommand(App) {
            _super.call(this, App);
        }
        SaveCommand.prototype.GetCommandLineNames = function () {
            return ["w", "save"];
        };

        SaveCommand.prototype.GetDisplayName = function () {
            return "Save";
        };

        SaveCommand.prototype.Invoke = function (CommandName, Target, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            var Extention = Filename.split(".").pop();
            var StringToWrite = "";
            switch (Extention) {
                case "dcase_model":
                    StringToWrite = this.ConvertToDCaseXML(this.App.MasterRecord.GetLatestDoc().TopNode);
                    break;
                default:
                    if (Extention != "wgsn") {
                        Extention = "wgsn";
                        Filename += ".wgsn";
                    }
                    var Writer = new AssureNote.StringWriter();
                    this.App.MasterRecord.FormatRecord(Writer);
                    StringToWrite = Writer.toString();
                    break;
            }
            AssureNote.AssureNoteUtils.SaveAs(StringToWrite, Filename);
        };

        SaveCommand.prototype.ConvertToDCaseXML = function (root) {
            var dcaseNS = "http://www.dependable-os.net/2013/11/dcase_model/";
            var xsiNS = "http://www.w3.org/2001/XMLSchema-instance";

            var DCaseArgumentXML = document.createElementNS(dcaseNS, "dcase:Argument");
            DCaseArgumentXML.setAttribute("xmlns:dcase", dcaseNS);
            DCaseArgumentXML.setAttribute("xmlns:xsi", xsiNS);
            DCaseArgumentXML.setAttribute("id", "_6A0EENScEeKCdP-goLYu9g");

            var NodeFragment = document.createDocumentFragment();
            var LinkFragment = document.createDocumentFragment();

            function NodeTypeToString(type) {
                switch (type) {
                    case AssureNote.GSNType.Goal:
                        return "Goal";
                    case AssureNote.GSNType.Strategy:
                        return "Strategy";
                    case AssureNote.GSNType.Evidence:
                        return "Evidence";
                    case AssureNote.GSNType.Context:
                        return "Context";
                    default:
                        return "";
                }
            }

            function Convert(node) {
                var Label = node.GetLabel();
                var UID = node.UID.toString();

                var NodeXML = document.createElementNS(dcaseNS, "rootBasicNode");
                NodeXML.setAttribute("xsi:type", "dcase:" + NodeTypeToString(node.NodeType));
                NodeXML.setAttribute("id", UID);
                NodeXML.setAttribute("name", Label);
                NodeXML.setAttribute("desc", node.NodeDoc.replace(/^\s*(.*?)\s*$/, "$1").replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;"));

                NodeFragment.appendChild(NodeXML);

                if (node.ParentNode != null && node != root) {
                    var ParentUID = node.ParentNode.UID.toString();
                    var linkId = "LINK_" + ParentUID + "_" + UID;
                    var LinkXML = document.createElementNS(dcaseNS, "rootBasicLink");
                    if (node.NodeType == AssureNote.GSNType.Context) {
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
                    for (var i = 0; i < node.SubNodeList.length; i++) {
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
        };
        return SaveCommand;
    })(Command);
    AssureNote.SaveCommand = SaveCommand;

    var SaveSVGCommand = (function (_super) {
        __extends(SaveSVGCommand, _super);
        function SaveSVGCommand(App) {
            _super.call(this, App);
        }
        SaveSVGCommand.prototype.GetCommandLineNames = function () {
            return ["saveassvg", "save-as-svg"];
        };

        SaveSVGCommand.prototype.GetDisplayName = function () {
            return "Save As SVG";
        };

        SaveSVGCommand.prototype.Invoke = function (CommandName, Target, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".svg");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToSVG(this.App.PictgramPanel.MasterView), Filename);
        };

        SaveSVGCommand.prototype.ConvertToSVG = function (TopView) {
            var SVG_NS = "http://www.w3.org/2000/svg";
            var $svg = $('<svg width="' + (TopView.Shape.GetTreeWidth() + 20) + 'px" height="' + (TopView.Shape.GetTreeHeight() + 20) + 'px" version="1.1" xmlns="' + SVG_NS + '">');
            $svg.append($("svg defs").clone(false));

            var $target = $(AssureNote.AssureNoteUtils.CreateSVGElement("g")).attr("transform", "translate(" + (10 - TopView.Shape.GetTreeLeftLocalX()) + " 10) scale(1)").appendTo($svg);
            TopView.TraverseVisibleNode(function (nodeView) {
                var svg = nodeView.Shape.ShapeGroup;
                var connector = nodeView.Shape.ArrowPath;
                var SVGStyle = window.getComputedStyle(svg, null);
                var Style = window.getComputedStyle(nodeView.Shape.Content, null);
                var LableStyle = window.getComputedStyle($(nodeView.Shape.Content).find("h4")[0], null);

                $target.append($(svg).clone(false).attr({ "fill": "none", "stroke": "#000000" }));
                if (nodeView != TopView) {
                    $target.append($(connector).clone(false));
                }

                var TextX = nodeView.GetGX() + parseInt(Style.paddingLeft);
                var TextY = nodeView.GetGY() + parseInt(Style.paddingTop);
                var LableDy = parseInt(LableStyle.marginTop) + parseInt(LableStyle.fontSize);
                var FirstLineDy = parseInt(LableStyle.marginBottom) + parseInt(LableStyle.lineHeight);
                var LineDy = parseInt(Style.lineHeight);
                var LineFontSize = parseInt(Style.fontSize);

                var $svgtext = $(AssureNote.AssureNoteUtils.CreateSVGElement("text")).attr({ x: TextX, y: TextY });

                function CreateTSpan(Text) {
                    return $(AssureNote.AssureNoteUtils.CreateSVGElement("tspan")).text(Text);
                }

                CreateTSpan(nodeView.Label).attr({ "x": TextX, dy: LableDy, "font-size": LableStyle.fontSize, "font-weight": "bold", "font-family": 'Arial, Meiryo' }).appendTo($svgtext);

                var MaxNumberOfCharInLine = 1 + ~~((nodeView.Shape.GetNodeWidth() - 2 * parseInt(Style.paddingLeft)) * 2 / LineFontSize);
                var firstLine = true;
                AssureNote.AssureNoteUtils.ForeachLine(nodeView.NodeDoc, MaxNumberOfCharInLine, function (linetext) {
                    CreateTSpan(linetext).attr({ x: TextX, dy: firstLine ? FirstLineDy : LineDy, "font-size": Style.fontSize, "font-family": 'Arial, Meiryo' }).appendTo($svgtext);
                    firstLine = false;
                });

                $target.append($svgtext);
            });
            var $dummydiv = $("<div>").append($svg);
            var header = '<?xml version="1.0" standalone="no"?>\n' + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
            var doc = header + $dummydiv.html();
            $svg.empty().remove();
            return doc;
        };
        return SaveSVGCommand;
    })(Command);
    AssureNote.SaveSVGCommand = SaveSVGCommand;

    var NewCommand = (function (_super) {
        __extends(NewCommand, _super);
        function NewCommand(App) {
            _super.call(this, App);
        }
        NewCommand.prototype.GetCommandLineNames = function () {
            return ["new"];
        };

        NewCommand.prototype.GetDisplayName = function () {
            return "New";
        };

        NewCommand.prototype.Invoke = function (CommandName, FocusedView, Params) {
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
        };
        return NewCommand;
    })(Command);
    AssureNote.NewCommand = NewCommand;

    var UnfoldAllCommand = (function (_super) {
        __extends(UnfoldAllCommand, _super);
        function UnfoldAllCommand(App) {
            _super.call(this, App);
        }
        UnfoldAllCommand.prototype.GetCommandLineNames = function () {
            return ["unfoldAll", "unfold-all"];
        };

        UnfoldAllCommand.prototype.GetDisplayName = function () {
            return "Unfold All";
        };

        UnfoldAllCommand.prototype.Invoke = function (CommandName, FocusedView, Params) {
            var TopView = this.App.PictgramPanel.MasterView;
            var unfoldAll = function (TargetView) {
                TargetView.IsFolded = false;
                TargetView.ForEachVisibleChildren(function (SubNode) {
                    unfoldAll(SubNode);
                });
            };
            unfoldAll(TopView);
            this.App.PictgramPanel.Draw();
        };
        return UnfoldAllCommand;
    })(Command);
    AssureNote.UnfoldAllCommand = UnfoldAllCommand;

    var SetColorCommand = (function (_super) {
        __extends(SetColorCommand, _super);
        function SetColorCommand(App) {
            _super.call(this, App);
        }
        SetColorCommand.prototype.GetCommandLineNames = function () {
            return ["setcolor", "set-color"];
        };

        SetColorCommand.prototype.GetDisplayName = function () {
            return "Set Color...";
        };

        SetColorCommand.prototype.Invoke = function (CommandName, FocusedView, Params) {
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
        };
        return SetColorCommand;
    })(Command);
    AssureNote.SetColorCommand = SetColorCommand;

    var SetScaleCommand = (function (_super) {
        __extends(SetScaleCommand, _super);
        function SetScaleCommand(App) {
            _super.call(this, App);
        }
        SetScaleCommand.prototype.GetCommandLineNames = function () {
            return ["setscale", "set-scale"];
        };

        SetScaleCommand.prototype.GetDisplayName = function () {
            return "Set Scale...";
        };

        SetScaleCommand.prototype.Invoke = function (CommandName, FocusedView, Params) {
            if (Params.length > 0) {
                this.App.PictgramPanel.Viewport.SetCameraScale(Params[0] - 0);
            }
        };
        return SetScaleCommand;
    })(Command);
    AssureNote.SetScaleCommand = SetScaleCommand;

    var OpenCommand = (function (_super) {
        __extends(OpenCommand, _super);
        function OpenCommand(App) {
            _super.call(this, App);
        }
        OpenCommand.prototype.GetCommandLineNames = function () {
            return ["e", "open"];
        };

        OpenCommand.prototype.GetDisplayName = function () {
            return "Open...";
        };

        OpenCommand.prototype.Invoke = function (CommandName, FocusedView, Params) {
            var _this = this;
            $("#file-open-dialog").change(function (e) {
                var target = e.target || e.srcElement;
                _this.App.LoadFiles((target).files);
            });
            $("#file-open-dialog").click();
        };
        return OpenCommand;
    })(Command);
    AssureNote.OpenCommand = OpenCommand;

    var HelpCommand = (function (_super) {
        __extends(HelpCommand, _super);
        function HelpCommand(App) {
            _super.call(this, App);
        }
        HelpCommand.prototype.GetCommandLineNames = function () {
            return ["help"];
        };

        HelpCommand.prototype.GetDisplayName = function () {
            return "Help";
        };

        HelpCommand.prototype.Invoke = function (CommandName, FocusedView, Params) {
            // TODO Impl interface like "GetHelpString" to all commands and collect message by it.
            ($("#help-modal")).modal();
        };
        return HelpCommand;
    })(Command);
    AssureNote.HelpCommand = HelpCommand;

    var UploadCommand = (function (_super) {
        __extends(UploadCommand, _super);
        function UploadCommand(App) {
            _super.call(this, App);
        }
        UploadCommand.prototype.GetCommandLineNames = function () {
            return ["upload"];
        };

        UploadCommand.prototype.GetDisplayName = function () {
            return "Upload";
        };

        UploadCommand.prototype.Invoke = function (CommandName, FocusedView, Params) {
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.postJsonRPC("upload", { content: Writer.toString() }, function (result) {
                window.location.href = Config.BASEPATH + "/file/" + result.fileId;
            });
        };
        return UploadCommand;
    })(Command);
    AssureNote.UploadCommand = UploadCommand;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Command.js.map
