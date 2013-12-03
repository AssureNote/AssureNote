///<reference path="./AssureNote.ts" />
var AssureNote;
(function (AssureNote) {
    var MenuBar = (function () {
        function MenuBar(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.IsEnable = false;
        }
        MenuBar.prototype.Create = function (CurrentView, ControlLayer) {
            var _this = this;
            this.IsEnable = true;
            this.CurrentView = CurrentView;
            $('#menu').remove();
            this.Menu = $('<div id="menu" style="display: none;"></div>');

            this.Menu.append('<a href="#" ><img id="remove" src="images/remove.png" title="Remove" alt="remove" /></a>');
            this.Menu.appendTo($(ControlLayer));

            var refresh = function () {
                AssureNote.AssureNoteApp.Assert(_this.CurrentView != null);
                var NodeRect = _this.CurrentView.Shape.Content.getBoundingClientRect();
                var Scale = _this.AssureNoteApp.PictgramPanel.ViewPort.GetScale();
                var Top = NodeRect.top / Scale + NodeRect.height + 5;
                var Left = NodeRect.left / Scale + (NodeRect.width - _this.Menu.width()) / 2;
                _this.Menu.css({ position: 'absolute', top: Top, left: Left, display: 'block', opacity: 0 });
            };

            (this.Menu).jqDock({
                align: 'bottom',
                fadeIn: 200,
                idle: 1500,
                size: 45,
                distance: 60,
                labels: 'tc',
                duration: 500,
                fadeIn: 1000,
                source: function () {
                    return this.src.replace(/(jpg|gif)$/, 'png');
                },
                onReady: refresh
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
            /*
            var self = this;
            
            $('.node').unbind('mouseenter').unbind('mouseleave'); // FIXME: this line may cause other plugin's event handler.
            var appendMenu = function () {
            var node = $(this);
            if (caseViewer.Screen.GetScale() < 1) return;
            
            var label: string = node.children('h4').text();
            //console.log(label);
            var model: AssureIt.NodeModel = case0.ElementMap[label];
            var menuBar: MenuBar = new MenuBar(caseViewer, model, case0, node, serverApi, self);
            menuBar.menu.appendTo($('#layer2'));
            refresh();
            menuBar.menu.hover(function () {
            clearTimeout(self.timeoutId);
            }, function () {
            $(menuBar.menu).remove();
            });
            self.plugInManager.UseUILayer(self);
            menuBar.SetEventHandlers();
            
            self.plugInManager.InvokePlugInMenuBarContents(caseViewer, model, menuBar.menu, serverApi);
            
            (<any>menuBar.menu).jqDock({
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
            menuBar.menu.click(refresh);
            }
            var removeMenu = function () {
            self.timeoutId = setTimeout(function () {
            }, 10);
            };
            $('.node').hover(appendMenu, removeMenu);
            $('.node').bind({ 'touchstart': removeMenu, 'touchend': appendMenu });
            */
        };

        MenuBar.prototype.AddNode = function (Type) {
        };

        MenuBar.prototype.Remove = function () {
            this.Menu.remove();
            this.Menu = null;
            this.CurrentView = null;
            this.IsEnable = false;
        };

        MenuBar.prototype.Center = function () {
        };
        return MenuBar;
    })();
    AssureNote.MenuBar = MenuBar;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=MenuBar.js.map
