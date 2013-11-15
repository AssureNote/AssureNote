///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

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