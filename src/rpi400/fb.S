
.global Cfb
Cfb:
.long 0
.global Cfb_width
Cfb_width:
.long 0
.global Cfb_height
Cfb_height:
.long 0
.global Cfb_pitch
Cfb_pitch:
.long 0
.global Cfb_isrgb
Cfb_isrgb:
.long 0
fb_base0:
.long 0
fb_base1:
.long 0



.global fb_init
fb_init:
	push {r1,r2,lr}
	ldr r1,=mbox

	ldr r0,=(35*4) //length of message
	str r0,[r1,#0]

	ldr r0,=MBOX_REQUEST
	str r0,[r1,#(1*4)]

	ldr r0,=MBOX_TAG_SETPHYWH
	str r0,[r1,#(2*4)]

	ldr r0,=8
	str r0,[r1,#(3*4)]

	ldr r0,=0
	str r0,[r1,#(4*4)]

	ldr r0,=640
	str r0,[r1,#(5*4)]

	ldr r0,=480
	str r0,[r1,#(6*4)]

	ldr r0,=MBOX_TAG_SETVIRTWH
	str r0,[r1,#(7*4)]

	ldr r0,=8
	str r0,[r1,#(8*4)]

	ldr r0,=8
	str r0,[r1,#(9*4)]

	ldr r0,=640
	str r0,[r1,#(10*4)]

	ldr r0,=960
	str r0,[r1,#(11*4)]

	ldr r0,=MBOX_TAG_SETVIRTOFF
	str r0,[r1,#(12*4)]

	ldr r0,=8
	str r0,[r1,#(13*4)]

	ldr r0,=8
	str r0,[r1,#(14*4)]

	ldr r0,=0
	str r0,[r1,#(15*4)]

	ldr r0,=0
	str r0,[r1,#(16*4)]

	ldr r0,=MBOX_TAG_SETDEPTH
	str r0,[r1,#(17*4)]

	ldr r0,=4
	str r0,[r1,#(18*4)]

	ldr r0,=4
	str r0,[r1,#(19*4)]

	ldr r0,=32
	str r0,[r1,#(20*4)]

	ldr r0,=MBOX_TAG_SETPXLORDR
	str r0,[r1,#(21*4)]

	ldr r0,=4
	str r0,[r1,#(22*4)]

	ldr r0,=4
	str r0,[r1,#(23*4)]

	ldr r0,=1 // RGB
	str r0,[r1,#(24*4)]

	ldr r0,=MBOX_TAG_GETFB
	str r0,[r1,#(25*4)]

	ldr r0,=8
	str r0,[r1,#(26*4)]

	ldr r0,=8
	str r0,[r1,#(27*4)]

	ldr r0,=4096	// info.pointer
	str r0,[r1,#(28*4)]

	ldr r0,=0	// info.size
	str r0,[r1,#(29*4)]

	ldr r0,=MBOX_TAG_GETPITCH
	str r0,[r1,#(30*4)]

	ldr r0,=4
	str r0,[r1,#(31*4)]

	ldr r0,=4
	str r0,[r1,#(32*4)]

	ldr r0,=0 // Byte per line
	str r0,[r1,#(33*4)]

	ldr r0,=MBOX_TAG_LAST
	str r0,[r1,#(34*4)]


	ldr r0,=MBOX_CH_PROP
	bl mbox_call

	cmp r0,#0
	beq fb_init_ret

	// successfull call
	ldr r0,[r1,#(20*4)]
	cmp r0,#32
	bne fb_init_ret

	ldr r0,[r1,#(28*4)]
	cmp r0,#0
	beq fb_init_ret

	and r0,r0,#0x3FFFFFFF
	ldr r2,=Cfb
	str r0,[r2]
	ldr r2,=fb_base0
	str r0,[r2]

	ldr r0,[r1,#(10*4)]
	ldr r2,=Cfb_width
	str r0,[r2]

	ldr r0,[r1,#(11*4)]
	lsr r0,r0,#1
	ldr r2,=Cfb_height
	str r0,[r2]

	ldr r0,[r1,#(33*4)]
	ldr r2,=Cfb_pitch
	str r0,[r2]

	ldr r0,[r1,#(24*4)]
	ldr r2,=Cfb_isrgb
	str r0,[r2]

//	ldr r0,[r1,#(16*4)]
	ldr r0,=Cfb_height
	ldr r0,[r0]
	ldr r2,=Cfb_pitch
	ldr r2,[r2]
	mul r0,r0,r2
	ldr r2,=fb_base0
	ldr r2,[r2]
	add r0,r0,r2
	ldr r2,=fb_base1
	str r0,[r2]
	ldr r2,=Cfb
	str r0,[r2]

fb_init_ret:
	pop {r1,r2,lr}
	bx lr


.global Cfb_swap
Cfb_swap:
	push {r11,lr}
	mov r11,sp

	mov r0,#'s'
	bl pl011_write

	ldr r1,=mbox

	ldr r0,=(8*4) //length of message
	str r0,[r1,#0]

	ldr r0,=MBOX_REQUEST
	str r0,[r1,#(1*4)]

	ldr r0,=MBOX_TAG_SETVIRTOFF
	str r0,[r1,#(2*4)]

	ldr r0,=8
	str r0,[r1,#(3*4)]

	ldr r0,=8
	str r0,[r1,#(4*4)]

	ldr r0,=0
	str r0,[r1,#(5*4)]

	ldr r2,=Cfb
	ldr r0,[r2]
	ldr r3,=fb_base0
	ldr r3,[r3]
	cmp r0,r3
	beq fb_swap1

	ldr r0,=fb_base0 // origin of 1st page
	ldr r0,[r0]
	str r0,[r2]
	ldr r2,=Cfb_height
	ldr r0,[r2]
	b fb_swap2
fb_swap1:
	ldr r0,=fb_base1 // origin of 2nd page
	ldr r0,[r0]
	str r0,[r2]
	ldr r0,=0
fb_swap2:
	str r0,[r1,#(6*4)]

	ldr r0,=MBOX_TAG_LAST
	str r0,[r1,#(7*4)]


	ldr r0,=MBOX_CH_PROP
	bl mbox_call

	mov r0,#'S'
	bl pl011_write

	pop {r11,pc}

.ltorg

