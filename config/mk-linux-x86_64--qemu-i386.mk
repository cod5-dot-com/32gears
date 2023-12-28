PATH:= $(PATH)
CC:= gcc -m32
AS:= as -m32

all: sh.exe mbr vbr io.sys bootx64 

include config/mk-clean.mk

sh.exe:
	scc -o build/sh.exe tools/sh.c

mbr:
	as --32 arch/i386/mbr.S -o build/mbr.o
	ld -m elf_i386 -o build/mbr.elf -T arch/i386/linker.ld build/mbr.o
	objcopy build/mbr.elf -O binary build/mbr.b
	dd if=build/mbr.b of=build/mbr.bin skip=0 count=1 bs=512
	build/sh.exe bin2hex build/mbr.bin build/mbr.h
	cp build/mbr.h arch/i386/
	dd if=build/mbr.bin of=build/mbr.pbin skip=0 count=440 bs=1
vbr:
	as --32 arch/i386/vbr.S -o build/vbr.o
	ld -m elf_i386 -o build/vbr.elf -T arch/i386/linker.ld build/vbr.o
	objcopy build/vbr.elf -O binary build/vbr.b
	dd if=build/vbr.b of=build/vbr.bin skip=0 count=1 bs=512
	build/sh.exe bin2hex build/vbr.bin build/vbr.h
	cp build/vbr.h arch/i386/

io.sys: arch/i386/sys.c
	scc -c -o build/sys.o arch/i386/sys.c
	as --32 arch/i386/io.S -o build/io.o
	as --32 arch/i386/io2.S -o build/io2.o
	ld -m elf_i386 -o build/io.elf -T arch/i386/linker.ld build/io.o 
	ld -m elf_i386 -o build/io2.elf -T arch/i386/io.ld build/io2.o build/sys.o
	objcopy build/io.elf -O binary build/io.b
	objcopy build/io2.elf -O binary build/io2.b
	dd if=build/io.b of=build/io.sys skip=0 bs=512
	cat build/io2.b >> build/io.sys


disk: sh.exe
#	build/sh.exe mkvhd 65536 build/disk.vhd
#	dosfstools/mkdosfs -v --boot build/vbr.bin --blocks 16384 --offset 63 -F 32 build/disk.vhd
	build/sh.exe mkvhd 524288 build/disk.vhd
	dosfstools/mkdosfs -v --boot build/vbr.bin --blocks 131072 --offset 2048 -F 32 build/disk.vhd
	dosfstools/mcopy --offset 2048 -i build/disk.vhd build/io.sys ::
	dosfstools/mmd --offset 2048 -i build/disk.vhd efi
	dosfstools/mmd --offset 2048 -i build/disk.vhd efi/boot
	dosfstools/mcopy --offset 2048 -i build/disk.vhd build/bootx64.efi ::efi/boot/
	dosfstools/mls --offset 2048 -i build/disk.vhd /
	dosfstools/mls --offset 2048 -i build/disk.vhd /efi/boot/
	qemu-img convert -f vpc -O raw build/disk.vhd build/disk.img

build/OVMF.fd:
	curl https://raw.githubusercontent.com/clearlinux/common/master/OVMF.fd > build/OVMF.fd

bootx64:
	as --64 arch/i386/bootx64.S -o build/bootx64.o
	ld -m elf_x86_64 -o build/bootx64.elf -T arch/i386/link64.ld build/bootx64.o
	objcopy build/bootx64.elf -O binary build/bootx64.efi

disk64: disk
	dd if=/dev/zero of=build/disk64.img iflag=fullblock bs=1M count=256 && sync
	 build/sh.exe mkvhd 524288 build/disk64.vhd
	dosfstools/mkdosfs -v --boot build/vbr.bin --blocks 131072 --offset 2048 -F 32 build/disk64.vhd
	qemu-img convert -f vpc -O raw build/disk64.vhd build/disk64.img
#	qemu-img convert -f raw -O vpc build/disk64.img build/disk64.vhd
	arch/i386/gpt.sh
	dosfstools/mcopy --offset 2048 -i build/disk64.vhd build/io.sys ::
	#dosfstools/mmd --offset 2048 -i build/disk64.vhd efi
	dosfstools/mmd --offset 2048 -i build/disk64.vhd efi
	dosfstools/mmd --offset 2048 -i build/disk64.vhd efi/boot
	dosfstools/mcopy --offset 2048 -i build/disk64.vhd build/bootx64.efi ::efi/boot/
	dosfstools/mls --offset 2048 -i build/disk64.vhd /
	dosfstools/mls --offset 2048 -i build/disk64.vhd /efi/boot/
	qemu-img convert -f vpc -O raw build/disk64.vhd build/disk64.img


run64: build/OVMF.fd disk64
	qemu-system-x86_64 \
		-bios  /usr/share/edk2/ovmf/OVMF.inteltdx.fd  \
		-drive if=none,id=stick,format=vpc,file=build/disk64.vhd \
		-device nec-usb-xhci,id=xhci \
		-device usb-storage,drive=stick,bus=xhci.0 


run: disk
	qemu-system-x86_64  \
		-smp cores=2 \
		-drive if=none,id=stick,format=raw,file=build/disk.vhd \
		-device nec-usb-xhci,id=xhci \
		-device usb-storage,bus=xhci.0,drive=stick

bochs: disk
	bochs -q -f arch/i386/bochrc.txt

vbox: disk
	 VBoxManage registervm arch/i386/vbox.vbox 
	 VirtualBoxVM --startvm vbox
	 VBoxManage unregistervm vbox 

vmware: disk
	vmplayer

.c.s:
	$(CC) -S $<

.s.o:
	$(AS) -o $@ $< 

