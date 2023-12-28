PATH:= $(PATH)
CC:= gcc -m32
AS:= as -m32

all:  kernel.exe

kernel.exe:
	gcc -o build/sh.exe tools/sh.c


.c.s:
	$(CC) -S $<

.s.o:
	$(AS) -o $@ $< 

