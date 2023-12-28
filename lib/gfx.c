

#include "font.h"

#define FONT_HEIGHT 16
#define FONT_WIDTH 8

static int shell_fg = 0xFFFFFFFF;
static int shell_bg = 0xFF000000;
static int shell_x = 0;
static int shell_y = 0;

void gfx_draw_char(int x, int y, int c)
{
	char *d;
	int i, j;
	char *p;
	char *pl;
	int l;
	static int colo = 0;

	/*
	for (i = 0; i < fb_height; i++) {
		for (j = 0; j < fb_width; j++) {
			fb[i * fb_pitch + j] = j &0xF;
		}
	}
	*/
	if (c < ' ' || c > 126) {
		return;
	}
	colo++;
	c -= ' ';
	d = &font[16 * c];
	p = fb + (y * fb_pitch);
	if (fb_bpp == 4) {
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
	} else if (fb_bpp == 1) {
		for (i = 0; i < 16; i++) {
			if ((y + i) < 0) {
				continue;
			} else if ((y + i) >= fb_height) {
				return;
			}
			l = d[i];
			pl = p + x;
			for (j = 0; j < 8; j++) {
				if ((x + j) < 0) {
				} else if ((x + j) >= fb_width) {
				} else if (l & 0x80) {
					pl[0] = shell_fg;
					pl[0] = colo & 0x0F;
				} else {
					pl[0] = shell_bg;
					pl[0] = 0;
				}
				pl += 1;
				l <<= 1;
			}
			p += fb_pitch;
		} 
	} else {
		for (i = 0; i < 16; i++) {
			if ((y + i) < 0) {
				continue;
			} else if ((y + i) >= fb_height) {
				return;
			}
			l = d[i];
			pl = p + (x * 3);
			for (j = 0; j < 8; j++) {
				if ((x + j) < 0) {
				} else if ((x + j) >= fb_width) {
				} else if (l & 0x80) {
					pl[0] = shell_fg;
					pl[1] = shell_fg >> 8;
					pl[2] = shell_fg >> 16;
				} else {
					pl[0] = shell_bg;
					pl[1] = shell_bg >> 8;
					pl[2] = shell_bg >> 16;
				}
				pl += 3;
				l <<= 1;
			}
			p += fb_pitch;
		} 
	
	}
}


void gfx_scroll(int a) 
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

void gfx_putchar(int ch)
{
	if (ch == '\n') {
		shell_x = -FONT_WIDTH;
		shell_y += FONT_HEIGHT;
	} else if (ch == '\b') {
		shell_x -= FONT_WIDTH;
		if (shell_x < 0) {
			shell_x = 0;
		}
		gfx_draw_char(shell_x, shell_y, ' ');
		shell_x -= FONT_WIDTH;
	} else {
		gfx_draw_char(shell_x, shell_y, ch);
	}

	shell_x += FONT_WIDTH;
	if (shell_x >= fb_width) {
		shell_x = 0;
		shell_y += FONT_HEIGHT;
	}
	if (shell_y > (fb_height - FONT_HEIGHT)) {
		gfx_scroll(shell_y - (fb_height - FONT_HEIGHT));
		shell_y = fb_height - FONT_HEIGHT;
	}
}

void gfx_puts(char *s)
{
	while (*s) {
		gfx_putchar(*s);
		s++;
	}
	fb_swap();
}

void gfx_print_int(int i) {
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
	gfx_puts(str);
}


