
	.text
# int setjmp(jmp_buf env);

        .globl  Csetjmp
Csetjmp:
        movl    4(%esp),%edx    # env
        movl    %esp,(%edx)
        addl    $4,(%edx)
        movl    %ebp,4(%edx)
        movl    (%esp),%eax
        movl    %eax,8(%edx)
        xorl    %eax,%eax
        ret

# void longjmp(jmp_buf env, int v);

        .globl  Clongjmp
Clongjmp:
        movl    8(%esp),%eax    # v
        orl     %eax,%eax
        jne     vok
        incl    %eax
vok:    movl    4(%esp),%edx    # env
        movl    (%edx),%esp
        movl    4(%edx),%ebp
        movl    8(%edx),%edx
        jmp     *%edx

