#         27 february MMXXIII PUBLIC DOMAIN by Jean-Marc Lienher
#           The author disclaims copyright to this source code.

.set LDADDR, 0x010000
.code32
.text
.global _start
_start:
#	ljmpl $10,$0
	jmp Cmain
x:
	jmp x
	nop
.org _start + 8
.globl Cgfx_info
Cgfx_info:
.rept 40
.byte 0
.endr
.long 0x0B0000
.rept 210
.byte 0
.endr
	.data
	.globl	Cenviron
Cenviron:
	.long	0

	.text

# internal switch(expr) routine
# %esi = switch table, %eax = expr

        .globl  switch
switch: 
	pushl   %esi
        movl    %edx,%esi
        movl    %eax,%ebx
        cld
        lodsl
        movl    %eax,%ecx
next:   lodsl
        movl    %eax,%edx
        lodsl
        cmpl    %edx,%ebx
        jnz     no
        popl    %esi
        jmp     *%eax
no:     loop    next
        lodsl
        popl    %esi
        jmp     *%eax


# int setjmp(jmp_buf env);

        .globl  Csetjmp
Csetjmp:
        movl    4(%esp),%edx    # env
        movl    %esp,(%edx)
        addl    $4,(%edx)
        movl    %ebp,4(%edx)
        movl    (%esp),%eax
        movl    %eax,8(%edx)
        xorl    %eax,%eax
        ret

# void longjmp(jmp_buf env, int v);

        .globl  Clongjmp
Clongjmp:
        movl    8(%esp),%eax    # v
        orl     %eax,%eax
        jne     vok
        incl    %eax
vok:    movl    4(%esp),%edx    # env
        movl    (%edx),%esp
        movl    4(%edx),%ebp
        movl    8(%edx),%edx
        jmp     *%edx

# void *memcpy2(void *dest, void *src, size_t n)	
	.globl Cmemcpy2
Cmemcpy2:
	movl 12(%esp),%ecx	# n
	movl 8(%esp),%esi	# src
	movl 4(%esp),%edi	# dest
	rep movsb
	ret

#uint32 OS_AsmInterruptEnable(uint32 state)
	.globl COS_AsmInterruptEnable
COS_AsmInterruptEnable:
	movl 4(%esp),%eax	# state
	cmpl $0, %eax
	jnz disablei
	sti
	ret
disablei:
	cli
	ret

#void OS_AsmInterruptInit(void)
	.globl COS_AsmInterruptInit
COS_AsmInterruptInit:
	movl $Cidt_pointer, %eax
	lidt (%eax)
#	xorl %eax,%eax
#	inb $0x21,%al
	movl $0xFC, %eax
	movl $0xF0, %eax
	outb %al,$0x21 #PIC1 data
	movl $0x0, %eax
	outb %al,$0xA1  #PIC2 data
	
#	ret

	movl $0xD4, %eax
	outb %al,$0x64  #PIC2 data
	movl $0xFF, %eax
	outb %al,$0x60  #PIC2 data
in1:
	inb $0x64,%al
	andl $1,%eax
	cmp $0,%al
	jz in1

	inb $0x60,%al

	movl $0xD4, %eax
	outb %al,$0x64  #PIC2 data
	movl $0xF4, %eax
	outb %al,$0x60  #PIC2 data
in2:
	inb $0x64,%al
	andl $1,%eax
	cmp $0,%al
	jz in2


	inb $0x60,%al
	inb $0x60,%al


	movl $0xD4, %eax
	outb %al,$0x64  #PIC2 data
	movl $0xF4, %eax
	outb %al,$0x60  #PIC2 data
in3:
	inb $0x64,%al
	andl $1,%eax
	cmp $0,%al
	jz in3


	inb $0x60,%al
	inb $0x60,%al
	inb $0x60,%al
	andl $0xFF,%eax
	push %eax
.extern Cgfx_print_int
	call Cgfx_print_int
	pop %eax


	ret

	.globl Cisr_stub
Cisr_stub:
	cli
	pushl $0
	pushl $1
	jmp isr_common

	.globl Cisr_timer
Cisr_timer:
	cli
	pushl $0
	pushl $8 
	jmp isr_common

	.globl Cisr_kbd
Cisr_kbd:
	cli
	pushl $0
	pushl $9
	jmp isr_common

	.globl Cisr_mouse
Cisr_mouse:
	cli
	pushl $0
	pushl $0x74
	jmp isr_common


	.globl Cisr_stub_err
Cisr_stub_err:
	cli
	pushl $1
	jmp isr_common

isr_common:
    pusha
    push %ds
    push %es
    push %fs
    push %gs

    mov $0x10, %ax
    mov %ax, %ds
    mov %ax, %es
    mov %ax, %fs
    mov %ax, %gs
    cld

    .extern Cisr_handler
    push %esp
    call Cisr_handler
    add $4, %esp
    

    inb $0x64, %al
    inb $0x60, %al

	movl $0xD4, %eax
	outb %al,$0x64  #PIC2 data
    	inb $0x64, %al
    	inb $0x60, %al

    movl $0x20, %eax
   outb %al, $0xA0; # PIC2
   outb %al, $0x20; # PIC1

    pop %gs
    pop %fs
    pop %es
    pop %ds

    popa

    add $8, %esp
    #sti
    iret

