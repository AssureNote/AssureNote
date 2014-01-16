export class Auth {
	constructor(public req: any, public res: any) {}
	isLogin(): boolean {
		return this.req.session.UserId != null;
	}

	set(UserId:string, UserName:string): void {
		this.res.cookie('UserId', UserId);
		this.res.cookie('UserName', UserName);
		this.res.cookie('sessionUserId', UserId, { signed: true });
		this.res.cookie('sessionUserName', UserName, { signed: true }); 
		this.req.session.UserId = UserId;
		this.req.session.UserName = UserName;
	}

	getLoginName(): string {
        console.log('Login Name: ' + this.req.session.UserName);
		return this.req.session.UserName;
	}

	getUserId(): string {
		if (this.req.session.UserId) return this.req.session.UserId;
		return undefined;
	}

	clear(): void {
		this.res.clearCookie('UserId');
		this.res.clearCookie('UserName');
		this.res.clearCookie('sessionUserId');
		this.res.clearCookie('sessionUserName'); 
		delete this.req.session.UserId;
		delete this.req.session.UserName;
	}
}
