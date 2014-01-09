/* lib/md5.js */
declare function unescape(str: string) : string;

/* FIXME this class is never used */
export class PdfConverter {
	constructor () {}
	static main(args: string[]) {}
}

export class Random {
    constructor(seed: number) {}

    nextInt() : number {
        return Math.floor(Math.random() * 2147483647);
    }
}

export class System {
    static currentTimeMillis() {
        return new Date().getTime();
    }
}

export class StringBuilder {
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

export class Character {
	static isDigit(c: number) : boolean {
		/* '0' ~ '9' */
		return 48 <= c && c <= 57;
	}

	static isWhitespace(c: number) : boolean {
		/* '\t' '\n' '\f' '\r' ' ' */
		return c == 9 || c == 10 || c == 12 || c == 13 || c == 32;;
	}
}

export class SimpleDateFormat {
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

export class Queue <E> {
    list: E[];

    constructor() {
        this.list = [];
    }

    add(elem: E) : void {
        this.list.push(elem);
    }

    poll() : E {
        if (this.list.length == 0) return null;
        var res: E = this.list[0];
        this.list = this.list.slice(1);
        return res;
    }
}

export class LinkedList <E> extends Queue <E> {
}

export class HashMap <K, V>{
	/* the type of key must be either string or number */
	hash : {[key: string]: V};
	constructor() {
		this.hash = {};
	}
	put(key: K, value: V) : void {
		this.hash[String(key)] = value;
	}

	get(key: K) : V {
		return this.hash[String(key)];
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

	toArray() : V[] {
		var res: V[] = [];
		for (var key in Object.keys(this.hash)) {
			res.push(this.hash[key]);
		}
		return res;
	}
}

export class MessageDigest {
	digestString: string;
	constructor() {
		this.digestString = null;
	}

	digest() : string {
		return this.digestString;
	}
}

export class Lib {
	/* To be set on lib/md5.js */
	static md5 : (str: string) => string;

	/* Static Fields */
	static Input: string[] = [];
	static EmptyNodeList = new Array<GSNNode>();
	static LineFeed : string = "\n";
	static VersionDelim : string = "*=====";

	/* Methods */
	static GetMD5() : MessageDigest {
		return new MessageDigest();
	}

	static UpdateMD5(md: MessageDigest, text: string) : void {
		md.digestString = Lib.md5(text);
	}

	static EqualsDigest(digest1: string, digest2: string) : boolean {
		return digest1 == digest2;
	}

	static ReadFile(file: string) : string {
		return "";
	}

	static parseInt(numText: string) : number {
		return Number(numText);
	}

    static HexToDec(v: string) : number {
        return parseInt(v, 16);
    }

    static DecToHex(n: number) : string {
        return n.toString(16);
    }

    static String_startsWith(self: string, key: string) : boolean {
        return self.indexOf(key, 0) == 0;
    }

    static String_compareTo(self: string, anotherString: string): number {
        if (self < anotherString) {
            return -1;
        } else if (self > anotherString) {
            return 1;
        } else {
            return 0;
        }
    }

    static String_endsWith(self: string, key: string) : boolean {
        return self.lastIndexOf(key, 0) == 0;
    }

    static String_matches(self: string, str: string): boolean {
        return self.match(str) != null;
    }

    static Array_get(self: any[], index: number): any {
        if (index >= self.length) {
            throw new RangeError("invalid array index");
        }
        return self[index];
    }
    static Array_set(self: any[], index: number, value: any): void {
        self[index] = value;
    }
    static Array_add(self: any[], obj: any): void {
        self.push(obj);
    }
    static Array_add2(self: any[], index: number, obj: any): void {
        self.splice(index, 0, obj);
    }
    static Array_addAll(self: any[], obj: any): void {
        Array.prototype.push.apply(self, obj);
    }
    static Array_size(self: any[]): number {
        return self.length;
    }
    static Array_clear(self: any[]): void {
        self.length = 0;
    }
    static Array_remove(self: any[], index: any): any {
        if (typeof index == 'number') {
            if (index >= self.length) {
                throw new RangeError("invalid array index");
            }
        } else {
            var item = index;
            index = 0;
            for (var j in self) {
                if (self[j] === index) break;
            }
            if (j == self.length) return null;
        }
        var v = self[index];
        self.splice(index, 1);
        return v;
    }

    static Object_equals(self: any, obj: any) : boolean {
        return (self === obj);
    }

    static Object_InstanceOf(self: any, klass: any) : boolean {
        return (<any>self).constructor == klass;
    }
}

export class Iterator<T> {//FIX ME!!
}

//export interface Array<T> {
//        get(index: number): any;
//        set(index: number, value: any): void;
//        add(obj: any): void;
//        add(index: number, obj : any): void;
//        addAll(obj : any): void;
//        size(): number;
//        clear(): void;
//        remove(index: number): any;
//        remove(item: any): any;
//        iterator(): Iterator<Array>;
//}

Object.defineProperty(Array.prototype, "addAll", {
        enumerable : false,
        value : function(obj) {
			Array.prototype.push.apply(this, obj);
        }
});

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

export interface Object {
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

//export interface String {
//        compareTo(anotherString: string): number;
//        startsWith(key: string): boolean;
//        endsWith(key: string): boolean;
//        lastIndexOf(ch: number) : number;
//        indexOf(ch: number) : number;
//        substring(BeginIdx : number, EndIdx : number) : string;
//        matches(str : string) : boolean;
//}

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

Object.defineProperty(String.prototype, "matches", {
        enumerable : false,
        value : function(str) {
                return this.match(str) != null;
        }
});
