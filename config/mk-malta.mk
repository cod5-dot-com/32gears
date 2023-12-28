
# https://gist.github.com/extremecoders-re/3ddddce9416fc8b293198cd13891b68c
#
all:
	qemu-system-mipsel -kernel vmlinuz-*4kc-malta \
    		-M malta -serial stdio \
		-m 512 -hda hda.qcow \
		-initrd initrd.img \
    		-append "rw console=ttyS0 vga=cirrus vesa=0x111 root=/dev/sda1 nokaslr"

comp:
	 mips64-linux-gnu-gcc -EL -mabi=32 -mfp32 -mips1 -S hello.c

install:
#	wget http://ftp.debian.org/debian/dists/Debian11.5/main/installer-mipsel/current/images/malta/netboot/initrd.gz
#	wget http://ftp.debian.org/debian/dists/Debian11.5/main/installer-mipsel/current/images/malta/netboot/vmlinuz-5.10.0-18-4kc-malta
	qemu-img create -f qcow2 hda.qcow 10G
	qemu-system-mipsel -cdrom debian-*-mipsel-netinst.iso \
		-hda hda.qcow \
		-M malta \
		-kernel vmlinuz-*-4kc-malta \
		-boot d \
		-initrd initrd.gz \
		-m 512 \
		-nographic \
		-append "root=/dev/sda1 nokaslr" 

	
