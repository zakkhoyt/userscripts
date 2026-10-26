


<!-- # Youtube


* Timestamp link urls are currently in the numbers of seconds (`t=#` where # can by any number of digits)
  * This becomes meaningless and hard for humans to read after `60` 
* I'd like to change this to it uses the format `t=##h##m##s` which is much easier to read. 


* Youtube does support a minutes seconds format
* EX of current: [YouTube: TornadoTRX - Pilger - The Most Insane Day In Tornado History @ 09:15](https://youtu.be/nw9d7s7Hz38?t=555)
    * the title has it right (9:15), but the url is is using seconds only (`t=555`)
* All of these syntaxes seem to work:
  * `https://youtu.be/nw9d7s7Hz38?t=555`
  * `https://youtu.be/nw9d7s7Hz38?t=555s`
  * `https://youtu.be/nw9d7s7Hz38?t=000000555s`
  * `https://youtu.be/nw9d7s7Hz38?t=9m15s`
  * `https://youtu.be/nw9d7s7Hz38?t=0h09m15s`
  * `https://youtu.be/nw9d7s7Hz38?t=0000h0009m15s`

 -->

 
<!-- 
# Regarding the query parameter key/value for `t`


## Drop leading `0`s


I'm testing and seeing some things that need changed;
Here is what I'm getting for a timestamp at 45 seconds:  [YouTube: J Perm - Rubik's Cube: Easy 2-Look OLL Tutorial (Beginner CFOP) @ 00:45](https://youtu.be/GhmYBgLoQQg?t=00m45s)




## Drop leading time divisions which have no value
* When computing, no need to include (let's drop or exclude):
  * leading time division(s) that equal `0`

* EX: `https://youtu.be/GhmYBgLoQQg?t=00m45s` -> `https://youtu.be/GhmYBgLoQQg?t=45s`



## Drop leading `0` within each time division

No need to include extra leading `0`s. 
* EX: `https://youtu.be/GhmYBgLoQQg?t=00m07s` -> `https://youtu.be/GhmYBgLoQQg?t=7s`

## More examples

  * EX:  `t=00h13m15s`  -> `t=13m15s`
  * EX:  `t=00h03m05s`  -> `t=3m5s`
  * EX:  `t=00h00m15s`  -> `t=15s`
  * EX:  `t=00h00m02s`  -> `t=02s` -> `t=2s`
  * EX:  `t=01h00m07s`  -> `t=1h7s`


----

Also I found a bug related to youtube.com timestamp links

* When I load a youtube video and star playing it, the initial invokation of markdown_linker menu works correctly and generates a menu entry for `timestamp` with the appropriate timestamp value in the URL and the title (disregarding the time formatting complaints above)
* However any subsequent invokatoins of the markdown_linker will present that same initial link (stale timestamp). 
* I'm guessing that when we are generating links that we are caching that first link in place of `nil` and the subsequent checks see that cached value and never create a new one (or somethign) -->