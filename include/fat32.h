#ifndef FAT32_H
#define FAT32_H 1

int fat32_open(struct k_file *dev);
int fat32_read(struct k_file *dev, char *buf, int count);
int fat32_write(struct k_file *dev, char *buf, int count);
int fat32_lseek(struct k_file *dev, int offset, int whence);

int fat32_read_block(int dev, char *blk, int start);
int fat32_write_block(int dev, char *blk, int start);
int fat32_set_mbr(char *mbr, int start, int length); 
int fat32_set_vbr_sect(char *blk, int start, int length); 
int fat32_set_fsinfo(char *blk); 
int fat32_format(int dev, int partid, char *name); 
Buf *fat32_list(char *path); 

extern char *fat32_error;
#endif

