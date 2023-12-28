PATH:= $(PATH)

all: shell


shell: 
	rm -f tools/sh.s
	scc -o sh.exe tools/sh.c

clean:
	rm -f sh.exe a.out *.core

