"use strict";

include("./font");
include("./Audio");
include("./Display");
include("./Keyboard");
include("./Fs");
include("./Zjc");

class TheApp {

static main()
{
	TheApp.audio = new Audio();
	TheApp.display = new Display();
	TheApp.audio.init();
	TheApp.display.font = TheFont;
	TheApp.display.init();
	let b = new ZjBuf(4);
	b.from_string("Greetings Professor Falken.\n");
	TheApp.display.puts(b);

	TheApp.keyboard = new Keyboard();

	TheApp.cb = new ZjCallback(TheApp, TheApp.log);
	TheApp.compiler = new Zjc(TheApp.cb);
	b.clear();
	b.from_string("./test.js");
	TheApp.compiler.compile(b);
	b.dispose();
}

static log(r, a, b)
{
	TheApp.display.puts(r.response);
}

}; // class

run(TheApp);

