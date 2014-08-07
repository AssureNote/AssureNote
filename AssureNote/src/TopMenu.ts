

module AssureNote {
    export class TopMenuItem {

        ButtonId: string;
        ElementId: string;

        constructor(public IsEnabled: boolean, ButtonId?: string) {
            this.ButtonId = null;
            this.ElementId = null;
            if (!ButtonId) {
                ButtonId = TopMenuItem.CreateID();
            }
            this.ButtonId = ButtonId;
            this.ElementId = ButtonId+"-menu-button";
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
                    item.id = this.ElementId;
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
                if (this.ElementId) {
                    item.id = this.ElementId;
                }
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
                if (this.IsEnabled) {
                    this.Invoke(App);
                }
            });
            Target.appendChild(item);
        }

        Invoke(App: AssureNoteApp): void {
        }

        Update(): void {
        }
    }

    export class SubMenuItem extends TopMenuItem {

        public SubMenuList: TopMenuItem[];

        constructor(IsEnabled: boolean, ButtonId: string, private DisplayName: string, private IconName: string, SubMenuList: TopMenuItem[]) {
            super(IsEnabled, ButtonId);
            this.SubMenuList = SubMenuList.filter(Menu => Menu != null);
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
                if (this.ElementId) {
                    button.id = this.ElementId;
                }
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

                this.SubMenuList.forEach(Menu => Menu.Render(App, ul, false));

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
                if (this.ElementId) {
                    li.id = this.ElementId;
                }
                var a = document.createElement("a");
                a.href = "#";
                li.appendChild(a);
                a.appendChild(icon);
                a.appendChild(text);

                var ul = document.createElement("ul");
                ul.setAttribute("oncontextmenu", "return false");
                ul.className = "dropdown-menu";

                this.SubMenuList.forEach(Menu => Menu.Render(App, ul, false));

                li.appendChild(ul);
                Target.appendChild(li);
            }
        }

        Update(): void {
            this.SubMenuList.forEach(Menu => Menu.Update());
        }
    }

    export class TopMenuTopItem extends TopMenuItem {

        SubMenuMap: { [index: string]: TopMenuItem };

        constructor(public SubMenuList: TopMenuItem[]) {
            super(true);
            this.SubMenuMap = {};
            this.SubMenuList.forEach(Menu => {
                if (Menu.ButtonId) {
                    this.SubMenuMap[Menu.ButtonId] = Menu;
                }
            });
        }

        AppendSubMenu(SubMenu: TopMenuItem) {
            this.SubMenuList.unshift(SubMenu);
            if(SubMenu.ButtonId) {
                this.SubMenuMap[SubMenu.ButtonId] = SubMenu;
            }
        }

        Render(App: AssureNoteApp, Target: Element, IsTopLevel: boolean): void {
            this.SubMenuList.forEach(Menu => Menu.Render(App, Target, true));
            (<any>$(".dropdown-toggle")).dropdown();
        }

        Update() {
            this.SubMenuList.forEach(Menu => Menu.Update());
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
            if (App.IsUserGuest()) {
                AssureNoteUtils.Notify("Please login first");
                return;
            }
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
            var Name = prompt("SaveAs: Enter the file name", DefaultName);
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

    export class SaveAsDCaseModelMenuItem extends SaveAsMenuItem {
        GetExtention(): string {
            return "dcase_model";
        }
    }

    export class SaveAsDCaseMenuItem extends SaveAsMenuItem {
        GetExtention(): string {
            return "dcase";
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
            var Name = prompt("SaveAs: Enter the file name", DefaultName);
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

    export class ShowHistoryPanelMenuItem extends TopMenuItem {
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

    export class ShowNodeCountPanelMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "signal";
        }
        GetDisplayName(): string {
            return "NodeCount";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("nodecount");
        }
    }

    export class SearchMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "search";
        }
        GetDisplayName(): string {
            return "Find";
        }
        Invoke(App: AssureNoteApp): void {
            var Key = prompt("Find: Enter the keyword");
            if (Key && Key != "") {
                App.ExecCommandByName("search", Key);
            }
        }
    }

    export class CommitMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "share-alt";
        }
        GetDisplayName(): string {
            return "Commit";
        }
        Invoke(App: AssureNoteApp): void {
            var Message = prompt("Commit: Enter commit message");
            App.ExecCommandByName("commit", Message);
        }
    }

    export class ZoomMenuItem extends TopMenuItem {
        constructor(IsEnabled: boolean, ButtonId: string, private Zoom: number) {
            super(IsEnabled, "Zoom-" + Zoom + "-" + AssureNoteUtils.GenerateRandomString());
        }
        GetIconName(): string {
            return "zoom-in";
        }
        GetDisplayName(): string {
            return "" + ~~(this.Zoom * 100) + "%";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("set-scale", this.Zoom);
        }
    }

    export class CopyMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "file";
        }
        GetDisplayName(): string {
            return "Copy";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("copy", App.PictgramPanel.GetFocusedLabel());
        }
    }

    export class PasteMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "file";
        }
        GetDisplayName(): string {
            return "Paste";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("paste", App.PictgramPanel.GetFocusedLabel());
        }
        Update(): void {
            var Mode = AssureNoteApp.Current.ModeManager.GetMode();
            if (Mode == AssureNoteMode.Edit) {
                this.Enable();
            } else {
                this.Disable();
            }
        }
    }

    export class UndoMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "step-backward";
        }
        GetDisplayName(): string {
            return "Undo";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("undo");
        }
        Update(): void {
            var Mode = AssureNoteApp.Current.ModeManager.GetMode();
            var CanUndo = AssureNoteApp.Current.MasterRecord.CanUndo();
            if (Mode == AssureNoteMode.Edit && CanUndo) {
                this.Enable();
            } else {
                this.Disable();
            }
        }
    }

    export class RedoMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "step-forward";
        }
        GetDisplayName(): string {
            return "Redo";
        }
        Invoke(App: AssureNoteApp): void {
            App.ExecCommandByName("redo");
        }
        Update(): void {
            var Mode = AssureNoteApp.Current.ModeManager.GetMode();
            var CanRedo = AssureNoteApp.Current.MasterRecord.CanRedo();
            if (Mode == AssureNoteMode.Edit && CanRedo) {
                this.Enable();
            } else {
                this.Disable();
            }
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
