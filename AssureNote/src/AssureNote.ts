///<reference path='PluginManager.ts'/>

module AssureNote {

	export module AssureNoteUtils {

		export function GetNodeLabel(event: Event): string {
			var element = <HTMLElement>event.srcElement;
			while (element != null) {
				if (element.id != "") {
					return element.id;
				}
				element = element.parentElement;
			}
			return "";
		}

	}

	export class AssureNoteApp {
		PluginManager: PluginManager;
		OldPluginManager: OldPlugInManager; //Deprecated
		PictgramPanel: PictgramPanel;
		PluginPanel: PluginPanel;
		IsDebugMode: boolean;
		FixMeModel: FixMeModel;
		Case: Case;

		constructor() {
			//var Api = new AssureNote.ServerAPI("http://", "", "");
			this.OldPluginManager = new OldPlugInManager("");
			this.PluginManager = new PluginManager(this);
			this.PictgramPanel = new PictgramPanel(this);
			this.PluginPanel = new PluginPanel(this);
		}

		DebugP(Message: string): void {
			console.log(Message);
		}

		ExecCommand(CommandLine: string): void {
			var Plugin = this.PluginManager.GetCommandPlugin(CommandLine);
			if (Plugin != null) {
				Plugin.ExecCommand(this, CommandLine);
			}
			else {
				this.DebugP("undefined command: " + CommandLine);
				alert("undefined command: " + CommandLine);
			}
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
					// ---Deprecated--
					var Case0: Case = new Case(Name, "{}", Contents, 0, 0, new OldPlugInManager(""));
					
					var casedecoder = new CaseDecoder();
					var root: NodeModel = casedecoder.ParseASN(Case0, Contents, null);
					Case0.SetElementTop(root);
					this.Case = Case0;
					//---
					this.PictgramPanel.Draw(root.Label, 0, 0);
					//GSNRecord MasterRecord = new GSNRecord();
					//MasterRecord.Parse(ReadFile(MasterFile));	
				};
				reader.readAsText(Files[0], 'utf-8');
			}
		}
	}

}

