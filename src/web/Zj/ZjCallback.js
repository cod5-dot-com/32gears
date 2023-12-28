

class ZjCallback {
	
static $(o) { return o; }

constructor(parent, cb)
{
	this.status = 102;
	// 102 in progess
	// 200 done
	// 403 permission denied
	// 404 error
	this.response = new ZjBuf(1);
	this.self = parent;
	this.callback = cb;
}

dispose()
{
	delete this.response;
	delete this;
}

set(status, response) {
	status |= 0;
	response = ZjBuf.$(response);
	this.status = status;
	this.response.clear();
	this.response.add(response);
}

exec(a, b)
{
	//let c = this.callback.bind(this.self);

	return this.callback(this, a, b);
}

fork(a, b) 
{
	setTimeout(this.callback, 1, this, a, b);
}

}