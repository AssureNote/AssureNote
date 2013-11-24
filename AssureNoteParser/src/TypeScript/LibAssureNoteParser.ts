/* lib/md5.js */
declare function md5(str: string) : void;
declare function unescape(str: string) : string;

class StringBuilder {
	str : string;
	constructor() {
		this.str = "";
	}

	append(str) : void {
		this.str += str;
	}

	toString() : string {
		return this.str;
	}
}

class Character {
	static isDigit(c: number) : boolean {
		/* '0' ~ '9' */
		return 48 <= c && c <= 57;
	}

	static isWhitespace(c: number) : boolean {
		/* '\t' '\n' '\f' '\r' ' ' */
		return c == 9 || c == 10 || c == 12 || c == 13 || c == 32;;
	}
}

class SimpleDateFormat {
	constructor(format: string) {
		// Support format string, or is it needless?
	}

	fillZero(digit : number) : string {
		if (digit < 10) {
			return '0'+digit;
		} else {
			return ''+digit;
		}
	}

	parse(date: string) : Date {
		return new Date(date);
	}

	formatTimezone(timezoneOffset: number) : string {
		var res = '';
		var timezoneInHours = timezoneOffset / -60;
		if (Math.abs(timezoneInHours) < 10) {
			res = '0' + Math.abs(timezoneInHours) + '00';
		} else {
			res = Math.abs(timezoneInHours) + '00';
		}

		if (timezoneInHours > 0) {
			return '+' + res;
		} else {
			return '-' + res;
		}
	}

	format(date: Date) : string {
		var y       : string = this.fillZero(date.getFullYear());
		var m       : string = this.fillZero(date.getMonth()+1);
		var d       : string = this.fillZero(date.getDate());
		var hr      : string = this.fillZero(date.getHours());
		var min     : string = this.fillZero(date.getMinutes());
		var sec     : string = this.fillZero(date.getSeconds());
		var timezone: string = this.formatTimezone(date.getTimezoneOffset());
		return y + '-' + m + '-' + d + 'T' + hr + ':' + min + ':' + sec + timezone;
	}
}

class HashMap <string, V>{
	/* the type of key must be either string or number */
	hash : {[key: string]: V};
	constructor() {
		this.hash = {};
	}
	put(key: string, value: V) : void {
		this.hash[key] = value;
	}

	get(key: string) : V {
		return this.hash[key];
	}

	size() : number {
		return Object.keys(this.hash).length;
	}

	clear() : void {
		this.hash = {};
	}

	keySet() : string[] {
		return Object.keys(this.hash);
	}
}

class MessageDigest {
	stringDigest: string;
	constructor() {
		this.stringDigest = null;
	}

	digest() : string {
		return this.stringDigest;
	}
}

class Lib {
	/* Static Fields */
	static EmptyNodeList = new Array<GSNNode>();
	static LineFeed : string = "\n";
	static VersionDelim : string = "*=====";

	/* Methods */
	static GetMD5() : MessageDigest {
		return null;
	}

	static UpdateMD5(md: MessageDigest, text: string) : void {
	}

	static EqualsDigest(digest1: string, digest2: string) : boolean {
		return null;
	}
	static ReadFile(file: string) : string {
		return "";
	}
}

class Iterator<T> {//FIX ME!!
}

interface Array {
        get(index: number): any;
        set(index: number, value: any): void;
        add(obj: any): void;
        add(index: number, obj : any): void;
        size(): number;
        clear(): void;
        remove(index: number): any;
        remove(item: any): any;
        iterator(): Iterator<Array>;
}

Object.defineProperty(Array.prototype, "size", {
        enumerable : false,
        value : function() {
                return this.length;
        }
});

Object.defineProperty(Array.prototype, "add", {
        enumerable : false,
        value : function(arg1) {
                if(arguments.length == 1) {
                        this.push(arg1);
                } else {
                        var arg2 = arguments[1];
                        this.splice(arg1, 0, arg2);
                }
        }
});

Object.defineProperty(Array.prototype, "get", {
        enumerable : false,
        value : function(i) {
                if(i >= this.length){
                        throw new RangeError("invalid array index");
                }
                return this[i];
        }
});

Object.defineProperty(Array.prototype, "set", {
        enumerable : false,
        value : function(i, v) {
                this[i] = v;
        }
});

Object.defineProperty(Array.prototype, "remove", {
        enumerable : false,
        value : function(i) {
                if(typeof i == 'number') {
                        if(i >= this.length){
                                throw new RangeError("invalid array index");
                        }
                } else {
                        var item = i;
                        i = 0;
                        for (var j in this) {
                                if (this[j] === i) break;
                        }
                        if (j == this.length) return null;
                }
                var v = this[i];
                this.splice(i, 1);
                return v;
        }
});

Object.defineProperty(Array.prototype, "clear", {
        enumerable : false,
        value : function() {
                this.length = 0;
        }
});

interface Object {
        equals(other: any): boolean;
        InstanceOf(klass: any): boolean;
}

Object.defineProperty(Object.prototype, "equals", {
        enumerable : false,
        value : function(other) {
                return (this === other);
        }
});

Object.defineProperty(Object.prototype, "InstanceOf", {
        enumerable : false,
        value : function(klass) {
                return (<any>this).constructor == klass;
        }
});

interface String {
        compareTo(anotherString: string): number;
        startsWith(key: string): boolean;
        endsWith(key: string): boolean;
        lastIndexOf(ch: number) : number;
        indexOf(ch: number) : number;
        substring(BeginIdx : number, EndIdx : number) : string;
}

Object.defineProperty(String.prototype, "compareTo", {
        enumerable : false,
        value : function(anotherString) {
                if (this < anotherString) {
                        return -1;
                } else if (this > anotherString) {
                        return 1;
                } else {
                        return 0;
                }
        }
});

Object.defineProperty(String.prototype, "startsWith", {
        enumerable : false,
        value : function(key) {
                return this.indexOf(key, 0) == 0;
        }
});

Object.defineProperty(String.prototype, "endsWith", {
        enumerable : false,
        value : function(key) {
                return this.lastIndexOf(key, 0) == 0;
        }
});

Object.defineProperty(String.prototype, "equals", {
        enumerable : false,
        value : function(other) {
                return (this == other);
        }
});
