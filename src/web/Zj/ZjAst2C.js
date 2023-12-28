class ZjAst2C {

static $(o) { return o; }

constructor(complete_cb)
{
	this.s = new ZjBuf(80);
	this.dst = new ZjBuf(8);
	this.hbuf = new ZjBuf(1024);
	this.cbuf = new ZjBuf(1024);
	this.cb = complete_cb;
	this.write_cb = new ZjCallback(this, ZjAst2C.write_cb);
	this.process_cb = new ZjCallback(this, ZjAst2C.process_cb);
	this.ctx = new ZjContext(null);

	this.t_class_name = ZjAst.$(null);
	this.t_extends = ZjAst.$(null);
	this.b_class_members = new ZjBuf(1024);
	this.t_method_name = ZjAst.$(null);
	this.b_method_body = new ZjBuf(1024);;
	this.f_in_body = 0;
	this.error = 0;
}

dispose()
{
	delete this;
}

ident(level)
{
	while (level > 0) {
		level--;
		this.log("  ");
	}
}

log(t)
{
	this.s.from_string(t);
}

add(data)
{
	this.hbuf.from_string(data);
}

zadd(data)
{
	this.hbuf.add(data);
}


addc(data)
{
	this.cbuf.from_string(data);
}

zaddc(data)
{
	this.cbuf.add(data);
}


run(ast, dst)
{
	this.s.clear();
	this.dst.clear();
	this.dst.add(dst);
	this.add("// ");
	this.add(dst.to_string());
	this.add("\n");
//	this.cb.set(200, this.s);
//	this.cb.exec(null, null);

	this.add("#include <stdlib.h>\n");
	this.add("#include <stdio.h>\n");
	this.add("union var__ {int i; void *p; char *s; union var__ (*f)();};\n");
	this.add("struct cb__ {union var__ self; int (*fu)();};\n");
	this.add("#define var union var__\n");
	this.add("struct console__proto__ { var prototype; var log; };");
	this.add("struct console { var prototype; };");
	this.add("extern struct console__proto__ console__proto__;");
	this.add("extern struct console *console;");
	this.process(ast, 0);
	//this.head(ast);
	//this.body(ast);
	this.zadd(this.cbuf);
	this.cbuf.clear();
	this.add("struct console *console;\n");
	this.add("struct console__proto__ console__proto__;");
	this.add("static var console__log(var __this, char *b) {");
	this.add("puts(b);");
	this.add("return (var)0;}\n");
	this.add("int main(int argc, char *argv[]) {");
	this.add("console = malloc(sizeof(struct console));");
	this.add("console->prototype = &console__proto__;");
	this.add("console__proto__.prototype.p = null;");
	this.add("console__proto__.log.f = console__log;");
	this.add("return Main__main().i;");
	this.add("}\n");
	this.dst.from_string(".c");
	this.add("/* ");
	this.zadd(this.s);
	this.add(" */");
	Fs.write(this.dst, this.hbuf, -1, -1, this.write_cb);
}

fatal(ast, txt)
{
	this.error = 100;
	this.cbuf.clear();
	this.hbuf.clear();
	this.add("\nFATAL: ");
	this.add(txt);
	this.add("\n\n");
	this.add(txt);
	return -1;
}

static write_cb(r, a, b)
{
	
	if (r.status === 200) {
		
	} else if (r.status === 102) {

	} else {

	}
	r.self.cb.set(r.status, r.self.hbuf);
	r.self.cb.fork(null, null);
	//r.self.cb.exec(null, null);
}

class_def(ast, level)
{
	this.add("struct ");
	this.zadd(this.t_class_name);
	this.add("__class {");
	if (this.t_extends) { // TODO
		this.add(" // extends ");
		this.add(this.t_extends);
	}
	this.add("\n");
	if (this.b_class_members.length <= 0) {
		this.add("\tvar dummy;\n");
	} else {
		this.zadd(this.b_class_members);
	}
	this.add("};\n");
}

method(ast, level)
{
	let n = 0;
	let a = ast.child;
	this.addc("var ");
	this.zaddc(this.t_class_name);
	this.addc("__");
	this.zaddc(this.t_method_name);
	this.addc("(");
	if (ast.id != ZjT.STATIC_METHOD) {
		this.addc("var self");
		n++;
	}
	if (a != null) {
		a = a.next;
	}
	if (a != null && a.id == ZjT.LEFT_PARENTHESIS) {
		a = a.child;
		while (a) {
			if (n > 0) {
				this.addc(", var ");
			} else {
				this.addc("var ");
			}
			this.zaddc(a.token);
			n++;
			a = a.next;
		}
	} else {
		return  this.fatal(a, "Missing method parameters");
	}
	if (n == 0) {
		this.addc("void");
	}
	this.addc(") {\n");
	this.zaddc(this.b_method_body);
	this.addc("}\n");
}

end_identifier(ast, level)
{
	switch (ast.parent.id) {
	case ZjT.CLASS:
		break;
	case ZjT.STATIC_METHOD:
		break;
	case ZjT.STATEMENT:
		break;
	}
}


identifier(ast, level)
{
	switch (ast.parent.id) {
	case ZjT.CLASS:
		this.t_class_name = ast.token;
		this.b_class_members.clear();
		break;
	case ZjT.STATIC_METHOD:
		this.t_method_name = ast.token;
		this.b_method_body.clear();
		break;;
	case ZjT.STATEMENT:
	default:
		if (this.f_in_body) {
			this.b_method_body.add(ast.token);
		}
	}
}

end_of_node(ast, level)
{
	switch (ast.id) {
	case ZjT.CLASS:
		this.class_def(ast, level);
		break;
	case ZjT.STATIC_METHOD:
		this.method(ast, level);
		break;
	case ZjT.IDENTIFIER:
		this.end_identifier(ast, level);
		break;
	case ZjT.LEFT_PARENTHESIS:
		if (this.f_in_body) {
			this.b_method_body.from_string(")");
		}
		break;
	case ZjT.LEFT_SQUARE_BRACKET:
		if (this.f_in_body) {
			this.b_method_body.from_string("]");
		}
		break;
	case ZjT.LEFT_CURLY_BRACKET:
		switch(ast.parent.id) {
		case ZjT.STATIC_METHOD:
			this.f_in_body = 0;
		}
		if (this.f_in_body) {
			this.b_method_body.from_string("}");
		}
		break;
	case ZjT.STATEMENT:
		if (this.f_in_body) {
			this.b_method_body.from_string(";\n");
		}
		break;
	default:
		break;
	}
}

node(ast, level)
{
	switch (ast.id) {
	case ZjT.CLASS:
	case ZjT.STATIC_METHOD:
	case ZjT.STATEMENT:
		break;
	case ZjT.DOT:
		if (this.f_in_body) {
			this.b_method_body.from_string("->");
		}
		break;
	case ZjT.LEFT_PARENTHESIS:
		if (this.f_in_body) {
			if (ast.parent.id == ZjT.IDENTIFIER) {
				this.b_method_body.from_string(".f(console, ");
			} else {
				this.b_method_body.add(ast.token);
			}
		}
		break;
	case ZjT.LEFT_SQUARE_BRACKET:
		if (this.f_in_body) {
			this.b_method_body.add(ast.token);
		}
		break;
	case ZjT.LEFT_CURLY_BRACKET:
		if (this.f_in_body) {
			this.b_method_body.add(ast.token);
		}
		switch(ast.parent.id) {
		case ZjT.STATIC_METHOD:
			this.f_in_body = 1;
		}
		break;
	case ZjT.IDENTIFIER:
		this.identifier(ast, level);
		break;
	case ZjT.STRING:
	case ZjT.QUOTE:
		if (this.f_in_body) {
			this.b_method_body.from_string("\"");
			this.b_method_body.escape(ast.token);
			this.b_method_body.from_string("\"");
		}
		break;
	default:
		if (this.f_in_body) {
			this.b_method_body.add(ast.token);
		}
	}
}

process(ast, level)
{
	if (this.error > 10) {
		return;
	}

	if (ast.left) {
		this.log("\n");
		this.ident(level);
		this.log("L:");
		this.process(ast.left, level + 1);
	}

	this.ident(level);
	this.log(ast.token.to_string());
	this.log("\n");
	this.node(ast, level);

	let c = ast.right;
	if (c !== null) {
		this.ident(level);
		this.log("R:");
		this.process(c, level + 1);
	}
	c = ast.child;
	if (c) {
		this.ident(level);
		this.log("C:\n");
	}
	while (c !== null) {
		this.process(c, level + 1);
		c = c.next;
	}
	this.end_of_node(ast, level);
}

head(ast)
{
	let c = ast.child;

	while (c !== null) {
		if (c.id === ZjT.CLASS) {
			let cls = "";
			let ext = "";
			let d = c.child;
			let f = null;
			if (d !== null) {
				cls = d.token.to_string() ;
				if (d.child) {
					ext = d.child.token.to_string();
				}
				d = d.next;
				if (d.id === ZjT.LEFT_CURLY_BRACKET) {
					d = d.child;
				} else {
					this.log("Bad class declaration");
					return;
				}
			}

			this.add("struct ");
			this.add(cls);
			this.add("__class {\n");
			if (ext !== "") {
				this.add("// extends ");
				this.add(ext);
				this.add("\n");
			}
			f = d;
			while (d !== null) {
				switch (d.id) {
				case ZjT.CONSTRUCTOR:
					this.constructor_members(d.child);
					break;
				}
				d = d.next;
			}
			this.add("};\n");
			d = f;
			while (d !== null) {
				switch (d.id) {
				case ZjT.STATIC_VAR:
					
					break;
				case ZjT.DEFINE:
					if (d.child === null || d.child.right === null) {
						this.log("bad getter");
					}
					this.add("#define ");
					this.add(cls);
					this.add("__");
					this.add(d.child.token.to_string());
					this.add(" ");
					this.add(d.child.right.token.to_string());
					this.add("\n");
					break;
				}
				d = d.next;
			}
		}
		c = c.next;
	}
}

body(ast)
{
	let c = ast.child;

	while (c !== null) {
		if (c.id === ZjT.CLASS) {
			let cls = "";
			let d = c.child;
			let f = null;
			if (d !== null) {
				cls = d.token.to_string() ;
				d = d.next;
				if (d.id === ZjT.LEFT_CURLY_BRACKET) {
					d = d.child;
				} else {
					this.log("Bad class declaration");
					return;
				}
			}

			f = d;

			d = f;
			while (d !== null) {
				switch (d.id) {
				case ZjT.CONSTRUCTOR:
				case ZjT.METHOD:
				case ZjT.STATIC_METHOD:
					if (d.child !== null && d.child.token.to_string()  !== "$") {
						let arg = 0;
						this.add("var ");
						this.add(cls);
						this.add("__");
						this.add(d.child.token.to_string());
						this.add("(");
						if (d.id !== ZjT.STATIC_METHOD) {
							this.add("var t__");
							arg = 1;
						}
						if (d.child.next !== null &&
							d.child.next.id === ZjT.LEFT_PARENTHESIS) 
						{
							let p = d.child.next.child;
							while (p) {
								if (arg > 0) {
									this.add(", ");
								}
								arg++;
								this.add("var ");
								this.add(p.token.to_string());
								p = p.next;
							}
							this.add(") {\n");
							this.method_body(d.child.next.next);
							this.add("}\n");
						}
					}
				}
				d = d.next;
			}
			this.add("var ");
			this.add(cls);
			this.add("__new() { var c; c.p = (void*)malloc(sizeof(struct ");
			this.add(cls);
			this.add("__class)); return c;}\n");
		}
		c = c.next;
	}
}

 method_body(bod)
 {
	ZjAst.$(bod);
	if (bod === null || bod.id !== ZjT.LEFT_CURLY_BRACKET) {
		this.log("Missing method body");
		return;
	}
	let d = bod.child;
	while (d) {
		switch (d.id) {
		case ZjT.LET:
			this.expression(d.child);
			break;
		case ZjT.STATEMENT:
			this.expression(d);
			break;
		default:
			this.add("// ");
			this.add(d.token.to_string());
			this.add("\n");
		}
		
		d = d.next;
	}
}

expression(ast)
{
	this.add(ast.token.to_string());
	this.add("\n");
}

constructor_members(ast)
{
	let c = ast;
	let d = c.next;
	if (d.next === null) {
		return;
	}
	d = d.next;
	if (d.id !== ZjT.LEFT_CURLY_BRACKET) {
		return;
	}
	d = d.child;
	while (d != null) {
		if (d.id === ZjT.STATEMENT) {
			let f = d.right;
			if (f !== null && f.token.to_string()  === "this") {
				if (f.child !== null && f.child.id === ZjT.DOT) {
					f = f.child.right;
					if (f !== null && f.id === ZjT.ASSIGN) {
						f = f.right;
						if (f !== null) {
							this.add("\tvar " + f.token.to_string()  + ";\n");
						}
					}

				}
			}
		}
		d = d.next;
	}
}

} // class ZjAst2C
