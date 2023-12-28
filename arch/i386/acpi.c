
/*
 * https://github.com/pdoane/osdev/blob/master/acpi/acpi.c
 */

typedef struct AcpiHeader {
	uint32 signature;
	uint32 length;
	uint8 data[8]; /* revision, checksum, oem[6] */
	uint8 oem_table_id[8];
	uint32 oem_revision;
	uint32 creator_id;
	uint32 creator_revision;
} AcpiHeader;

static void acpi_parse_dt(AcpiHeader *rsdt)
{
	printk("dt\n");
}

static void acpi_parse_rsdt(AcpiHeader *rsdt)
{
	uint32 *p;
	uint32 *end;
	char oem[10];
	p = (uint32*)(rsdt + 1);
	memcpy(oem, rsdt->data + 2, 6);
	printk("dt '%d' -%s-\n", rsdt->length, oem);
	end = (uint32*)((uint8*)rsdt + rsdt->length);
	while (p < end) {
		acpi_parse_dt((void*)*p);
		p++;
	}
}

static void acpi_parse_xsdt(AcpiHeader *xsdt)
{
}

static int acpi_parse_rsdp(uint8 *p)
{
	uint8 sum = 0;
	char oem[7];
	int i;
	for (i = 0; i < 20; i++) {
		sum += p[i];
	}
	if (sum != 0) {
		printk("RSDP checksum failed\n");
		return -1;
	}
	memcpy(oem, p + 9, 6);
	oem[6] = 0;
	printk("OEM = %s\n", oem);
	if (p[15] == 0) {
		printk("Version 1\n");
		acpi_parse_rsdt((void*)*((uint32*)(p + 6)));
		return -1;
	} else if (p[15] == 2) {
		printk("Version 2\n");
		if (*((uint32*)(p + 24)) || *((uint32*)(p + 28))) {
			acpi_parse_xsdt((void*)*((uint32*)(p + 24)));
		} else {
			acpi_parse_rsdt((void*)*((uint32*)(p + 16)));
		}
	} else {
		printk("Unsupported ACPI version %d\n", p[15]);
	}
	return 0;
}

void acpi_init()
{
	uint8 *p, *q, *end;
	uint32 s;

	p = (uint8*)0x000e0000;
	end = (uint8*)0x000fffff;
	while (p < end) {
		s = *(uint32*)p;
		if (s == 0x20445352) {
			q = p + 4;
			s = *(uint32*)q;
			if (s == 0x20525450) { /* 'RSD PTR' */
				if (!acpi_parse_rsdp(p)) {
					printk("MEs %d\n", 0x92, 0);
					while(1);
					break;
				}

			}
		}
		p += 16;
	}	
}


