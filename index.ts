///<reference path='src/Api.ts'/>
///<reference path='src/DragFile.ts'/>
///<reference path='d.ts/jquery.d.ts'/>


window.onload = () => {
	var Api = new AssureNote.ServerAPI("","");
	var PluginManager = new AssureNote.PlugInManager("");

	//create if id is not found
	var backgroundlayer: HTMLDivElement = <HTMLDivElement>(document.getElementById("background"));
	var shapelayer: SVGGElement = <SVGGElement>(<any>document.getElementById("layer0"));
	var contentlayer: HTMLDivElement = <HTMLDivElement>(document.getElementById("layer1"));
	var controllayer: HTMLDivElement = <HTMLDivElement>(document.getElementById("layer2"));
	var popuplayer: HTMLDivElement = <HTMLDivElement>(document.getElementById("layer3"));

	contentlayer.onclick = (ev: any) => {
		//ここで、ノード名に変換してイベントオブジェクトをラップ
		alert("Hi!");
		return false;
	};
	contentlayer.ondblclick = (ev: any) => {
	};
	var cmdline = "";
	contentlayer.onkeydown = (ev: KeyboardEvent) => {
		//今までに押したキーの列を作って渡す
	};

	var Importer = new AssureNote.DragFile($(backgroundlayer));
	//Importer.read((file: AssureNote.DCaseFile, )
	//Api.GetCase(1, 1, (CaseData: any) => {
	//	var contents = CaseData.contents;
	//	var summary = CaseData.summary;

	//	Case.SetInitialData(CaseData.DCaseName, JSON.stringify(summary), contents, CaseData.caseId, CaseData.commitId);
	//	//Case.ParseASN(contents, null);
	//	//var casedecoder = new assureit.casedecoder();
	//	//var root = casedecoder.parseasn(case0, contents, null);
	//	//case0.setelementtop(root);

	//	var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
	//	var Viewer = new AssureIt.CaseViewer(Case, pluginManager, Api, Screen);

	//	pluginManager.RegisterKeyEvents(Viewer, Case, Api);
	//	pluginManager.CreateSideMenu(Viewer, Case, Api);

	//	Viewer.Draw();
	//	var TopView = Viewer.ViewMap[Viewer.ElementTop.Label];
	//	Viewer.Screen.SetCaseCenter(TopView.AbsX, TopView.AbsY, TopView.HTMLDoc);

	//});
};