PATH:= $(PATH)

all:  runweb

runweb:
	make -f Makefile.webi

run:
	make -f Makefile.ibmpc run

run64:
	make -f Makefile.ibmpc run64

pc:
	make -f Makefile.ibmpc

rpi:
	make -f Makefile.rpi400

tool:
	make -f Makefile.tools

clean:
	make -f Makefile.ibmpc clean
	make -f Makefile.rpi400 clean
	make -f Makefile.tools clean

