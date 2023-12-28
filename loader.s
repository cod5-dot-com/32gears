#              32gears - 
#
#	                 30 May MMXIV PUBLIC DOMAIN
#            The author disclaims copyright to this source code. 
#
# Serial port kernel loader
#

	.section ".text"
	.align 2
	.globl _startup
_startup:
	mov r3, pc
	sub r3, r3, #8
	mov sp, r3

	add r3, r3, #0x0200
	mov r4, #0x02000000
	add r5, r4, #0x40000
copy:
	ldr r6, [r3]
	str r6, [r4]
	add r3, r3, #4
	add r4, r4, #4
	cmp r4, r5
	blo copy

next:
	mov r4, #0x02000000
	bx r4

