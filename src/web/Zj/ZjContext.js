/*******************************************************************************

            15 April MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/

/**
 * code context
 */
class ZjContext {

static $(o) { return o; }

constructor(parent)
{
	this.parent = ZjContext.$(parent);
	this.current = this;
	this.items = new ZjHash(512, null);
}

/**
 * delete this
 */
dispose()
{
	delete this;
}

push()
{
	this.current = new ZjContext(this.current);
}

pop()
{
	let p = this.current.parent;
	if (p) {
		this.current.dispose();
	}
	this.current = p;
}

add(key, data)
{
	if (this.items.get(key) !== null) {
		return null;
	}
	this.items.add(key, data);
	return key;
}

get(key) {
	let p = this.current;
	do {
		let r = p.items.get(key);
		if (r !== null) {
			return r;
		}
		p = p.parent;
	} while (p);
	return null;
}
} // class ZjContext
