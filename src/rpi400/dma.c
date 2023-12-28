 
#define PERIPHERAL_BASE 0xFE000000
#define GPU_CACHED_BASE		0x40000000
#define GPU_UNCACHED_BAS	0xC0000000
#define GPU_MEM_BASE	GPU_UNCACHED_BAS

#define ARM_DMA_BASE (PERIPHERAL_BASE + 0x7000)
#define ARM_DMA_INT_STA	(ARM_DMA_BASE + 0xFE0)
#define ARM_DMA_ENABLE	(ARM_DMA_BASE + 0xFF0)
#define CONBLK_AD 0x04

#define CS_RESET			(1 << 31)
#define CS_ABORT			(1 << 30)
#define CS_END				(1 << 1)
#define CS_ACTIVE			(1 << 0)



struct TDMAControlBlock
{
	int nTransferInf;
	int nSourceAddress;
	int nDestAdd;
	int nTransferLength;
	int n2DModeStride;
	int nNextCtlBA;
	int nReserved[2];
};


extern struct TDMAControlBlock dma_ctrl;

static int BUS_ADDRESS(char *a)
{
	return (((int)a) & ~0xC0000000) | GPU_MEM_BASE;
}

void dma_move(char *dest, char *src, int len)
{
	int cs;
	int t = 0;

	cs = ARM_DMA_BASE + ((1) * 0x100);
	dma_ctrl.nReserved[0] = 0;
	dma_ctrl.nReserved[1] = 0;

	poke(cs, CS_END);
	dma_ctrl.nTransferInf = 0x330;
	dma_ctrl.nSourceAddress = BUS_ADDRESS(src);
	dma_ctrl.nDestAdd = BUS_ADDRESS(dest);
	dma_ctrl.nTransferLength = len;
	dma_ctrl.n2DModeStride = 0;
	dma_ctrl.nNextCtlBA = 0;

	
	poke(cs + CONBLK_AD, BUS_ADDRESS((char*)&dma_ctrl));

	poke(cs, CS_ACTIVE);

	while ((peek(cs) & CS_END) == 0) {
		t++;
		if (t == 1000000) {
			poke(cs, CS_RESET);
			t = 0;
			return;
		}
	}
	poke(cs, CS_END);
	return;
}
