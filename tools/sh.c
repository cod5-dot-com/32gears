
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <unistd.h>

#include "../lib/utils.c"
#include "../lib/buf.c"
#include "../include/kernel.h"
#include "bin2hex.c"
#include "mkvhd.c"
#include "../lib/fat32.c"
#include "format.c"
#include "ls.c"
#include "cp.c"
#include "kernel.c"

void run(char *a, char *p, int(*f)(), int argc, char *argv[])
{
	if (!strcmp(a, p)) {
		exit(f(argc -1, argv + 1));
	}
}

int main(int argc, char *argv[]) 
{
	if (argc > 1) {
		run(argv[1], "bin2hex", bin2hex_main, argc, argv);	
		run(argv[1], "cp", cp_main, argc, argv);	
		run(argv[1], "mkvhd", mkvhd_main, argc, argv);	
		run(argv[1], "format", format_main, argc, argv);	
		run(argv[1], "ls", ls_main, argc, argv);	
	}
	printf("Command not found.\n");
	return 0;
}

