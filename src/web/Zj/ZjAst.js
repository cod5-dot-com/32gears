/*******************************************************************************

            22 March MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/

/**
 * Abstract syntax tree
 */
class ZjAst {

static $(o) { return o; }

/**
 * 
 * @param {type of tpken} id 
 * @param {name or value of the token} token 
 * @param {operator precedence} precedence 
 * @param {parent AST} parent 
 */
constructor(id, token, precedence, parent)
{
	this.id = id | 0;
	token = ZjBuf.$(token);
	this.preced = precedence | 0;
	this.parent = ZjBuf.$(parent);
	this.token = token.copy();
	this.left = null;
	this.right = null;
	this.next = null;
	this.child = null;
}

/**
 * delete this
 */
dispose()
{
	if (this.left !== null) {
		this.left.dispose();
	}
	if (this.right !== null) {
		this.right.dispose();
	}
	if (this.next !== null) {
		this.next.dispose();
	}
	if (this.child !== null) {
		this.child.dispose();
	}
	this.token.dispose();
	delete this;
}

/**
 * create a child AST
 * @param {type of token} id 
 * @param {value of token} token 
 * @param {precedence of operator} precedence 
 * @returns the newly created AST
 */
add_child(id, token, precedence)
{
	let c = this.child;
	let a = new ZjAst(id, token, precedence, this);
	if (!c) {
		this.child = a;
	} else {
		while (c.next) {
			c = c.next;
		}
		c.next = a;
	}
	return a;
}

/**
 * create an AST to the right
 * @param {type of token} id 
 * @param {value of token} token 
 * @param {precedence of operator} precedence 
 * @returns the newly created AST
 */
add(id, token, precedence)
{
	let a = new ZjAst(id, token, precedence, this);
	if (this.right === null) {
		this.right = a;
	} else {
		console.log("we already have a right: ");
		console.log(token.to_string());
		return null;
	}
	return a;
}

/**
 * create and insert an operator AST
 * @param {type of token} id 
 * @param {value of token} token 
 * @param {precedence of operator} precedence 
 * @returns the newly created AST
 */
add_op(id, token, precedence)
{
	if (this.parent === null) {
		return null;
	}
	let a = new ZjAst(id, token, precedence, this.parent);
	a.left = this;
	if (this.parent.left === this) {
		this.parent.left = a;
	} else if (this.parent.right === this) {
		this.parent.right = a;
	} else if (this.parent.child !== null) {
		let n = this.parent.child;
		if (n === this) {
			this.parent.child = a;
			a.next = n.next;
			this.next = null;
		} else {
			while (n.next) {
				if (n.next === this) {
					a.next = this.next;
					n.next = a;
					this.next = null;
					break;
				}
				n = n.next;
			}
			if (!n.next) {
				console.log("What a mess");
				return null;
			}
		}
	} else {
		console.log("no left element!!!");
		return null;
	}
	this.parent = a;
	return a;
}

} // class ZjAst
