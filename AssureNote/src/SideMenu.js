/// <reference path="../d.ts/jquery_plugins.d.ts" />
var AssureNote;
(function (AssureNote) {
    var SideMenuContent = (function () {
        function SideMenuContent(href, value, id, icon, callback) {
            this.href = href;
            this.value = value;
            this.id = id;
            this.icon = icon;
            this.callback = callback;
        }
        return SideMenuContent;
    })();
    AssureNote.SideMenuContent = SideMenuContent;

    var SideMenu = (function () {
        function SideMenu() {
        }
        SideMenu.Create = function (models) {
            $("#menu-template").tmpl(models).appendTo("#drop-menu");
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                $("#" + model.id).click(model.callback);
            }
        };
        return SideMenu;
    })();
    AssureNote.SideMenu = SideMenu;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=SideMenu.js.map
