/*
 *             32gears ... 
 *
 *                       30 May MMXIV PUBLIC DOMAIN
 *           The author disclaims copyright to this source code.
 *
 *
 * https://github.com/mrvn/raspbootin/blob/master/raspbootin/uart.cc
 * https://github.com/dwelch67/raspberrypi/blob/master/uartx01/uartx01.c
 */

#include "raspi.h"
#include "uart.h"

void uart0_init(void)
{
	int i;
	int ra;

	poke(UART0_CR, 0);

	ra = peek(GPFSEL1);
	ra &= ~(7 << 12); 
    	ra |= 4 << 12; 
    	ra &= ~(7 << 15); 
    	ra |= 4 << 15; 
    	poke(GPFSEL1, ra);

	poke(GPPUD, 0);
	for (i = 0; i < 150; i++) i = i;
	poke(GPPUDCLK0, (1<<14)|(1<<15));
	for (i = 0; i < 150; i++) i = i;
	poke(GPPUDCLK0, 0);

	poke(UART0_ICR, 0x7FF);
	poke(UART0_IBRD, 1);
	poke(UART0_FBRD, 40);
	poke(UART0_LCRH, 0x70);
	poke(UART0_CR, 0x301);
}

void uart0_write(int byte)
{
	while (peek(UART0_FR) & 0x20);
	poke(UART0_DR, byte);		
}

int uart0_data_ready(void)
{
	return (peek(UART0_FR) & 0x10) == 0;
}

int uart0_read(void)
{
	while (!uart0_data_ready());
	
	return peek(UART0_DR);
}

