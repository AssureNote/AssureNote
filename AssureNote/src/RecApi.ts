///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

	function RemoteProcedureCall(Uri: string, Method: string, Params: any): any {
		var DefaultSuccessCallback = function(Reponse) {
			// do nothing
		}

		var DefaultErrorCallback = function(Request, Status, Error) {
			alert("ajax error");
		}

		var Command = {
			jsonrpc: "2.0",
			method: Method,
			id: 1,
			params: Params
		};

		var ReturnValue = JSON.parse($.ajax({
			type: "POST",
			url: Uri,
			async: false,
			data: Command,
			//dataType: "json",   // FIXME
			//contentType: "application/json; charset=utf-8",   // FIXME
			success: DefaultSuccessCallback,
			error: DefaultErrorCallback
		}).responseText);

		return ReturnValue;
	}

	export class RecApi {

		constructor(public Uri: string) {
		}

		GetLatestData(Location: string, Type: string): any {
			var Params = {
				location: Location,
				type: Type
			};

			var Response = RemoteProcedureCall(this.Uri, "getLatestData", Params);

			if('result' in Response) {
				return Response.result;
			}
			else {
				console.log(Response.error)   // for debug
				return null;
			}
		}
	}

}
