///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

	export class CommandParser {
		private Method: string;
		private Args: string[];

		constructor(line: string) {
			var s = line.split(" ");
			this.Method = s[0].slice(1);
			if (s.length > 1) {
				this.Args = s.slice(1);
			}
		}

		GetMethod(): string {
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

}