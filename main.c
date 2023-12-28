/*
 *             32gears - Serial port loader
 *
 *                       24 February MMXV PUBLIC DOMAIN
 *           The author disclaims copyright to this source code.
 *
 *
 */

#include "raspi.h"
#include "uart.h"
#include "timer.h"
#include "irq.h"

void jump(int r0, int r1, int r2);
void blink(int n);

void echo(char *txt)
{
	while (*txt) {
		uart0_write(*txt);
		txt++;
	}
}

void echo_hex(int n)
{
	int i;
	for (i = 0; i < 8; i++) {
		int k = (n & 0xF0000000) >> 28;
		if (k <= 9 ) {
			uart0_write('0' + k);
		} else {
			uart0_write('A' + k - 10);
		}
		n <<= 4;
	}
}

void echo_num(int n)
{
	int d = 10000000;
	int c = '0';
        if (n < 0) {
		uart0_write('-');
		n = -n;
	}	
	while (n >= d) { n -= d; c++;} uart0_write(c);
	d = 1000000; c = '0';
	while (n >= d) { n -= d; c++;} uart0_write(c);
	d = 100000; c = '0';
	while (n >= d) { n -= d; c++;} uart0_write(c);
	d = 10000; c = '0';
	while (n >= d) { n -= d; c++;} uart0_write(c);
	d = 1000; c = '0';
	while (n >= d) { n -= d; c++;} uart0_write(c);
	d = 100; c = '0';
	while (n >= d) { n -= d; c++;} uart0_write(c);
	d = 10; c = '0';
	while (n >= d) { n -= d; c++;} uart0_write(c);
	c = '0' + n;
	uart0_write(c);
}

int raspi_main(int r0, int r1, int r2)
{
	int i;
	int load = 0;
	int *addr = 0;
	int d = 0; 
	int n = 0;
	int k;

	addr += 0x2000;
	
	uart0_init();

	echo("\r\n------------------------------------------\r\n");	
	echo("Raspberry PI 2 B serial port kernel loader\r\n");
	echo("     Public Domain  27 February MMXV\r\n");	

	pic_init();
	timer0_init();	
	timer_sys_init();
	enable_irq();	

	echo("------------------------------------------\r\n");	
	uart0_write('\n');
	uart0_write('\n');
	echo("Please upload your kernel...");
	blink(2);
	while (1) {
		i = 0;
		while (!uart0_data_ready()) {
			i++;
			if (i == 0x2000) {
				static int r = 0;
				k = timer_sys_val();
				if (r == 30) {
					uart0_write('.');
					r = 0;
				}
				r++;
				i = 0;
				if (load != 0) {
					echo("\nRUN the kernel...\n Size: ");
					echo_num(load << 2);
					echo("Bytes\n");
					jump(r0, r1, r2);
				}
			}
		}
		d = (d >> 8) & 0x00FFFFFF;
		d |= (uart0_read() << 24) & 0xFF000000;
		n++;
		if (n == 4) {
			*addr = d;
			addr++;
			n = 0;
			d = 0;
			load++;
		}
	}
	return 0;
}

void hang(void)
{
	echo ("\nhang\n");
}

