///<reference path='AssureNote.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
                    this.App.PictgramPanel.Viewport.SetCaseCenter(Node.GetCenterGX(), Node.GetCenterGY());
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
            return ["w"];
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
                    var Writer = new StringWriter();
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
                this.App.PictgramPanel.Viewport.SetScale(Params[0] - 0);
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
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Command.js.map
