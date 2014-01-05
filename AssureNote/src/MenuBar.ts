///<reference path="./AssureNote.ts" />

module AssureNote {

	export class MenuBarButton {
		constructor(public ElementId: string, public ImagePath: string, public Title: string, public EventHandler: (event: Event, NodeView: NodeView) => void) {
        }

        EnableEventHandler(MenuBar: MenuBar) {
            MenuBar.Menu.append('<a href="#" ><img id="' + this.ElementId + '" src="' + this.ImagePath + '" title="' + this.Title + '" alt="' + this.Title + '" /></a>');
            $("#" + this.ElementId).click((event: Event) => {
                this.EventHandler(event, MenuBar.CurrentView);
                MenuBar.Remove();
            });
        }
	}

	export class MenuBar {
		Menu: JQuery;
		CurrentView: NodeView;
		IsEnable: boolean;

		constructor(public AssureNoteApp: AssureNoteApp) {
			this.IsEnable = false;
		}

		private CreateButtons(Contents: MenuBarButton[]): void {
			for (var i = 0; i < Contents.length; i++) {
				var Button = Contents[i];
                Button.EnableEventHandler(this);
			}
		}

		Create(CurrentView: NodeView, ControlLayer: HTMLDivElement, Contents: MenuBarButton[]): void {
			this.IsEnable = true;
			this.CurrentView = CurrentView;
			$('#menu').remove();
			this.Menu = $('<div id="menu" style="display: none;"></div>');
			this.Menu.appendTo(ControlLayer);
			this.CreateButtons(Contents);

			var refresh = () => {
                AssureNoteApp.Assert(this.CurrentView != null);
                var Node = this.CurrentView;
				var Top = Node.GetGY() + Node.Shape.GetNodeHeight() + 5;
				var Left = Node.GetGX() + (Node.Shape.GetNodeWidth() - this.Menu.width()) / 2;
				this.Menu.css({ position: 'absolute', top: Top, left: Left, display: 'block', opacity: 0 });
			};

			(<any>this.Menu).jqDock({
				align: 'bottom',
				idle: 1500,
				size: 45,
				distance: 60,
				labels: 'tc',
				duration: 200,
				fadeIn: 200,
				source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
				onReady: refresh,
			});
		}

		Remove(): void {
			this.Menu.remove();
			this.Menu = null;
			this.CurrentView = null;
			this.IsEnable = false;
		}

	}
}