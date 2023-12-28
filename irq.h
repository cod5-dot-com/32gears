/*
 *             32gears - Serial port loader
 *
 *                       24 February MMXV PUBLIC DOMAIN
 *           The author disclaims copyright to this source code.
 *
 *
 */

void pic_init(void);
void pic_timer01(int enable);
void pic_irq_handler(void);
void pic_enable_irq(void);
