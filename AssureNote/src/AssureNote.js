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
///<reference path='PictgramPanel.ts'/>
///<reference path='Socket.ts'/>
///<reference path='Command.ts'/>
///<reference path='TopMenu.ts'/>
///<reference path='UserList.ts'/>
///<reference path='DCaseModelXMLParser.ts'/>
///<reference path='HistoryView.ts'/>
///<reference path='../d.ts/config.d.ts'/>

var AssureNote;
(function (AssureNote) {
    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            this.LoadingIndicatorVisible = true;
            this.LoadingIndicator = document.getElementById("loading-indicator");
            this.Commands = [];
            this.CommandLineTable = {};

            this.PluginManager = new AssureNote.PluginManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.SocketManager = new AssureNote.SocketManager(this);
            this.FullScreenEditorPanel = new AssureNote.WGSNEditorPanel(this);
            this.SingleNodeEditorPanel = new AssureNote.SingleNodeEditorPanel(this);
            this.ModeManager = new AssureNote.ModeManager(this, 0 /* Edit */);

            this.DefaultCommand = new AssureNote.CommandMissingCommand(this);
            this.RegistCommand(new AssureNote.SaveCommand(this));
            this.RegistCommand(new AssureNote.SaveSVGCommand(this));
            this.RegistCommand(new AssureNote.SaveWGSNCommand(this));
            this.RegistCommand(new AssureNote.SaveDCaseCommand(this));
            this.RegistCommand(new AssureNote.CommitCommand(this));
            this.RegistCommand(new AssureNote.OpenCommand(this));
            this.RegistCommand(new AssureNote.NewCommand(this));
            this.RegistCommand(new AssureNote.UnfoldAllCommand(this));
            this.RegistCommand(new AssureNote.SetColorCommand(this));
            this.RegistCommand(new AssureNote.SetScaleCommand(this));
            this.RegistCommand(new AssureNote.HelpCommand(this));
            this.RegistCommand(new AssureNote.UploadCommand(this));
            this.RegistCommand(new AssureNote.HistoryCommand(this));

            this.TopMenu = new AssureNote.TopMenuTopItem([]);

            this.PluginManager.LoadPlugin();
            this.UserName = ($.cookie('UserName') != null) ? $.cookie('UserName') : 'Guest';
            this.UserList = new AssureNote.UserList(this);

            this.TopMenu.AppendSubMenu(new AssureNote.SubMenuItem("File", "file", [
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
                new AssureNote.AboutMenuItem()
            ]));
            this.TopMenu.Render(this, $("#top-menu").empty()[0], true);
        }
        AssureNoteApp.prototype.IsLoading = function () {
            return this.LoadingIndicatorVisible;
        };

        AssureNoteApp.prototype.SetLoading = function (IsLoading) {
            this.LoadingIndicatorVisible = IsLoading;
            this.LoadingIndicator.style.display = IsLoading ? "" : "none";
        };

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
            Plugin.OnNodeDoubleClicked(NodeView);
        };

        AssureNoteApp.prototype.FindCommandByCommandLineName = function (Name) {
            var Command = this.CommandLineTable[Name.toLowerCase()] || this.DefaultCommand;
            if (this.ModeManager.GetMode() == 1 /* View */ && !Command.CanUseOnViewOnlyMode()) {
                return this.DefaultCommand;
            }
            return Command;
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
            this.SetLoading(true);
            if (window.location.pathname.match("/file/") != null) {
                AssureNote.AssureNoteUtils.postJsonRPC("download", { fileId: window.location.pathname.replace(/\/.*\//, "") }, function (result) {
                    _this.LoadNewWGSN("hello.wgsn", result.content);
                }, function () {
                    //TODO impl error UI
                    console.log("Assurance Case not found.");
                    alert("Assurance Case not found.");
                });
            } else {
                var lang = navigator.browserLanguage || navigator.language || navigator.userLanguage;
                if (!lang || lang == "ja") {
                    this.LoadNewWGSN("hello.wgsn", $("#default-case-ja").text());
                } else {
                    this.LoadNewWGSN("hello.wgsn", $("#default-case-en").text());
                }
            }
            this.SetLoading(false);
        };

        AssureNoteApp.prototype.GetUserName = function () {
            return this.UserName;
        };

        AssureNoteApp.prototype.SetUserName = function (Name) {
            this.UserName = Name;
        };

        AssureNoteApp.prototype.LoadNewWGSN = function (Name, WGSN) {
            this.SetLoading(true);
            var Extention = Name.split(".").pop();
            this.WGSNName = Name;
            this.MasterRecord = new AssureNote.GSNRecord();
            switch (Extention) {
                case "dcase_model":
                    new AssureNote.DCaseModelXMLParser(this.MasterRecord).Parse(WGSN);
                    break;
                case "xmi":
                    new AssureNote.XMIParser(this.MasterRecord).Parse(WGSN);
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
            this.PictgramPanel.FoldDeepSubGoals(this.PictgramPanel.MasterView);
            this.PictgramPanel.Draw();

            if (location.hash != "") {
                var label = location.hash.substring(1);
                var NodeView = this.PictgramPanel.ViewMap[label];
                if (NodeView) {
                    var ParentView = NodeView.Parent;
                    while (ParentView) {
                        ParentView.IsFolded = false;
                        ParentView = ParentView.Parent;
                    }
                    this.PictgramPanel.Draw();
                    this.PictgramPanel.ChangeFocusedLabel(label);
                    console.log(NodeView.GetGX());
                    this.PictgramPanel.Viewport.SetCamera(NodeView.GetCenterGX(), NodeView.GetCenterGY(), 1);
                }
            } else {
                var TopGoal = this.PictgramPanel.MasterView;
                console.log("else " + TopGoal.GetGX());
                this.PictgramPanel.Viewport.SetCamera(TopGoal.GetCenterGX(), TopGoal.GetCenterGY() + this.PictgramPanel.Viewport.GetPageHeight() / 3, 1);
            }
            $("title").text("AssureNote");
            this.SetLoading(false);
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
                    AssureNote.AssureNoteUtils.UpdateHash(null);
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
