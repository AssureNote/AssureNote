var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var TopMenuItem = (function () {
        function TopMenuItem(IsEnabled, ButtonId) {
            this.IsEnabled = IsEnabled;
            this.ButtonId = null;
            this.ElementId = null;
            if (ButtonId) {
                this.ButtonId = ButtonId;
                this.ElementId = ButtonId + "-menu-button";
            }
        }
        TopMenuItem.prototype.GetIconName = function () {
            return "";
        };
        TopMenuItem.prototype.GetDisplayName = function () {
            return "";
        };

        TopMenuItem.prototype.Enable = function () {
            this.IsEnabled = true;
            if (this.ElementId) {
                var button = $('#' + this.ElementId);
                var classes = button.attr('class').split(" ");
                var index = classes.indexOf('disabled');
                if (index > 0) {
                    classes.splice(index, 1);
                }
                button.attr('class', classes.join(" "));
            }
        };

        TopMenuItem.prototype.Disable = function () {
            this.IsEnabled = false;
            if (this.ElementId) {
                var button = $('#' + this.ElementId);
                var classes = button.attr('class').split(" ");
                var index = classes.indexOf('disabled');
                if (index > 0) {
                    return;
                }
                classes.push('disabled');
                button.attr('class', classes.join(" "));
            }
        };

        TopMenuItem.CreateIconElement = function (Name) {
            var span = document.createElement("span");
            span.className = "glyphicon glyphicon-" + Name;
            return span;
        };
        TopMenuItem.CreateID = function () {
            return "topmenu-" + AssureNote.AssureNoteUtils.GenerateRandomString();
        };
        TopMenuItem.prototype.Render = function (App, Target, IsTopLevel) {
            var _this = this;
            var item;
            var icon = TopMenuItem.CreateIconElement(this.GetIconName());
            var spaceChar = "\u00a0";
            var text = document.createTextNode(spaceChar + this.GetDisplayName());
            if (IsTopLevel) {
                /*
                <button id="file-menu-button" type="button" data-toggle="dropdown" oncontextmenu="return false" class="btn navbar-btn btn-default dropdown-toggle">
                <span class="glyphicon glyphicon-file">
                </span>&nbsp;File&nbsp;
                <span class="caret">
                </span>
                </button>
                */
                item = document.createElement("button");
                item.type = "button";
                if (this.ElementId) {
                    item.setAttribute("id", this.ElementId);
                }
                item.setAttribute("oncontextmenu", "return false");
                var classes = "btn navbar-btn btn-default clickable navbar-left";
                if (!this.IsEnabled) {
                    classes += " disabled";
                }
                item.className = classes;
                item.appendChild(icon);
                item.appendChild(text);
            } else {
                /*
                <li>
                <a id="create-wgsn-menu" href="#">
                <span class="glyphicon glyphicon-plus"></span>&nbsp;
                New...
                </a>
                </li>
                */
                item = document.createElement("li");
                var a = document.createElement("a");
                a.href = "#";
                a.appendChild(icon);
                a.appendChild(text);
                item.appendChild(a);
            }
            item.addEventListener("click", function (event) {
                _this.Invoke(App);
            });
            Target.appendChild(item);
        };

        TopMenuItem.prototype.Invoke = function (App) {
        };
        return TopMenuItem;
    })();
    AssureNote.TopMenuItem = TopMenuItem;

    var SubMenuItem = (function (_super) {
        __extends(SubMenuItem, _super);
        function SubMenuItem(IsEnabled, ButtonId, DisplayName, IconName, SubMenuList) {
            _super.call(this, IsEnabled, ButtonId);
            this.DisplayName = DisplayName;
            this.IconName = IconName;
            this.SubMenuList = SubMenuList;
        }
        SubMenuItem.prototype.GetIconName = function () {
            return this.IconName;
        };

        SubMenuItem.prototype.GetDisplayName = function () {
            return this.DisplayName;
        };

        SubMenuItem.prototype.Render = function (App, Target, IsTopLevel) {
            var icon = TopMenuItem.CreateIconElement(this.GetIconName());
            var text = document.createTextNode("\u00a0" + this.GetDisplayName() + "\u00a0");
            if (IsTopLevel) {
                /*
                <button id="file-menu-button" type="button" data-toggle="dropdown" oncontextmenu="return false" class="btn navbar-btn btn-default dropdown-toggle">
                <span class="glyphicon glyphicon-file">
                </span>&nbsp;File&nbsp;
                <span class="caret">
                </span>
                </button>
                */
                var dropdown = document.createElement("div");
                dropdown.className = "dropdown clickable navbar-left";
                var button = document.createElement("button");
                button.type = "button";
                button.setAttribute("id", this.ElementId);
                button.setAttribute("oncontextmenu", "return false");
                button.setAttribute("data-toggle", "dropdown");
                var classes = "btn navbar-btn btn-default dropdown-toggle";
                if (!this.IsEnabled) {
                    classes += " disabled";
                }
                button.className = classes;
                var caret = document.createElement("span");
                caret.className = "caret";
                button.appendChild(icon);
                button.appendChild(text);
                button.appendChild(caret);

                var ul = document.createElement("ul");
                ul.setAttribute("oncontextmenu", "return false");
                ul.className = "dropdown-menu";
                ul.style.right = "auto";
                ul.style.width = "250px";

                for (var i = 0; i < this.SubMenuList.length; i++) {
                    this.SubMenuList[i].Render(App, ul, false);
                }

                dropdown.appendChild(button);
                dropdown.appendChild(ul);
                Target.appendChild(dropdown);
            } else {
                /*
                <li>
                <a id="create-wgsn-menu" href="#">
                <span class="glyphicon glyphicon-plus"></span>&nbsp;
                New...
                </a>
                </li>
                */
                var li = document.createElement("li");
                li.className = "dropdown-submenu";
                var a = document.createElement("a");
                a.href = "#";
                li.appendChild(a);
                a.appendChild(icon);
                a.appendChild(text);

                var ul = document.createElement("ul");
                ul.setAttribute("oncontextmenu", "return false");
                ul.className = "dropdown-menu";

                for (var i = 0; i < this.SubMenuList.length; i++) {
                    this.SubMenuList[i].Render(App, ul, false);
                }

                li.appendChild(ul);
                Target.appendChild(li);
            }
        };
        return SubMenuItem;
    })(TopMenuItem);
    AssureNote.SubMenuItem = SubMenuItem;

    var TopMenuTopItem = (function (_super) {
        __extends(TopMenuTopItem, _super);
        function TopMenuTopItem(SubMenuList) {
            _super.call(this, true);
            this.SubMenuList = SubMenuList;
            this.SubMenuMap = {};
            for (var i; i < SubMenuList.length; i++) {
                if (SubMenuList[i].ButtonId) {
                    this.SubMenuMap[SubMenuList[i].ButtonId] = SubMenuList[i];
                }
            }
        }
        TopMenuTopItem.prototype.AppendSubMenu = function (SubMenu) {
            this.SubMenuList.unshift(SubMenu);
            if (SubMenu.ButtonId) {
                this.SubMenuMap[SubMenu.ButtonId] = SubMenu;
            }
        };

        TopMenuTopItem.prototype.Render = function (App, Target, IsTopLevel) {
            for (var i = 0; i < this.SubMenuList.length; i++) {
                this.SubMenuList[i].Render(App, Target, true);
            }
            $(".dropdown-toggle").dropdown();
        };
        return TopMenuTopItem;
    })(TopMenuItem);
    AssureNote.TopMenuTopItem = TopMenuTopItem;

    var DividerMenuItem = (function (_super) {
        __extends(DividerMenuItem, _super);
        function DividerMenuItem() {
            _super.apply(this, arguments);
        }
        DividerMenuItem.prototype.Render = function (App, Target, IsTopLevel) {
            var li = document.createElement("li");
            li.className = "divider";
            Target.appendChild(li);
        };
        return DividerMenuItem;
    })(TopMenuItem);
    AssureNote.DividerMenuItem = DividerMenuItem;

    var NewMenuItem = (function (_super) {
        __extends(NewMenuItem, _super);
        function NewMenuItem() {
            _super.apply(this, arguments);
        }
        NewMenuItem.prototype.GetIconName = function () {
            return "plus";
        };
        NewMenuItem.prototype.GetDisplayName = function () {
            return "New...";
        };
        NewMenuItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("new");
            Command.Invoke(null, []);
        };
        return NewMenuItem;
    })(TopMenuItem);
    AssureNote.NewMenuItem = NewMenuItem;

    var OpenMenuItem = (function (_super) {
        __extends(OpenMenuItem, _super);
        function OpenMenuItem() {
            _super.apply(this, arguments);
        }
        OpenMenuItem.prototype.GetIconName = function () {
            return "folder-open";
        };
        OpenMenuItem.prototype.GetDisplayName = function () {
            return "Open...";
        };
        OpenMenuItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("open");
            Command.Invoke(null, []);
        };
        return OpenMenuItem;
    })(TopMenuItem);
    AssureNote.OpenMenuItem = OpenMenuItem;

    var UploadMenuItem = (function (_super) {
        __extends(UploadMenuItem, _super);
        function UploadMenuItem() {
            _super.apply(this, arguments);
        }
        UploadMenuItem.prototype.GetIconName = function () {
            return "cloud-upload";
        };
        UploadMenuItem.prototype.GetDisplayName = function () {
            return "Share";
        };
        UploadMenuItem.prototype.Invoke = function (App) {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                var CommitCommand = App.FindCommandByCommandLineName("commit");
                CommitCommand.Invoke(null, ["Share"]);
            }
            var Command = App.FindCommandByCommandLineName("share");
            Command.Invoke(null, []);
        };
        return UploadMenuItem;
    })(TopMenuItem);
    AssureNote.UploadMenuItem = UploadMenuItem;

    var SaveMenuItem = (function (_super) {
        __extends(SaveMenuItem, _super);
        function SaveMenuItem() {
            _super.apply(this, arguments);
        }
        SaveMenuItem.prototype.GetIconName = function () {
            return "floppy-save";
        };
        SaveMenuItem.prototype.GetDisplayName = function () {
            return "Save";
        };
        SaveMenuItem.prototype.Invoke = function (App) {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                var CommitCommand = App.FindCommandByCommandLineName("commit");
                CommitCommand.Invoke(null, ["Save"]);
            }
            var Command = App.FindCommandByCommandLineName("save");
            var DefaultName = App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            Command.Invoke(null, [DefaultName]);
        };
        return SaveMenuItem;
    })(TopMenuItem);
    AssureNote.SaveMenuItem = SaveMenuItem;

    var SaveAsMenuItem = (function (_super) {
        __extends(SaveAsMenuItem, _super);
        function SaveAsMenuItem() {
            _super.apply(this, arguments);
        }
        SaveAsMenuItem.prototype.GetDisplayName = function () {
            return "*." + this.GetExtention() + "...";
        };
        SaveAsMenuItem.prototype.GetExtention = function () {
            return "";
        };
        SaveAsMenuItem.prototype.Invoke = function (App) {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                var CommitCommand = App.FindCommandByCommandLineName("commit");
                CommitCommand.Invoke(null, ["Save"]);
            }
            var DefaultName = App.WGSNName.replace(/(\.\w+)?$/, "." + this.GetExtention());
            var Command = App.FindCommandByCommandLineName("save");
            var Name = prompt("Enter the file name", DefaultName);
            if (Name == null) {
                return;
            }
            var Args;
            if (Name == "") {
                Args = [DefaultName];
            } else {
                Args = [Name.replace(/(\.\w+)?$/, "." + this.GetExtention())];
            }
            Command.Invoke(null, Args);
        };
        return SaveAsMenuItem;
    })(TopMenuItem);
    AssureNote.SaveAsMenuItem = SaveAsMenuItem;

    var SaveAsWGSNMenuItem = (function (_super) {
        __extends(SaveAsWGSNMenuItem, _super);
        function SaveAsWGSNMenuItem() {
            _super.apply(this, arguments);
        }
        SaveAsWGSNMenuItem.prototype.GetExtention = function () {
            return "wgsn";
        };
        return SaveAsWGSNMenuItem;
    })(SaveAsMenuItem);
    AssureNote.SaveAsWGSNMenuItem = SaveAsWGSNMenuItem;

    var SaveAsDCaseMenuItem = (function (_super) {
        __extends(SaveAsDCaseMenuItem, _super);
        function SaveAsDCaseMenuItem() {
            _super.apply(this, arguments);
        }
        SaveAsDCaseMenuItem.prototype.GetExtention = function () {
            return "dcase_model";
        };
        return SaveAsDCaseMenuItem;
    })(SaveAsMenuItem);
    AssureNote.SaveAsDCaseMenuItem = SaveAsDCaseMenuItem;

    var SaveAsSVGMenuItem = (function (_super) {
        __extends(SaveAsSVGMenuItem, _super);
        function SaveAsSVGMenuItem() {
            _super.apply(this, arguments);
        }
        SaveAsSVGMenuItem.prototype.GetDisplayName = function () {
            return "*.svg...";
        };
        SaveAsSVGMenuItem.prototype.GetExtention = function () {
            return "";
        };
        SaveAsSVGMenuItem.prototype.Invoke = function (App) {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                var CommitCommand = App.FindCommandByCommandLineName("commit");
                CommitCommand.Invoke(null, ["Save"]);
            }
            var DefaultName = App.WGSNName.replace(/(\.\w+)?$/, ".svg");
            var Command = App.FindCommandByCommandLineName("save-as-svg");
            var Name = prompt("Enter the file name", DefaultName);
            if (Name == null) {
                return;
            }
            var Args;
            if (Name == "") {
                Args = [DefaultName];
            } else {
                Args = [Name.replace(/(\.\w+)?$/, ".svg")];
            }
            Command.Invoke(null, Args);
        };
        return SaveAsSVGMenuItem;
    })(TopMenuItem);
    AssureNote.SaveAsSVGMenuItem = SaveAsSVGMenuItem;

    var CommandListMenuItem = (function (_super) {
        __extends(CommandListMenuItem, _super);
        function CommandListMenuItem() {
            _super.apply(this, arguments);
        }
        CommandListMenuItem.prototype.GetIconName = function () {
            return "question-sign";
        };
        CommandListMenuItem.prototype.GetDisplayName = function () {
            return "Command list";
        };
        CommandListMenuItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("help");
            Command.Invoke(null, []);
        };
        return CommandListMenuItem;
    })(TopMenuItem);
    AssureNote.CommandListMenuItem = CommandListMenuItem;

    var HelpMenuItem = (function (_super) {
        __extends(HelpMenuItem, _super);
        function HelpMenuItem() {
            _super.apply(this, arguments);
        }
        HelpMenuItem.prototype.GetIconName = function () {
            return "question-sign";
        };
        HelpMenuItem.prototype.GetDisplayName = function () {
            return "Help";
        };
        HelpMenuItem.prototype.Invoke = function (App) {
            window.open("https://github.com/AssureNote/AssureNote/blob/master/README.md");
        };
        return HelpMenuItem;
    })(TopMenuItem);
    AssureNote.HelpMenuItem = HelpMenuItem;

    var AboutMenuItem = (function (_super) {
        __extends(AboutMenuItem, _super);
        function AboutMenuItem() {
            _super.apply(this, arguments);
        }
        AboutMenuItem.prototype.GetIconName = function () {
            return "question-sign";
        };
        AboutMenuItem.prototype.GetDisplayName = function () {
            return "About";
        };
        AboutMenuItem.prototype.Invoke = function (App) {
            $('#about-modal').modal();
        };
        return AboutMenuItem;
    })(TopMenuItem);
    AssureNote.AboutMenuItem = AboutMenuItem;

    var ShowHistoryPanelItem = (function (_super) {
        __extends(ShowHistoryPanelItem, _super);
        function ShowHistoryPanelItem() {
            _super.apply(this, arguments);
        }
        ShowHistoryPanelItem.prototype.GetIconName = function () {
            return "time";
        };
        ShowHistoryPanelItem.prototype.GetDisplayName = function () {
            return "Show history panel";
        };
        ShowHistoryPanelItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("history");
            Command.Invoke(null, []);
        };
        return ShowHistoryPanelItem;
    })(TopMenuItem);
    AssureNote.ShowHistoryPanelItem = ShowHistoryPanelItem;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=TopMenu.js.map
