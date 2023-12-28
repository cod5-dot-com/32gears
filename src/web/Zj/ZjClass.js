
class ZjClass {

static $(o) { return o; }

constructor()
{
	this.methods = [];
}

dispose()
{
	delete this;
}

ident(log, level)
{
	while (level > 0) {
		level--;
		log("  ");
	}
}

log(t)
{
	this.s += t;
}

run(ast, completeCB)
{
	this.s = "";
	this.process(ast, this.log.bind(this), 0);
	let r = [];
	r.status = 200;
	r.response = this.s + "END";
	completeCB(r);
}

process(ast, log, level)
{
	this.ident(log, level);
	log(ast.token);
	log("\n");

	if (ast.left) {
		this.ident(log, level);
		log("L:");
		this.process(ast.left, log, level + 1);
	}
	let c = ast.right;
	if (c !== null) {
		this.ident(log, level);
		log("R:");
		this.process(c, log, level + 1);
	}
	c = ast.child;
	if (c) {
		this.ident(log, level);
		log("C:\n");
	}
	while (c !== null) {
		this.process(c, log, level + 1);
		c = c.next;
	}
}   

}
