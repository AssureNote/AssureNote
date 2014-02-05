// ***************************************************************************
// Copyright (c) 2014, AssureNote project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// *  Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// *  Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// **************************************************************************
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="./AssureNote.ts" />
///<reference path="../d.ts/jquery_plugins.d.ts" />
var AssureNote;
(function (AssureNote) {
    var UserItem = (function () {
        function UserItem(UserName, Color, IsEditMode, SID) {
            this.UserName = UserName;
            this.Color = Color;
            this.IsEditMode = IsEditMode;
            this.SID = SID;
        }
        return UserItem;
    })();
    AssureNote.UserItem = UserItem;

    var UserList = (function (_super) {
        __extends(UserList, _super);
        function UserList(App) {
            var _this = this;
            _super.call(this, App);
            this.App = App;
            this.UserName = 'Guest';
            this.UserList = [];
            $('.change-user').on('click', function (e) {
                var Name = prompt('Enter the new user name', '');
                if (Name == '')
                    Name = 'Guest';
                _this.App.SetUserName(Name);
                _this.Show();
            });
        }
        UserList.prototype.Show = function () {
            var found = false;
            for (var i in this.UserList) {
                if (this.UserList[i].IsEditMode) {
                    found = true;
                }
            }
            this.App.ModeManager.ReadOnly(found);
            $('.user-name').text(this.App.GetUserName());
            $('#user-list-tmpl').tmpl(this.UserList).appendTo($('#user-list').empty());
        };

        UserList.prototype.AddUser = function (Info) {
            var Color = this.GetRandomColor();
            var IsEditMode = (Info.Mode == 0 /* Edit */) ? true : false;
            this.UserList.push(new UserItem(Info.User, Color, IsEditMode, Info.SID));
            this.Show();
        };

        UserList.prototype.UpdateEditMode = function (Info) {
            for (var i in this.UserList) {
                if (this.UserList[i].SID == Info.SID) {
                    var UserItem = this.UserList[i];
                    UserItem.IsEditMode = (Info.Mode == 0 /* Edit */);
                }
            }
            this.Show();
        };

        UserList.prototype.RemoveUser = function (SID) {
            for (var i = 0; i < this.UserList.length; i++) {
                if (this.UserList[i].SID == SID) {
                    this.UserList.splice(i, 1); //Index of UserInfo and UserList is same since push data in the same time
                    break;
                }
            }
            this.Show();
        };

        UserList.prototype.GetRandomColor = function () {
            var color = Math.floor(Math.random() * 0xFFFFFF).toString(16);
            for (var i = color.length; i < 6; i++) {
                color = "0" + color;
            }
            return "#" + color;
        };

        UserList.prototype.AddFocusedUserColor = function (SID, View) {
            var Color;
            var ClassName = SID + "-focused";
            for (var i = 0; i < this.UserList.length; i++) {
                if (this.UserList[i].SID == SID) {
                    Color = this.UserList[i].Color;
                }
            }
            View.Shape.AddColorStyle(ClassName);
            $("." + SID + "-focused").css({ stroke: Color });
        };

        UserList.prototype.RemoveFocusedUserColor = function (SID, OldView) {
            var ClassName = SID + "-focused";
            OldView.Shape.RemoveColorStyle(ClassName);
        };
        return UserList;
    })(AssureNote.Panel);
    AssureNote.UserList = UserList;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=UserList.js.map
