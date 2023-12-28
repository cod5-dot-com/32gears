
SECTIONS
{
    .text1 0x8000 : AT (0) {
	*(.text.boot) 
     }

    .text 0x2000000 :  AT (0x1000) {
	*(.text) 
	*(.rodata*)
	*(.data)
	*(.bss) 
     }
     /DISCARD/ : {
	*(.*)
     }

}
