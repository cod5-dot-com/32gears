// ./test.js
#include <stdlib.h>
#include <stdio.h>
union var__ {int i; void *p; char *s; union var__ (*f)();};
struct cb__ {union var__ self; int (*fu)();};
#define var union var__
struct console__proto__ { var prototype; var log; };struct console { var prototype; };extern struct console__proto__ console__proto__;extern struct console *console;struct Main__class {
	var dummy;
};
var Main__main(void) {
console->log.f(console, "he\0llo");
}
struct console *console;
struct console__proto__ console__proto__;static var console__log(var __this, char *b) {puts(b);return (var)0;}
int main(int argc, char *argv[]) {console = malloc(sizeof(struct console));console->prototype = &console__proto__;console__proto__.prototype.p = null;console__proto__.log.f = console__log;return Main__main().i;}
/* 
C:
  class
  C:
    Main
    {
    C:
      staticVarOrMethod
      C:
        main
        (
        {
        C:
          stmt
          R:            console
            C:
              .
              R:                log
                C:
                  (
                  R:                    he llo
 */