32gears
=======

http://cod5.org/32gears/


Raspberry PI 2 B: serial port kernel loader
------------------------------------------

Using this software you can upload your bare metal kernel from your developement
Linux host to your PI without need to repeatedly plug and unplug the SD card.

LICENSE
-------
Public Domain.

INSTALL
-------

You will need clang and GNU binutils in order to build the loader 
image "kernel7.img" under Linux.

Then replace the "kernel7.img" of a Raspbian SD card by this new one.
Connect a serial cable to the GPIO of your PI.
Restart your PI.

You can use CuteCom to send your own raw kernel image file from Linux to
the Raspberry PI:
http://cutecom.sourceforge.net/
The serial settings are: 115200 bauds, 8 data bits, 1 stop bit, parity none.

Links
-----

http://code.google.com/p/xv6-rpi/source/browse/
https://gitorious.org/lambdapi/lambdapi/source/
https://github.com/rememberthe8bit/pi-interrupt-test/
https://github.com/mrvn/raspbootin/blob/master/raspbootin/
https://github.com/dwelch67/raspberrypi/blob/master/
https://github.com/PeterLemon/RaspberryPi
https://github.com/rsta2/circle
http://www.cl.cam.ac.uk/projects/raspberrypi/tutorials/os/index.html

http://clang.llvm.org/get_started.html
http://ftp.gnu.org/gnu/binutils/


