/*******************************************************************************

            22 March MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/

/**
* UTF-8 string (or byte array) auto growing buffer class 
*/
class ZjBuf { 

static $(o) { return o; }

/**
 * 
 * @param {initial size of the buffer} size 
 */
constructor(size) {
	size |= 0;
	this.bufsize = size;
	this.buffer = new Uint8Array(size);
	this.length = 0;
}

/**
 * delete this object
 */
dispose() {
	delete this.buffer;
	delete this;
}

/**
 * reset the length of the string.
 */
clear() {
	this.length = 0;
}

/**
 * 
 * @returns a ZjBuf with a copy of this buffer
 */
copy() {
	let b = new ZjBuf(this.length);
	b.add(this);
	return b;
}

/**
 * Appends a ZjBuf to this one
 * @param {the buffer} buf
 * @returns this 
 */
add(buf) {
	buf = ZjBuf.$(buf);
	let l = buf.length;
	let b = buf.buffer;
	for (let i = 0; i < l; i++) {
		this.u8(b[i]);
	}
	return this;
}

escape(buf) {
	buf = ZjBuf.$(buf);
	let l = buf.length;
	let b = buf.buffer;
	for (let i = 0; i < l; i++) {
		switch(b[i]) {
		case 0x00:	// \0
			this.u8(0x5C);
			this.u8(0x30);
			break;
		case 0x08:	// \b
			this.u8(0x5C);
			this.u8(0x62);
			break;
		case 0x09:	// \t
			this.u8(0x5C);
			this.u8(0x74);
			break;
		case 0x0A:	// \n
			this.u8(0x5C);
			this.u8(0x6E);
			break;
		case 0x0D:	// \r
			this.u8(0x5C);
			this.u8(0x72);
			break;
		case 0x22:	// \"
			this.u8(0x5C);
			this.u8(0x22);
			break;
		case 0x27:	// \'
			this.u8(0x5C);
			this.u8(0x27);
			break;
		case 0x08:	// \b
			this.u8(0x5C);
			this.u8(0x62);
			break;
		case 0x08:	// \b
			this.u8(0x5C);
			this.u8(0x62);
			break;
		case 0x5C: // \\
			this.u8(0x5C);
			this.u8(0x5C);
			break;
		default:
			this.u8(b[i]);
		}
	}
	return this;
}


/**
 * allocate a new internal buffer and copy the content of the ArrayBuffer into it.
 * @param {an ArrayBuffer} a 
 * @returns this
 */
from_array(a) {
	delete this.buffer;
	this.buffer = new Uint8Array(a);
	this.length = a.length;
	this.bufsize = a.length;
	return this;
}

/**
 * appends the string litteral to the end of this buffer
 * @param {string litteral} s 
 * @returns this
 */
from_string(s) {
	s += "";
	for (let c of s) {
		this.utf8(c.codePointAt(0));
	}
	return this;
}

/**
 * compute hash key value
 * @returns hash integer
 */
hash()
{
	let i = 0;
	let h = 0;
	while (i < this.length) {
		h += (h << 3) ^ this.buffer[i];
		i++;
	}
	return h & 0x7FFFFFFF;
}

/**
 * compare this with b
 * @param {ZjBuf to compare with} b 
 * @returns 0 if strings are equal, postive number if this is greater than b, negative number if this is less than b
 */
compare(b)
{
	let i = 0;
	let c = 0;
	while (i < b.length && i < this.length) {
		c = this.buffer[i] - b.buffer[i];
		if (c !== 0) {
			return c;
		}
		i++;
	}
	c = this.length - b.length;
	return c;
}

/**
 * Compare n codepoint in b with s
 * @param {source ZjBuf} b
 * @param {byte start index in b} b
 * @param {string litteral to compare} s
 * @param {number of codepoint to read} n
 * @returns 0 if strings are equal, postive number if b is greater than s, negative number if b is less than s
 */
strncmp(b, i, s, n) {
	s += "";
	b = ZjBuf.$(b);
	i |= 0;
	n |= 0;
	
	if (n < 1) {
		return 0;
	}
	for (let c of s) {
		this.length = 0;
		if (i >= b.length) {
			return -1;
		}
		b.char_at(this, i);
		let ts = this.to_string();
		if (ts !== c) {
			if (ts > c) {
				return 1;
			}
			return -1;
		}
		n--;
		if (n === 0) {
			return 0;
		}
		i += this.length;
	}
	return 1;
}

/**
 * append the UTF-8 character at byte index pos to the ZjBuf out
 * @param {the buffer to write the UTF8 character} out 
 * @param {the byte index in this buffer to read the charcater} pos 
 * @returns this
 */
char_at(out, pos) {
	out = ZjBuf.$(out);
	pos |= 0;
	let str = "";
	let b = this.buffer;
	let p = this.length;
	let i = pos;
	let l = 0;
	if (i >= p) {
		out.u8(0x3F);
		return;
	}
	let v = b[i];
	if (v < 0x80) {
		l = 1;
	} else if (v < 0xC0) {
		// error...
		while (i < p) {
			out.u8(0xFF);
			i++;
		}
		return;
	} else if (v < 0xE0) {
		l = 2;
	} else if (v < 0xF0) {
		l = 3;
	} else if (v < 0xF8) {
		l = 4;
	} else if (v < 0xFC) {
		l = 5;
	} else {
		l = 6;
	}
	if (i + l > p) {
		out.u8(0x3F);
		return;
	}
	while (l > 0) {
		out.u8(b[i]);
		l--;
		i++;
	}
	return this;
}
/**
 * set this buffer with the n codepoint content of b starting index i
 * @param {source ZjBuf} b
 * @param {byte start index} i
 * @param {number of codepoint to read} n
 * @returns string litteral of this
 */
substr(b, i, n)
{
	b = ZjBuf.$(b);
	i |= 0;
	n |= 0;
	this.length = 0;
	while (n > 0) {
		b.char_at(this, i + this.length);
		n--;
	}
	return this.to_string();
}

/**
 * 
 * @returns a string "litteral" of this
 */

static to_string_cb(cb, u, x)
{
	 cb.self += String.fromCodePoint(u);
}

to_string()
{
	let str = "";
	let cb = new ZjCallback(str, ZjBuf.to_string_cb);
	this.for_each(cb);
	str = cb.self;
	cb.dispose();
	return str;
}

for_each(cb) 
{
	let b = this.buffer;
	let p = this.length;
	let i = 0;
	
	while (i < p) {
		let u = 0;
		let v = b[i];
		if (v < 0x80) {
			u = v;
		} else if (v < 0xC0) {
			// error...
			while (i < p) {
				str += "?";
				i++;
			}
			return str;
		} else if (v < 0xE0) {
			u = (v & 0x1F) << 6;
			i++;
			u |= b[i] & 0x3F;
		} else if (v < 0xF0) {
			u = (v & 0x0F) << 12;
			i++;
			u |= (b[i] & 0x3F) << 6;
			i++;
			u |= b[i] & 0x3F;
		} else if (v < 0xF8) {
			u = (v & 0x07) << 18;
			i++;
			u |= (b[i] & 0x3F) << 12;
			i++;
			u |= (b[i] & 0x3F) << 6;
			i++;
			u |= b[i] & 0x3F;
		} else if (v < 0xFC) {
			u = (v & 0x03) << 24;
			i++;
			u |= (b[i] & 0x3F) << 18;
			i++;
			u |= (b[i] & 0x3F) << 12;
			i++;
			u |= (b[i] & 0x3F) << 6;
			i++;
			u |= b[i] & 0x3F;
		} else {
			u = (v & 0x03) << 30;
			i++;
			u |= (b[i] & 0x3F) << 24;
			i++;
			u |= (b[i] & 0x3F) << 18;
			i++;
			u |= (b[i] & 0x3F) << 12;
			i++;
			u |= (b[i] & 0x3F) << 6;
			i++;
			u |= b[i] & 0x3F;
		}
		cb.exec(u, 0);
		i++;
	}
	return 0;
}

/**
 * append a byte to the internal buffer
 * @param {a byte} v 
 */
u8(v) 
{
	v |= 0;
	if (this.length >= this.bufsize) {
		let l = this.bufsize;
		let o = this.buffer;
		this.bufsize <<= 1;
		this.buffer = new Uint8Array(this.bufsize);
		let n = this.buffer;
		for (let i = 0; i < l; i++) {
			n[i] = o[i];
		}
	}
	this.buffer[this.length] = v;
	this.length++;
}

/**
 * Codepoint length
 * */
cplen(data)
{
	if (data < 0) {
		return 6;
	} else if (data < 0x80) {
		return 1;
	} else if (data < 0x800) {
		return 2;
	} else if (data < 0x10000) {
		return 3;
	} else if (data < 0x200000) {
		return 4;
	} else if (data < 0x4000000) {
		return 5;
	}
	return 6;
}

/**
 * append a codepoint to the internal UTF-8 buffer
 * @param {UTF-32 codepoint} data 
 */
utf8(data) 
{
	data |= 0;
	// https://www.cl.cam.ac.uk/~mgk25/ucs/utf-8-history.txt
	if (data < 0) {
		this.u8(((data >>> 30) & 3) | 252); // 2^30
		this.u8(((data >>> 24) & 63) | 128); // 2^24
		this.u8(((data >>> 18) & 63) | 128);   // 2^18
		this.u8(((data >>> 12) & 63) | 128);    // 2^12
		this.u8(((data >>> 6) & 63) | 128);     // 2^6
		this.u8(((data) & 63) | 128);
	} else if (data < 0x80) {
		this.u8(((data) & 127));
	} else if (data < 0x800) {
		this.u8(((data >> 6) & 31) | 192);
		this.u8(((data) & 63) | 128);
	} else if (data < 0x10000) {
		this.u8(((data >>> 12) & 15) | 224);
		this.u8(((data >>> 6) & 63) | 128);
		this.u8(((data) & 63) | 128);
	} else if (data < 0x200000) {
		this.u8(((data >>> 18) & 7) | 240);
		this.u8(((data >>> 12) & 63) | 128);
		this.u8(((data >>> 6) & 63) | 128);
		this.u8(((data) & 63) | 128);
	} else if (data < 0x4000000) {
		this.u8(((data >>> 24) & 3) | 248);
		this.u8(((data >>> 18) & 63) | 128);
		this.u8(((data >>> 12) & 63) | 128);
		this.u8(((data >>> 6) & 63) | 128);
		this.u8(((data) & 63) | 128);
	} else {
		this.u8(((data >>> 30) & 3) | 252); // 2^30
		this.u8(((data >>> 24) & 63) | 128); // 2^24
		this.u8(((data >>> 18) & 63) | 128);   // 2^18
		this.u8(((data >>> 12) & 63) | 128);    // 2^12
		this.u8(((data >>> 6) & 63) | 128);     // 2^6
		this.u8(((data) & 63) | 128);
	}
}

/**
 * append a UTF-16 character to the internal byte little endian buffer
 * @param {UTF-16 character} v 
 */
utf16le(v) 
{
	v |= 0;
	// https://stackoverflow.com/questions/66679330/convert-unicode-codepoint-to-utf-16
	if (v < 0xD800 || (v > 0xDFFF && v < 0x10000)) {
		this.u16le(v);
		return;
	}

	v -= 0x010000;
	this.u16le(((v & 0xFFC00) >>> 10) + 0xD800);
	this.u16le((v & 0x003FF) + 0xDC00);
}

/**
 * append v to the internal little endian buffer
 * @param {16 bit unsigned number} v 
 */
u16le(v) 
{
	v |= 0;
	this.u8(v);
	this.u8(v >>> 8);
}

/**
 * append v to the internal little endian buffer
 * @param {32 bit unsigned number} v 
 */
u32le(v) {
	v |= 0;
	this.u16le(v);
	this.u16le(v >>> 16);
}

/**
 * append v to the internal big endian buffer
 * @param {16 bit unsigned number} v 
 */
u16be(v) 
{
	v |= 0;
	this.u8(v >>> 8);
	this.u8(v);
}

/**
 * append v to the internal big endian buffer
 * @param {32 bit unsigned number} v 
 */
u32be(v) 
{
	v |= 0;
	this.u16be(v >>> 16);
	this.u16be(v);
}

/**
 * append v to the internal LEB128 buffer
 * @param {32 bit unsigned number} v 
 */
leb128(v) 
{
	v |= 0; // https://en.wikipedia.org/wiki/LEB128
	if (v > 0x7FFFFFFF) {
		if (v === 0x80000000) {
			v = -0x7FFFFFFF;
			v--;
		} else {
			v = ~v;
			v++;
			v = -v;
		}
	}
	while (true) {
    		let b = v & 0x7f;
    		v >>= 7;
		if ((v === 0 && (b & 0x40) === 0) ||
      			(v === -1 && (b & 0x40) !== 0)) 
		{
			this.u8(b);
      			return;
		}
    		this.u8(b | 0x80);
	}
}

/**
 * append v to the internal LEB128 buffer
 * @param {32 bit unsigned number} v 
 */
uleb128(v)
{
	v |= 0;
	while (true) {
		let b = v & 0x7f;
		v >>>= 7;
	    	if (v === 0) {
		    	this.u8(b);
			return;
		}
		this.u8(b | 0x80);
	}
}

} // class ZjBuf
