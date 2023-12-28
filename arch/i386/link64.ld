
ENTRY(_start)

SECTIONS
{
    .text 0x0 : {
	_start = .;
	*(.text) 
	*(.data)
	*(.bss) 
	end = .;
     }
     .shstrtab : {
     	*(.shstrtab)
	}

     /DISCARD/ : {
	*(.*)
     }
}
