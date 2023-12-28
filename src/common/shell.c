

#include "common/32gears.h"
#include "common/font.h"

void puts(char*s);
void irq_init();
void timer_init(void *func, void *param);

extern int kbhit(void);
extern int getch(void);
#define FONT_HEIGHT 16
#define FONT_WIDTH 8

static int shell_fg = 0xFFFFFFFF;
static int shell_bg = 0xFF000000;
static int shell_x = 0;
static int shell_y = 0;

void print_int(int i) {
	char *h;
	char *str;
	str = "0x00000000";
	h = "0123456789ABCDEF";
	str[2] = (h[(i >> 28) & 0xF]);
	str[3] = (h[(i >> 24) & 0xF]);
	str[4] = (h[(i >> 20) & 0xF]);
	str[5] = (h[(i >> 16) & 0xF]);
	str[6] = (h[(i >> 12) & 0xF]);
	str[7] = (h[(i >> 8) & 0xF]);
	str[8] = (h[(i >> 4) & 0xF]);
	str[9] = (h[i & 0xF]);
	puts(str);
}

void draw_char(int x, int y, int c)
{
	char *d;
	int i, j;
	char *p;
	char *pl;
	int l;

	if (c < ' ' || c > 126) {
		return;
	}
	c -= ' ';
	d = &font[16 * c];
	p = fb + (y * fb_pitch);
	for (i = 0; i < 16; i++) {
		if ((y + i) < 0) {
			continue;
		} else if ((y + i) >= fb_height) {
			return;
		}
		l = d[i];
		pl = p + (x * 4);
		for (j = 0; j < 8; j++) {
			if ((x + j) < 0) {
			} else if ((x + j) >= fb_width) {
			} else if (l & 0x80) {
				((int*)pl)[0] = shell_fg;
			} else {
				((int*)pl)[0] = shell_bg;
			}
			pl += 4;
			l <<= 1;
		}
		p += fb_pitch;
	}
}
void scroll(int a) 
{
	char *src;
	int i, j;
	char *p;
	src = fb + (a * fb_pitch);
	memcpy(fb, src, (fb_height - a) * fb_pitch);
	for (i = 0; i < a; i++) {
		p = fb + ((fb_height - i - 1) * fb_pitch);
		for (j = 0; j < fb_width; j++) {
			((int*)p)[0] = shell_bg;
			p += 4;
		}
	}
}

void swap(void)
{
	char *last;
	last = fb;
	fb_swap();
	memcpy(fb, last, fb_height * fb_pitch);
}

void putchar(int ch)
{
	if (ch == '\n') {
		shell_x = -FONT_WIDTH;
		shell_y += FONT_HEIGHT;
	} else if (ch == '\b') {
		shell_x -= FONT_WIDTH;
		if (shell_x < 0) {
			shell_x = 0;
		}
		draw_char(shell_x, shell_y, ' ');
		shell_x -= FONT_WIDTH;
	} else {
		draw_char(shell_x, shell_y, ch);
	}

	shell_x += FONT_WIDTH;
	if (shell_x >= fb_width) {
		shell_x = 0;
		shell_y += FONT_HEIGHT;
	}
	if (shell_y > (fb_height - FONT_HEIGHT)) {
		scroll(shell_y - (fb_height - FONT_HEIGHT));
		shell_y = fb_height - FONT_HEIGHT;
	}
}

void puts(char *s)
{
	while (*s) {
		pl011_write(*s);
		putchar(*s);
		s++;
	}
}

void shell_main(void)
{
	int x, y;
	int i, j;
	char *p;
	int doit = 0;

	print_int(*((int*)0x18));
	for (i = 0; i < fb_height; i++) {
		p = fb + (i * fb_pitch);
		for (j = 0; j < fb_width; j++) {
			p[0] = 0xFF; // blue
			p[1] = 0x80; // green
			p[2] = 0x80; // red
			p[3] = 0xFF;
			p += 4;
		}
	}
	puts("32 Gears\n");
	print_int(*((int*)0x0));
	swap();
	irq_init();
	puts("Swapped\n");
	timer_init(putchar, "T");
	while (1) {
		while (kbhit()) {
			putchar(getch());
			doit = 1;
		}
		if (doit) {
			swap();
			doit = 0;
		} else {
			print_int(clock());
			puts("\n");
			wait(10);
			swap();
		}
		
	}
	print_int(fb_width);
	print_int(fb_height);
	print_int(fb_pitch);

}

