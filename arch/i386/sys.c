
#define GEARS32 1
#define printk UartPrintf

#include "../../include/32gears.h"

struct Registers {
    uint32 __ignored, fs, es, ds;
    uint32 edi, esi, ebp, esp, ebx, edx, ecx, eax;
    uint32 int_no, err_no;
    uint32 eip, cs, efl, useresp, ss;
};

#define RAM_INTERNAL_BASE 0x00000000 /*8KB*/
#define RAM_EXTERNAL_BASE 0x00000000 /*1MB or 64MB*/
#define RAM_EXTERNAL_SIZE (1024 * 1024 * 8)
#define IRQ_MASK          0x20000010
#define IRQ_STATUS        0x20000020
#define IRQ_COUNTER18_NOT        0x04
#define IRQ_COUNTER18            0x08
//#define DISABLE_IRQ_SIM		1

char memory[RAM_EXTERNAL_SIZE];
char fb_back[640 * 480];

struct IDTentry {
	uint32 low;
	uint32 high;
};
struct IDTpointer {
	char v[6];
};

struct IDTpointer idt_pointer;
struct IDTentry idt_entries[256];

int isr_stub();
int isr_timer();
int isr_kbd();
int isr_mouse();
int isr_stub_err();

extern byte gfx_info[256];
byte *fb;
byte *fb_front;
int fb_height;
int fb_width;
int fb_pitch;
int fb_bpp;
void fb_swap(void);

#include "../../lib/gfx.c"
#include "acpi.c"
#define NO_MAIN
#include "../../kernel/rtos.c"
#include "../../kernel/libc.c"


void isr_handler(struct Registers *regs) {
	int n;
	n = regs->int_no;
	if (n == 8) {
		UartPrintf("T  ");
	} else if (n == 9) {
		UartPrintf("K  ");
	} else if (n == 0x74) {
		UartPrintf("M  ");
		while (1);
	} else {
	gfx_print_int(n);
		UartPrintf("?  ");
		while (1);
	}
//    if (handlers[regs->int_no]) {
  //      handlers[regs->int_no](regs);
   // }
//   while (1);
}

void idt_set(int index, int (*base)(), int selector, char flags)
{
	idt_entries[index].low =
		((uint32)base & 0xFFFF) |
		((selector << 16) & 0xFFFF0000);
	idt_entries[index].high =
		(((flags | 0x60) << 8) & 0x0000FF00) |
		((uint32)base & 0xFFFF0000);
}

void idt_init()
{
	int i;
	idt_pointer.v[0] = (sizeof(idt_entries) - 1) & 0xFF;
	idt_pointer.v[1] = ((sizeof(idt_entries) - 1) >> 8) & 0xFF;
	idt_pointer.v[2] = ((uint32)idt_entries) & 0xFF;
	idt_pointer.v[3] = ((uint32)idt_entries >> 8) & 0xFF;
	idt_pointer.v[4] = ((uint32)idt_entries >> 16) & 0xFF;
	idt_pointer.v[5] = ((uint32)idt_entries >> 24) & 0xFF;
	for (i = 0; i < 256; i++) {
		idt_set(i, isr_mouse, 0x08, 0x8E);
	}
	idt_set(8 + 0, isr_timer, 0x8, 0x8E);
	idt_set(8+1, isr_kbd, 0x08, 0x8E);
	idt_set(0x70 - 8 + 12, isr_mouse, 0x08, 0x8E);
	OS_AsmInterruptInit();
}

/* https://forum.osdev.org/viewtopic.php?f=2&t=30186 */
byte *get_framebuffer()
{
	return *((byte**)(&gfx_info[40]));
}

int get_fb_linear()
{
	return gfx_info[0] & 0x08;
}

int get_fb_width()
{
	return gfx_info[18] | gfx_info[19] << 8;
}

int get_fb_height()
{
	return gfx_info[20] | gfx_info[21] << 8;
}

int get_fb_pitch()
{
	return gfx_info[16] | gfx_info[17] << 8;
}

int get_fb_bpp()
{
	return gfx_info[25] >> 3;
}


void fb_swap(void)
{
	memcpy(fb_front, fb_back, fb_height * fb_pitch);
}


int bob(int a, int b) {
	int (*f)();
	f = (void*)0;
	f();
	return a / b;	
}


void UartPrintfCritical(const char *format, ...)
{
	int argv[8];
	int i;
	char buf[128];
	va_list p;
	va_start(p, format);

	for (i = 0; i < 8; i++) {
		argv[i] = (int)va_arg(p, int);
	}
	va_end(p);

	sprintf(buf, format, argv[0], argv[1], argv[2], argv[3], 
			argv[4], argv[5], argv[6], argv[7]);
       	gfx_puts(buf);
}

void UartPrintf(const char *format, ...)
{	int argv[8];
	int i;
	char buf[128];
	va_list p;
	va_start(p, format);

	for (i = 0; i < 8; i++) {
		argv[i] = (int)va_arg(p, int);
	}
	va_end(p);

	sprintf(buf, format, argv[0], argv[1], argv[2], argv[3], 
			argv[4], argv[5], argv[6], argv[7]);
       	gfx_puts(buf);
}

void UartInit(void)
{
}

/*
void *memset2(void *s, int c, size_t n)
{
	char *p;
	p = (char*)s;
	while (n > 0) {
		n--;
		p[n] = c;
	}
	return s;
}
*/

void MainThread(void *Arg)
{
	gfx_puts("jml\n");
	while (1) {
		UartPrintf("YO ");
		OS_ThreadSleep(100);
	}
}

int main(void)
{
	int i;
	uint32 programEnd = 1024 * 1024 * 4;

	//bob(0,0);
	//bob(1,0);
	//while (1) {;}
	fb_front = get_framebuffer();
	//if ((int)fb_front != 0) bob(1, 0);
	fb = fb_back;
	//fb = fb_front;

	fb_width = get_fb_width();
	fb_height = get_fb_height();
	fb_pitch = get_fb_pitch();
	fb_bpp = get_fb_bpp();
	gfx_puts("HElloi\n");
	gfx_puts("WOrld\n");
	gfx_print_int((int)*((int*)gfx_info));
	//while(1);


	MemoryWrite(IRQ_MASK, 0);
	acpi_init();
	idt_init();
	OS_Init((uint32*)memory, RAM_EXTERNAL_SIZE);
	UartInit();
	OS_ThreadCreate("Main", MainThread, NULL, 100, 4000);
  	OS_Start();


	gfx_puts("END of \n");
	while (1) {;}
	//i = i / i;
	bob(1, 1);
	return 0;
}


