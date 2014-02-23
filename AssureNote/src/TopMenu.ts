

module AssureNote {
    export class TopMenuItem {

        ButtonId: string;
        ElementId: string;

        constructor(public IsEnabled: boolean, ButtonId?: string) {
            this.ButtonId = null;
            this.ElementId = null;
            if(ButtonId) {
                this.ButtonId = ButtonId;
                this.ElementId = ButtonId+"-menu-button";
            }
        }

        GetIconName(): string {
            return "";
        }
        GetDisplayName(): string {
            return "";
        }

        Enable(): void {
            this.IsEnabled = true;
            if(this.ElementId) {
                $('#' + this.ElementId).removeClass("disabled");
            }
        }

        Disable(): void {
            this.IsEnabled = false;
            if(this.ElementId) {
                $('#' + this.ElementId).addClass("disabled");
            }
        }

        static CreateIconElement(Name: string): HTMLSpanElement {
            var span = document.createElement("span");
            span.className = "glyphicon glyphicon-" + Name;
            return span;
        }
        static CreateID(): string {
            return "topmenu-" + AssureNoteUtils.GenerateRandomString();
        }
        Render(App: AssureNoteApp, Target: Element, IsTopLevel: boolean): void {
            var item: HTMLElement;
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
                (<HTMLButtonElement>item).type = "button";
                if(this.ElementId) {
                    item.setAttribute("id", this.ElementId);
                }
                item.setAttribute("oncontextmenu", "return false");
                var classes = "btn navbar-btn btn-default clickable navbar-left";
                if(!this.IsEnabled) {
                    classes += " disabled";
                    item.setAttribute("disabled");
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
                if (!this.IsEnabled) {
                    item.className = "disabled";
                }
            }
            item.addEventListener("click", (event: MouseEvent) => {
                this.Invoke(App);
            });
            Target.appendChild(item);
        }

        Invoke(App: AssureNoteApp): void {
        }
    }

    export class SubMenuItem extends TopMenuItem {

        constructor(IsEnabled: boolean, ButtonId: string, private DisplayName: string, private IconName: string, public SubMenuList: TopMenuItem[]) {
            super(IsEnabled, ButtonId);
        }

        GetIconName(): string {
            return this.IconName;
        }

        GetDisplayName(): string {
            return this.DisplayName;
        }

        Render(App: AssureNoteApp, Target: Element, IsTopLevel: boolean): void {
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
                if(!this.IsEnabled) {
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
        }
    }

    export class TopMenuTopItem extends TopMenuItem {

        SubMenuMap: { [index: string]: TopMenuItem };

        constructor(public SubMenuList: TopMenuItem[]) {
            super(true);
            this.SubMenuMap = {};
            for(var i: number; i < SubMenuList.length; i++) {
                if(SubMenuList[i].ButtonId) {
                    this.SubMenuMap[SubMenuList[i].ButtonId] = SubMenuList[i];
                }
            }
        }

        AppendSubMenu(SubMenu: TopMenuItem) {
            this.SubMenuList.unshift(SubMenu);
            if(SubMenu.ButtonId) {
                this.SubMenuMap[SubMenu.ButtonId] = SubMenu;
            }
        }

        Render(App: AssureNoteApp, Target: Element, IsTopLevel: boolean): void {
            for (var i = 0; i < this.SubMenuList.length; i++) {
                this.SubMenuList[i].Render(App, Target, true);
            }
            (<any>$(".dropdown-toggle")).dropdown();
        }
    }

    export class DividerMenuItem extends TopMenuItem {
        Render(App: AssureNoteApp, Target: Element, IsTopLevel: boolean): void {
            var li = document.createElement("li");
            li.className = "divider";
            Target.appendChild(li);
        }
    }

    export class NewMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "plus";
        }
        GetDisplayName(): string {
            return "New...";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("new");
        }
    }

    export class OpenMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "folder-open";
        }
        GetDisplayName(): string {
            return "Open...";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("open");
        }
    }

    export class UploadMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "cloud-upload";
        }
        GetDisplayName(): string {
            return "Share";
        }
        Invoke(App: AssureNoteApp): void {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                App.ExecCommandByName("commit", "Share");
            }
            App.ExecCommandByName("share");
        }
    }

    export class SaveMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "floppy-save";
        }
        GetDisplayName(): string {
            return "Save";
        }
        Invoke(App: AssureNoteApp): void {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                App.ExecCommandByName("commit", "Save");
            }
            var DefaultName = App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            App.ExecCommandByName("save", DefaultName);
        }
    }

    export class SaveAsMenuItem extends TopMenuItem {
        GetDisplayName(): string {
            return "*." + this.GetExtention() + "...";
        }
        GetExtention(): string {
            return "";
        }
        Invoke(App: AssureNoteApp): void {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                App.ExecCommandByName("commit", "Save");
            }
            var DefaultName = App.WGSNName.replace(/(\.\w+)?$/, "." + this.GetExtention());
            var Command = App.FindCommandByCommandLineName("save");
            var Name = prompt("Enter the file name", DefaultName);
            if (Name == null) {
                return;
            }
            var Args: string[];
            if (Name == "") {
                Args = [DefaultName];
            } else {
                Args = [Name.replace(/(\.\w+)?$/, "." + this.GetExtention())];
            }
            Command.Invoke(null, Args);
        }
    }

    export class SaveAsWGSNMenuItem extends SaveAsMenuItem {
        GetExtention(): string {
            return "wgsn";
        }
    }

    export class SaveAsDCaseMenuItem extends SaveAsMenuItem {
        GetExtention(): string {
            return "dcase_model";
        }
    }

    export class SaveAsSVGMenuItem extends TopMenuItem {
        GetDisplayName(): string {
            return "*.svg...";
        }
        GetExtention(): string {
            return "";
        }
        Invoke(App: AssureNoteApp): void {
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
            var Args: string[];
            if (Name == "") {
                Args = [DefaultName];
            } else {
                Args = [Name.replace(/(\.\w+)?$/, ".svg")];
            }
            Command.Invoke(null, Args);
        }
    }

    export class CommandListMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "question-sign";
        }
        GetDisplayName(): string {
            return "Command list";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("help");
        }
    }

    export class HelpMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "question-sign";
        }
        GetDisplayName(): string {
            return "Help";
        }
        Invoke(App: AssureNoteApp): void {
            window.open("https://github.com/AssureNote/AssureNote/blob/master/README.md");
        }
    }

    export class AboutMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "question-sign";
        }
        GetDisplayName(): string {
            return "About";
        }
        Invoke(App: AssureNoteApp): void {
            (<any>$('#about-modal')).modal();
        }
    }

    export class ShowHistoryPanelItem extends TopMenuItem {
        GetIconName(): string {
            return "time";
        }
        GetDisplayName(): string {
            return "History";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("history");
        }
    }

    export class DummyMenuItem extends TopMenuItem {
        constructor(private DisplayName: string, private IconName: string) {
            super(false, "dummy-" + AssureNoteUtils.GenerateRandomString());
        }
        GetIconName(): string {
            return this.IconName
        }
        GetDisplayName(): string {
            return this.DisplayName;
        }
    }
}
