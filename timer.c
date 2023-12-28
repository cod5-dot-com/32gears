/*
 *             32gears ...
 *
 *                       31 October MMXIV PUBLIC DOMAIN
 *           The author disclaims copyright to this source code.
 *
 * http://code.google.com/p/xv6-rpi/source/browse/src/device/timer.c
 * https://gitorious.org/lambdapi/lambdapi/source/
 *      dbd065a652fba658076fa449eaaba256a69c1d7c:src/bsp/generic/include/sp804.h
 * https://github.com/rememberthe8bit/pi-interrupt-test/blob/master/systimer.c
 */

#include "raspi.h"
#include "timer.h"
#include "uart.h"

#define INCRE_SYS 40000

#define TIMER0_BASE	0x101E2000
#define BASE_IRQ_EN     0x3F00b218
#define BASE_IRQ_DI     0x3F00b224
#define SP804_0_BASE 0x3F00b400
#define SP804_1_BASE 0x3F00b420

#define LOAD     0        
#define CURVAL   1       
#define CONTROL  2      
#define INTCLR   3     
#define RIS      4     
#define MIS      5    
#define BGLOAD	 6
#define DIV      7
#define CNT      8
 

#define TIMER_LOAD     0x3F00b400     
#define TIMER_CURVAL   (TIMER_LOAD + 0x04)       
#define TIMER_CONTROL  (TIMER_LOAD + 0x08)       
#define TIMER_INTCLR    (TIMER_LOAD + 0x0C)    
#define TIMER_RIS      (TIMER_LOAD + 0x10)    
#define TIMER_MIS       (TIMER_LOAD + 0x14)  
#define TIMER_BGLOAD	(TIMER_LOAD + 0x18)
#define TIMER_DIV      (TIMER_LOAD + 0x1C)
#define TIMER_CNT      (TIMER_LOAD + 0x20)
 
#define TIMER_ONESHOT  0x01 
#define TIMER_32BIT    0x02
#define TIMER_INTEN    0x20     
#define TIMER_PERIODIC 0x40   
#define TIMER_EN       0x80  

static int sys_counter = 0;
static int counter = 0;

void timer0_init(void)
{
 	int c = 0;
	int k;

	poke(BASE_IRQ_DI, 1);
 	poke(TIMER_LOAD, 500000); 
 	poke(TIMER_BGLOAD, 500000); 
	poke(TIMER_DIV, 0xF9); 
	c = peek(TIMER_CONTROL);
	c = c & ~0x03FF;
	c = 0x003E0000;
	poke(TIMER_CONTROL, c|TIMER_EN|TIMER_32BIT|TIMER_INTEN);
	poke(TIMER_CONTROL, 0x200|c|TIMER_EN|TIMER_32BIT|TIMER_INTEN);
	poke(TIMER_CONTROL, 0x200|c|TIMER_EN|TIMER_32BIT|TIMER_INTEN);
	if (0) poke(TIMER_CONTROL, 0x200|c|0xA2);
	poke(TIMER_INTCLR, 0); 
	poke(BASE_IRQ_EN, 1);
}

int timer0_val(void)
{
	int r;
	r = peek(TIMER_CURVAL);
	return r;
}

void timer0_isr(void)
{
	int c;
	poke(TIMER_INTCLR, 0); 
	counter++;
}


void timer_sys_init(void)
{
 	int c;

	c = peek(SYSTIMER_CLO);
	c += INCRE_SYS;
	poke(SYSTIMER_C3, c);
	poke(SYSTIMER_CS, 1 << 3);
	poke(INT_EN_IRQ1, 1 << 3);
	sys_counter = 0;
}

int timer_sys_val(void)
{
	return sys_counter;
}

void timer_sys_isr(void)
{
	int c;
	c = peek(SYSTIMER_C3);
	c += INCRE_SYS;
	poke(SYSTIMER_C3, c);
	poke(SYSTIMER_CS, 1 << 3);
	sys_counter++;
	if ((sys_counter & 0x7F) == 0) {
		uart0_write('$');
	}
}


