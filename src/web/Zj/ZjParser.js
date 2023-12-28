/*******************************************************************************

	   6 January MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

	    The authors disclaim copyright to this source code.

 ******************************************************************************/


class ZjParser {

static $(o) { return o; }

constructor(cb)
{
	this.end_cb = cb;
	this.pro_cb = new ZjCallback(this, ZjParser.pro_cb)
	this.tk = null;
	this.s = new ZjBuf(80);
	this.root_b = new ZjBuf(1);
	this.ast = new ZjAst(0, this.root_b, null);
	this.root = this.ast;
	this.ok = true;
	this.member = this.root;
}

dispose()
{
	this.ast.dispose();
	this.root_b.dispose();
	delete this;
}

reset()
{
	this.ast.dispose();
	this.ast = new ZjAst(this.root_b, 0, null);
	this.root = ast;
	this.ok = true;
}

log(d)
{
	this.s.from_string(d);
}

parse(tok)
{
	this.tk = tok;
	this.pro_cb.fork(null, null);
}

match(token, id, precedence, advance)
{
	token += "";
	let a = this.ast;
	if (advance) {
		this.advance();
	}
	if (token === "") {
		if (id !== this.tk.type) {
			return false;
		}
	} else {
		if (token !== this.tk.token.to_string()) {
			return false;
		}
	}

	
	switch (precedence) {
	case ZjT.CHILD:
		this.ast = this.ast.add_child(id, this.tk.token, 0);
		return true;
	}

	switch (id) {
	case ZjT.RIGHT_CURLY_BRACKET:
		while (a.parent !== null && a.id !== ZjT.LEFT_CURLY_BRACKET) {
			a = a.parent;
		}

		if (a.id !== ZjT.LEFT_CURLY_BRACKET) {
			this.log("unmatched }");
			return false;
		}
		this.ast = a;
		return true;
	case ZjT.RIGHT_SQUARE_BRACKET:
		while (a.parent !== null && a.id !== ZjT.LEFT_SQUARE_BRACKET) {
			a = a.parent;
		}

		if (a.id !== ZjT.LEFT_SQUARE_BRACKET) {
			this.log("unmatched ]");
			return false;
		}
		this.ast = a;
		return true;
	case ZjT.RIGHT_PARENTHESIS:
		while ((a.parent !== null) && (a.id !== ZjT.LEFT_PARENTHESIS)) {
			a = a.parent;
		}
		if (a.id !== ZjT.LEFT_PARENTHESIS) {
			this.log("unmatched ) ");
			return false;
		}
		this.ast = a;
		return true;
	}


	if (precedence > 0) {
		// 0xA = left to right
		// 0xB = right to left
		let to = precedence & 0x0F;
		let p = precedence & 0xFFF0;
		let a = this.ast;
		// FIXME cleanup!
		if ((a.preced <= 0x1000) && (a.preced > 0) && (a.parent.preced > 0)) {
			while ((a.parent.preced > 0)) {
				if ((a.parent.preced & 0x0F) === 0) {
					break;
				}
				if (to === ZjT.RTL) {
					if ((a.parent.preced & 0xFFF0) <= p) {
						break;
					}
				} else {
					if ((a.parent.preced & 0xFFF0) < p) {
						break;
					}
				}
				a = a.parent;
			}
		} else if ((to === ZjT.RTL) && (a.preced < 0x1000)) {
			this.ast = a.add(id, this.tk.token, precedence);
			return true;
		}
		if ((to === 0x00)) {
			this.ast = a.add(id, this.tk.token, precedence);
			return true;
		}
		this.ast = a.add_op(id, this.tk.token, precedence);
		return true;
	}
	this.ast = this.ast.add(id, this.tk.token, precedence);
	return true;
}

add_member(m)
{
	let s = new ZjBuf(8);
	s.from_string(m);
	this.ast = this.ast.add_child(ZjT.MEMBER, s, 0);
	this.member = this.ast;
	s.dispose();
}

add_child(id, m, p)
{
	let s = new ZjBuf(8);
	s.from_string(m);
	let r =  this.ast.add_child(id, s, p); 
	s.dispose();
	return r;
}

semicolon()
{
	while (this.ast.parent) {
		if (this.ast.id === ZjT.LEFT_CURLY_BRACKET ||
			this.ast.id === ZjT.LEFT_PARENTHESIS) {
			break;
		}
		this.ast = this.ast.parent;
	}
}

advance()
{
	if (this.tk.has_tokens()) {
		return this.tk.advance();
	}
	return null;
}

process()
{
	let n = 10;
	while (this.ok && this.tk.has_tokens()) {
		this.ast = this.root;
		let t = this.tk.advance();
		if (this.tk.type === 0) {
			break;
		}
		switch (t.to_string()) {
		case "include":
			break;
		case "class":
			if (!this.parse_class()) {
				this.ok = false;
			}
			this.ast = this.root;
			break;
		default:
			this.log("Unknown ");
			this.s.add(t);
			this.ok = false;
			break;
		}

		if (this.ok && n <= 0) {
			this.pro_cb.fork(null, null);
			return;
		}
	}

	if (!this.ok) {
		this.end_cb.set(404, this.s);
	} else {
		this.end_cb.set(200, this.s);
	}
	
	this.end_cb.exec(null, null);
}

static pro_cb(r, a, b)
{
	r.self.process();
}

parse_class()
{
	let z = false;
	z = this.match("class", ZjT.CLASS, ZjT.CHILD, false);
	let a = this.ast;
	z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, true);
	if (!z) {
		this.log("missing identifier");
		return false;
	}
	this.log("ok");
	this.advance();
	if (this.tk.token.to_string()  === "extends") {
		z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, true);
		if (!z) {
			this.log("missing identifier");
			return false;
		}
		this.advance();
	}
	this.ast = a;
	z = this.match("{", ZjT.LEFT_CURLY_BRACKET, ZjT.CHILD, false);
	if (!z) {
		this.log("missing {");
		return false;
	}
	let b = this.ast;
	this.advance();

	while (this.tk.type !== 0) {
		this.ast = b;
		z = this.match("}", ZjT.RIGHT_CURLY_BRACKET, 0, false);
		if (z) {
			return true;
		}
		z = this.class_static();
		if (!z) {
			z = this.class_method();
		}
		if (!z) {
			return false;
		}
	}
	this.log("missing } got ")
	this.s.add(this.tk.token.to_string());
	return false;
}

