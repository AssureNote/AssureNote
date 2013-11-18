///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

	export class CommandParser {
		private Method: string;
		private Args: string[] = [];

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
			return this.Args;
		}

		GetArg(n: number): string {
			return this.Args[n];
		}

	}

	export class CommandLine {
		Element: JQuery = $("#command-line");
		constructor() {
		}

		IsEnable(): boolean {
			return this.Element.css("display") == "block";
		}

		Clear(): void {
			this.Element.val("");
		}

		Show(): void {
			this.Element.css("display", "block");
			this.Element.focus();
		}

		Hide(): void {
			this.Element.css("display","none");
		}

		GetValue(): string {
			return this.Element.val();
		}
	}

}