///<reference path='../../d.ts/jquery.d.ts'/>
///<reference path='./CaseModel.ts'/>
///<reference path='./CommitModel.ts'/>

//module AssureNote {

//	var default_error_callback = function(req, stat, err) {
//		alert("ajax error");
//	};

//	export class ServerAPI {
//		uri : string;
//		basepath : string;
//		recpath : string;
//		agentpath : string;

//		constructor(basepath: string, recpath: string, agentpath) {
//			this.uri = basepath + "/api/1.0/";
//			this.basepath = basepath;
//			this.recpath = recpath;
//			this.agentpath = agentpath;
//			this.basepath = basepath + "/";
//		}

//		RemoteCall(method : string, params : any, Callback: any) {
//			var cmd = {
//				jsonrpc: "2.0",
//				method: method,
//				id: 1,
//				params: params
//			};
//			var error_callback = default_error_callback;
//			var res = $.ajax({
//				type: "POST",
//				url: this.uri,
//				data: JSON.stringify(cmd),
//				dataType: "json",
//				contentType: "application/json; charset=utf-8",
//				success: function(response) {
//					Callback(JSON.parse(res.responseText).result);
//				},
//				error: error_callback
//			});
//		}

//		GetCase(ProjectName : string, CaseId : number, Callback: any) : void {
//			this.RemoteCall("getDCase", { dcaseId: CaseId }, Callback);
//		}

//		//-------------------------------------

//		SearchCase(pageIndex: any,  Callback: any) {
//			try{
//				return this.RemoteCall("searchDCase", { page: pageIndex, tagList: [] }, Callback);
//			}catch(e){
//				return [];
//			}
//		}

//		CreateCase(name: string, tree: any, Callback: any) {
//			this.RemoteCall("createDCase", {
//				dcaseName: name, contents: tree
//			}, Callback);
//		}

//		//TODO
//		//GetCommitList(dcaseId: number, Callback: any): CommitCollection {
//		//	return CommitCollection.FromJson(this.RemoteCall("getCommitList", { dcaseId: dcaseId }, Callback).commitList);
//		//}

//		Commit(tree, msg, commitId, summary, Callback: any) {
//			this.RemoteCall("commit", {
//				contents: tree,
//				commitMessage: msg,
//				'commitId': commitId,
//				summary: JSON.stringify(summary)
//			}, Callback);
//		}

//		EditCase(dcaseId, name, Callback: any) {
//			return this.RemoteCall("editDCase", {
//				dcaseId: dcaseId,
//				dcaseName: name
//			}, Callback);
//		}

//		DeleteCase(dcaseId, Callback: any) {
//			this.RemoteCall("deleteDCase", { dcaseId: dcaseId }, Callback);
//		}

//		GetNodeTree(commitId, Callback: any) {
//			this.RemoteCall("getNodeTree", { commitId: commitId }, Callback);
//		}

//		GetProjectList(userId: number, Callback: any) {
//			this.RemoteCall("getProjectList", { userId:userId }, Callback);
//		}

//		CreateProject(name: string, isPublic: boolean, Callback: any) {
//			this.RemoteCall("createProject", {
//				name: name, isPublic: isPublic }, Callback);
//		}

//		EditProject(name: string, projectId: number, Callback: any) {
//			this.RemoteCall("editProject", {
//				name: name, projectId: projectId }, Callback);
//		}
//	}
//}
