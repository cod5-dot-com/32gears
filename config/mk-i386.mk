PATH:= $(PATH)

all: vbr86 iosys bootx64 tool


iosys:	
	clang -c -target i686-linux-gnu ibmpc/io.S -o io.o
	clang -m16 -target i686-linux-gnu -o io.elf -nostdlib -static --no-undefined \
		-T ibmpc/linker.ld io.o 
	llvm-objcopy io.elf -O binary io.b
	dd if=io.b of=io.sys skip=62 count=1 bs=512




vbr86: mbr86
	clang -c -target i686-linux-gnu ibmpc/vbr.S -o vbr.o
	clang -m16 -target i686-linux-gnu -o vbr.elf -nostdlib -static --no-undefined \
		-T ibmpc/linker.ld vbr.o 
	llvm-objcopy vbr.elf -O binary vbr.b
	dd if=vbr.b of=vbr.bin skip=62 count=1 bs=512
	./sh.exe bin2hex vbr.bin ibmpc/vbr.h

mbr86:
	clang -c -target i686-linux-gnu ibmpc/mbr.S -o mbr.o
	clang -target i686-linux-gnu -m16 -o mbr.elf -nostdlib -static --no-undefined \
		-T ibmpc/linker.ld  mbr.o
	llvm-objcopy mbr.elf -O binary mbr.b
	dd if=mbr.b of=mbr.bin skip=62 count=1 bs=512
	./sh.exe bin2hex mbr.bin ibmpc/mbr.h

bootx64:
	clang -c -target x86_64-linux-gnu ibmpc/bootx64.S -o bootx64.o
	clang -target x86_64-linux-gnu  -o bootx64.elf -nostdlib -static --no-undefined \
		-T ibmpc/link64.ld	bootx64.o
	llvm-objcopy bootx64.elf -O binary bootx64.efi

run64:
	mkdir -p ../ff/d/EFI/BOOT/
	cp -f bootx64.efi ../ff/d/EFI/BOOT/
	qemu-system-x86_64 -cpu qemu64 -bios ../ff/OVMF.fd -drive driver=vvfat,rw=on,dir=../ff/d/ || echo bad

tool:
	make -f Makefile.tools
	./sh.exe mkvhd 65536 disk.vhd
	./sh.exe format disk.vhd
	./sh.exe ls vhd://./disk.vhd:A:/
	./sh.exe cp io.sys vhd://./disk.vhd:/
	./sh.exe ls vhd://./FD13LITE.img:A:/

run: tool

	qemu-system-i386 -usb \
		-drive if=none,id=stick,format=raw,file=./disk.vhd \
		-device nec-usb-xhci,id=xhci \
		-device usb-storage,bus=xhci.0,drive=stick

.c.s:
	$(CC) -S $<

.s.o:
	$(AS) -o $@ $< 

clean:
	rm -f $(OBJS) common/*.s rpi400/crt0.o
	rm -f *.o *.elf *.b *.bin *.img *.lst mbr.h mbr.vhd vbr.h vbr.vhd
	rm -f disk.vhd *.sys *.efi

