#define VOLATILE

#define PIT_A 0x40

#define PIT_CONTROL 0x43

#define PIT_MASK 0xFF
#define PIT_SET 0x36

#define PIT_HZ 1193181
#define REAL_FREQ_OF_FREQ(_f) (PIT_HZ / (PIT_HZ / (_f)))

#define TIMER_TPS 363

#define HZ 100
#define CNT_MAX 0x20000000

extern void out8(int port, char value);
extern void out16(int port, int value);
extern void irq_connect(int irq, void *handler);

VOLATILE static int cnt = 0;
VOLATILE static int event = 0;

static int (*cb)() = 0;
static void *data;

static void timer_write(int hz)
{
	int d;
   	out8(PIT_CONTROL, PIT_SET);
	d = PIT_HZ / hz;	
    	out8(PIT_A, d & PIT_MASK);
	out8(PIT_A, (d >> 8) & PIT_MASK);
}

static void callback(void *d)
{
	cnt++;
        if (cnt >= CNT_MAX) {
                cnt = 0;
        }
	if (cb) cb(data);
}

void trigger_event(void)
{
        event = 1;
}

void timer_init(void *func, void *_data)
{
	cb = func;
	data = _data;
	timer_write(HZ);
	
	irq_connect(0, callback);	
}

int clock() 
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

