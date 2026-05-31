
# Unfinished Amazon link work


I found this lying around in Conductor from months ago
```prompt
using the following files/data:
*  the data up to line 84 from `/Users/zakkhoyt/Documents/notes/amazon/coding/AMAZON_URL_MINED_QUERY_PARAMETERS.md`
* lines 69 - 234 from `/Users/zakkhoyt/Documents/notes/amazon/coding/AMAZON_URL_ANATOMY.md`
```


<!-- 

# markdown_linker output (for an amazon product)

* Amazon Product URL: `https://www.amazon.com/OK-TAPE-Athletic-Injuries-Medical/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1`


## Current Output 

* Page Title: `[OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Beige)](https://www.amazon.com/OK-TAPE-Athletic-Injuries-Medical/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1)`

### Problems
* The link.url should be much shorter: 
  * This might exclude some variant selection: `[OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Beige)](https://www.amazon.com/dp/B0DF7NX1D8)`
  * Maybe this: `[OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Beige)](https://www.amazon.com/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&th=1)`
    * I know we had defined this somewhere



  * The product description in the url path is useless and can be removed
    * amazon product links (of the `dp` variety) can omit the part of the url path between `www.amazon.com` and `dp`.
    * `https://www.amazon.com/OK-TAPE-Athletic-Injuries-Medical/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1` -> `https://www.amazon.com/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1`
  * Several query parameter should be stripped out as well; 
    * Several of these query paramter are ther for traacking or other non-essential purposes
    * we only need to keep those that are essential to the project, variants (like color, size, etc...)

### Solutions: 
* Short product URLs might already have beon implemented in `amazon_toolkit` (searh through all function names looking for such a url)
* If not we may need to implement it ourselves


### References:
* To learn more about amazon product urls:
  * see: `docs/ai/planning/markdown_linker/planning_references/notes/amazon/coding/**/*`
    * expecially: `AMAZON_URL_ANATOMY.md`
* Also read through the amazon_toolkit code and comments. They might contain refined info 

* I saved the web page's source code using a few different methods (i'm not sure which is more complete or which I should prefer)
  * See: `docs/ai/planning/markdown_linker/planning_references/amazon_html/purple_tape/README.md` -->




---

# Amazon Product Details

When the url is an amazon product url, I want the popup menu to contain a couple of additional markdown outputs


* These will be more than just a markdown URL, rather building a markdown list underneath the `page title` url:


* Amazon Product URL: `https://www.amazon.com/OK-TAPE-Athletic-Injuries-Medical/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&sprefix=sports%2Btap%2Caps%2C313&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1`
* desired output:
````markdown
* [OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Purple)](https://www.amazon.com/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&th=1)
  * price: $9.99
  * delivers: 0d
  * rating: 4.4 / 653
  * variant_1: Purple-4 Rolls
  * variant_2: 15 yards
  * store: [Visit the OK TAPE Store](https://www.amazon.com/stores/OKTAPE/page/863F38C9-4A34-42F5-8D5E-A91EF70C815D)
````


* About the above: 
  * the exercise is 
* `rating` is average rating (4.4) / number of votes (653)
* `delivers` is derived from `today` in this example
  * Delivers should always be expressed in terms of `days` fromn today
    * today -> 0d
    * tomorrow -> 1d
    * etc...
* `variant_1`, `variant_2`, etc... might vary from product to product as different product have differnt variants properties and number of variant properties
* `seller` might be the wrong word here. Sometimes different product has different `store`, `seller`, `shipped by`, etc... 
* `store` similar to seller, can vary from product to product. 

## popup menu
* the entry should render like the others: just the link title 
* however what it copies to the clipboard should look like above
* The entry could be called "amazon product"
* this entry should reside in its own section within the popup menu
  * (this is how youtube does it's domain specific code)

## amazon_toolkit
* I am fairly sure that we have already implemented the code to extract a lot of these product properties already. 
* However the naming that I used for each property is likely not what is looks like in code. 

## Page Source Code
* I saved the web page's source code using a few different methods (i'm not sure which is more complete or which I should prefer)
  * See: `docs/ai/planning/markdown_linker/planning_references/amazon_html/purple_tape/README.md` -->




* [OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Purple)](https://www.amazon.com/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&th=1)
  * price: $9.99
  * shipping: 0d 
  * rating: 4.4 / 653
  * variant_1: Purple-4 Rolls
  * variant_2: 15 yards
  * seller: HTT Health Care
  * store: [Visit the OK TAPE Store](https://www.amazon.com/stores/OKTAPE/page/863F38C9-4A34-42F5-8D5E-A91EF70C815D)




