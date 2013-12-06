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
			this.Menu.appendTo($(ControlLayer));
			this.CreateButtons(Contents);

			var refresh = () => {
				AssureNoteApp.Assert(this.CurrentView != null);
				var NodeRect = this.CurrentView.Shape.Content.getBoundingClientRect();
				var Scale = this.AssureNoteApp.PictgramPanel.ViewPort.GetScale();
				var Top = NodeRect.top / Scale + NodeRect.height + 5;
				var Left = NodeRect.left / Scale + (NodeRect.width - this.Menu.width()) / 2;
				this.Menu.css({ position: 'absolute', top: Top, left: Left, display: 'block', opacity: 0 });
			};

			(<any>this.Menu).jqDock({
				align: 'bottom',
				fadeIn: 200,
				idle: 1500,
				size: 45,
				distance: 60,
				labels: 'tc',
				duration: 500,
				fadeIn: 1000,
				source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
				onReady: refresh,
			});

				//switch (thisNodeType) {
				//	case AssureIt.NodeType.Goal:
				//		if (!hasContext) {
				//			this.menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
				//		}
				//		this.menu.append('<a href="#" ><img id="strategy" src="' + this.serverApi.basepath + 'images/strategy.png" title="Strategy" alt="strategy" /></a>');
				//		this.menu.append('<a href="#" ><img id="evidence" src="' + this.serverApi.basepath + 'images/evidence.png" title="Evidence" alt="evidence" /></a>');
				//		break;
				//	case AssureIt.NodeType.Strategy:
				//		this.menu.append('<a href="#" ><img id="goal"     src="' + this.serverApi.basepath + 'images/goal.png" title="Goal" alt="goal" /></a>');
				//		if (!hasContext) {
				//			this.menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
				//		}
				//		break;
				//	case AssureIt.NodeType.Evidence:
				//		if (!hasContext) {
				//			this.menu.append('<a href="#" ><img id="context"  src="' + this.serverApi.basepath + 'images/context.png" title="Context" alt="context" /></a>');
				//		}
				//		break;
				//	default:
				//		break;
				//}
		}

		Remove(): void {
			this.Menu.remove();
			this.Menu = null;
			this.CurrentView = null;
			this.IsEnable = false;
		}

	}
}