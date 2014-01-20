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
///<reference path='Socket.ts'/>
///<reference path='Command.ts'/>
///<reference path='TopMenu.ts'/>
///<reference path='DCaseModelXMLParser.ts'/>

var AssureNote;
(function (AssureNote) {
    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            this.Commands = [];
            this.CommandLineTable = {};

            this.PluginManager = new AssureNote.PluginManager(this);
            this.SocketManager = new AssureNote.SocketManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.PluginPanel = new AssureNote.PluginPanel(this);

            this.DefaultCommand = new AssureNote.CommandMissingCommand(this);
            this.RegistCommand(new AssureNote.SaveCommand(this));
            this.RegistCommand(new AssureNote.OpenCommand(this));
            this.RegistCommand(new AssureNote.NewCommand(this));
            this.RegistCommand(new AssureNote.UnfoldAllCommand(this));
            this.RegistCommand(new AssureNote.SetColorCommand(this));
            this.RegistCommand(new AssureNote.SetScaleCommand(this));
            this.RegistCommand(new AssureNote.HelpCommand(this));
            this.RegistCommand(new AssureNote.SaveSVGCommand(this));
            this.RegistCommand(new AssureNote.UploadCommand(this));

            this.PluginManager.LoadPlugin();
            this.UserName = ($.cookie('UserName') != null) ? $.cookie('UserName') : 'Guest';

            this.TopMenu = new AssureNote.TopMenuTopItem([
                new AssureNote.SubMenuItem("File", "file", [
                    new AssureNote.NewMenuItem(),
                    new AssureNote.OpenMenuItem(),
                    new AssureNote.UploadMenuItem(),
                    new AssureNote.SaveMenuItem(),
                    new AssureNote.SubMenuItem("Save As", "floppy-save", [
                        new AssureNote.SaveAsWGSNMenuItem(),
                        new AssureNote.SaveAsDCaseMenuItem(),
                        new AssureNote.SaveAsSVGMenuItem()
                    ]),
                    new AssureNote.DividerMenuItem(),
                    new AssureNote.HelpMenuItem(),
                    new AssureNote.CommandListMenuItem(),
                    new AssureNote.AboutMenuItem()
                ])
            ]);
            this.TopMenu.Render(this, $("#top-menu").empty()[0], true);
        }
        AssureNoteApp.prototype.RegistCommand = function (Command) {
            this.Commands.push(Command);
            var Names = Command.GetCommandLineNames();
            for (var i = 0; i < Names.length; ++i) {
                this.CommandLineTable[Names[i].toLowerCase()] = Command;
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
            return this.CommandLineTable[Name.toLowerCase()] || this.DefaultCommand;
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
                    $('#about-modal').modal();
                    break;
                case "upload-menu":
                    Command = this.FindCommandByCommandLineName("upload");
                    break;
                case "command-list-menu":
                    Command = this.FindCommandByCommandLineName("help");
                    break;
                case "help-menu":
                    window.open("https://github.com/AssureNote/AssureNote/blob/master/README.md");
                    break;
            }
            if (Command != null) {
                Command.Invoke(Id, Args);
            }
        };

        AssureNoteApp.prototype.ExecCommand = function (ParsedCommand) {
            var CommandName = ParsedCommand.GetMethod();
            if (CommandName == "search") {
                return;
            }

            var Command = this.FindCommandByCommandLineName(CommandName);
            Command.Invoke(CommandName, ParsedCommand.GetArgs());
        };

        AssureNoteApp.prototype.LoadDefaultWGSN = function () {
            var _this = this;
            if (window.location.pathname.match("/file/") != null) {
                AssureNote.AssureNoteUtils.postJsonRPC("download", { fileId: window.location.pathname.replace(/\/.*\//, "") }, function (result) {
                    _this.LoadNewWGSN("hello.wgsn", result.content);
                });
            } else {
                var lang = navigator.browserLanguage || navigator.language || navigator.userLanguage;
                if (!lang || lang == "ja") {
                    this.LoadNewWGSN("hello.wgsn", $("#default-case-ja").text());
                } else {
                    this.LoadNewWGSN("hello.wgsn", $("#default-case-en").text());
                }
            }
        };

        AssureNoteApp.prototype.GetUserName = function () {
            return this.UserName;
        };

        AssureNoteApp.prototype.LoadNewWGSN = function (Name, WGSN) {
            var Extention = Name.split(".").pop();
            this.WGSNName = Name;
            this.MasterRecord = new AssureNote.GSNRecord();
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

            this.PictgramPanel.InitializeView(new AssureNote.NodeView(TopGoalNode, true));
            this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

            this.PictgramPanel.Draw();

            var TopGoal = this.PictgramPanel.MasterView;
            this.PictgramPanel.Viewport.SetCamera(TopGoal.GetCenterGX(), TopGoal.GetCenterGY() + this.PictgramPanel.Viewport.GetPageHeight() / 3, 1);

            $("#filename-view").text(Name);
            $("title").text("AssureNote - " + Name);
        };

        AssureNoteApp.prototype.LoadFiles = function (Files) {
            var _this = this;
            if (Files[0]) {
                var reader = new FileReader();
                reader.onerror = function (event) {
                    console.log('error', event.target.error.code);
                };

                reader.onload = function (event) {
                    var Contents = event.target.result;
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
