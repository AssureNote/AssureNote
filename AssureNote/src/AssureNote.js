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
var AssureNote;
(function (AssureNote) {
    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            this.PluginManager = new AssureNote.PluginManager(this);
            this.SocketManager = new AssureNote.SocketManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.PluginPanel = new AssureNote.PluginPanel(this);
            this.Commands = {};

            this.DefaultCommand = new AssureNote.CommandMissingCommand(this);
            this.RegistCommand(new AssureNote.SaveCommand(this));
            this.RegistCommand(new AssureNote.OpenCommand(this));
            this.RegistCommand(new AssureNote.NewCommand(this));
            this.RegistCommand(new AssureNote.UnfoldAllCommand(this));
            this.RegistCommand(new AssureNote.SetColorCommand(this));
            this.RegistCommand(new AssureNote.SetScaleCommand(this));
            this.RegistCommand(new AssureNote.HelpCommand(this));
        }
        AssureNoteApp.prototype.RegistCommand = function (Command) {
            var Names = Command.GetCommandLineNames();
            for (var i = 0; i < Names.length; ++i) {
                this.Commands[Names[i]] = Command;
            }
        };

        // Deprecated
        AssureNoteApp.prototype.DebugP = function (Message) {
            console.log(Message);
        };

        AssureNoteApp.Assert = function (b, message) {
            if (b == false) {
                console.log("Assert: " + message);
                throw "Assert: " + message;
            }
        };

        AssureNoteApp.prototype.ExecDoubleClicked = function (NodeView) {
            var Plugin = this.PluginManager.GetDoubleClicked();
            Plugin.ExecDoubleClicked(NodeView);
        };

        AssureNoteApp.prototype.FindCommandByCommandLineName = function (Name) {
            return this.Commands[Name] || this.DefaultCommand;
        };

        AssureNoteApp.prototype.ExecTopMenu = function (Id) {
            // temporary code
            var Command = null;
            var Args = [];
            switch (Id) {
                case "create-wgsn-menu":
                    Command = this.FindCommandByCommandLineName("new");
                    break;
                case "open-menu":
                    Command = this.FindCommandByCommandLineName("open");
                    break;
                case "save-menu":
                    var DefaultName = this.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
                    Command = this.FindCommandByCommandLineName("w");
                    Args = [DefaultName];
                    break;
                case "save-wgsn-menu":
                    var DefaultName = this.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
                    Command = this.FindCommandByCommandLineName("w");
                    var Name = prompt("Enter the file name", DefaultName);
                    if (Name == null) {
                        return;
                    }
                    if (Name == "") {
                        Args = [DefaultName];
                    } else {
                        Args = [Name.replace(/(\.\w+)?$/, ".wgsn")];
                    }
                    break;
                case "save-dcasemodel-menu":
                    var DefaultName = this.WGSNName.replace(/(\.\w+)?$/, ".dcase_model");
                    Command = this.FindCommandByCommandLineName("w");
                    var Name = prompt("Enter the file name", DefaultName);
                    if (Name == null) {
                        return;
                    }
                    if (Name == "") {
                        Args = [DefaultName];
                    } else {
                        Args = [Name.replace(/(\.\w+)?$/, ".dcase_model")];
                    }
                    break;
                case "about-menu":
                    ($('#about-modal')).modal();
                    break;
            }
            if (Command != null) {
                Command.Invoke(Id, this.PictgramPanel.MasterView, Args);
            }
        };

        AssureNoteApp.prototype.ExecCommand = function (ParsedCommand) {
            var CommandName = ParsedCommand.GetMethod();
            if (CommandName == "search") {
                return;
            }

            var Command = this.FindCommandByCommandLineName(CommandName);
            Command.Invoke(CommandName, this.PictgramPanel.GetFocusedView(), ParsedCommand.GetArgs());
        };

        AssureNoteApp.prototype.LoadNewWGSN = function (Name, WGSN) {
            var Extention = Name.split(".").pop();
            this.WGSNName = Name;
            this.MasterRecord = new GSNRecord();
            switch (Extention) {
                case "dcase_model":
                    new AssureNote.DCaseModelXMLParser(this.MasterRecord).Parse(WGSN);
                    break;
                default:
                case "wgsn":
                    this.MasterRecord.Parse(WGSN);
                    this.MasterRecord.RenumberAll();
                    break;
            }
            var LatestDoc = this.MasterRecord.GetLatestDoc();
            var TopGoalNode = LatestDoc.TopNode;

            this.PictgramPanel.SetView(new AssureNote.NodeView(TopGoalNode, true));
            this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

            this.PictgramPanel.Draw();

            var Shape = this.PictgramPanel.MasterView.GetShape();
            var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
            var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
            this.PictgramPanel.Viewport.SetScale(1);
            this.PictgramPanel.Viewport.SetOffset(WX, WY);

            $("#filename-view").text(Name);
            $("title").text("AssureNote - " + Name);
        };

        AssureNoteApp.prototype.LoadFiles = function (Files) {
            var _this = this;
            if (Files[0]) {
                var reader = new FileReader();
                reader.onerror = function (event) {
                    console.log('error', (event.target).error.code);
                };

                reader.onload = function (event) {
                    var Contents = (event.target).result;
                    var Name = Files[0].name;
                    _this.LoadNewWGSN(Name, Contents);

                    /* TODO resolve conflict */
                    _this.SocketManager.UpdateWGSN();
                };
                reader.readAsText(Files[0], 'utf-8');
            }
        };
        return AssureNoteApp;
    })();
    AssureNote.AssureNoteApp = AssureNoteApp;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNote.js.map