class_constant()
{
	let z = false;
	z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, true);
	if (!z) {
		this.log("missing identifier");
		return false;
	}
	
}
class_static()
{
	let z = false;
	if (this.tk.token.to_string() !== "static") {
		return false;
	}

	this.add_member("staticVarOrMethod");

	this.advance();
	if (this.tk.token.to_string() === "get") {
		this.member.id = ZjT.DEFINE;
		this.advance();
		return this.define_constant();
	}

	z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, false);
	if (!z) {
		this.log("missing identifier");
		return false;
	}
	
	let a = this.ast;
	a.preced = 0x1000;
	this.ast = this.member;
	z = this.match("(", ZjT.LEFT_PARENTHESIS, ZjT.CHILD, true);
	if (z) {
		this.member.id = ZjT.STATIC_METHOD;
		this.advance();
		return this.class_method_common();
	}

	this.member.id = ZjT.STATIC_VAR;
	this.ast = a;
	z = this.match("=", ZjT.ASSIGN, 0x02B, false);
	if (z) {
		this.advance();
		z = this.expression();
		if (!z) {
			return false;
		}
	}
	if (this.tk.token.to_string() === ";") {
		this.semicolon();
		this.advance();
		return true;
	}
	return false;
}

class_method()
{
	let z = false;
	let t = ZjT.METHOD;

	this.add_member("method");

	z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, false);
	if (!z) {
		this.log("missing identifier");
		return false;
	}
	if (this.tk.token.to_string()  === "constructor") {
		t = ZjT.CONSTRUCTOR;
	}
	let a = this.ast;
	this.ast = this.member;
	z = this.match("(", ZjT.LEFT_PARENTHESIS, ZjT.CHILD, true);
	if (z) {
		this.member.id = t;
		this.advance();
		return this.class_method_common();
	}
	this.log("missing ( in method declaration ");
	return false;
}

