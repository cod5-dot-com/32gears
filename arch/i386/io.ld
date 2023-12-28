
ENTRY(_start)

SECTIONS
{
    .text 0x010000 + 1024 : AT(0) {
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
