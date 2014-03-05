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
            AssureNoteApp.Current = this;
            this.Commands = [];
            this.CommandLineTable = {};

            this.PluginManager = new AssureNote.PluginManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.SocketManager = new AssureNote.SocketManager(this);
            this.FullScreenEditorPanel = new AssureNote.WGSNEditorPanel(this);
            this.SingleNodeEditorPanel = new AssureNote.SingleNodeEditorPanel(this);
            this.ModeManager = new AssureNote.ModeManager(this, 1 /* View */);
            AssureNote.ShapeFactory.SetFactory(new AssureNote.DefaultShapeFactory());

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
            this.RegistCommand(new AssureNote.ShareCommand(this));
            this.RegistCommand(new AssureNote.HistoryCommand(this));
            this.RegistCommand(new AssureNote.SetGuestUserNameCommand(this));
            this.RegistCommand(new AssureNote.SearchCommand(this));

            this.TopMenu = new AssureNote.TopMenuTopItem([]);
            this.TopMenuRight = new AssureNote.TopMenuTopItem([]);

            this.PluginManager.LoadPlugin();
            var Name = $.cookie('UserName');
            this.IsGuestUser = (Name == null);
            this.UserName = this.IsGuestUser ? 'Guest' : Name;
            this.UserList = new AssureNote.UserList(this);
            this.NodeListPanel = new AssureNote.NodeListPanel(this);

            this.TopMenu.AppendSubMenu(new AssureNote.SubMenuItem(true, "view", "View", "screenshot", [
                new AssureNote.DummyMenuItem("GSN View (Coming soon)", "unchecked"),
                new AssureNote.DummyMenuItem("D-Case View (Coming soon)", "check"),
                new AssureNote.DividerMenuItem(true),
                new AssureNote.SubMenuItem(true, "zoom", "Zoom...", "zoom-in", [
                    new AssureNote.ZoomMenuItem(true, "Zoom", 0.2),
                    new AssureNote.ZoomMenuItem(true, "Zoom", 0.5),
                    new AssureNote.ZoomMenuItem(true, "Zoom", 1),
                    new AssureNote.ZoomMenuItem(true, "Zoom", 1.5),
                    new AssureNote.ZoomMenuItem(true, "Zoom", 2)
                ]),
                new AssureNote.DividerMenuItem(true),
                new AssureNote.ShowHistoryPanelMenuItem(true, "history"),
                new AssureNote.ShowMonitorListMenuItem(true, "monitorlist"),
                new AssureNote.SetMonitorMenuItem(true, "setmonitor")
            ]));
            this.TopMenu.AppendSubMenu(new AssureNote.SubMenuItem(true, "edit", "Edit", "pencil", [
                new AssureNote.DummyMenuItem("Undo (Coming soon)", "step-backward"),
                new AssureNote.DummyMenuItem("Redo (Coming soon)", "step-forward"),
                new AssureNote.DividerMenuItem(true),
                new AssureNote.DummyMenuItem("Copy (Coming soon)", "file"),
                new AssureNote.DividerMenuItem(true),
                new AssureNote.SearchMenuItem(true),
                new AssureNote.CommitMenuItem(true)
            ]));
            this.TopMenu.AppendSubMenu(new AssureNote.SubMenuItem(true, "file", "File", "file", [
                new AssureNote.NewMenuItem(true),
                new AssureNote.OpenMenuItem(true),
                new AssureNote.SaveMenuItem(true),
                new AssureNote.SubMenuItem(true, "save-as", "Save As", "floppy-save", [
                    new AssureNote.SaveAsWGSNMenuItem(true),
                    new AssureNote.SaveAsDCaseMenuItem(true),
                    new AssureNote.SaveAsSVGMenuItem(true)
                ]),
                new AssureNote.DividerMenuItem(true),
                new AssureNote.HelpMenuItem(true),
                new AssureNote.AboutMenuItem(true)
            ]));
            this.TopMenuRight.AppendSubMenu(new AssureNote.UploadMenuItem(true));

            this.TopMenu.Render(this, $("#top-menu").empty()[0], true);
            this.TopMenuRight.Render(this, $("#top-menu-right").empty()[0], true);
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
            this.PluginManager.GetDoubleClicked().forEach(function (Plugin) {
                Plugin.OnNodeDoubleClicked(NodeView);
            });
        };

        AssureNoteApp.prototype.FindCommandByCommandLineName = function (Name) {
            var Command = this.CommandLineTable[Name.toLowerCase()] || this.DefaultCommand;
            if (this.ModeManager.GetMode() == 1 /* View */ && !Command.CanUseOnViewOnlyMode()) {
                return this.DefaultCommand;
            }
            return Command;
        };

        AssureNoteApp.prototype.ExecCommandByName = function (Name) {
            var Params = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                Params[_i] = arguments[_i + 1];
            }
            var Command = this.FindCommandByCommandLineName(Name);
            if (Command) {
                Command.Invoke(Name, Params);
                return true;
            }
            return false;
        };

        AssureNoteApp.prototype.ExecCommand = function (ParsedCommand) {
            var CommandName = ParsedCommand.GetMethod();
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

        AssureNoteApp.prototype.IsUserGuest = function () {
            return this.IsGuestUser;
        };

        AssureNoteApp.prototype.GetUserName = function () {
            return this.UserName;
        };

        AssureNoteApp.prototype.SetUserName = function (Name) {
            if (this.IsGuestUser) {
                this.UserName = Name;
            }
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
            this.PictgramPanel.FoldDeepSubGoals(this.PictgramPanel.TopNodeView);
            this.PictgramPanel.Draw();
            this.TopMenu.Update();
            this.TopMenuRight.Update();

            if (location.hash != "") {
                var label = location.hash.substring(1);
                var NodeView = this.PictgramPanel.ViewMap[label];
                if (NodeView) {
                    var ParentView = NodeView.Parent;
                    while (ParentView) {
                        ParentView.SetIsFolded(false);
                        ParentView = ParentView.Parent;
                    }
                    this.PictgramPanel.Draw();
                    this.PictgramPanel.ChangeFocusedLabel(label);
                    console.log(NodeView.GetCenterGX());
                    this.PictgramPanel.Viewport.SetCamera(NodeView.GetCenterGX(), NodeView.GetCenterGY(), 1);
                }
            } else {
                var TopGoal = this.PictgramPanel.TopNodeView;
                this.PictgramPanel.Viewport.SetCamera(TopGoal.GetCenterGX(), TopGoal.GetCenterGY() + this.PictgramPanel.Viewport.GetPageHeight() / 3, 1);
            }
            $("title").text("AssureNote");
            this.SetLoading(false);
        };

        AssureNoteApp.prototype.LoadFiles = function (Files) {
            var _this = this;
            if (Files.length > 0) {
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

        /**
        @method EditDocument
        Edit document and repaint the GSN. If Action returns 'false', changes will be discarded.
        */
        AssureNoteApp.prototype.EditDocument = function (Role, Process, Action) {
            this.MasterRecord.OpenEditor(this.GetUserName(), Role, null, Process);

            var ReturnCode = Action();

            if (ReturnCode === false) {
                this.MasterRecord.DiscardEditor();
            } else {
                var Doc = this.MasterRecord.EditingDoc;
                Doc.RenumberAll();
                this.MasterRecord.CloseEditor();

                var TopNode = Doc.TopNode;
                var NewNodeView = new AssureNote.NodeView(TopNode, true);
                var OldViewMap = this.PictgramPanel.ViewMap;
                NewNodeView.SaveFlags(OldViewMap);

                this.PictgramPanel.InitializeView(NewNodeView);
                this.PictgramPanel.Draw(TopNode.GetLabel());

                //TODO: Use eventhandler
                this.SocketManager.UpdateWGSN();
            }
        };

        AssureNoteApp.prototype.GetNodeFromLabel = function (Label, ReportError) {
            var Node = this.PictgramPanel.ViewMap[Label];
            if (Node == null && (ReportError === undefined || ReportError)) {
                AssureNote.AssureNoteUtils.Notify("Node " + Label + " is not found");
            }
            return Node;
        };
        return AssureNoteApp;
    })();
    AssureNote.AssureNoteApp = AssureNoteApp;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNote.js.map
