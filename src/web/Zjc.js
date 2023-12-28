
/*******************************************************************************

            22 March MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/

include("./Zj/ZjHash");
include("./Zj/ZjArray");
//include("./Zj/ZjString");
include("./Zj/ZjCallback");
include("./Zj/ZjBuf");
include("./Zj/ZjTokenizer");
include("./Zj/ZjAst");
include("./Zj/ZjContext");
include("./Zj/ZjParser");
include("./Zj/ZjAst2C");
//include("./Zj/ZjClass");

/**
 * ZeuDjak compiler
 */
class Zjc {
    
$(o) { return o; }

/**
 * 
 * @param {a callback object to monitor the progress of compilation} cb 
 */
constructor(cb)
{
	this.cb = ZjCallback.$(cb);
	this.t_cb = new ZjCallback(this, Zjc.t_cb);
    	this.tokenizer = new ZjTokenizer(this.t_cb);
	this.p_cb = new ZjCallback(this, Zjc.p_cb);
    	this.parser = new ZjParser(this.p_cb);
	this.e_cb = new ZjCallback(this, Zjc.e_cb);
    	this.emitter = new ZjAst2C(this.e_cb);
    	this.file = new ZjBuf(8);
}   
/**
 * delete this
 */
dispose()
{
	this.file.dispose();
	this.t_cb.dispose();
	this.p_cb.dispose();
	this.e_cb.dispose();
	this.tokenizer.dispose();
	this.parser.dispose();
	this.emitter.dispose();
    	delete this;
}

/**
 * compile a ZeuDjak file
 * @param {the name of the source file} filename 
 */
compile(filename)
{
	filename = ZjBuf.$(filename);
	this.cb.set(102, filename);
    	this.cb.exec(null, null);
	this.file.clear();
    	this.file.add(filename);
    	this.tokenizer.reset();
    	this.tokenizer.open(filename);
}

/**
 * monitor the tokenization process
 * @param {result} r 
 * @param {first argument} a 
 * @param {second argument} b 
 */
static t_cb(r, a, b)
{
	
    	if (r.status === 200) { // success
        	//this.log(JSON.stringify(r));
		/*let t = r.self.tokenizer;
		let s = "";
		while (t.has_tokens()) {
			let to = t.advance();
			s += to.to_string();

		}
		alert(s);*/
        	r.self.parser.parse(r.self.tokenizer);
    	} else if (r.status === 102) { // progress
		r.self.cb.set(102, r.response);
		r.self.cb.exec(null, null);
	} else { // error
		let s = new ZjBuf(10);
		s.from_string("Error...");
		s.add(r.response);
		r.self.cb.set(404, s);
		r.self.cb.exec(null, null);
		s.dispose();
	}
}

/**
 * monitor the parsing process
 * @param {result} r 
 * @param {first argument} a 
 * @param {second argument} b 
 */
static p_cb(r, a, b)
{
	r.self.cb.set(102, r.response);
	r.self.cb.exec(null, null);

	r.self.emitter.run(r.self.parser.root, r.self.file);
}

/**
 * monitor the code emission process
 * @param {result} r 
 * @param {first argument} a 
 * @param {second argument} b 
 */
static e_cb(r, a, b) {
	r.self.cb.set(r.status, r.response);
	r.self.cb.exec(null, null);
}

} // class Zjc