class_method_common()
{
	let z = false;
	z = this.parameter_list();
	if (!z) {
		return false;
	}
	z = this.match(")", ZjT.RIGHT_PARENTHESIS, 0, false);
	if (!z) {
		return false;
	}
	this.ast = this.member;
	z = this.match("{", ZjT.LEFT_CURLY_BRACKET, ZjT.CHILD, true);
	if (!z) {
		return false;
	}
	this.advance();
	z = this.method_body();
	if (!z) {
		return false;
	}
	z = this.match("}", ZjT.RIGHT_CURLY_BRACKET, 0, false);
	if (!z) {
		return false;
	}
	this.advance();
	return true;
}

define_constant()
{
	let z = false;
	z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, false);
	if (!z) {
		this.log("missing identifier");
		return false;
	}
	this.advance();
	if (this.tk.token.to_string() !== "(") {
		return false;
	}
	this.advance();
	if (this.tk.token.to_string() !== ")") {
		return false;
	}
	this.advance();
	if (this.tk.token.to_string() !== "{") {
		return false;
	}
	this.advance();
	if (this.tk.token.to_string() !== "return") {
		return false;
	}
	this.advance();
	if (!this.constant()) {
		return false;
	}
	if (this.tk.token.to_string() !== ";") {
		return false;
	}
	this.advance();
	if (this.tk.token.to_string() !== "}") {
		return false;
	}
	this.advance();
	return true;
}

method_body()
{
	let z = true;
	while (z) {
		z = this.statement();
		if (!z) {
			return true;
		}
	}
	return true;
}

statement()
{
	let z = true;
	let a = this.ast;

	switch (this.tk.token.to_string()) {
	case "if":
		this.match("if", ZjT.IF, ZjT.CHILD, false);
		this.advance();
		z = this.if_statement();
		break;
	case "switch":
		this.match("switch", ZjT.SWITCH, ZjT.CHILD, false);
		this.advance();
		z = this.switch_statement();
		break;
	case "for":
		this.match("for", ZjT.FOR, ZjT.CHILD, false);
		this.advance();
		z = this.for_statement();
		break;
	case "while":
		this.match("while", ZjT.WHILE, ZjT.CHILD, false);
		this.advance();
		z = this.while_statement();
		break;
	case "do":
		this.match("do", ZjT.DO, ZjT.CHILD, false);
		this.advance();
		z = this.do_statement();
		break;
	case "let":
		this.match("let", ZjT.LET, ZjT.CHILD, false);
		this.advance();
		z = this.let_statement();
		break;
	case "return":
		this.match("return", ZjT.RETURN, ZjT.CHILD, false);
		this.advance();
		z = this.return_statement();
		break;
	case "}":
		z = false;
		break;
	case "case":
		this.ast = this.add_child(ZjT.CASE, "case", 0);
		this.advance();
		z = this.expression();
		if (!z) {
			this.log("missing case expression");
			return false;
		}
		if (this.tk.token.to_string()  !== ":") {
			this.log("missing : ");
			return false;
		}
		this.advance();
		z = true;
		break;
	case "default":
		this.ast = this.add_child(ZjT.DEFAULT, "default", 0);
		this.advance();
		if (this.tk.token.to_string()  !== ":") {
			this.log("missing : ");
			return false;
		}
		this.advance();
		z = true;
		break;
	case "break":
		this.ast = this.add_child(ZjT.BREAK, "break", 0);
		this.advance();
		if (this.tk.token.to_string()  !== ";") {
			this.log("missing ; ");
			return false;
		}
		this.advance();
		z = true;
		break;
	case "continue":
		this.ast = this.add_child(ZjT.CONTINUE, "continue", 0);
		this.advance();
		if (this.tk.token.to_string()  !== ";") {
			this.log("missing ; ");
			return false;
		}
		this.advance();
		z = true;
		break;
	default:
		this.ast = this.add_child(ZjT.STATEMENT, "stmt", 0);
		z = this.expression_statement();
		break;
	}
	this.ast = a;
	return z;
}

