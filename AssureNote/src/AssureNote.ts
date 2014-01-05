///<reference path='Socket.ts'/>
///<reference path='Command.ts'/>
///<reference path='DCaseModelXMLParser.ts'/>

declare function saveAs(data: Blob, filename: String): void;

module AssureNote {

	export class AssureNoteApp {
        PluginManager: PluginManager;
        SocketManager: SocketManager;
		PictgramPanel: PictgramPanel;
		PluginPanel: PluginPanel;
		IsDebugMode: boolean;
		MasterRecord: GSNRecord;
		WGSNName: string;
        Commands: { [index: string]: Command };
        DefaultCommand: AssureNote.CommandMissingCommand;

		constructor() {
            this.PluginManager = new PluginManager(this);
            this.SocketManager = new SocketManager(this);
			this.PictgramPanel = new PictgramPanel(this);
            this.PluginPanel = new PluginPanel(this);
            this.Commands = {};

            this.DefaultCommand = new CommandMissingCommand(this);
            this.RegistCommand(new SaveCommand(this));
            this.RegistCommand(new OpenCommand(this));
            this.RegistCommand(new NewCommand(this));
            this.RegistCommand(new UnfoldAllCommand(this));
            this.RegistCommand(new SetColorCommand(this));
            this.RegistCommand(new SetScaleCommand(this));
            this.RegistCommand(new HelpCommand(this));
		}

        public RegistCommand(Command: Command) {
            var Names = Command.GetCommandLineNames();
            for (var i = 0; i < Names.length; ++i) {
                this.Commands[Names[i]] = Command;
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
			Plugin.ExecDoubleClicked(NodeView);
        }

        FindCommandByCommandLineName(Name: string): Command {
            return this.Commands[Name] || this.DefaultCommand;
        }

        ExecTopMenu(Id: string): void {
            var Command = null;
            var Args = [];
            switch (Id) {
                case "create-wgsn-menu":
                    Command = this.FindCommandByCommandLineName("new");
                    break;
                case "open-menu":
                    Command = this.FindCommandByCommandLineName("open");
                    break;
                case "save-wgsn-menu":
                    Command = this.FindCommandByCommandLineName("w");
                    break;
                case "save-xmi-menu":
                    Command = this.FindCommandByCommandLineName("w");
                    if (this.WGSNName.match(/\./) == null) {
                        Args = [this.WGSNName + ".dcase_model"];
                    } else {
                        Args = [this.WGSNName.replace(/\..*/, ".dcase_model")];
                    }
                    break;
            }
            if (Command != null) {
                Command.Invoke(Id/*FIXME*/, this.PictgramPanel.MasterView, Args);
            }
        }

		ExecCommand(ParsedCommand: CommandParser): void {
			var CommandName = ParsedCommand.GetMethod();
			if (CommandName == "search") {
				return;
            }

            var Command = this.FindCommandByCommandLineName(CommandName);
            Command.Invoke(CommandName, this.PictgramPanel.GetFocusedView(), ParsedCommand.GetArgs());
		}

        LoadNewWGSN(Name: string, WGSN: string): void {
            var Extention = Name.split(".").pop();
			this.WGSNName = Name;
            this.MasterRecord = new GSNRecord();
            switch (Extention) {
                case "dcase_model":
                    new DCaseModelXMLParser(this.MasterRecord).Parse(WGSN);
                    break;
                default:
                case "wgsn":
                    this.MasterRecord.Parse(WGSN);
                    this.MasterRecord.RenumberAll();
                    break;
            }
			var LatestDoc = this.MasterRecord.GetLatestDoc();
			var TopGoalNode = LatestDoc.TopNode;

			this.PictgramPanel.SetView(new NodeView(TopGoalNode, true));
			this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

			this.PictgramPanel.Draw();

			var Shape = this.PictgramPanel.MasterView.GetShape();
			var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
            var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
            this.PictgramPanel.Viewport.SetScale(1);
            this.PictgramPanel.Viewport.SetOffset(WX, WY);
		}

		LoadFiles(Files: File[]): void {
			if (Files[0]) {
				var reader = new FileReader();
				reader.onerror = (event: Event) => {
					console.log('error', (<any>event.target).error.code);
				};

				reader.onload = (event) => {
					var Contents: string = (<any>event.target).result;
					var Name: string = Files[0].name;
                    this.LoadNewWGSN(Name, Contents);

                    /* TODO resolve conflict */
                    this.SocketManager.UpdateWGSN();
				};
				reader.readAsText(Files[0], 'utf-8');
			}
		}
	}

}

