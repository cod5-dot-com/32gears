

class ZjObject {

static $(o) { return o; }

constructor(name)
{
	this.prototype = ZjObject.$(null);
	this.properties = new ZjHash(1);
}

dispose()
{
	delete this.properties;
	delete this;
}

set(k, val)
{
	k = ZjBuf.$(k);
	val = ZjVar.$(val);
	return this.properties.set(k, val);
}

get(k)
{
	k = ZjBuf.$(k);
	return this.properties.get(k);
}

}
