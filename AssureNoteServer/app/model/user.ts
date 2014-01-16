import model    = require('./model')
import error    = require('../api/error')

export class User {
	constructor(public key: string, public displayName: string, public authId: string) {
	}

	static tableToObject(row:any) {
		return new User(row.id, row.name, row.auth_id);
	}
}

export class UserDAO extends model.DAO {
	login(key: string, auth_id: string, callback: (err:any, user: User) => void) {
		function validate(key: string) {
			var checks = [];
			if (key.length == 0) checks.push('User key is required.');
			if (key.length > 45) checks.push('User key should not exceed 45 characters.'); 
			if (checks.length > 0) {
				callback(new error.InvalidParamsError(checks, null), null);
				return false;
			}
			return true;
		}
		if (!validate(key)) return;

		this.select(key, (err, resultSelect) => {
			if (err) {
				callback(err, null);
				return;
			}

			if (resultSelect) {
				callback(err, resultSelect);
				return;
			} else {
				this.insert(key, key/*FIXME*/, auth_id, (err, resultInsert) => {
					if (err) {
						callback(err, null);
						return;
					}
					callback(null, resultInsert);
					return;
				});
			}

		});
	}

	register(key: string, displayName: string, authId: string, callback: (err: any, user: User) => void) {
		function validate(key: string, name: string) {
			var checks = [];
			if (name.length == 0) checks.push('Display name is required.');
			if (name.length > 45) checks.push('Display name should not exceed 45 characters.'); 
			if (key.length == 0) checks.push('User key is required.');
			if (key.length > 45) checks.push('User key should not exceed 45 characters.'); 
			if (checks.length > 0) {
				callback(new error.InvalidParamsError(checks, null), null);
				return false;
			}
			return true;
		}
		if (!validate(key, displayName)) return;


		this.insert(key, name, authId, (err, resultInsert) => {
			if (err) {
				callback(err, null);
				return;
			} else {
				callback(null, resultInsert);
			}
		});
	}

	select(key: string, callback: (err:any, user: User) => void): void {
		this.con.query('SELECT * FROM user WHERE id_key = ? ', [key], (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			var resultUser : User = null;
			if (result.length == 0) {
				err = new error.NotFoundError('UserId Not Found.');
			} else {
				resultUser = User.tableToObject(result[0]);
			}	
			callback(err, resultUser);
		});
	}

	insert(key: string, name: string, auth_id: string, callback: (err:any, user:User) => void) {

		if (!auth_id) auth_id = '';
		this.con.query('INSERT INTO user(id_key, display_name, auth_id) VALUES(?, ?, ?) ', [key, name, auth_id], (err, result) => {
			if (err) {
				if (err.code == 'ER_DUP_ENTRY') {
					err = new error.DuplicatedError('The login name is already exist.');
				}
				callback(err, null);
				return;
			}
			callback(err, new User(key, name, auth_id));
		});
	}
}
