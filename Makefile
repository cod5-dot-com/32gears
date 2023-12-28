AS=clang -target armv6-unknown-eabi  -c 
CC=clang -target armv6-unknown-eabi  -c 
LD=${HOME}/gcc-arm/bin/arm-none-eabi-ld 
OD=${HOME}/gcc-arm/bin/arm-none-eabi-objdump
OC=${HOME}/gcc-arm/bin/arm-none-eabi-objcopy

OBJECTS=init.o main.o uart.o irq.o timer.o

all: kernel7.img

kernel7.img: recovery.img loader.img
	./merge.sh

recovery.img: recovery.elf 
	$(OC) recovery.elf -O binary recovery.img

loader.img: loader.elf
	$(OC) loader.elf -O binary loader.img

loader.elf: loader.ld loader.o Makefile
	$(LD) -static --no-undefined -nostdlib -T loader.ld loader.o -o loader.elf 
	$(OD) -D loader.elf >loader.list

recovery.elf: $(OBJECTS) recovery.ld Makefile 
	$(LD) -N -static -nostdlib --no-undefined -T recovery.ld $(OBJECTS) -o recovery.elf 
	$(OD) -D recovery.elf >recovery.list

init.o: init.s
	$(AS) -o init.o init.s

loader.o: loader.s
	$(AS) -o loader.o loader.s

install: kernel7.img
	cp kernel7.img /media/boot/

clean:
	rm -f *.o *.elf *.bin *.log
	rm -f recovery.elf
	rm -f *.img
	rm -f main.s
	rm -f uart.s
	rm -f irq.s
	rm -f timer.s
	rm -f recovery.list loader.list
.c.o: 
	$(CC) -o $@ $<
	#clang -target arm-unknown-eabi -S $<
	
