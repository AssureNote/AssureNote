///<reference path='../d.ts/jquery.d.ts'/>
///<reference path='./CaseModel.ts'/>
///<reference path='./CommitModel.ts'/>
var AssureNote;
(function (AssureNote) {
    var default_error_callback = function (req, stat, err) {
        alert("ajax error");
    };

    var ServerAPI = (function () {
        function ServerAPI(basepath, recpath, agentpath) {
            this.uri = basepath + "/api/1.0/";
            this.basepath = basepath;
            this.recpath = recpath;
            this.agentpath = agentpath;
            this.basepath = basepath + "/";
        }
        ServerAPI.prototype.RemoteCall = function (method, params, Callback) {
            var cmd = {
                jsonrpc: "2.0",
                method: method,
                id: 1,
                params: params
            };
            var error_callback = default_error_callback;
            var res = $.ajax({
                type: "POST",
                url: this.uri,
                data: JSON.stringify(cmd),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    Callback(JSON.parse(res.responseText).result);
                },
                error: error_callback
            });
        };

        ServerAPI.prototype.GetCase = function (ProjectName, CaseId, Callback) {
            this.RemoteCall("getDCase", { dcaseId: CaseId }, Callback);
        };

        //-------------------------------------
        ServerAPI.prototype.SearchCase = function (pageIndex, Callback) {
            try  {
                return this.RemoteCall("searchDCase", { page: pageIndex, tagList: [] }, Callback);
            } catch (e) {
                return [];
            }
        };

        ServerAPI.prototype.CreateCase = function (name, tree, Callback) {
            this.RemoteCall("createDCase", {
                dcaseName: name,
                contents: tree
            }, Callback);
        };

        //TODO
        //GetCommitList(dcaseId: number, Callback: any): CommitCollection {
        //	return CommitCollection.FromJson(this.RemoteCall("getCommitList", { dcaseId: dcaseId }, Callback).commitList);
        //}
        ServerAPI.prototype.Commit = function (tree, msg, commitId, summary, Callback) {
            this.RemoteCall("commit", {
                contents: tree,
                commitMessage: msg,
                'commitId': commitId,
                summary: JSON.stringify(summary)
            }, Callback);
        };

        ServerAPI.prototype.EditCase = function (dcaseId, name, Callback) {
            return this.RemoteCall("editDCase", {
                dcaseId: dcaseId,
                dcaseName: name
            }, Callback);
        };

        ServerAPI.prototype.DeleteCase = function (dcaseId, Callback) {
            this.RemoteCall("deleteDCase", { dcaseId: dcaseId }, Callback);
        };

        ServerAPI.prototype.GetNodeTree = function (commitId, Callback) {
            this.RemoteCall("getNodeTree", { commitId: commitId }, Callback);
        };

        ServerAPI.prototype.GetProjectList = function (userId, Callback) {
            this.RemoteCall("getProjectList", { userId: userId }, Callback);
        };

        ServerAPI.prototype.CreateProject = function (name, isPublic, Callback) {
            this.RemoteCall("createProject", {
                name: name,
                isPublic: isPublic
            }, Callback);
        };

        ServerAPI.prototype.EditProject = function (name, projectId, Callback) {
            this.RemoteCall("editProject", {
                name: name,
                projectId: projectId
            }, Callback);
        };
        return ServerAPI;
    })();
    AssureNote.ServerAPI = ServerAPI;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Api.js.map
