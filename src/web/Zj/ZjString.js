

class ZjString {

static $(o) { return o; }

constructor(txt)
{
	txt += "";
	this.str = new String(txt);
}

dispose()
{
	delete this.str;
	delete this;
}

length()
{
	return this.str.length();
}

fromString(s)
{
	s += "";
	let l = s.length();
	let i = 0;
	while (i < l) {
		this.utf16le(s.charCodeAt(i))
		i++;
	}
}

fromByteArray(ba)
{
	ba = ZjByteArray.$(ba);
	let b = ba.buffer;
	let p = ba.bufpos;
	let i = 0;
	while (i < p) {
		let u = 0;
		let v = b[i];
		if (v < 0x80) {
			u = v;
		} else if (v < 0xC0) {
			// error...
			return;
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
			u |= (b[i] & 0x3F) << 18;
			i++;
			u |= (b[i] & 0x3F) << 12;
			i++;
			u |= (b[i] & 0x3F) << 6;
			i++;
			u |= b[i] & 0x3F;
		}
		this.str += String.fromCodePoint(u);
		i++;
	}

}

setl(txt)
{
	txt += "";
	this.str = txt;
}

set(txt)
{
	txt = ZjString.$(txt);
	delete this.str;
	this.str = txt;
}

addi(num)
{
	num |= 0;
	this.str += num.toString();
}

addl(txt)
{
	txt += "";
	this.str += txt;
}

add(txt)
{
	this.str = this.str.concat(txt.get());
}

get()
{
	return this.str;
}

}