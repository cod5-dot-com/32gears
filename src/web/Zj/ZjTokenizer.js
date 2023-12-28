/*******************************************************************************

	    3 January MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

	    The authors disclaim copyright to this source code.

 ******************************************************************************/
class ZjT {
static get CHILD() {return -2}
static get LTR() {return 0xA;}// 0xA = left to right
static get RTL() {return 0xB;}// 0xB = right to left

static get STRING() {return 1;}
static get QUOTE() {return 2;}
static get INTEGER() {return 3;}
static get FLOAT() {return 4;}
static get OP() {return 5;}
static get IDENTIFIER() {return 6;}
static get PUNCTUATION() {return 7;}
static get LEFT_CURLY_BRACKET() {return 8;}
static get RIGHT_CURLY_BRACKET() {return 9;}
static get LEFT_PARENTHESIS() {return 10;}
static get RIGHT_PARENTHESIS() {return 11;}
static get LEFT_SQUARE_BRACKET() {return 12;}
static get RIGHT_SQUARE_BRACKET() {return 13;}
static get SEMICOLON() {return 14;}
static get RETURN() {return 15;}
static get STATIC() {return 16;}
static get ASSIGN() {return 17;}
static get EQUAL() {return 18;}
static get STATIC_METHOD() {return 19;}
static get STATIC_VAR() {return 20;}
static get COMMA() {return 21;}
static get IF() {return 22;}
static get ELSE() {return 23;}
static get SWITCH() {return 24;}
static get FOR() {return 25;}
static get WHILE() {return 26;}
static get DO() {return 27;}
static get LET() {return 28;}
static get POSTFIX_DECREMENT() {return 29;}
static get POSTFIX_INCREMENT() {return 30;}
static get PREFIX_DECREMENT() {return 31;}
static get PREFIX_INCREMENT() {return 32;}
static get CLASS() {return 33;}
static get METHOD() {return 34;}
static get MEMBER() {return 35;}
static get EXPRESSION() {return 36;}
static get STATEMENT() {return 37;}
static get ADDITION() {return 38;}
static get SUBTRACTION() {return 39;}
static get MULTIPLICATION() {return 40;}
static get DIVISION() {return 41;}
static get REMAINDER() {return 42;}
static get LOGICAL_NOT() {return 43;}
static get BITWISE_NOT() {return 44;}
static get UNARY_PLUS() {return 45;}
static get UNARY_NEGATION() {return 46;}
static get LEFT_SHIFT() {return 47;}
static get RIGHT_SHIFT() {return 48;}
static get UNSIGNED_RIGHT_SHIFT() {return 49;}
static get LESS_THAN() {return 50;}
static get LESS_THAN_OR_EQUAL() {return 51;}
static get GREATER_THAN() {return 52;}
static get GREATER_THAN_OR_EQUAL() {return 53;}
static get EQUALITY() {return 54;}
static get INEQUALITY() {return 55;}
static get STRICT_EQUALITY() {return 56;}
static get STRICT_INEQUALITY() {return 57;}
static get BITWISE_AND() {return 58;}
static get BITWISE_OR() {return 59;}
static get BITWISE_XOR() {return 60;}
static get LOGICAL_AND() {return 61;}
static get LOGICAL_OR() {return 62;}
static get NULLISH_COALESCING_OP() {return 63;}
static get CONDITIONAL_OP() {return 64;}
static get CONDITIONAL_ELSE() {return 65;}
static get ASSIGN_BITWISE_OR() {return 66;}
static get ASSIGN_BITWISE_XOR() {return 67;}
static get ASSIGN_BITWISE_AND() {return 68;}
static get ASSIGN_LEFT_SHIFT() {return 69;}
static get ASSIGN_RIGHT_SHIFT() {return 70;}
static get ASSIGN_UNSIGNED_RIGHT_SHIFT() {return 71;}
static get EXPONENTIATION() {return 72;}
static get ASSIGN_EXPONENTIATION() {return 73;}
static get ASSIGN_LOGICAL_AND() {return 74;}
static get ASSIGN_LOGICAL_OR() {return 75;}
static get ASSIGN_NULLISH_COALESCING_OP() {return 76;}
static get ASSIGN_ADDITION() {return 77;}
static get ASSIGN_SUBTRACTION() {return 78;}
static get ASSIGN_MULTIPLICATION() {return 79;}
static get ASSIGN_DIVISION() {return 80;}
static get ASSIGN_REMAINDER() {return 81;}
static get NEW_WITH_ARGUMENTS() {return 82;}
static get NEW() {return 83;}
static get TYPEOF() {return 84;}
static get VOID() {return 85;}
static get AWAIT() {return 86;}
static get DELETE() {return 87;}
static get IN() {return 88;}
static get INSTANCEOF() {return 89;}
static get YIELD() {return 90;}
static get YIELD_STAR() {return 91;}
static get NULL() {return 92;}
static get TRUE() {return 93;}
static get FALSE() {return 94;}
static get INITIALIZATION() {return 95;}
static get CONDITION() {return 96;}
static get ENDOFLOOP() {return 97;}
static get CONTINUE() {return 98;}
static get BREAK() {return 99;}
static get DEFAULT() {return 100;}
static get CASE() {return 101;}
static get DOT() {return 102;}
static get CONSTRUCTOR() {return 103;}
static get DEFINE() {return 104;}
static get END_OF_NODE() {return 105;}
}

