module AssureNote {

	export class CommitModel {
		constructor(public CommitId: number, public Message:string, public date: string, public userId:number, public userName: string, public LatestFlag: boolean) {
		}

		//Deprecated
		toString(): string {
			return "date:" + this.date + "\n commiter:"+this.userName+"\n";
		}
	}

	export class CommitCollection {
		CommitModels: CommitModel[];

		constructor(CommitModels?: CommitModel[]) {
			if(CommitModels == null) {
				CommitModels = [];
			}
			this.CommitModels = CommitModels;
		}

		Append(CommitModel: CommitModel): void {
			this.CommitModels.push(CommitModel);
		}

		static FromJson(json_array: any[]): CommitCollection {
			var CommitModels: CommitModel[] = [];
			for(var i: number = 0; i < json_array.length; i++) {
				var j = json_array[i];
				CommitModels.push(new CommitModel(j.commitId, j.commitMessage, j.dateTime, j.userId, j.userName, false));
			}
			CommitModels[json_array.length - 1].LatestFlag = true; //Latest one
			return new CommitCollection(CommitModels);
		}

		forEach(callback: (i:number, v: CommitModel)=>void): void {
			for(var i: number = 0; i < this.CommitModels.length; i++) {
				callback(i, this.CommitModels[i]);
			}
		}

		Size(): number {
			return this.CommitModels.length;
		}
	}
}
