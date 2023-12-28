/*
 *             32gears - Serial port loader
 *
 *                       24 February MMXV PUBLIC DOMAIN
 *           The author disclaims copyright to this source code.
 *
 *
 * http://code.google.com/p/xv6-rpi/source/browse/src/device/picirq.c
 */

#include "raspi.h"
#include "timer.h"

extern void timer0_isr(void);
extern void timer_sys_isr(void);
extern void echo(char *);
extern void echo_hex(int);

#define BASE_IRQ_PENDING 0x2000B200

#define VIC_BASE        0x10140000
#define PIC_TIMER01     4
#define PIC_TIMER23     5
#define PIC_UART0       12
#define PIC_GRAPHIC     19

static int* vic_base;

#define VIC_IRQSTATUS   0 
#define VIC_FIQSTATUS   1 
#define VIC_RAWINTR     2 
#define VIC_INTSEL      3 
#define VIC_INTENABLE   4 
#define VIC_INTCLEAR    5 
#define VIC_PROTECTIOIN 8 

void pic_init(void)
{
	vic_base = (void*)0x10140000;
	vic_base[VIC_INTCLEAR] = 0xFFFFFFFF;	
}

void irq_timer01(int enable)
{
	if (enable) {
		vic_base[VIC_INTENABLE] = 1 << PIC_TIMER01;
	} else {
		vic_base[VIC_INTCLEAR] = 1 << PIC_TIMER01;
	}
}


void irq_handler(void)
{
	int pend;
	pend = peek(INT_PENDB);
	if (pend & 1) {
		timer0_isr();
	}
	poke(INT_PENDB, 0);

	pend = peek(INT_PEND1);
	if (pend & (1 << 3)) {
		timer_sys_isr();
	}
	poke(INT_PEND1, 0xFFFFFFFF);
	
}

void fiq_handler(void)
{
	echo("fiq");
}

void undefined_handler(void)
{
	echo("undefined");
}

void swi_handler(int n)
{
	echo("swi");
	echo_hex(n);
}

void data_handler(void)
{
	echo("data");
}

void prefetch_handler(void)
{
	echo("prefetch");
}
