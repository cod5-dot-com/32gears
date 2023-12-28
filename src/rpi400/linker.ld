
ENTRY(_start)

SECTIONS
{
    .text 0x8000 : AT(0) {
	*(.text) 
	*(.data) 
	*(.bss) 
	end = .;
     }
     .shstrtab : {
     	*(.shstrtab)
	}


/*    .data : {
	*(.data) 
	end = .;
     }
*/
     /DISCARD/ : {
	*(.*)
     }
}