parameter_list()
{
	let a = this.ast;
	let z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, false);
	if (!z) {
		if (this.tk.token.to_string() !== ")") {
			return false;
		} else {

			return true;
		}
	}
	while (z) {
		this.advance();
		if (this.tk.token.to_string() !== ",") {
			if (this.tk.token.to_string() !== ")") {
				return false;
			} else {
				return true;
			}
		}
		this.ast = a;
		z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, true);
		if (!z) {
			this.log("missing identifier");
			return false;
		}
	}
	return false;
}

if_statement()
{
	let a = this.ast;
	let z = this.match("(", ZjT.LEFT_PARENTHESIS, ZjT.CHILD, false);
	if (!z) {
		this.log("missing parenthesis");
		return false;
	}
	this.advance();
	z = this.expression();
	if (!z) {
		this.log("missing expression");
		return -1;
	}

	if (this.tk.token.to_string() !== ")") {
		this.log("expected ')'");
		return false;
	}
	this.ast = a;
	this.advance();
	z = this.body_state();
	if (!z) {
		return false;
	}
	if (this.tk.token.to_string() === "else") {
		this.ast = a;
		this.match("else", ZjT.ELSE, ZjT.CHILD, false);
		this.advance();
		if (this.tk.token.to_string() === "if") {
			this.match("if", ZjT.IF, ZjT.CHILD, false);
			this.advance();
			return this.if_statement();
		}
		return this.body_state();
	}
	return z;
}

body_state()
{
	let z = this.match("{", ZjT.LEFT_CURLY_BRACKET, ZjT.CHILD, false);
	if (!z) {
		this.log("missing {");
		return false;
	}
	this.advance();
	z = true;
	while (z) {
		z = this.statement(); // RECURSION
		if (!z) {
			break;
		}
	}

	if (this.tk.token.to_string() !== "}") {
		this.log("missing }");
		return false;
	}
	this.advance();
	return true;
}

switch_statement()
{
	let a = this.ast;
	let z = this.match("(", ZjT.LEFT_PARENTHESIS, ZjT.CHILD, false);
	if (!z) {
		this.log("missing parenthesis");
		return false;
	}
	this.advance();
	z = this.expression();
	if (!z) {
		this.log("missing expression");
		return -1;
	}
	if (this.tk.token.to_string() !== ")") {
		this.log("expected ')'");
		return false;
	}
	this.ast = a;
	this.advance();
	z = this.body_state();
	if (!z) {
		return false;
	}
	return true;
}

for_statement()
{
	let a = this.ast;
	let z = this.match("(", ZjT.LEFT_PARENTHESIS, ZjT.CHILD, false);
	if (!z) {
		this.log("missing parenthesis");
		return false;
	}
	let b = this.ast;

	this.advance();
	this.ast = this.add_child(ZjT.INITIALIZATION, "init", 0);
	z = this.expression();
	if (!z && this.tk.token.to_string() !== ";") {
		this.log("missing for initialization");
	}
	if (this.tk.token.to_string() !== ";") {
		this.log("missing ; ");
		return false;
	}

	this.ast = b;
	this.advance();
	this.ast = this.add_child(ZjT.CONDITION, "cond", 0);
	z = this.expression();
	if (!z && this.tk.token.to_string() !== ";") {
		this.log("missing for condition");
	}
	if (this.tk.token.to_string() !== ";") {
		this.log("missing ; ");
		return false;
	}

	this.ast = b;
	this.advance();
	this.ast = this.add_child(ZjT.ENDOFLOOP, "end", 0);
	z = this.expression();
	if (!z && this.tk.token.to_string() != ")") {
		this.log("missing for expression");
		return false;
	}

	if (this.tk.token.to_string() !== ")") {
		this.log("expected ')'");
		return false;
	}
	this.ast = a;
	this.advance();
	z = this.body_state();
	return z;
}

