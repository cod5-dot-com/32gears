#/bin/sh

s=`wc -c < loader.img`
l=$((512 - $s))

dd if=/dev/zero of=padding.img ibs=$l count=1
cat loader.img padding.img recovery.img > kernel7.img

