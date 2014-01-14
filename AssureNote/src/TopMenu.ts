module AssureNote {
    class TopMenuItem {
        constructor() { }
        GetIconName(): string {
            return "";
        }
        GetDisplayName(): string {
            return "";
        }
        Render(Target: Element, IsSubMemu: boolean): void {
            if (IsSubMemu) {
                /*
                <li>
                    <a id="create-wgsn-menu" href="#">
                        <span class="glyphicon glyphicon-plus"></span>&nbsp;
                        New...
                    </a>
                </li>
                */
                var li = document.createElement("li");
                var a = document.createElement("a");
                var ID = "topmenu-" + this.GetDisplayName();
                a.id = ID;
                a.href = "#";
                var span = document.createElement("span");
                var text = document.createTextNode("&nbsp;" + this.GetDisplayName());
                span.className = "glyphicon glyphicon-" + this.GetIconName();
                li.appendChild(a);
                a.appendChild(span);
                a.appendChild(text);
                Target.appendChild(li);
            } else {
                /*
                */
            }
        }
        Invoke(App: AssureNoteApp): void {
        }
    }

    class NewMenuItem extends TopMenuItem {
        GetIconName(): string {
            return "plus";
        }
        GetDisplayName(): string {
            return "New...";
        }

    }
}