while_statement()
{
	let a = this.ast;
	let z = this.match("(", ZjT.LEFT_PARENTHESIS, ZjT.CHILD, false);
	if (!z) {
		this.log("missing parenthesis");
		return false;
	}
	this.advance();
	z = this.expression();
	if (!z) {
		this.log("missing expression");
	}
	if (this.tk.token.to_string() !== ")") {
		this.log("expected ')'");
		return false;
	}
	this.ast = a;
	this.advance();
	z = this.body_state();
	return z;
}

do_statement()
{
	let a = this.ast;
	let z = this.body_state();
	if (!z) {
		this.log("missing do body");
		return false;
	}
	this.ast = a;
	z = this.match("while", ZjT.WHILE, ZjT.CHILD, false);

	if (!z) {
		this.log("missing while keyword");
		return false;
	}
	z = this.match("(", ZjT.LEFT_PARENTHESIS, ZjT.CHILD, true);
	if (!z) {
		this.log("missing parenthesis");
		return false;
	}
	this.advance();
	z = this.expression();
	if (!z) {
		this.log("missing expression");
	}
	if (this.tk.token.to_string() !== ")") {
		this.log("expected ')'");
		return false;
	}
	this.advance();
	if (this.tk.token.to_string() !== ";") {
		this.log("missing ; ");
		return false;
	}
	this.advance();
	return z;
}

let_statement()
{
	let z = true;
	while (z) {
		z = this.var_assign();
		if (this.tk.token.to_string() === ";") {
			this.advance();
			return true;
		}
		z = this.match(",", ZjT.COMMA, 0x01A, false);
		if (!z) {
			return true;
		}
		this.advance();
	}

	return false;
}

return_statement()
{
	this.expression();
	if (this.tk.token.to_string()  === ";") {
		this.advance();
		return true;
	}
	return false;
}

var_assign()
{
	let z = false;
	z = this.match("", ZjT.IDENTIFIER, ZjT.CHILD, false);
	if (!z) {
		this.log("missing identifier");
		return false;
	}
	this.ast.preced = 0x1000;
	this.advance();
	if (this.tk.token.to_string() === ";") {
		return false;
	}
	z = this.assign_op();
	if (!z) {
		this.log("missing assignment op");
		return false;
	}
	z = this.expression();
	if (!z) {
		return false;
	}
	return true;
}

expression_statement()
{
	/*
	expressionStatement: assignTerm ';'
    | postfixTerm ';'
    | prefixTerm ';'
    | callTerm ';'*/
	let z = false;

	z = this.expression();
	if (!z) {
		return false;
	}
	if (this.tk.token.to_string() !== ";") {
		this.log("missing ; ");
		return false;
	}
	this.advance();
	return true;
}

expression()
{
	// TODO:
	if (this.tk.token.to_string()  === ";") {
		return true;
	}
	if (this.tk.token.to_string()  === ":") {
		return true;
	}
	let z = this.term();
	if (!z) {
		return false;
	}
	while (z) {
		z = this.op();
		if (z) {
			z = this.term();
		}
	}
	return true;
}


term()
{
	let z = false;
	z = this.match("(", ZjT.LEFT_PARENTHESIS, 0x190, false);
	if (z) {
		this.advance();
		z = this.expression(); // RECURSION
		if (!z) {
			this.log("missing expression");
			return false;
		}
		z = this.match(")", ZjT.RIGHT_PARENTHESIS, 0x19B, false);
		if (!z) {
			this.log(") expected...");
			return false;
		}
		this.advance();
		this.postfix_op();
		return true;
	}


	if (this.unary_op()) {
		return this.term(); // RECURSION
	}
	if (this.prefix_op()) {
		return this.term(); // RECURSION
	}
	if (this.constant()) {
		return true;
	}
	z = this.expression_name(); // RECURSION
	if (z) {
		this.postfix_op();
		return true;
	}
	return false;
}

