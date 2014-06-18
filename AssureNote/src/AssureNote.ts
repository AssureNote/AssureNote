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

declare function saveAs(data: Blob, filename: String): void;

module AssureNote {

    export class AssureNoteApp {
        static Current: AssureNoteApp;

        PluginManager: PluginManager;
        SocketManager: SocketManager;
        ModeManager: ModeManager;
        PictgramPanel: PictgramPanel;
        FullScreenEditorPanel: WGSNEditorPanel;
        SingleNodeEditorPanel: SingleNodeEditorPanel;
        IsDebugMode: boolean;
        MasterRecord: GSNRecord;
        WGSNName: string;
        Commands: Command[];
        private CommandLineTable: { [index: string]: Command };
        DefaultCommand: AssureNote.CommandMissingCommand;
        UserList: UserList;
        HistoryPanel: HistoryPanel;
        NodeCountPanel: NodeCountPanel;
        NodeListPanel: NodeListPanel;

        TopMenu: TopMenuTopItem;
        TopMenuRight: TopMenuTopItem;

        private IsGuestUser: boolean;
        private UserName: string;
        private LoadingIndicatorVisible = true;
        private LoadingIndicator: HTMLImageElement = <HTMLImageElement>document.getElementById("loading-indicator");

        constructor() {
            AssureNoteApp.Current = this;
            this.Commands = [];
            this.CommandLineTable = {};

            this.PluginManager = new PluginManager(this);
            this.PictgramPanel = new PictgramPanel(this);
            this.SocketManager = new SocketManager(this);
            this.FullScreenEditorPanel = new WGSNEditorPanel(this);
            this.SingleNodeEditorPanel = new SingleNodeEditorPanel(this);
            this.ModeManager = new ModeManager(this, AssureNoteMode.View);
            ShapeFactory.SetFactory(new DefaultShapeFactory());

            this.DefaultCommand = new CommandMissingCommand(this);
            this.RegistCommand(new SaveCommand(this));
            this.RegistCommand(new SaveSVGCommand(this));
            this.RegistCommand(new SaveWGSNCommand(this));
            this.RegistCommand(new SaveDCaseModelCommand(this));
            this.RegistCommand(new SaveDCaseCommand(this));
            this.RegistCommand(new CommitCommand(this));
            this.RegistCommand(new OpenCommand(this));
            this.RegistCommand(new NewCommand(this));
            this.RegistCommand(new UnfoldAllCommand(this));
            this.RegistCommand(new SetColorCommand(this));
            this.RegistCommand(new SetScaleCommand(this));
            this.RegistCommand(new HelpCommand(this));
            this.RegistCommand(new ShareCommand(this));
            this.RegistCommand(new HistoryCommand(this));
            this.RegistCommand(new NodeCountCommand(this));
            this.RegistCommand(new SetGuestUserNameCommand(this));
            this.RegistCommand(new SearchCommand(this));
            this.RegistCommand(new CopyCommand(this));
            this.RegistCommand(new PasteCommand(this));

            this.TopMenu = new TopMenuTopItem([]);
            this.TopMenuRight = new TopMenuTopItem([]);

            this.PluginManager.LoadPlugin();
            var Name = (<any>$).cookie('UserName');
            this.IsGuestUser = (Name == null);
            this.UserName = this.IsGuestUser ? 'Guest' : Name;
            this.UserList = new UserList(this);
            this.NodeListPanel = new NodeListPanel(this);

            this.TopMenu.AppendSubMenu(
                new SubMenuItem(true, "view", "View", "screenshot", [
                    new DummyMenuItem("GSN View (Coming soon)", "unchecked"), 
                    new DummyMenuItem("D-Case View (Coming soon)", "check"), 
                    new DividerMenuItem(true),
                    new SubMenuItem(true, "zoom", "Zoom...", "zoom-in", [
                        new ZoomMenuItem(true, "Zoom", 0.2),
                        new ZoomMenuItem(true, "Zoom", 0.5),
                        new ZoomMenuItem(true, "Zoom", 1),
                        new ZoomMenuItem(true, "Zoom", 1.5),
                        new ZoomMenuItem(true, "Zoom", 2)
                    ]),
                    new DividerMenuItem(true),
                    new ShowHistoryPanelMenuItem(true, "history"),
                    new ShowMonitorListMenuItem(true, "monitorlist"),
                    new SetMonitorMenuItem(true, "setmonitor"),
                    new ShowNodeCountPanelMenuItem(true, "nodecount")
                ]) );
            this.TopMenu.AppendSubMenu(
                new SubMenuItem(true, "edit", "Edit", "pencil", [
                    new DummyMenuItem("Undo (Coming soon)", "step-backward"),
                    new DummyMenuItem("Redo (Coming soon)", "step-forward"),
                    new DividerMenuItem(true),
                    new DummyMenuItem("Copy (Coming soon)", "file"),
                    new DummyMenuItem("Paste (Coming soon)", "file"),
                    new DividerMenuItem(true),
                    new SearchMenuItem(true),
                    new CommitMenuItem(true)
                ]));
            this.TopMenu.AppendSubMenu(
                new SubMenuItem(true, "file", "File", "file", [
                    new NewMenuItem(true),
                    new OpenMenuItem(true),
                    new SaveMenuItem(true),
                    new SubMenuItem(true, "save-as", "Save As", "floppy-save", [
                        new SaveAsWGSNMenuItem(true),
                        new SaveAsDCaseModelMenuItem(true),
                        new SaveAsDCaseMenuItem(true),
                        new SaveAsSVGMenuItem(true)
                    ]),
                    new DividerMenuItem(true),
                    new HelpMenuItem(true),
                    new AboutMenuItem(true)
                ]) );
            this.TopMenuRight.AppendSubMenu(new UploadMenuItem(true));

            this.TopMenu.Render(this, $("#top-menu").empty()[0], true);
            this.TopMenuRight.Render(this, $("#top-menu-right").empty()[0], true);
        }

