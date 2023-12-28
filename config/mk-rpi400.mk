PATH:= $(PATH)
EXESFX=
AS=clang -c -target armv6-none-eabi
LD=clang -target armv6-none-eabi 
SCC=arm-none-eabi-scc 
CFLAGS=

OBJS= common/main.o common/shell.o \
      rpi400/gic400.o \
      rpi400/timer.o \
      rpi400/dma.o

all: kernel7l.img

.c.s:
	$(SCC) -S $<

.c.o:
	$(SCC) -S -o $*.s $<
	$(AS) -o $@ $*.s 
	rm -f  $*.s 

.s.o:
	$(AS) -o $@ $< 


kernel7l.img: rpi400/crt0.S $(OBJS)
	$(AS) -o rpi400/crt0.o rpi400/crt0.S 
	$(LD) -nostdlib -static --no-undefined -T rpi400/linker.ld \
	      	rpi400/crt0.o \
		$(OBJS) \
		-o kernel7l.elf 
	llvm-objdump -d kernel7l.elf | llvm-cxxfilt > kernel7l.lst
	llvm-objcopy kernel7l.elf -O binary kernel7l.bin
	#dd if=kernel7l.bin of=kernel7l.img bs=32768 skip=1 
	cp kernel7l.bin kernel7l.img
	#xxd kernel7l.img > k.txt


.SUFFIXES: .c .s .o

clean:
	rm -f $(OBJS) common/*.s rpi400/crt0.o
	rm -f *.o *.elf *.bin *.img *.lst
