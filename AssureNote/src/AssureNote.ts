///<reference path='SideMenu.ts'/>
///<reference path='Socket.ts'/>
///<reference path='Command.ts'/>

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
            this.RegistCommand(new NewCommand(this));
            this.RegistCommand(new UnfoldAllCommand(this));
            this.RegistCommand(new SetColorCommand(this));
            this.RegistCommand(new SetScaleCommand(this));
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

		ExecCommand(ParsedCommand: CommandParser): void {
			var CommandName = ParsedCommand.GetMethod();
			if (CommandName == "search") {
				return;
            }

            var Command = this.FindCommandByCommandLineName(CommandName);
            Command.Invoke(this.PictgramPanel.GetFocusedView(), ParsedCommand.GetArgs());

			//var BuiltinCommand = this.Commands.GetFunction(MethodName);
			//if (BuiltinCommand != null) {
			//	BuiltinCommand(this, ParsedCommand.GetArgs());
			//	return;
			//}
			//var Plugin = this.PluginManager.GetCommandPlugin(MethodName);
			//if (Plugin != null) {
			//	Plugin.ExecCommand(this, ParsedCommand.GetArgs());
			//} else {
            //    //TODO split jump-node function
			//	var Label = MethodName.toUpperCase();
			//	if (this.PictgramPanel.ViewMap == null) {
			//		this.DebugP("Jump is diabled.");
			//		return;
			//	}
            //    var Node = this.PictgramPanel.ViewMap[Label];
            //    if (MethodName == "" && Node == null) {
            //        Label = this.PictgramPanel.FocusedLabel;
            //        Node = this.PictgramPanel.ViewMap[Label];
            //    }
            //    if (Node != null) {
            //        if ($("#" + Label.replace(/\./g,"\\.")).length > 0) { //FIXME use IsVisible
            //            this.PictgramPanel.Viewport.SetCaseCenter(Node.GetCenterGX(), Node.GetCenterGY());
            //        } else {
            //            this.DebugP("Invisible node " + Label + " Selected.");
            //        }
            //        return;
            //    }
			//	this.DebugP("undefined command: " + MethodName);
			//}
		}

		LoadNewWGSN(Name: string, WGSN: string): void {
			this.WGSNName = Name;
			this.MasterRecord = new GSNRecord();
			this.MasterRecord.Parse(WGSN);

			var LatestDoc = this.MasterRecord.GetLatestDoc();
			var TopGoalNode = LatestDoc.TopGoal;

			this.PictgramPanel.SetView(new NodeView(TopGoalNode, true));
			this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

			this.PictgramPanel.Draw();

			var Shape = this.PictgramPanel.MasterView.GetShape();
			var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
            var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
            this.PictgramPanel.Viewport.SetScale(1);
            this.PictgramPanel.Viewport.SetOffset(WX, WY);
		}

		ProcessDroppedFiles(Files: File[]): void {
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