        public IsLoading(): boolean {
            return this.LoadingIndicatorVisible;
        }

        public SetLoading(IsLoading: boolean): void {
            this.LoadingIndicatorVisible = IsLoading;
            this.LoadingIndicator.style.display = IsLoading ? "" : "none";
        }

        public RegistCommand(Command: Command) {
            this.Commands.push(Command);
            var Names = Command.GetCommandLineNames();
            for (var i = 0; i < Names.length; ++i) {
                this.CommandLineTable[Names[i].toLowerCase()] = Command;
            }
        }

        // Deprecated
        DebugP(Message: string): void {
            console.log(Message);
        }

        static Assert(b: boolean, message?: string): void {
            if (b == false) {
                console.log("Assert: " + message);
                throw "Assert: " + message;
            }
        }

        ExecDoubleClicked(NodeView: NodeView): void {
            this.PluginManager.GetDoubleClicked().forEach((Plugin) => {
                Plugin.OnNodeDoubleClicked(NodeView);
            });
        }

        FindCommandByCommandLineName(Name: string): Command {
            var Command = this.CommandLineTable[Name.toLowerCase()] || this.DefaultCommand;
            if (this.ModeManager.GetMode() == AssureNoteMode.View && !Command.CanUseOnViewOnlyMode()) {
                return this.DefaultCommand;
            }
            return Command;
        }

        ExecCommandByName(Name: string, ...Params: any[]): boolean {
            var Command = this.FindCommandByCommandLineName(Name);
            if (Command) {
                Command.Invoke(Name, Params);
                return true;
            }
            return false;
        }

        ExecCommand(ParsedCommand: CommandParser): void {
            var CommandName = ParsedCommand.GetMethod();
            var Command = this.FindCommandByCommandLineName(CommandName);
            Command.Invoke(CommandName, ParsedCommand.GetArgs());
        }

