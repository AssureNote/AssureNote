/// <reference path="../d.ts/jquery_plugins.d.ts" />

module AssureNote {

	export class SideMenuContent {
		constructor(public href: string, public value:string, public id: string, public icon: string, public callback: (ev: Event)=> void) {
		}

	}

	export class SideMenu {
		constructor() {
		}

		static Create(models: SideMenuContent[]) {
			$("#menu-template").tmpl(models).appendTo("#drop-menu");
			for(var i: number = 0; i < models.length; i++) {
				var model = models[i];
				$("#"+model.id).click(model.callback);
			}
		}
	}
}
