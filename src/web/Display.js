
/*******************************************************************************

          9 JUne MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/


class Display {

static $(o) { return o; }

constructor() 
{
	this.font = null;
	this.context;
	this.fb = null;
	this.fb_width = 0;
	this.fb_height = 0;
	this.fb_pitch = 0;
	this.fg = 0xFF000000;
	this.bg = 0xFFFFFFFF; 
	this.x = 0;
	this.y = 0;
	this.font_height = 16;
	this.font_width = 8;
}

dispose() 
{
   
    delete this;
}

init()
{
	let canvas =  document.getElementById("canvas");
	this.context = canvas.getContext("2d");
	this.fb_width = canvas.width;
	this.fb_height = canvas.height;
	this.fb_pitch = canvas.width * 4;
	this.fb = this.context.createImageData(this.fb_width, this.fb_height);
	
}

swap()
{
	this.context.putImageData(this.fb, 0, 0);
}

draw_char(x, y, c)
{
	if (c < 32 || c > 126) {
		c = 63; // ?
	}

	c -= 32;
	let p = y * this.fb_pitch;
	let fb = this.fb.data;
	let fg = this.fg;
	let bg = this.bg;
	let font = this.font;
	let fb_width = this.fb_width;
	let fb_height = this.fb_height;
	for (let i = 0; i < 16; i++) {
		if ((y + i) < 0) {
			continue;
		}
		if ((y + i) >= fb_height) {
			return;
		}
		let pl = p + (x * 4);
		let l = font[(16 * c + i)];
		for (let j = 0; j < 8; j++) {
			if ((x + j) < 0) {
				pl += 4;
			} else if ((x + j) >= fb_width) {
				pl += 4;
			} else if (l & 0x80) {
				fb[pl++] = fg & 0xFF;         // r
				fb[pl++] = (fg >> 8) & 0xFF;  // g
				fb[pl++] = (fg >> 16) & 0xFF; // b
				fb[pl++] = (fg >> 24) & 0xFF; // a
			} else {
				fb[pl++] = bg & 0xFF;
				fb[pl++] = (bg >> 8) & 0xFF;
				fb[pl++] = (bg >> 16) & 0xFF;
				fb[pl++] = (bg >> 24) & 0xFF;
			}
			l <<= 1;
		}
		p += this.fb_pitch;
	}
}

vscroll(a)
{
	let fb = this.fb.data;
	let s = a * this.fb_pitch;
	let d = 0;
	let n = (this.fb_height - a) * this.fb_pitch;
	for (let i = 0; i < n; i++) {
		fb[d++] = fb[s++];	
	}
	for (let i = 0; i < s; i++) {
		fb[d++] = 0x80;	
	}
}

putchar(ch)
{
        if (ch == 10) { // \n
                this.x = -this.font_width;
                this.y += this.font_height;
        } else if (ch == 8) { // \b
                this.x -= this.font_width;
                if (this.x < 0) {
                        this.x = 0;
                }
                this.draw_char(this.x, this.y, 0x20);
                this.x -= this.font_width;
        } else {
                this.draw_char(this.x, this.y, ch);
        }

        this.x += this.font_width;
        if (this.x >= this.fb_width) {
                this.x = 0;
                this.y += this.font_height;
        }
        if (this.y > (this.fb_height - this.font_height)) {
                this.vscroll(this.y - (this.fb_height - this.font_height));
                this.y = this.fb_height - this.font_height;
        }
}

static puts_cb(cb, a, b)
{
	cb.self.putchar(a);
}

puts(s)
{
        s = ZjBuf.$(s);
	let cb = new ZjCallback(this, Display.puts_cb);
	s.for_each(cb);
	cb.dispose();
	this.swap();
}

} // class
