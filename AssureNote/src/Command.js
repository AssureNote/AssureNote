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

        Command.prototype.Invoke = function (CommandName, Params) {
        };

        Command.prototype.GetHelpHTML = function () {
            return "<code>" + this.GetCommandLineNames().pop() + "</code>";
        };

        Command.prototype.CanUseOnViewOnlyMode = function () {
            return false;
        };
        return Command;
    })();
    AssureNote.Command = Command;

    var CommandMissingCommand = (function (_super) {
        __extends(CommandMissingCommand, _super);
        function CommandMissingCommand(App) {
            _super.call(this, App);
        }
        CommandMissingCommand.prototype.Invoke = function (CommandName, Params) {
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
                if ($("#" + Label.replace(/\./g, "\\.")).length > 0) {
                    this.App.PictgramPanel.Viewport.SetCameraPosition(Node.GetCenterGX(), Node.GetCenterGY());
                    this.App.PictgramPanel.ChangeFocusedLabel(Label);
                } else {
                    this.App.DebugP("Invisible node " + Label + " Selected.");
                }
                return;
            }
            AssureNote.AssureNoteUtils.Notify(CommandName + " is not valid command or node name");
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

        SaveCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            var Extention = Filename.split(".").pop();
            var SaveCommand = this.App.FindCommandByCommandLineName("save-as-" + Extention);
            if (SaveCommand) {
                SaveCommand.Invoke(CommandName, Params);
                return;
            }
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Filename);
        };

        SaveCommand.prototype.GetHelpHTML = function () {
            return "<code>save [name]</code><br>Save editing GSN.";
        };

        SaveCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SaveCommand;
    })(Command);
    AssureNote.SaveCommand = SaveCommand;

    var SaveWGSNCommand = (function (_super) {
        __extends(SaveWGSNCommand, _super);
        function SaveWGSNCommand(App) {
            _super.call(this, App);
            this.App = App;
        }
        SaveWGSNCommand.prototype.GetCommandLineNames = function () {
            return ["save-as-wgsn", "SaveAsWgsn"];
        };

        SaveWGSNCommand.prototype.GetHelpHTML = function () {
            return "<code>" + this.GetCommandLineNames()[0] + " [name]</code><br>Save editing GSN as WGSN file.";
        };

        SaveWGSNCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Filename);
        };

        SaveWGSNCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SaveWGSNCommand;
    })(Command);
    AssureNote.SaveWGSNCommand = SaveWGSNCommand;

    var SaveDCaseModelCommand = (function (_super) {
        __extends(SaveDCaseModelCommand, _super);
        function SaveDCaseModelCommand(App) {
            _super.call(this, App);
            this.App = App;
        }
        SaveDCaseModelCommand.prototype.GetCommandLineNames = function () {
            return ["save-as-dcase_model", "SaveAsDCaseModel"];
        };

        SaveDCaseModelCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".dcase_model");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToDCaseXML(this.App.MasterRecord.GetLatestDoc().TopNode), Filename);
        };

        SaveDCaseModelCommand.prototype.GetHelpHTML = function () {
            return "<code>" + this.GetCommandLineNames()[0] + " [name]</code><br>Save editing GSN as dcase_model file.";
        };

        SaveDCaseModelCommand.prototype.ConvertToDCaseXML = function (root) {
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
                    case 0 /* Goal */:
                        return "Goal";
                    case 2 /* Strategy */:
                        return "Strategy";
                    case 3 /* Evidence */:
                        return "Evidence";
                    case 1 /* Context */:
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
                NodeXML.setAttribute("id", UID); // label is also regarded as id in AssureNote
                NodeXML.setAttribute("name", Label);
                NodeXML.setAttribute("desc", node.NodeDoc.replace(/^\s*(.*?)\s*$/, "$1").replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;"));

                NodeFragment.appendChild(NodeXML);

                if (node.ParentNode != null && node != root) {
                    var ParentUID = node.ParentNode.UID.toString();
                    var linkId = "LINK_" + ParentUID + "_" + UID;
                    var LinkXML = document.createElementNS(dcaseNS, "rootBasicLink");
                    if (node.NodeType == 1 /* Context */) {
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

        SaveDCaseModelCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SaveDCaseModelCommand;
    })(Command);
    AssureNote.SaveDCaseModelCommand = SaveDCaseModelCommand;

    var SaveDCaseCommand = (function (_super) {
        __extends(SaveDCaseCommand, _super);
        function SaveDCaseCommand(App) {
            _super.call(this, App);
            this.App = App;
        }
        SaveDCaseCommand.prototype.GetCommandLineNames = function () {
            return ["save-as-dcase", "SaveAsDCase"];
        };

        SaveDCaseCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".dcase");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToDCaseXML(this.App.MasterRecord.GetLatestDoc().TopNode), Filename);
        };

        SaveDCaseCommand.prototype.GetHelpHTML = function () {
            return "<code>" + this.GetCommandLineNames()[0] + " [name]</code><br>Save editing GSN as dcase file.";
        };
        SaveDCaseCommand.prototype.ConvertToDCaseXML = function (root) {
            var dcaseNS = "http://www.dependable-os.net/2013/11/dcase";
            var dreNS = "http://www.dependable-os.net/dre";

            var DCaseArgumentXML = document.createElementNS(dcaseNS, "dcase:dcase");
            DCaseArgumentXML.setAttribute("xmlns:dcase", dcaseNS);
            DCaseArgumentXML.setAttribute("xmlns:dre", dreNS);
            DCaseArgumentXML.setAttribute("id", "114199572c001a457275233ab78155e0");

            var NodeFragment = document.createElementNS(dcaseNS, "dcase:nodes");
            var LinkFragment = document.createElementNS(dcaseNS, "dcase:links");

            function NodeTypeToString(type) {
                switch (type) {
                    case 0 /* Goal */:
                        return "Goal";
                    case 2 /* Strategy */:
                        return "Strategy";
                    case 3 /* Evidence */:
                        return "Evidence";
                    case 1 /* Context */:
                        return "Context";
                    default:
                        return "";
                }
            }

            function Convert(node) {
                var Label = node.GetLabel();
                var UID = node.UID.toString();

                var NodeXML = document.createElementNS(dcaseNS, "dcase:node");
                NodeXML.setAttribute("type", NodeTypeToString(node.NodeType));
                NodeXML.setAttribute("id", UID); // label is also regarded as id in AssureNote
                NodeXML.setAttribute("name", Label);
                var DescriptionXML = document.createElementNS(dcaseNS, "dcase:description");
                DescriptionXML.textContent = node.NodeDoc.replace(/^\s*(.*?)\s*$/, "$1").replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;");
                NodeXML.appendChild(DescriptionXML);

                var Author = node.LastModified.Author;
                if (Author && Author != 'unknown') {
                    var ResponsibilityXML = document.createElementNS(dcaseNS, "dcase:responsibility");
                    ResponsibilityXML.setAttribute("name", node.LastModified.Author);
                    NodeXML.appendChild(ResponsibilityXML);
                }

                NodeFragment.appendChild(NodeXML);

                if (node.ParentNode != null && node != root) {
                    var ParentUID = node.ParentNode.UID.toString();
                    var linkId = "LINK_" + ParentUID + "_" + UID;
                    var LinkXML = document.createElementNS(dcaseNS, "dcase:link");
                    if (node.NodeType == 1 /* Context */) {
                        LinkXML.setAttribute("type", "InContextOf");
                    } else {
                        LinkXML.setAttribute("type", "SupportedBy");
                    }
                    LinkXML.setAttribute("id", linkId);
                    LinkXML.setAttribute("name", linkId);
                    LinkXML.setAttribute("source", ParentUID);
                    LinkXML.setAttribute("target", UID);

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

        SaveDCaseCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SaveDCaseCommand;
    })(Command);
    AssureNote.SaveDCaseCommand = SaveDCaseCommand;

    var SaveSVGCommand = (function (_super) {
        __extends(SaveSVGCommand, _super);
        function SaveSVGCommand(App) {
            _super.call(this, App);
        }
        SaveSVGCommand.prototype.GetCommandLineNames = function () {
            return ["saveassvg", "save-as-svg"];
        };

        SaveSVGCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".svg");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToSVG(this.App.PictgramPanel.TopNodeView), Filename);
        };

        SaveSVGCommand.prototype.GetHelpHTML = function () {
            return "<code>save-as-svg [name]</code><br>Save editing GSN as SVG file.";
        };

        SaveSVGCommand.prototype.ConvertToSVG = function (TopView) {
            var SVG_NS = "http://www.w3.org/2000/svg";
            var $svg = $('<svg width="' + (TopView.Shape.GetTreeWidth() + 20) + 'px" height="' + (TopView.Shape.GetTreeHeight() + 20) + 'px" version="1.1" xmlns="' + SVG_NS + '">');
            $svg.append($("svg defs").clone(false));

            this.App.PictgramPanel.ForceAppendAllOutOfScreenNode();

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

        SaveSVGCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
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

        NewCommand.prototype.GetHelpHTML = function () {
            return "<code>new [name]</code><br>Create new file.";
        };

        NewCommand.prototype.Invoke = function (CommandName, Params) {
            var History = new AssureNote.GSNHistory(0, this.App.GetUserName(), 'todo', null, 'test', null);
            var Writer = new AssureNote.StringWriter();
            AssureNote.TagUtils.FormatHistoryTag([History], 0, Writer);
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
            if (history.replaceState) {
                history.replaceState(null, null, Config.BASEPATH);
            }
        };

        NewCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
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

        UnfoldAllCommand.prototype.GetHelpHTML = function () {
            return "<code>unfold-all</code><br>Unfold all folded Goals";
        };

        UnfoldAllCommand.prototype.Invoke = function (CommandName, Params) {
            var TopView = this.App.PictgramPanel.TopNodeView;
            var unfoldAll = function (TargetView) {
                TargetView.SetIsFolded(false);
                TargetView.ForEachVisibleChildren(function (SubNode) {
                    unfoldAll(SubNode);
                });
            };
            unfoldAll(TopView);
            this.App.PictgramPanel.Draw();
        };

        UnfoldAllCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
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

        SetColorCommand.prototype.GetHelpHTML = function () {
            return "<code>set-color label color</code><br>Change node color.";
        };

        SetColorCommand.prototype.Invoke = function (CommandName, Params) {
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

        SetScaleCommand.prototype.GetHelpHTML = function () {
            return "<code>set-scale scale</code><br>Change scale.";
        };

        SetScaleCommand.prototype.Invoke = function (CommandName, Params) {
            if (Params.length > 0) {
                this.App.PictgramPanel.Viewport.SetCameraScale(Params[0] - 0);
            }
        };

        SetScaleCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SetScaleCommand;
    })(Command);
    AssureNote.SetScaleCommand = SetScaleCommand;

    var CommitCommand = (function (_super) {
        __extends(CommitCommand, _super);
        function CommitCommand(App) {
            _super.call(this, App);
        }
        CommitCommand.prototype.GetCommandLineNames = function () {
            return ["commit"];
        };

        CommitCommand.prototype.GetHelpHTML = function () {
            return "<code>commit</code><br>Commit.";
        };

        CommitCommand.prototype.Invoke = function (CommandName, Params) {
            if (this.App.IsUserGuest()) {
                alert("Please login first.");
                return;
            }
            var message = "Default message";
            if (Params.length >= 1)
                message = Params.join(" ");
            this.App.MasterRecord.Commit(message);
        };

        CommitCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return CommitCommand;
    })(Command);
    AssureNote.CommitCommand = CommitCommand;

    var OpenCommand = (function (_super) {
        __extends(OpenCommand, _super);
        function OpenCommand(App) {
            _super.call(this, App);
        }
        OpenCommand.prototype.GetCommandLineNames = function () {
            return ["e", "open"];
        };

        OpenCommand.prototype.GetHelpHTML = function () {
            return "<code>open</code><br>Open a file.";
        };

        OpenCommand.prototype.Invoke = function (CommandName, Params) {
            var _this = this;
            $("#file-open-dialog").change(function (e) {
                var target = e.target || e.srcElement;
                _this.App.LoadFiles(target.files);
            });
            $("#file-open-dialog").click();
            if (history.replaceState) {
                history.replaceState(null, null, Config.BASEPATH);
            }
        };

        OpenCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
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
            return ["help", "?"];
        };

        HelpCommand.prototype.GetHelpHTML = function () {
            return "<code>help [name]</code><br>Show this message.";
        };

        HelpCommand.prototype.Invoke = function (CommandName, Params) {
            var Helps = jQuery.map(this.App.Commands, function (Command, i) {
                return Command.GetHelpHTML();
            }).sort();
            $("#help-modal ul").empty().append("<li>" + Helps.join("</li><li>") + "</li>");
            $("#help-modal .modal-body").css({ "overflow-y": "scroll", "height": this.App.PictgramPanel.Viewport.GetPageHeight() * 0.6 });
            $("#help-modal").modal();
        };

        HelpCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return HelpCommand;
    })(Command);
    AssureNote.HelpCommand = HelpCommand;

    var ShareCommand = (function (_super) {
        __extends(ShareCommand, _super);
        function ShareCommand(App) {
            _super.call(this, App);
        }
        ShareCommand.prototype.GetCommandLineNames = function () {
            return ["share"];
        };

        ShareCommand.prototype.GetHelpHTML = function () {
            return "<code>share</code><br>Share editing GSN to the server(online version only).";
        };

        ShareCommand.prototype.Invoke = function (CommandName, Params) {
            var _this = this;
            if (this.App.IsUserGuest()) {
                alert("Please login first.");
                return;
            }
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            this.App.SetLoading(true);
            AssureNote.AssureNoteUtils.postJsonRPC("upload", { content: Writer.toString() }, function (result) {
                var NewURL = Config.BASEPATH + "/file/" + result.fileId;
                if (history.replaceState) {
                    history.replaceState(null, null, NewURL);
                } else {
                    window.location.href = Config.BASEPATH + "/file/" + result.fileId;
                }
                //this.App.SetLoading(false);
                //if(history.pushState) {
                //    history.pushState({fileId: result.fileId}, "", Config.BASEPATH + "/file/" + result.fileId);
                //} else {
                //    window.location.href = Config.BASEPATH + "/file/" + result.fileId;
                //}
            }, function () {
                _this.App.SetLoading(false);
            });
        };

        ShareCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return ShareCommand;
    })(Command);
    AssureNote.ShareCommand = ShareCommand;

    var SetGuestUserNameCommand = (function (_super) {
        __extends(SetGuestUserNameCommand, _super);
        function SetGuestUserNameCommand(App) {
            _super.call(this, App);
        }
        SetGuestUserNameCommand.prototype.GetCommandLineNames = function () {
            return ["set-user", "setuser"];
        };

        SetGuestUserNameCommand.prototype.Invoke = function (CommandName, Params) {
            var Name = Params[0];
            if (!Name || Name == '') {
                Name = prompt('Enter the new name for guest', '');
            }
            if (!Name || Name == '') {
                Name = 'Guest';
            }
            this.App.SetUserName(Name);
        };

        SetGuestUserNameCommand.prototype.GetHelpHTML = function () {
            return "<code>set-user [name]</code><br>Rename guest user.";
        };

        SetGuestUserNameCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SetGuestUserNameCommand;
    })(Command);
    AssureNote.SetGuestUserNameCommand = SetGuestUserNameCommand;

    var SearchCommand = (function (_super) {
        __extends(SearchCommand, _super);
        function SearchCommand(App) {
            _super.call(this, App);
        }
        SearchCommand.prototype.GetCommandLineNames = function () {
            return ["search", "find"];
        };

        SearchCommand.prototype.GetHelpHTML = function () {
            return "<code>search keyword</code><br>Search nodes including keyword.";
        };

        SearchCommand.prototype.Invoke = function (CommandName, Params) {
            var Key = Params[0];
            if (!Key) {
                Key = prompt("Enter the keyword");
            }
            if (Key) {
                var Result = this.App.PictgramPanel.TopNodeView.Model.SearchNode(Key);
                this.App.NodeListPanel.StartVisit(Result, "Search: " + Key);
            }
        };

        SearchCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SearchCommand;
    })(Command);
    AssureNote.SearchCommand = SearchCommand;

    var CopyCommand = (function (_super) {
        __extends(CopyCommand, _super);
        function CopyCommand(App) {
            _super.call(this, App);
        }
        CopyCommand.prototype.GetCommandLineNames = function () {
            return ["copy"];
        };

        CopyCommand.prototype.GetHelpHTML = function () {
            return "<code>copy node</code><br>Copy the nodes.";
        };

        CopyCommand.prototype.Invoke = function (CommandName, Params) {
            console.log("invoke");
            console.log(Params);
            if (Params.length == 1) {
                var TargetLabel = Params[0];
                console.log(Params);
                var Node = this.App.PictgramPanel.ViewMap[TargetLabel];
                if (Node != null) {
                    var Writer = new AssureNote.StringWriter();
                    Node.Model.FormatSubNode(1, Writer, true);
                    var Text = Writer.toString();

                    /* TODO copy to the clipboard. It seems that some libraries is needed to use the clipboard. */
                    console.log(Text);
                } else {
                    AssureNote.AssureNoteUtils.Notify("Node " + Params[0] + "not found");
                }
            } else {
                AssureNote.AssureNoteUtils.Notify("Invalid parameters");
            }
        };

        CopyCommand.prototype.CanUseOnViewOnlyMode = function () {
            return false;
        };
        return CopyCommand;
    })(Command);
    AssureNote.CopyCommand = CopyCommand;

    var PasteCommand = (function (_super) {
        __extends(PasteCommand, _super);
        function PasteCommand(App) {
            _super.call(this, App);
        }
        PasteCommand.prototype.GetCommandLineNames = function () {
            return ["paste"];
        };

        PasteCommand.prototype.GetHelpHTML = function () {
            return "<code>Paste node</code><br>Paste the nodes as the sub-tree of the specified nodes.";
        };

        PasteCommand.prototype.Invoke = function (CommandName, Params) {
            /* TODO Get WGSN from the clipboard. */
        };

        PasteCommand.prototype.CanUseOnViewOnlyMode = function () {
            return false;
        };
        return PasteCommand;
    })(Command);
    AssureNote.PasteCommand = PasteCommand;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Command.js.map
