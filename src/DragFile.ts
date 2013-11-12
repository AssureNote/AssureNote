///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {
	export class DCaseFile {
		constructor(public result: string, public name: string) { }
	}

	export class DragFile {

		constructor(public element: JQuery) {
			this.element.on('dragenter', (e) => {
				e.stopPropagation();
				e.preventDefault();
			}).on('dragover', (e) => {
					e.stopPropagation();
					e.preventDefault();
				}).on('dragleave', (e) => {
					e.stopPropagation();
					e.preventDefault();
				});
		}

		read(callback: (DCaseFile, target: any) => void): void {
			this.element.on('drop', (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
				$(ev.currentTarget).removeClass('hover');
				var file: File = (<any>ev.originalEvent.dataTransfer).files[0];
				if (file) {
					var reader = new FileReader();
					reader.onerror = (e) => {
						console.log('error', (<any>e.target).error.code);
					};
					reader.onload = (e) => {
						var dcaseFile = new DCaseFile((<any>e.target).result, file.name);
						callback(dcaseFile, ev.currentTarget);
					};
					reader.readAsText(file, 'utf-8');
				}
				return false;
			});
		}
	}
}