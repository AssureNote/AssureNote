import model    = require('./model')
import error    = require('../api/error')

/**
  * @class User
  * @constructor
  * @param {String} key
  * @param {String} displayName
  * @param {String} authId
  */
export class User {
    constructor(public key: string, public displayName: string, public authId: string) {
    }

    /**
      * @method tableToObject
      * @static
      * @param {Any} row
      * @return {User}
      */
    static tableToObject(row:any) {
        return new User(row.id_key, row.display_name, row.auth_id);
    }
}

/**
  * @class UserDAO
  * @constructor
  * @extends DAO
  */
export class UserDAO extends model.DAO {
    /**
      * @method login
      * @param {String} key
      * @param {String} displayName
      * @param {String} auth_id
      * @param {Function} callback
      * @return {void}
      */
    login(key: string, displayName: string, authId: string, callback: (err:any, user: User) => void) {
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
                this.insert(key, displayName, authId, (error, resultInsert) => {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    console.log(resultInsert);
                    callback(null, resultInsert);
                    return;
                });
                return;
            } else {
                callback(err, resultSelect);
                return;
            }

        });
    }

    /**
      * @method register
      * @param {String} key
      * @param {String} displayName
      * @param {String} authId
      * @param {Function} callback
      * @return {void}
      */
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

    /**
      * @method insert
      * @param {String} key
      * @param {String} displayName
      * @param {String} authId
      * @param {Function} callback
      * @return {void}
      */
    insert(key: string, displayName: string, authId: string, callback: (err:any, user:User) => void) {

        if (!authId) authId = '';
        this.con.query('INSERT INTO user(id_key, display_name, auth_id) VALUES(?, ?, ?) ', [key, displayName, authId], (err, result) => {
            if (err) {
                if (err.code == 'ER_DUP_ENTRY') {
                    err = new error.DuplicatedError('The login name is already exist.');
                }
                callback(err, null);
                return;
            }
            callback(err, new User(key, displayName, authId));
        });
    }
}
