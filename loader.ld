
SECTIONS
{
    .text 0x8000 : AT (0) {
	KEEP(*(.text)) 
     }

     /DISCARD/ : {
	*(.*)
     }
}
