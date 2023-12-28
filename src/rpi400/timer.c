
#define VOLATILE 

#define HZ		100
#define CLOCKHZ	1000000
#define ARM_IO_BASE		0xFE000000
//#define ARM_IRQ1_BASE		0
//#define ARM_IRQ_TIMER3		(ARM_IRQ1_BASE + 3)
#define ARM_SYSTIMER_BAS	(ARM_IO_BASE + 0x3000)
#define ARM_SYSTIMER_CS		(ARM_SYSTIMER_BAS + 0x00)
#define ARM_SYSTIMER_CLO	(ARM_SYSTIMER_BAS + 0x04)
#define ARM_SYSTIMER_C3		(ARM_SYSTIMER_BAS + 0x18)
#define SYS_TIMER_IRQ_3 0x63

#define CNT_MAX 0x20000000

VOLATILE static int cnt = 0;
VOLATILE static int event = 0;
static int (*cb)();
static void callback(void * data)
{
	cnt++;
	if (cnt >= CNT_MAX) {
		cnt = 0;
	}
	poke(ARM_SYSTIMER_C3, peek(ARM_SYSTIMER_CLO) + CLOCKHZ / HZ);	
	poke(ARM_SYSTIMER_CS, 1 << 3);
}

void timer_init(void *func, void *data)
{
	cb = func;
	irq_connect(SYS_TIMER_IRQ_3, callback, data);
	poke(ARM_SYSTIMER_CLO, -(30 * CLOCKHZ));
	poke(ARM_SYSTIMER_C3, peek(ARM_SYSTIMER_CLO) + CLOCKHZ / HZ);	

}

void trigger_event(void)
{
	event = 1;
}

int clock(void)
{
	return cnt;
}

void wait(int c)
{
	c += cnt;
	if (c < 0) {
		return;
	}
	while (c >= CNT_MAX) {
		c -= CNT_MAX;
	}
	while (c > cnt) {
		if (event) {
			event = 0;
			return;
		}
	}
}

