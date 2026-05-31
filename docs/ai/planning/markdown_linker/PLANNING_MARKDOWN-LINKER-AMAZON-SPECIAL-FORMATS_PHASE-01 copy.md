
# Unfinished Amazon link work


I found this lying around in Conductor from months ago
```prompt
using the following files/data:
*  the data up to line 84 from `/Users/zakkhoyt/Documents/notes/amazon/coding/AMAZON_URL_MINED_QUERY_PARAMETERS.md`
* lines 69 - 234 from `/Users/zakkhoyt/Documents/notes/amazon/coding/AMAZON_URL_ANATOMY.md`
```




# markdown_linker output (for an amazon product)

* Amazon Product URL: `https://www.amazon.com/OK-TAPE-Athletic-Injuries-Medical/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1`
* Saved the web page's source code using a few different methods (i'm not sure which is more complete or which I should prefer)
  * See: `docs/ai/planning/markdown_linker/planning_references/amazon_html/purple_tape/README.md`



## Current Output 

* Page Title: `[OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Beige)](https://www.amazon.com/OK-TAPE-Athletic-Injuries-Medical/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1)``

* Problems:
  * The link.url should be much shorter:
    * The product description in the url path is useless and can be removed
      * amazon product links (of the `dp` variety) can omit the part of the url path between `www.amazon.com` and `dp`.
      * `https://www.amazon.com/OK-TAPE-Athletic-Injuries-Medical/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1` -> `https://www.amazon.com/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1`
    * Several query parameter should be stripped out as well; 
      * Several of these query paramter are ther for traacking or other non-essential purposes
      * we only need to keep those that are essential to the project, variants (like color, size, etc...)

* Solutions: 
  * Short product URLs might already have beon implemented in `amazon_toolkit` (searh through all function names looking for such a url)
  * If not we may need to implement it ourselves

* To learn more about amazon product urls:
  * see: `docs/ai/planning/markdown_linker/planning_references/notes/amazon/coding/**/*`
    * expecially: `AMAZON_URL_ANATOMY.md`

<!-- 

* -->









* [OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Beige)](https://www.amazon.com/OK-TAPE-Athletic-Injuries-Medical/dp/B0DF7MW3SG?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1)
  * rating: 4.4
  * votes: 653
  * Price 




* [OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Purple)](https://www.amazon.com/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&th=1)
  * price: $9.99
  * shipping: 0d 
  * rating: 4.4 / 653
  * variant_1: Purple-4 Rolls
  * variant_2: 15 yards
  * seller: HTT Health Care
  * store: [Visit the OK TAPE Store](https://www.amazon.com/stores/OKTAPE/page/863F38C9-4A34-42F5-8D5E-A91EF70C815D)

* [OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Purple)](https://www.amazon.com/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&th=1)
  * price: $9.99
  * shipping: 0d 
  * rating: 4.4 / 653
  * variant_1: Purple-4 Rolls
  * variant_2: 15 yards
  * seller: HTT Health Care
  * store: [Visit the OK TAPE Store](https://www.amazon.com/stores/OKTAPE/page/863F38C9-4A34-42F5-8D5E-A91EF70C815D)




