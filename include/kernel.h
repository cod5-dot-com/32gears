#define O_RDONLY        0x000000
#define O_WRONLY        0x000001
#define O_RDWR          0x000002
#define O_CREAT         0x000100  

#define K_BUF_SIZE      0x20000 /* 128k*/

struct fat32_dev {
	int (*read)();
	int (*write)();
	int (*lseek)();
	int cluster_size;
        char buf[K_BUF_SIZE];
};

struct k_dirent { 
	char d_name[FILENAME_MAX];
};

union k_devs {
	struct fat32_dev fat32;
};

struct k_file {
	int (*read)();
	int (*write)();
	void *lseek;
	int (*close)();
	int fd;
	char pathname[FILENAME_MAX];
	int flags;
	union k_devs d;
};

extern char *k_error;
int k_close(int fd);
void k_exit(int rc);
int k_lseek(int fd, int offset, int whence);
int k_open(char *pathname, int flags);
int k_read(int fd, void *buf, int count);
int k_rename(char *oldname, char *newname);
void *k_sbrk(int size);
int k_system(char *command);
int k_time(void);
int k_unlink(char *pathname);
int k_usleep(int usec);
int k_write(int fd, void *buf, int count);

