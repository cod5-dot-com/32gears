#         27 february MMXXIII PUBLIC DOMAIN by Jean-Marc Lienher
#           The author disclaims copyright to this source code.

.set LDADDR, 0x010000
.set Cgfx_info, 1024 + 8
.set STROFF,  -512 

.code16
.text
.global _start
_start:
	jmp bypass
	nop
public_domain:
.ascii "io.sys"

bypass:
	movw 0x7C00, %sp	# set stack pointer to where we've been loaded
	xorw %ax, %ax
	movw %ax, %ss
	pushl %ebx
	pushl %edx		# save dx value passed by VBR
	movw %ax, %es
	movw %ax, %ds

	movl $0x83, %ebx
	movb $0x0E, %ah	 	# print I
	movb $'I', %al
	int $0x10

	ljmpl $0,$updatecs-_start+0x7C00
updatecs:
	movb $0x0E, %ah	 	# print O
	movb $'O', %al
	int $0x10

boot:
	movb $',', %al
	call putc
	movb $'S', %al
	call putc
	movb $'Y', %al
	call putc
	movb $'S', %al
	call putc
	movb $' ', %al
	call putc
	popl %edx		# dx value passed by BIOS
	popl %ebx		# ebx value passed by VBR

	addl $1, %ebx
self_load:
	movb $0x10, (lba_packet_size)
	movb $0x0, (lba_packet_reserved)
	movw $127, (lba_packet_sectors)
	movw $0, (lba_packet_offset)
	movw $0x1000, (lba_packet_segment)
	movl %ebx, (lba_packet_lba)
	movl $0x0, (lba_packet_padding)

	movw $3, %cx
try_read:
	movw $0, %ax
	movw %ax, %ds
	movb $0x42, %ah			# read block, %dx contains disk id
	movw $lba_packet, %si
	int $0x13
	jnc read_done 
	movb $0, %ah			# reset disk controller
	int $0x13
	loop try_read

cant_read_lba:
	movb $'#', %al
	call putc
io_error:
	jmp halt

read_done:
	movb $'*', %al
	call putc

	ljmpw $0x1000, $0 # jump to second_stage

putc:	# print %al char to the console
	movb $0x0E, %ah
	int $0x10
	ret

halt:
	hlt
	movb $'.', %al
	call putc
	jmp halt


.p2align 4,0
lba_packet:
lba_packet_size:
.byte 0x10
lba_packet_reserved:
.byte 0x0
lba_packet_sectors:
.word 0x0001
lba_packet_offset:
.word 0x7C00
lba_packet_segment:
.word 0x0
lba_packet_lba:
.long 0
lba_packet_padding:
.long 0

signature:
.org _start + 510 
.byte 0x55, 0xAA

.code16
.globl second_stage
second_stage:
	movw %cs, %ax
	movw %ax, %ds
	movw %ax, %es
    	movw %ax, %fs
    	movw %ax, %gs
    	#movw %ax, %ss

	call fb_mode_getinfo

	movw $yo + STROFF - _start, %si
	call print

	call fb_init

	# A20 line https://wiki.osdev.org/A20_Line
    	cli

	call a20_wait0
	movb $0xD0, %al
    	outb $0x64
    	call a20_wait1
    	xorw %ax, %ax
    	inb $0x60

    	pushw %ax
    	call a20_wait0
    	movb $0xD1, %al
    	outb $0x64
    	call a20_wait0
    	popw %ax
    	orw $0x2, %ax
    	outb $0x60
	
    	lgdtl gdtp + STROFF - _start
	lidtl idt + STROFF - _start


	#  enable protected mode
    	movl %cr0, %eax
    	orl $0x1, %eax
    	movl %eax, %cr0

	ljmpl $0x8, $protected - _start + 0x10000 - 512

print:
	movl $0x83, %ebx
	movb $0x0E, %ah
	lodsb
	cmpb $0, %al
	je print_ret
	int $0x10
	jmp print
print_ret:
	ret
yo:
.asciz "YO\n"

