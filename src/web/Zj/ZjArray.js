

class ZjArray {

static $(o) { return o; }

constructor(size)
{
	this.size = size | 0;
	this.current = 0;
	if (size < 1) {
		size = 1;
	}
	this.table = new Array(this.size);
	for (let i = 0; i < this.size; i++) {
		this.table[i] = null;
	}
}

dispose()
{
	delete this.table;
	delete this;
}

set(k, val)
{
	k |= 0;
	val = ZjVar.$(val);

	if (k >= this.size) {
		let s = this.size;
		while (k >= s) {
			s *= 2;
		}
		let t = new Array(s);
		let i = 0;
		for (i = 0; i < this.size; i++) {
			t[i] = this.table[i];
		}
		for (;i < s; i++) {
			t[i] = null;
		}
		delete this.table;
		this.table = t;
		this.size = s;
	}
	this.table[k] = val;
	return val;
}

get(k)
{
	k |= 0;
	val = ZjVar.$(val);
	if (k < this.size) {
		return this.table[k];
	}
	return null;
}

push(val)
{
	val = ZjVar.$(val);
	if (null !== this.set(this.current, val)) {
		this.current++;
		return val;
	}
	return null;
}

pop()
{
	if (this.current > 0) {
		this.current--;
		let val = this.table[this.current];
		this.table[this.current] = null;
		return val;
	}
	return null;
}

shift() 
{
	let val = this.table[0];
	for (let i = this.size - 1; i > 0; i--) {
		this.table[i - 1] = this.table[i];
	}
	this.current--;
	return val;
}

unshift(val) 
{
	val = ZjVar.$(val);
	for (let i = 1; i < this.size; i++) {
		this.table[i] = this.table[i - 1];
	}
	this.table[0] = val;
	this.current++;
	return val;
}

full()
{
	if (this.current >= this.size) {
		return 1;
	}
	return 0;
}

empty()
{
	return this.current <= 0;
}

}
