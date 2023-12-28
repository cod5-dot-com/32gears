/*
 *             32gears - Serial port loader
 *
 *                       24 February MMXV PUBLIC DOMAIN
 *           The author disclaims copyright to this source code.
 *
 *
 * http://code.google.com/p/xv6-rpi/source/browse/src/arm.h
 */

#define NO_INT      0xc0
#define DIS_INT     0x80

#define MODE_MASK   0x1f
#define USR_MODE    0x10
#define FIQ_MODE    0x11
#define IRQ_MODE    0x12
#define SVC_MODE    0x13
#define ABT_MODE    0x17
#define UND_MODE    0x1b
#define SYS_MODE    0x1f


#define INT_BASE 0x3F00B000
#define INT_PENDB (INT_BASE+0x200)
#define INT_PEND1 (INT_BASE+0x204)
#define INT_PEND2 (INT_BASE+0x208)
#define INT_FIQCTRL (INT_BASE+0x20C)
#define INT_EN_IRQ1 (INT_BASE+0x210)
#define INT_EN_IRQ2 (INT_BASE+0x214)
#define INT_EN_IRQB (INT_BASE+0x218)
#define INT_DIS_IRQ1 (INT_BASE+0x21C)
#define INT_DIS_IRQ2 (INT_BASE+0x220)
#define INT_DIS_IRQB (INT_BASE+0x224)

#define SYSTIMER_CS 0x3F003000
#define SYSTIMER_CLO 0x3F003004
#define SYSTIMER_C0 0x3F00300C
#define SYSTIMER_C1 0x3F003010
#define SYSTIMER_C2 0x3F003014
#define SYSTIMER_C3 0x3F003018

extern int peek(int addr);
extern void poke(int addr, int data);
extern void enable_irq(void);

#define GPIO_BASE  0x3F200000
#define GPFSEL1 (GPIO_BASE + 0x4)
#define GPSET0 (GPIO_BASE + 0x1C)
#define GPCLR0 (GPIO_BASE + 0x28)
#define GPPUD (GPIO_BASE + 0x94)
#define GPPUDCLK0 (GPIO_BASE + 0x98)

//#define UART0_BASE 0x3F201000
#define UART0_BASE 0x101f1000
#define UART0_DR  (UART0_BASE + 0x00)
#define UART0_RSRECR (UART0_BASE + 0x04)
#define UART0_FR (UART0_BASE + 0x18)
#define UART0_ILPR (UART0_BASE + 0x20)
#define UART0_IBRD (UART0_BASE + 0x24)
#define UART0_FBRD (UART0_BASE + 0x28)
#define UART0_LCRH (UART0_BASE + 0x2C)
#define UART0_CR (UART0_BASE + 0x30)
#define UART0_IFLS (UART0_BASE + 0x34)
#define UART0_IMSC (UART0_BASE + 0x38)
#define UART0_RIS (UART0_BASE + 0x3C)
#define UART0_MIS (UART0_BASE + 0x40)
#define UART0_ICR (UART0_BASE + 0x44)
#define UART0_DMACR (UART0_BASE + 0x48)
#define UART0_ITCR (UART0_BASE + 0x80)
#define UART0_ITIP (UART0_BASE + 0x84)
#define UART0_ITOP (UART0_BASE + 0x88)
#define UART0_TDR (UART0_BASE + 0x8C)

