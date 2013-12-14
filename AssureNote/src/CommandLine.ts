///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

	export class CommandParser {
		private Method: string;
		private Args: string[];

		constructor() {
		}

		Parse(line: string): void {
			var s = line.split(" ");
			if (s.length > 0) {
				if (s[0][0].match(/\//) != null) {
					this.Method = "search";
					this.Args = [];
					this.Args.push(line.slice(1));
					return;
				} else if (s[0][0].match(/:/) != null) {
					this.Method = s[0].slice(1);
					if (s.length > 1) {
						this.Args = s.slice(1);
					}
				} else if (s[0][0].match(/@/) != null) {
					this.Method = "message";
					this.Args = [];
					this.Args.push(line.slice(1));
				}
			}
		}

		GetMethod(): string {
			AssureNoteApp.Assert(this.Method != null);
			return this.Method;
		}

		GetArgs(): string[]{
			if (this.Args == null) {
				this.Args = [];
			}
			return this.Args;
		}

		GetArg(n: number): string {
			return this.Args[n];
		}

	}

	export class CommandLine {
		Element: JQuery;
		IsVisible: boolean;
		IsEnable: boolean;
		constructor() {
			this.Element = $("#command-line");
			this.IsEnable = true;
			this.IsVisible = false;
		}

		Enable(): void {
			this.IsEnable = true;
		}

		Disable(): void {
			this.IsEnable = false;
			this.Hide();
		}

		Clear(): void {
			this.Element.val("");
		}

		Show(): void {
			this.Element.css("display", "block");
			this.Element.focus();
			this.IsVisible = true;
		}

		Hide(): void {
			this.Element.css("display","none");
			this.IsVisible = false;
		}

		GetValue(): string {
			return this.Element.val();
		}
	}

	export class CommandLineBuiltinFunctions {
		FunctionMap: {[index: string]: (AssureNoteApp: AssureNoteApp, Args: string[]) => void};
		constructor() {
			this.FunctionMap = <{ [index: string]: (AssureNoteApp: AssureNoteApp, Args: string[]) => void }>{};

			this.FunctionMap["new"] = (AssureNoteApp: AssureNoteApp, Args: string[]) => {
				if (Args.length > 0) {
					AssureNoteApp.LoadNewWGSN(Args[0], "* G1");
				} else {
					var Name = prompt("Enter the file name");
					if (Name != null) {
						if (Name == "") {
							Name = "default.wgsn";
						}
						AssureNoteApp.LoadNewWGSN(Name, "* G1");
					}
				}
			};

			this.FunctionMap["w"] = (AssureNoteApp: AssureNoteApp, Args: string[]) => {
				var Writer = new StringWriter();
				AssureNoteApp.MasterRecord.FormatRecord(Writer);
				if (Args.length > 0) {
					AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Args[0]);
				} else {
					AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), AssureNoteApp.WGSNName);
				}
			};

			this.FunctionMap["unfoldAll"] = (AssureNoteApp: AssureNoteApp, Args: string[]) => {
				var TopView = AssureNoteApp.PictgramPanel.MasterView;
				var unfoldAll = (TargetView: NodeView) => {
					TargetView.IsFolded = false;
					TargetView.ForEachVisibleChildren((SubNode: NodeView) => {
						unfoldAll(SubNode);
					});
				};
				unfoldAll(TopView);
				AssureNoteApp.PictgramPanel.Draw();
			};

			this.FunctionMap["set"] = (AssureNoteApp: AssureNoteApp, Args: string[]) => {
				if (Args.length > 0) {
					switch (Args[0]) {
                        case "color":
                            if (Args.length > 2) {
                                if (AssureNoteApp.PictgramPanel.ViewMap == null) {
                                    console.log("'set color' is disabled.");
                                    break;
                                }
                                var Node = AssureNoteApp.PictgramPanel.ViewMap[Args[1]];
                                if (Node != null) {
                                    console.log(Args);
                                    $("#" + Args[1] + " h4").css("background-color", Args[2]);
                                }
                            }
                            break;
                        case "scale":
                            if (Args.length > 1) {
                                console.log(Args);
                                AssureNoteApp.PictgramPanel.ViewPort.SetScale(<number><any>Args[1] - 0);
                            }
                            break;
					}
				}
			}

		}

		GetFunction(Key: string): (AssureNoteApp: AssureNoteApp, Args: string[]) => void {
			//FIXME
			return this.FunctionMap[Key];
		}
	}

}
