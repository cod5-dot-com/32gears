
clean:
	rm -f $(OBJS) common/*.s rpi400/crt0.o
	rm -f *.o *.elf *.b *.bin *.img *.lst mbr.h mbr.vhd vbr.h vbr.vhd
	rm -f disk.vhd *.sys *.efi
	rm -rf arch/i386/Logs/
	rm -f arch/i386/vbox.vbox-prev

