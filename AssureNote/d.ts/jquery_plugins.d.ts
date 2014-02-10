///<reference path='./jquery.d.ts'/>

interface JQueryCookieOptions {
    expires?: any;
    path?: string;
    domain?: string;
    secure?: boolean;
}

interface JQueryCookieStatic {
    raw?: boolean;
    json?: boolean;

    (name: string): any;
    (name: string, value: string): void;
    (name: string, value: string, options: JQueryCookieOptions): void;
    (name: string, value: any): void;
    (name: string, value: any, options: JQueryCookieOptions): void;
}

interface JQuery
{
    tmpl(data?:any,options?:any): JQuery;
    tmplItem(): JQueryTmplItem;
    template(name?:string): ()=>any;
    tooltip(options: any): void;
}

interface JQueryStatic
{
    tmpl(template:string,data?:any,options?:any): JQuery;
    tmpl(template:(data:any)=>string,data?:any,options?:any): JQuery;
    tmplItem(element:JQuery): JQueryTmplItem;
    tmplItem(element:HTMLElement): JQueryTmplItem;
    template(name:string,template:any): (data:any)=>string[];
    template(template:any): JQueryTemplateDelegate;
}

interface JQueryTemplateDelegate {
    (jQuery: JQueryStatic, data: any):string[];
}

interface JQueryTmplItem
{
    data:any;
    nodes:HTMLElement[];
    key:number;
    parent:JQueryTmplItem;
}

interface JQuery {
    bootstrapSwitch(type?: string, value?: string): JQuery;
    bootstrapSwitch(type?: string, value?: boolean): JQuery;
}
