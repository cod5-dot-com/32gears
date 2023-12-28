/*******************************************************************************

            24 March MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/

/**
 * Web Assembly
 */
class ZjWasm {

static $(o) { return o; }

static get TYPE_I32() {return 0x7F;} // i32
static get TYPE_V128() {return 0x7B;} // vector of bytes. u32 length followed by array of bytes 

constructor()
{
	
}

/**
 * delete this
 */
dispose()
{

	delete this;
}


} // class ZjWasm