constant()
{
	let z = false;
	let t = 0;
	switch (this.tk.type) {
	case ZjT.INTEGER:
	case ZjT.STRING:
	case ZjT.QUOTE:
		this.ast = this.ast.add(this.tk.type, this.tk.token, 0x1000);
		this.advance();
		return true;
	case ZjT.IDENTIFIER:
		switch (this.tk.token.to_string()) {
		case "null":
			t = ZjT.NULL;
			break;
		case "true":
			t = ZjT.TRUE;
			break;
		case "false":
			t = ZjT.FALSE;
			break;
		default:
			return false;
		}
		this.ast = this.ast.add(t, this.tk.token, 0x1000);
		this.advance();
		return true;
	}
	return false;
}

expression_name()
{
	let z = true;
	if (this.tk.type !== ZjT.IDENTIFIER) {
		return false;
	}
	this.ast = this.ast.add(this.tk.type, this.tk.token, 0x1000);
	let a = this.ast;
	this.advance();
	while (z) {
		this.ast = a;
		switch (this.tk.token.to_string() ) {
			case ".":
				z = this.match(".", ZjT.DOT, ZjT.CHILD, false);
				a = this.ast;
				this.advance();
				return this.expression_name(); // RECURSION
			case "[":
				z = this.match("[", ZjT.LEFT_SQUARE_BRACKET, ZjT.CHILD, false);
				a = this.ast;
				this.advance();
				z = this.expression(); // RECURSION
				if (!z) {
					this.log("Expression expected");
					return false;
				}
				if (this.tk.token.to_string() !== "]") {
					this.log("Misssing ]");
					return false;
				}
				this.advance();
				break;
			case "(":
				z = this.match("(", ZjT.LEFT_PARENTHESIS, ZjT.CHILD, false);
				a = this.ast;
				this.advance();
				if (this.tk.token.to_string() !== ")") {
					z = this.expression(); // RECURSION
					if (!z) {
						this.log("Expression list expected");
						return false;
					}
					//while (this.tk.token.to_string()  == ",") {

					//}
					if (this.tk.token.to_string() !== ")") {
						this.log("Misssing )");
						return false;
					}
				}
				this.advance();
				break;
		}
		switch (this.tk.token.to_string() ) {
		case "[":
		case '.':
			continue;
		}
		return true;
	}
	return false;
}

op()
{
	let t = 0;
	let p = 0x001A;
	if (this.assign_op()) {
		return true;
	}
	switch (this.tk.token.to_string()) {
	case "+":
		p = 0x12A;
		t = ZjT.ADDITION;
		break;
	case "-":
		t = ZjT.SUBTRACTION;
		p = 0x12A;
		break;
	case "*":
		t = ZjT.MULTIPLICATION;
		p = 0x13A;
		break;
	case "/":
		t = ZjT.DIVISION;
		p = 0x13A;
		break;
	case "%":
		t = ZjT.REMAINDER;
		p = 0x13A;
		break;
	case "**":
		t = ZjT.EXPONENTIATION;
		p = 0x14B;
		break;
	case ",":
		t = ZjT.COMMA;
		p = 0x01A;
		break;
	case "<<":
		t = ZjT.LEFT_SHIFT;
		p = 0x11A;
		break;
	case ">>":
		t = ZjT.RIGHT_SHIFT;
		p = 0x11A;
		break;
	case ">>>":
		t = ZjT.UNSIGNED_RIGHT_SHIFT;
		p = 0x11A;
		break;
	case ">":
		t = ZjT.GREATER_THAN;
		p = 0x10A;
		break;
	case ">=":
		t = ZjT.GREATER_THAN_OR_EQUAL;
		p = 0x10A;
		break;
	case "<":
		t = ZjT.LESS_THAN;
		p = 0x10A;
		break;
	case "<=":
		t = ZjT.LESS_THAN_OR_EQUAL;
		p = 0x10A;
		break;
	case "==":
		t = ZjT.EQUALITY;
		p = 0x09A;
		break;
	case "!=":
		t = ZjT.INEQUALITY;
		p = 0x09A;
		break;
	case "===":
		t = ZjT.STRICT_EQUALITY;
		p = 0x09A;
		break;
	case "!==":
		t = ZjT.STRICT_INEQUALITY;
		p = 0x09A;
		break;
	case "&":
		t = ZjT.BITWISE_AND;
		p = 0x08A;
		break;
	case "^":
		t = ZjT.BITWISE_XOR;
		p = 0x07A;
		break;
	case "|":
		t = ZjT.BITWISE_OR;
		p = 0x06A;
		break;
	case "&&":
		t = ZjT.LOGICAL_AND;
		p = 0x05A;
		break;
	case "||":
		t = ZjT.LOGICAL_OR;
		p = 0x04A;
		break;
	case "??":
		t = ZjT.NULLISH_COALESCING_OP;
		p = 0x04A;
		break;
	case "?":
		t = ZjT.CONDITIONAL_OP;
		p = 0x03A;
		break;
	case ":":
		t = ZjT.CONDITIONAL_ELSE;
		p = 0x03A;
		// FIXME : must match the ?
		return false;
		break;
	default:
		return false;
	}
	this.match(this.tk.token.to_string(), t, p, false);
	this.advance();
	return true;
}


