
.global pl011_init
pl011_init:
pl011_init_ret:
	bx lr

.global pl011_write
pl011_write:
	push {r1}

pl011_not_ready:
	ldr r1,=PL011_FR
	ldr r1,[r1]
	and r1,r1,#PL011_TXFF
	cmp r1,#0
	bne pl011_not_ready

	ldr r1,=PL011_DR
	str r0,[r1]	

pl011_write_ret:
	pop {r1}
	bx lr


.global Cpl011_write
Cpl011_write:
	push {r11,lr}
	mov r11,sp
	ldr r0,[r11,#8]
	bl pl011_write
	pop {r11,pc}

.global pl011_read
pl011_read:
	push {r1,r11,lr}
	ldr r1,=PL011_FR
	ldr r1,[r1]
	and r1,r1,#PL011_RXFE
	cmp r1,#0
	bne pl011_no_data

	ldr r1,=PL011_DR
	ldr r0,[r1]
	and r0,r0,#0xFF	
	b pl011_ret

pl011_no_data:
	ldr r0,=-1
pl011_ret:
	pop {r1,r11,pc}


.ltorg
