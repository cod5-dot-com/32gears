

static struct k_file _fds[FOPEN_MAX];
static int _maxfd = 0;
char *k_error = 0;

int k_close(int fd) 
{
	int r;
	int (*k)();
	struct k_file *f;
	if (fd < 0 || fd >= _maxfd) {
		return -1;
	}
	f = &_fds[fd];
	k = f->close;
	r = k(f->fd);	
	f->read = NULL;
	return r;
}

void k_exit(int rc) 
{
}

void k_add_fp(struct k_file *f, int offset)
{
/*
	if (offset < 0) {
		while (offset <= -f->blocksize) {
			f->block--;
			offset += f->blocksize;
		}
		if (offset < 0) {
			f->offset += offset;	
		}
		return;
	}

	while (offset >= f->blocksize) {
		f->block++;
		offset -= f->blocksize;
	}
	if (offset > 0) {
		f->offset += offset;
		if (f->offset >= f->blocksize) {
			f->block++;
			f->offset -= f->blocksize;
		}
 	}
*/
}

int k_lseek(int fd, int offset, int whence) 
{
	int r;
	int (*k)();
	struct k_file *f;
	if (fd < 0 || fd >= _maxfd) {
		return -1;
	}
	f = &_fds[fd];
	k = f->lseek;
	r = k(f->fd, offset, whence);
	if (whence == SEEK_SET) {
		if (offset < 0) {
			return -1;
		}
	} else if (whence == SEEK_CUR) {
	} else if (whence == SEEK_END) {
	}
	return r;
}

int vhd_open(struct k_file *f, char *subpath)
{
	f->fd = _open(f->pathname, f->flags);
	if (f->fd < 0) {
		k_error = "cannot open vhd file";
		return -1;
	} 
	strncpy(f->pathname, subpath, FILENAME_MAX);
	
	f->d.fat32.read = _read;
	f->d.fat32.write = _write;
	f->d.fat32.lseek = _lseek;
	return fat32_open(f);
}

int vhd_close(int fd)
{
	return -1;
}

int vhd_read(int fd, char *buf, int count)
{
	
	return -1;
}

int vhd_write(int fd, char *buf, int count)
{
	return -1;
}

int vhd_lseek(int fd, int offset, int whence)
{
	struct k_file *f;
	f = &_fds[fd];
	fat32_lseek(f, offset, whence);
	return -1;
}


int k_open(char *pathname, int flags) 
{
	int i;
	char *p;
	struct k_file *f;

	if (_maxfd == 0) {
		memset(_fds, 0, sizeof(_fds));
		_maxfd = FOPEN_MAX;
	}
	for (i = 0; i < _maxfd; i++) {
		if (_fds[i].read == NULL) {
			break;
		}
	}
	if (i >= _maxfd) {
		k_error = "too many open files";
		return -1;
	}
	f = &_fds[i];
	f->flags = flags;
	if (!strncmp(pathname, "vhd://", 6)) {
		strncpy(f->pathname, pathname + 6, FILENAME_MAX);
		p = f->pathname;
		while (*p && *p != ':') {
			p++;
		}
		if (*p) {
			*p = 0;
			p++;
		}
		f->read = vhd_read;
		f->write = vhd_write;
		f->close = vhd_close;
		f->lseek = vhd_lseek;
		f->fd = vhd_open(f, p); 
	} else {
		strncpy(f->pathname, pathname, FILENAME_MAX);
		f->read = _read;
		f->write = _write;
		f->close = _close;
		f->lseek = _lseek;
		f->fd = _open(f->pathname, f->flags); 
	}
	if (f->fd < 0) {
		f->read = NULL;
		return -1;
	}
	return i;
}

int k_read(int fd, void *buf, int count) 
{
	int r;
	int (*k)();
	struct k_file *f;
	if (fd < 0 || fd >= _maxfd) {
		return -1;
	}
	f = &_fds[fd];
	k = f->read;
	r = k(f->fd, buf, count);
	if (r > 0) {
		k_add_fp(f, r);	
	}
	return r;
}

int k_rename(char *oldname, char *newname)
{
	return -1;
}

void *k_sbrk(int size) 
{
	return (void*)0;
}

int k_system(char *command) 
{
	return -1;
}

int k_time(void) 
{
	return 0;
}

int k_unlink(char *pathname) 
{
	return -1;
}

int k_usleep(int usec) 
{
	return -1;
}

int k_write(int fd, void *buf, int count) 
{
	int r;
	int (*k)();
	struct k_file *f;
	if (fd < 0 || fd >= _maxfd) {
		return -1;
	}
	f = &_fds[fd];
	k = f->write;
	r = k(f->fd, buf, count);
	if (r > 0) {
		k_add_fp(f, r);	
	}
	return r;
}

