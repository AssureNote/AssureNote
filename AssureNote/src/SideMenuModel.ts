module AssureNote {

	export class SideMenuModel {
		constructor(public href: string, public value:string, public id: string, public icon: string, public callback: (ev: Event)=> void) {
		}

	}

	export class SideMenu {
		constructor() {
		}

		static Create(models: SideMenuModel[]) {
			for(var i: number = 0; i < models.length; i++) {
				var model:SideMenuModel = models[i];
				$("#drop-menu").prepend($('<li id="'+model.id+'"><a href="'+model.href+'"><span class="glyphicon '+model.icon+'"></span>&nbsp; '+model.value+'</a></li>'));
				$("#"+model.id).click(model.callback);
			}
		}
	}
}
