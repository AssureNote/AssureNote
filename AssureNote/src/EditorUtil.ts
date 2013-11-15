declare class CodeMirror {
	constructor(selector: any, option: any);
	static fromTextArea(selector: any, option: any): any;
};

class ErrorHighlight {
	marker: any[];
	interval: number;

	constructor(public editor: any) {
		this.marker = [];
	}

	Blink(line: number) {
		var cycle = 1000 / 15;
		var cycles = 8;
		var count = 0;
		var blink = ()=>{
			count = count + 1;
			if(count < cycles){
				if (count % 2 == 0) {
					this._ClearHighlight();
				} else {
					this.marker.push(this.editor.markText({line: line-1, ch: 0},{line: line, ch: 0}, {className: "CodeMirror-error"}));
				}
				//this.editor.refresh();
				this.interval = setTimeout(blink, cycle);
			}
		}
		blink();
	}

	private _ClearHighlight(): void {
		for (var i in this.marker) {
			this.marker[i].clear();
		}
		this.marker = [];
	}

	ClearHighlight(): void {
		clearInterval(this.interval);
		this._ClearHighlight();
	}

	Highlight(line: number, message: string) : void {
		this.Blink(line);
		this.editor.scrollIntoView({line: line, ch: 0});
		this.editor.setCursor({line: line});
	}
}
