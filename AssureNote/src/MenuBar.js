///<reference path="./AssureNote.ts" />
var AssureNote;
(function (AssureNote) {
    var MenuBarButton = (function () {
        function MenuBarButton(ElementId, ImagePath, Title, EventHandler) {
            this.ElementId = ElementId;
            this.ImagePath = ImagePath;
            this.Title = Title;
            this.EventHandler = EventHandler;
        }
        MenuBarButton.prototype.EnableEventHandler = function (MenuBar) {
            var _this = this;
            MenuBar.Menu.append('<a href="#" ><img id="' + this.ElementId + '" src="' + this.ImagePath + '" title="' + this.Title + '" alt="' + this.Title + '" /></a>');
            $("#" + this.ElementId).click(function (event) {
                _this.EventHandler(event, MenuBar.CurrentView);
                MenuBar.Remove();
            });
        };
        return MenuBarButton;
    })();
    AssureNote.MenuBarButton = MenuBarButton;

    var MenuBar = (function () {
        function MenuBar(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.IsEnable = false;
        }
        MenuBar.prototype.CreateButtons = function (Contents) {
            for (var i = 0; i < Contents.length; i++) {
                var Button = Contents[i];
                Button.EnableEventHandler(this);
            }
        };

        MenuBar.prototype.Create = function (CurrentView, ControlLayer, Contents) {
            var _this = this;
            this.IsEnable = true;
            this.CurrentView = CurrentView;
            $('#menu').remove();
            this.Menu = $('<div id="menu" style="display: none;"></div>');
            this.Menu.appendTo(ControlLayer);
            this.CreateButtons(Contents);

            var refresh = function () {
                AssureNote.AssureNoteApp.Assert(_this.CurrentView != null);
                var Node = _this.CurrentView;
                var Top = Node.GetGY() + Node.Shape.GetNodeHeight() + 5;
                var Left = Node.GetGX() + (Node.Shape.GetNodeWidth() - _this.Menu.width()) / 2;
                _this.Menu.css({ position: 'absolute', top: Top, left: Left, display: 'block', opacity: 0 });
            };

            (this.Menu).jqDock({
                align: 'bottom',
                idle: 1500,
                size: 45,
                distance: 60,
                labels: 'tc',
                duration: 200,
                fadeIn: 200,
                source: function () {
                    return this.src.replace(/(jpg|gif)$/, 'png');
                },
                onReady: refresh
            });
        };

        MenuBar.prototype.Remove = function () {
            this.Menu.remove();
            this.Menu = null;
            this.CurrentView = null;
            this.IsEnable = false;
        };
        return MenuBar;
    })();
    AssureNote.MenuBar = MenuBar;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=MenuBar.js.map