        LoadDefaultWGSN(): void {
            this.SetLoading(true);
            if(window.location.pathname.match("/file/") != null) {
                AssureNoteUtils.postJsonRPC("download",
                        {fileId: window.location.pathname.replace(/\/.*\//,"")},
                        (result: any) => {
                            this.LoadNewWGSN("hello.wgsn", result.content);
                        },() => {
                            //TODO impl error UI
                            console.log("Assurance Case not found.");
                            alert("Assurance Case not found.");
                        }
                );
            } else {
                var lang: string = navigator.browserLanguage || navigator.language || navigator.userLanguage;
                if (!lang || lang == "ja") {
                    this.LoadNewWGSN("hello.wgsn", $("#default-case-ja").text());
                } else {
                    this.LoadNewWGSN("hello.wgsn", $("#default-case-en").text());
                }
            }
            this.SetLoading(false);
        }

        IsUserGuest(): boolean {
            return this.IsGuestUser;
        }

        GetUserName(): string {
            return this.UserName;
        }

        SetUserName(Name: string): void {
            if (this.IsGuestUser) {
                this.UserName = Name;
            }
        }

        LoadNewWGSN(Name: string, WGSN: string): void {
            this.SetLoading(true);
            var Extention = Name.split(".").pop();
            this.WGSNName = Name;
            this.MasterRecord = new GSNRecord();
            switch (Extention) {
                case "dcase_model":
                    new DCaseModelXMLParser(this.MasterRecord).Parse(WGSN);
                    break;
                case "xmi":
                    new XMIParser(this.MasterRecord).Parse(WGSN);
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
                var NodeView: AssureNote.NodeView = this.PictgramPanel.ViewMap[label];
                if (NodeView) {
                    var ParentView: AssureNote.NodeView = NodeView.Parent;
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
        }

        LoadFiles(Files: FileList): void {
            if (Files.length > 0) {
                var reader = new FileReader();
                reader.onerror = (event: Event) => {
                    console.log('error', (<any>event.target).error.code);
                };

                reader.onload = (event) => {
                    var Contents: string = (<any>event.target).result;
                    var Name: string = Files[0].name;
                    AssureNoteUtils.UpdateHash(null);
                    this.LoadNewWGSN(Name, Contents);

                    /* TODO resolve conflict */
                    this.SocketManager.UpdateWGSN();
                };
                reader.readAsText(Files[0], 'utf-8');
            }
        }
        
        /**
        @method EditDocument
        Edit document and repaint the GSN. If Action returns 'false', changes will be discarded.
        */
        public EditDocument(Role: string, Process: string, Action: Function): void {
            this.MasterRecord.OpenEditor(this.GetUserName(), Role, null, Process);

            var ReturnCode = Action();

            if (ReturnCode === false) {
                this.MasterRecord.DiscardEditor();
            } else {
                var Doc = this.MasterRecord.EditingDoc;
                Doc.RenumberAll();
                this.MasterRecord.CloseEditor();

                var TopNode = Doc.TopNode;
                var NewNodeView: NodeView = new NodeView(TopNode, true);
                var OldViewMap = this.PictgramPanel.ViewMap;
                NewNodeView.SaveFlags(OldViewMap);

                this.PictgramPanel.InitializeView(NewNodeView);
                this.PictgramPanel.Draw(TopNode.GetLabel());
                //TODO: Use eventhandler
                this.SocketManager.UpdateWGSN();

                this.TopMenu.Update();
                this.TopMenuRight.Update();
            }
        }

        public GetNodeFromLabel(Label: string, ReportError?: boolean) {
            var Node = this.PictgramPanel.ViewMap[Label];
            if (Node == null && (ReportError === undefined || ReportError)) {
                AssureNoteUtils.Notify("Node " + Label + " is not found");
            }
            return Node;
        }
    }

}

