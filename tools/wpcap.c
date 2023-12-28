#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <sys/ioctl.h>
#include <net/ethernet.h>
#include <netinet/in.h>
#include <net/if.h>
#include <netpacket/packet.h>

int opensock(char *device)
{	
	int fd;
   	struct ifreq ifr;
   	struct sockaddr_ll sll;

	memset(&ifr, 0, sizeof(ifr));
   	memset(&sll, 0, sizeof(sll));

   	fd = socket(PF_PACKET, SOCK_RAW, htons(ETH_P_ALL));
	if (fd < 1) return -1;
   	strncpy(ifr.ifr_name, device, sizeof(ifr.ifr_name));
   	if (ioctl(fd, SIOCGIFINDEX, &ifr) < 0) return -1;
	sll.sll_family      = AF_PACKET;
	sll.sll_ifindex     = ifr.ifr_ifindex;
	sll.sll_protocol    = htons(ETH_P_ALL);
	if (bind(fd, (struct sockaddr *) &sll, sizeof(sll)) < 0) return -1;
  	return fd;
}

int init_pcap(int argc, char *argv[])
{
	int fd;
	char buf[1024];
	char *p;
	int i = 0;
	int l;
	fd = opensock(argv[1]);
	if (fd < 0) return -1;
	printf("READING %s\n", argv[1]);
	while ((l = read(fd, buf, 100)) > 0) {
		buf[l] = 0;
		p = buf;
		while (l > 0) {
			printf("%02x '%s' ", p[0] & 0xFF, buf);
			p++;
			l--;
		}
		i++;
		if (i == 16) {
			i = 0;
			printf("\n");
		}
	}
	return 0;

}