postfix_op()
{
	let t = 0;
	let p = 0x0160;
	switch (this.tk.token.to_string()) {
	case "++":
		t = ZjT.POSTFIX_INCREMENT;
		break;
	case "--":
		t = ZjT.POSTFIX_DECREMENT;
		break;
	default:
		return false;
	}
	this.match(this.tk.token.to_string() , t, p, false);
	this.advance();
	return true;
}

prefix_op()
{
	let t = 0;
	let p = 0x015B;
	switch (this.tk.token.to_string() ) {
	case "++":
		t = ZjT.PREFIX_INCREMENT;
		break;
	case "--":
		t = ZjT.PREFIX_DECREMENT;
		break;
	default:
		return false;
	}
	this.match(this.tk.token.to_string() , t, p, false);
	this.advance();
	return true;
}

unary_op()
{
	let t = 0;
	let p = 0x015B;
	switch (this.tk.token.to_string()) {
	case "+":
		t = ZjT.UNARY_PLUS;
		break;
	case "-":
		t = ZjT.UNARY_NEGATION;
		break;
	case "!":
		t = ZjT.LOGICAL_NOT;
		break;
	case "~":
		t = ZjT.BITWISE_NOT;
		break;
	default:
		return false;
	}
	this.match(this.tk.token.to_string() , t, p, false);
	this.advance();
	return true;
}

assign_op()
{
	let t = 0;
	let p = 0x002B;
	switch (this.tk.token.to_string()) {
	case "=":
		t = ZjT.ASSIGN;
		break;
	case "|=":
		t = ZjT.ASSIGN_BITWISE_OR;
		break;
	case "^=":
		t = ZjT.ASSIGN_BITWISE_XOR;
		break;
	case "&=":
		t = ZjT.ASSIGN_BITWISE_AND;
		break;
	case "%=":
		t = ZjT.ASSIGN_REMAINDER;
		break;
	case "/=":
		t = ZjT.ASSIGN_DIVISION;
		break;
	case "*=":
		t = ZjT.ASSIGN_MULTIPLICATION;
		break;
	case "-=":
		t = ZjT.ASSIGN_SUBTRACTION;
		break;
	case "+=":
		t = ZjT.ASSIGN_ADDITION;
		break;
	case "??=":
		t = ZjT.ASSIGN_NULLISH_COALESCING_OP;
		break;
	case "||=":
		t = ZjT.ASSIGN_LOGICAL_OR;
		break;
	case "&&=":
		t = ZjT.ASSIGN_LOGICAL_AND;
	case ">>=":
		t = ZjT.ASSIGN_RIGHT_SHIFT;
		break;
	case "<<=":
		t = ZjT.ASSIGN_LEFT_SHIFT;
		break;
	case "**=":
		t = ZjT.ASSIGN_EXPONENTIATION;
		break;
	case ">>>=":
		t = ZjT.ASSIGN_UNSIGNED_RIGHT_SHIFT;
		break;
	default:
		return false;
	}
	this.match(this.tk.token.to_string(), t, p, false);
	this.advance();
	return true;
}

}