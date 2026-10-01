


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




## Drop leading 0s
* When computing, no need to include leading `0` terms, or leading `0` digits. 
  * EX:  `t=00h13m15s`  -> `t=13m15s`
  * EX:  `t=00h03m05s`  -> `t=3m5s`
  * EX:  `t=00h00m15s`  -> `t=15s` -> `t=15`



# GitHub

* [github.com: zakkhoyt/userscripts - Zakk/markdown linker domains](https://github.com/zakkhoyt/userscripts/pull/12/changes#diff-7962a467862baccea309d6c43425f90c50ab2d131a20154fa03039b125675e1b)














