/*
 *                          cod5.com computer
 *
 *                      1 april MMXXII PUBLIC DOMAIN
 *           The author disclaims copyright to this source code.
 *
 *
 */

#include "../include/fat32.h"

int ls_main(int argc, char *argv[])
{
	int fd;
	struct k_dirent d;
	if (argc < 2) {
		fprintf(stderr, "USAGE: %s  vhd://./disk.vhd:A:/path \n", argv[0]);
		exit(-1);
	}
	fd = k_open(argv[1], O_RDONLY);
	if (fd < 0) { exit(-1); }
	while (k_read(fd, &d, sizeof(d)) > 0) {
		puts(d.d_name);
	}
	return k_close(fd);
}