class ZjTokenizer {

static $(o) { return o; }

constructor(cb)
{
	this.cb = cb;
	this.open_cb = new ZjCallback(this, ZjTokenizer.open_cb);
	this.buffer = new ZjBuf(1);
	this.token = new ZjBuf(80);
	this.index = 0;
	this.len = 0;
	this.type = 0;
	this.tmp = new ZjBuf(6);
}

dispose()
{
	this.open_cb.dispose();
	delete this;
}

log(s)
{
	this.cb.response.from_string(s);
	this.cb.status = 102;
	this.cb.exec(null, null);
}

reset()
{

}

open(file)
{
	Fs.read(file, -1, -1, this.open_cb);
}

static open_cb(r, a, b)
{
	
	if (r.status === 200) {
		delete r.self.buffer;
		r.self.buffer = r.response;
		r.self.len = r.self.buffer.length;
		r.self.index = 0;
	} else if (r.status === 102) {

	} else {

	}
	r.self.cb.set(r.status, r.response);
	r.self.cb.fork(null, null);
	//r.self.cb.exec(null, null);
}

skip_spaces()
{

	let i = this.index;
	let l = this.len;
	let b = this.buffer;
	let tmp = this.tmp;
	while (i < l) {
		switch (tmp.substr(b, i, 1)) {
		case " ":
		case "\n":
		case "\r":
		case "\t":
			i += tmp.length;
			break;
		default:
			l = -1;
			break;
		}
	}
	this.index = i;
}

has_tokens()
{
	this.skip_spaces();
	let tmp = this.tmp;
	let b = this.buffer;
	let c = "";
	let i = this.index;
	let l = this.len;
	while (i < this.len) {
		if (!tmp.strncmp(b, i, "/", 1)) {
			let ok = false;
			i = i + 2;
			switch (tmp.substr(b, i - 1, 1)) {
			case "/":
				while (i < l) {
					c = tmp.substr(b, i, 1);
					if (c === "\n"|| c === "\r") {
						break;
					}
					i += tmp.length;
				}
				break;
			case "*":
				while (i < l + 1) {
					if (!tmp.strncmp(b, i, "*", 1)) {
						if (!tmp.strncmp(b, i + 1,
							"/", 1)) 
						{
							i += 2;
							ok = true;
							break;
						}
					}
					i += tmp.length;
				}
				if (!ok) {
					this.log("Comment toward end of file.");
					return false;
				}
				break;
			default:
				return true;
			}
			this.index = i;
			this.skip_spaces();
		} else {
			return true;
		}
	}
	return false;
}

advance()
{
	this.token.clear();
	this.type = 0;
	if (this.index >= this.len) {	
		return this.token;
	}
	let i = this.index;
	let l = this.len;
	let t = this.token;
	let b = this.buffer;
	let c = "";
	let tmp = this.tmp;

	let single_quote = false;
	let double_quote = false;
	let escape = false;
	let floating = false;
	let decimal = false;
	let hexa = false;
	let identifier = false;
	let dot = false;
	let ll = 0;

	while (i < l) {
		c = tmp.substr(b, i, 1);

		if (double_quote || single_quote) {
			if (escape) {
				escape = false;
				switch (c) {
				 // FIXME
				case "0":
					tmp.clear();
					tmp.from_string("\0");
					break;

				case "n":
					tmp.clear();
					tmp.from_string("\n");
					break;
				case "r":
					tmp.clear();
					tmp.from_string("\r");
					break;
				case "t":
					tmp.clear();
					tmp.from_string("\t");
					break;
				}
			} else {
				switch (c) {
				case "\\":
					escape = true;
					i++;
					continue;
				case "\"":
					if (double_quote) {
						l = -1;
						i++;
					}
					break;
				case "'":
					if (single_quote) {
						l = -1;
						i++;
					}
					break;
				}
			}
		} else if (decimal || floating || hexa) {
			if (c >= "0" && c <= "9") {

			} else if ((c === "x" || c === "X") 
				&& t.to_string() === "0") 
			{
				decimal = false;
				hexa = true;
				this.type = ZjT.INTEGER;
			} else if (decimal && c === ".") {
				floating = true;
				decimal = false;
				this.type = ZjT.FLOAT;
			} else if (hexa &&
				((c >= "a" && c <= "f")
					|| (c >= "A" && c <= "F"))) 
			{
				//
			} else if (floating && (
				c === "E" || c === "e" || c === "-")) 
			{
				//
			} else {
				l = -1;
			}
		} else if (dot) {
			if (c >= "0" && c <= "9") {
				dot = false;
				floating = true;
				this.type = ZjT.FLOAT;
			} else {
				l = -1;
			}
		} else if (identifier) {
			if ((c >= "0" && c <= "9")
				|| (c >= "a" && c <= "z")
				|| (c >= "A" && c <= "Z")
				|| c === "_" || c === "$") {
			} else if (c === "*" && t.to_string() === "yield") {
			} else {
				l = -1;
			}
		} else if (ll === 1) {
			switch (t.to_string()) {
			case "=":
				if (c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "?":
				if (c !== "?") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "|":
				if (c !== "|" && c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "^":
				if (c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "&":
				if (c !== "&" && c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case ">":
				if (c !== ">" && c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "<":
				if (c !== "<" && c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "-":
				if (c !== "-" && c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "+":
				if (c !== "+" && c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "%":
				if (c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "/":
				if (c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "*":
				if (c !== "*") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "~":
			case "!":
				if (c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			}
		} else if (ll === 2) {
			switch (t.to_string()) {
			case "|=":
			case "^=":
			case "&=":
			case "%=":
			case "/=":
			case "*=":
			case "-=":
			case "+=":
			case "--":
			case "++":
			case ">=":
			case "<=":
				l = -1;
				this.type = ZjT.OP;
				break;
			case ">>":
				if (c !== "=" && c !== ">") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "??":
			case "||":
			case "&&":
			case "!=":
			case "<<":
			case "**":
			case "==":
				if (c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			}
		} else if (ll === 3) {
			switch (t.to_string()) {
			case ">>>":
				if (c !== "=") {
					l = -1;
					this.type = ZjT.OP;
				}
				break;
			case "??=":
			case "||=":
			case "&&=":
			case ">>=":
			case "<<=":
			case "**=":
			case "!==":
			case "===":
				l = -1;
				this.type = ZjT.OP;
				break;
			}
		} else if (ll === 4) {
			switch (t.to_string()) {
			case ">>>=":
				this.type = ZjT.OP;
				break;
			}
		} else {
			switch (c) {
			case "\"":
				double_quote = true;
				this.type = ZjT.STRING;
				i++;
				continue;
			case "'":
				single_quote = true;
				this.type = ZjT.QUOTE;
				i++;
				continue;
			case " ":
			case "\n":
			case "\r":
			case "\t":
				l = -1;
				break;
			case ".":
				dot = true;
				break;
			case "~":
				this.type = ZjT.OP;
				t.add(tmp);
				i++;
				l = -1;
				break;
			case ",":
			case ";":
			case ":":
			case "(":
			case ")":
			case "{":
			case "}":
			case "[":
			case "]":
				t.add(tmp);
				i++;
				l = -1;
				this.type = ZjT.PUNCTUATION;
				break;
			default:
				if (c >= "0" && c <= "9") {
					decimal = true;
					this.type = ZjT.INTEGER;
				} else if ((c >= "a" && c <= "z")
					|| (c >= "A" && c <= "Z")
					|| c === "_" || c === "$") {
					this.type = ZjT.IDENTIFIER;
					identifier = true;
				}
				break;
			}
		}
		if (l > 0) {
			t.add(tmp);
			i += tmp.length;
			ll = t.length;
		}
	}

	this.index = i;
	this.token = t;
	//this.token.to_string();
	return this.token;
}


get_token()
{
	return this.token;
}

get_type()
{
	return this.type;
}

}