a20_wait0:
    	xorw %ax, %ax
    	inb $0x64
    	btw $1, %ax
    	jc a20_wait0
    	ret

a20_wait1:
    	xorw %ax, %ax
    	inb $0x64
    	btw $0, %ax
    	jnc a20_wait1
    	ret

.code32
protected:
    	movw $0x10, %ax
	movw %ax, %ds
    	movw %ax, %es
    	movw %ax, %fs
    	movw %ax, %gs
    	movw %ax, %ss
    	movl $0x7C00, %esp
	movl $0x10000 + 1024, %eax
	jmpl *%eax

.code16
# https://github.com/lucianoforks/tetris-os/blob/master/src/stage0.S
.align 16
gdtp:
    .word gdt_end - gdt - 1
    .long gdt - _start + 0x010000 - 512

.align 16
gdt:
gdt_null:
    .quad 0
gdt_code_segment:
    .word 0xffff
    .word 0x0000
    .byte 0x00
    .byte 0b10011010
    .byte 0b11001111
    .byte 0x00
gdt_data_segment:
    .word 0xffff
    .word 0x0000
    .byte 0x00
    .byte 0b10010010
    .byte 0b11001111
    .byte 0x00
gdt_end:

idt:
    .word 0
    .long 0

palette:
.byte   0x00, 0x00, 0x00 # black
.byte   0x3F, 0x00, 0x00 # red
.byte   0x00, 0x3F, 0x00 # green
.byte   0x3F, 0x3F, 0x00
.byte   0x00, 0x00, 0x3F # blue
.byte   0x3F, 0x00, 0x3F
.byte   0x00, 0x3F, 0x3F
.byte   0x3F, 0x3F, 0x3F # white

# 8 levels of gray
.byte	7, 7, 7
.byte   14, 14, 14
.byte   21, 21, 21
.byte   28, 28, 28
.byte   35, 35, 35
.byte   42, 42, 42
.byte   49, 49, 49
.byte   56, 56, 56

fb_init:
	push %es
	movw $0x4F02, %ax
#	movw $0x4112, %bx # video mode: VESA 640 x 480 @ 16M colors */
	movw $0x4101, %bx # video mode: VESA 640 x 480 @ 256 colors */
	movw $0, %di
    	int $0x10
	pop %es

	# get current mode
	push %es
	movw $0x4F03, %ax
    	int $0x10
	pop %es
	
	cmpw $0x004F, %ax
	je fb_mode_readok
	movw $novesa_str + STROFF - _start, %si
	jmp error

fb_mode_readok:
	andw $0x3FFF, %bx
#	cmpw $0x0112, %bx
	cmpw $0x0101, %bx
	movw %bx, Cgfx_info
	je fb_mode_ok
	movw $badmod_str + STROFF - _start, %si
	jmp error

fb_mode_ok:
	# set palette
	push %es
	movw $0x1012, %ax
	movw $0x0, %bx
	movw $32, %cx
	movw $0 , %dx
	movw $palette + STROFF - _start, %dx
    	int $0x10
	pop %es

	ret

fb_mode_getinfo:
	# get mode specs
	push %es
	movw $0x1000, %ax
	movw %ax, %es
	movw $0x4F01, %ax
#	movw $0x0112, %cx
	movw $0x0101, %cx
	movw $Cgfx_info, %di
    	int $0x10
	pop %es

	cmpw $0x004F, %ax
	je fb_mode_infook
	movw $infofail_str + STROFF - _start, %si
	jmp error

fb_mode_infook:
	movw $gfxok_str + STROFF - _start, %si
	call print
	ret

infofail_str:
.asciz "Cannot read GFX info.\r\n"

badmod_str:
.asciz "Bad VESA mode.\r\n"

gfxok_str:
.asciz "GFX info ok...\r\n"

novesa_str:
.asciz "no vesa GFX card!\n"

error:
	call print
	hlt
error1:
	jmp error1

.org _start + 1023 + 512
	nop
world32:
