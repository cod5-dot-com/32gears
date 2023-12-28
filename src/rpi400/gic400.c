
// https://developer.arm.com/documentation/ddi0471/b/functional-description/functional-overview-of-the-gic-400
// https://developer.arm.com/documentation/ihi0048/b/Programmers--Model/CPU-interface-register-descriptions/Interrupt-Acknowledge-Register--GICC-IAR?lang=en
//
extern void disable_irqs(void);
extern void enable_irqs(void);

#define ARM_GICC_BASE		0xFF842000
#define ARM_GICD_BASE		0xFF841000
#define IRQ_LINES 256

#define GICD_CTLR		(ARM_GICD_BASE + 0x000)
#define GICD_ISENABLER0		(ARM_GICD_BASE + 0x100)
#define GICD_ICENABLER0		(ARM_GICD_BASE + 0x180)
#define GICD_ITARGETSR0		(ARM_GICD_BASE + 0x800)

#define GICC_IAR		(ARM_GICC_BASE + 0x00C)
#define GICC_IAR_INTERID	0x3FF
#define CEOIR			(ARM_GICC_BASE + 0x010)
#define CEOIR_ID_MASK	(0x3FF)

static void *irq_handlers[IRQ_LINES];
static void *irq_params[IRQ_LINES];

void irq_enable(int irq)
{
	poke(GICD_ISENABLER0 + 4 * (irq / 32), 1 << (irq % 32));
	poke(GICD_ITARGETSR0 + 4 * (irq /4), 1 << ((irq % 4) * 8)); // core 0   
}

void irq_disable(int irq)
{
	poke(GICD_ICENABLER0 + 4 * (irq / 32), 1 << (irq % 32));
}


void irq_vector(void)
{ 
	int irq;
	int (*h)();

	irq = peek(GICC_IAR) & GICC_IAR_INTERID;
	if (irq <= 15 || irq >= IRQ_LINES) {
	       return;
      	}	       
	h = irq_handlers[irq];
	if (h) {
		h(irq_params[irq]);	
	} else {
		irq_disable(irq);
	}
	poke(CEOIR, irq & CEOIR_ID_MASK);
}

void irq_init(void)
{
	int i;
	for (i = 0; i < IRQ_LINES; i++) {
		irq_handlers[i] = (void*) 0;
		irq_params[i] = (void*) 0;
	}
	sync_cache();
	enable_irqs();
}

void irq_disconnect(int irq, void *handler, void *param)
{
	irq_handlers[irq] = (void*)0;	
	irq_params[irq] = (void*)0;
	irq_disable(irq);	
}

void irq_connect(int irq, void *handler, void *param)
{
	irq_handlers[irq] = handler;	
	irq_params[irq] = param;
	irq_enable(irq);	
	puts("connect\n");
}

