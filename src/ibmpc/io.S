#           27 march MMXXII PUBLIC DOMAIN by Jean-Marc Lienher
#           The author disclaims copyright to this source code.

.code16
.text
.equ start, 0x7C00
.org 0 + start
.global _start

_start:
	jmp bypass
	nop
.org 0x03 + start
public_domain:
.ascii "io.sys"

bypass:
	movl $0x83, %ebx
	movb $0x0E, %ah	 	# print I
	movb $'I', %al
	int $0x10

	movw 0x7C00, %sp	# set stack pointer to where we've been loaded
	xorw %ax, %ax
	movw %ax, %ss
	pushl %ebx
	pushl %edx		# save dx value passed by VBR
	movw %ax, %es
	movw %ax, %ds

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
	popl %ebx		# ebx value passed by BIOS


loop:
	movw $500, %ax
repeat:
	movw $57600, %cx
delay:
	subw $1, %cx
	jnz delay

	subw $1, %ax
	jnz repeat

	movb $8, %al
	call putc
	movb $'/', %al
	call putc

	movw $500, %ax
repeat1:
	movw $57600, %cx
delay1:
	subw $1, %cx
	jnz delay
	subw $1, %ax
	jnz repeat1

	movb $8, %al
	call putc
	movb $'\\', %al
	call putc

	jmp loop	

putc:				# print %al char to the console
	movb $0x0E, %ah
	int $0x10
	ret

halt:
	hlt
	movb $'.', %al
	call putc
	jmp halt


signature:
.org 510 + start
.byte 0x55, 0xAA

