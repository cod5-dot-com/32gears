
/*******************************************************************************

          9 JUne MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/


class Keyboard {

static $(o) { return o; }

constructor() 
{
	this.buf = new ZjBuf(8);
//	window.addEventListener("mousemove", mousemoveCb);
//        window.addEventListener("click", clickCb);
        window.addEventListener("keydown", Keyboard.keydown_cb);
        window.addEventListener("keyup", Keyboard.keyup_cb);
}

dispose() 
{
   
    delete this;
}

static keydown_cb(e)
{
	let k = e.key;
	if (e.code == "ArrowLeft") {
	}
	if (e.code == "ArrowRight") {
	}
	switch (k) {
	case "Enter":
		k = "\n";
		break;
	case "Backspace":
		k = "\b";
		break;
	case "Shift":
	case "Control":
	case "Meta":
	case "Alt":
	case "AltGraph":
	case "ArrowLeft":
	case "ArrowRight":
	case "ArrowUp":
	case "ArrowDown":
	case "Home":
	case "End":
	case "PageUp":
	case "PageDown":
	case "Backspace":
	case "Dead":
		if (e.isComposing) {
			k = "*";
		} else {
			k = "";
		}
		k  += e.code;
		k = "";
	}
	TheApp.keyboard.buf.clear();
	TheApp.keyboard.buf.from_string(k);
	TheApp.display.puts(TheApp.keyboard.buf);
}

static keyup_cb(e)
{
	let k = e.key;
	if (e.code == "ArrowLeft") {
	}
	if (e.code == "ArrowRight") {
	}
	if (k == "Enter") {
		k = "\n";
	}
	TheApp.keyboard.buf.clear();
	TheApp.keyboard.buf.from_string(" UP:");
	TheApp.keyboard.buf.from_string(k);
	//TheApp.display.puts(TheApp.keyboard.buf);
}

static puts_cb(cb, a, b)
{
	cb.self.putchar(a);
}

} // class
