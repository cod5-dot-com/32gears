#              32gears OS - the definitive 32-bit operating system
#
#	                 30 May MMXIV PUBLIC DOMAIN
#            The author disclaims copyright to this source code. 
#
# Serial port kernel loader
#
	.text
	.cpu arm7tdmi
	.align 2
	.globl _startup
_startup:
        mov sp,#0x8000
spi:
	ldr r3, interrupt_table
#	mov r3, :upper16:interrupt_table
#	lsl r3, #16
#	mov r4, :lower16:interrupt_table
#	add r3, r3, r4
	mov r4, #0
        add r5, r4, #68
copy_irq:
        ldr r6, [r3]
        str r6, [r4]
        add r3, r3, #4
        add r4, r4, #4
        cmp r4, r5
        blo copy_irq

         ;@ (PSR_IRQ_MODE|PSR_FIQ_DIS|PSR_IRQ_DIS)
        mov r4,#0xD2
        msr cpsr_c,r4
        mov sp,#0x8000

        ;@ (PSR_FIQ_MODE|PSR_FIQ_DIS|PSR_IRQ_DIS)
        mov r4,#0xD1
        msr cpsr_c,r4
        mov sp,#0x4000

        ;@ (PSR_SVC_MODE|PSR_FIQ_DIS|PSR_IRQ_DIS)
        mov r4,#0xD3
        msr cpsr_c,r4
        mov sp,#0x3000

        cps #0x1F ;@ system mode
        mov sp,#0x2000
next:	
	bl raspi_main
	b reset

interrupt_table:
	ldr pc,reset_handler
	ldr pc,undefined_handler_
	ldr pc,swi_handler_
	ldr pc,prefetch_handler_
	ldr pc,data_handler_
	ldr pc,unused_handler_
	ldr pc,irq_handler_
	ldr pc,fiq_handler_
reset_handler: 		.word reset
undefined_handler_: 	.word undefined
swi_handler_: 		.word swi
prefetch_handler_: 	.word prefetch
data_handler_: 		.word data
unused_handler_: 	.word hang0
irq_handler_: 		.word irq
fiq_handler_: 		.word fiq

reset:
	bl _startup

undefined:
	bl undefined_handler
	movs pc,lr
swi:	// svc called
	push {r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,lr}
	biceq r12,r12, #0xFF000000  // Extract SWI Number
	mov r1, r12
	mov r1, lr
	bl swi_handler
	pop {r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,lr}
	movs pc,lr

prefetch:
	bl prefetch_handler
	subs pc,lr,#4
data:
	bl data_handler
	subs pc,lr,#8
fiq:
	bl fiq_handler
	subs pc,lr,#4

hang0:
	bl hang
	subs pc,lr,#4

hang1:
	b hang1

irq:
	push {r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,lr}
	bl irq_handler
	pop {r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,lr}
	subs pc,lr,#4

	.globl peek
peek:
        ldr     r0,[r0]
	mov	pc,lr

	.globl poke
poke:
        str     r1,[r0]
	mov	pc,lr

	.globl jump
jump:
	mov r4, #0x08000
	bx r4

	.globl enable_irq
enable_irq:
	mrs r0,cpsr
	bic r0,r0,#0x80
	msr cpsr_c,r0
	bx lr
	
	.globl disable_irq
disable_irq:
	ldmfd sp!, {r8, r12}
	orr r12, r12, #0x80 // set irq flag to disable it
	msr SPSR_cxsf, r12
	ldmfd sp!, {r12, pc}^

	.globl blink
blink:
	ldr r3,=0x3F200000
	
	mov r1,#1 //gpio 47 = 4  7*3 21
	lsl r1,#21
	str r1,[r3,#16] //4*4=16 is controller address

	mov r1,#1
	lsl r1,#15 // 47 -32 = 15
loop1$:
	str r1,[r3,#44] // 40 + 4 = turn on
	mov r2,#0x0F0000
wait1:
        sub r2,#1
        cmp r2,#0
        bne wait1

	str r1,[r3,#32] // 28 + 4  = turn off
	mov r2,#0x0F0000
wait2:
        sub r2,#1
        cmp r2,#0
        bne wait2

	sub r0,#1	
	cmp r0,#0
	beq end

	b loop1$
end:	
	bx lr


