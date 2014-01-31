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
///<reference path='UserList.ts'/>
///<reference path='DCaseModelXMLParser.ts'/>

declare function saveAs(data: Blob, filename: String): void;

module AssureNote {
    export class AssureNoteApp {
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

        TopMenu: TopMenuItem;

        private UserName: string;

        constructor() {
            this.Commands = [];
            this.CommandLineTable = {};

            this.PluginManager = new PluginManager(this);
            this.PictgramPanel = new PictgramPanel(this);
            this.SocketManager = new SocketManager(this);
            this.FullScreenEditorPanel = new WGSNEditorPanel(this);
            this.SingleNodeEditorPanel = new SingleNodeEditorPanel(this);
            this.ModeManager = new ModeManager(this, AssureNoteMode.Edit);

            this.DefaultCommand = new CommandMissingCommand(this);
            this.RegistCommand(new SaveCommand(this));
            this.RegistCommand(new SaveSVGCommand(this));
            this.RegistCommand(new SaveWGSNCommand(this));
            this.RegistCommand(new SaveDCaseCommand(this));
            this.RegistCommand(new CommitCommand(this));
            this.RegistCommand(new OpenCommand(this));
            this.RegistCommand(new NewCommand(this));
            this.RegistCommand(new UnfoldAllCommand(this));
            this.RegistCommand(new SetColorCommand(this));
            this.RegistCommand(new SetScaleCommand(this));
            this.RegistCommand(new HelpCommand(this));
            this.RegistCommand(new UploadCommand(this));

            this.PluginManager.LoadPlugin();
            this.UserName = ((<any>$).cookie('UserName') != null) ? (<any>$).cookie('UserName') : 'Guest';
            this.UserList = new UserList(this);

            this.TopMenu = new TopMenuTopItem([
                new SubMenuItem("File", "file", [
                    new NewMenuItem(),
                    new OpenMenuItem(),
                    new UploadMenuItem(),
                    new SaveMenuItem(),
                    new SubMenuItem("Save As", "floppy-save", [
                        new SaveAsWGSNMenuItem(),
                        new SaveAsDCaseMenuItem(),
                        new SaveAsSVGMenuItem()
                    ]),
                    new DividerMenuItem(),
                    new HelpMenuItem(),
                    new AboutMenuItem()
                ])
            ]);
            this.TopMenu.Render(this, $("#top-menu").empty()[0], true);


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
            var Plugin = this.PluginManager.GetDoubleClicked();
            Plugin.OnNodeDoubleClicked(NodeView);
        }

        FindCommandByCommandLineName(Name: string): Command {
            return this.CommandLineTable[Name.toLowerCase()] || this.DefaultCommand;
        }

        ExecCommand(ParsedCommand: CommandParser): void {
            var CommandName = ParsedCommand.GetMethod();
            if (CommandName == "search") {
                return;
            }

            var Command = this.FindCommandByCommandLineName(CommandName);
            Command.Invoke(CommandName, ParsedCommand.GetArgs());
        }

        LoadDefaultWGSN(): void {
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
        }

        GetUserName(): string {
            return this.UserName;
        }

        SetUserName(Name: string): void {
            this.UserName = Name;
        }

        LoadNewWGSN(Name: string, WGSN: string): void {
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
            this.PictgramPanel.FoldDeepSubGoals(this.PictgramPanel.MasterView);
            this.PictgramPanel.Draw();

            if (location.hash != null) {
                var label = location.hash.substring(1);
                var NodeView: AssureNote.NodeView = this.PictgramPanel.ViewMap[label];
                if (NodeView) {
                    var ParentView: AssureNote.NodeView = NodeView.Parent;
                    while (ParentView) {
                        ParentView.IsFolded = false;
                        ParentView = ParentView.Parent;
                    }
                    this.PictgramPanel.Draw();
                    this.PictgramPanel.ChangeFocusedLabel(label);
                    this.PictgramPanel.Viewport.SetCamera(NodeView.GetGX(), NodeView.GetGY(), 1);
                }
            } else {
                var TopGoal = this.PictgramPanel.MasterView;
                this.PictgramPanel.Viewport.SetCamera(TopGoal.GetCenterGX(), TopGoal.GetCenterGY() + this.PictgramPanel.Viewport.GetPageHeight() / 3, 1);
            }
            $("title").text("AssureNote");
        }

        LoadFiles(Files: FileList): void {
            if (Files[0]) {
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
    }

}

