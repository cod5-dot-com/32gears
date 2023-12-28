/*
The COD5 4x4x4 CPU

0x'FFFF'FFFF'FFFF
		   memory accessed by the banked window
0x'0000'8000'0000
0x'0000'7FFF'FFFF
		   banked data memory window
0x'0000'4000'0000
0x'0000'3FFF'FFFF
		   fixed data and program memory
0x'0000'0000'0000

31 bit program address
31 bit data address
18 bit paging data
*/

class ZjCod5Symbol {

static $(o) { return o; }

constructor(next, hash, key, data)
{
	this.next = next;
	this.hash = hash;
	this.key = key;
	this.data = data;
}

dispose()
{
	delete this.data;
	delete this;
}

} // class

class ZjCod5 {

static $(o) { return o; }


constructor()
{
	this.buffer = new ZjByteArray();
}

dispose()
{
	this.buffer.dispose();
	delete this;
}

label(name)
{

}

org(pos) {

}

section(name) {

}

// load address of "label" in register "rdest"
la(rdest, label)
{

}

// no operation
nop()
{

}

// branch to "label"
b(label)
{

}

lu(rdest, imm)
{

}

u8(v)
{
	this.buffer.u8(v);
}

utf8(data)
{
	this.buffer.utf8(data);
}

utf16le(v)
{
	this.buffer.utf16le(v);
}

u16le(v)
{
	this.buffer.u16le(v);
}

u32le(v)
{
	this.buffer.u32le(v);
}

u64le(high, low)
{
	this.buffer.u32le(low);
	this.buffer.u32le(high);
}

u16be(v)
{
	this.buffer.u16be(v);
}

u32be(v)
{
	this.buffer.u32be(v);
}

u64be(high, low)
{
	this.buffer.u32be(high);
	this.buffer.u32be(low);
}

} // class

