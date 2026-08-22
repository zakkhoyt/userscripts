
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

---

# Feedback

I did some investigating

* color: blue, size: 11 yards
  * URL: `https://www.amazon.com/dp/B0G2WTDLXS?th=1`
  * source: `docs/ai/planning/markdown_linker/planning_references/amazon_html/purple_tape/blue_11_yards.html`
  * price: 
    * location A HTML: `<span aria-hidden="true"><span class="a-price-symbol">$</span><span class="a-price-whole">9<span class="a-price-decimal">.</span></span><span class="a-price-fraction">99</span></span>`
      * above delivery date
    * location B HTML: `<span aria-hidden="true"><span class="a-price-symbol">$</span><span class="a-price-whole">9<span class="a-price-decimal">.</span></span><span class="a-price-fraction">99</span></span>`
      * above product variant
    * Parsing: 
      * currency: `<span class="a-price-symbol">$</span>`
      * dollars & decimal: `<span class="a-price-whole">9<span class="a-price-decimal">.</span></span>`
      * cents: `<span class="a-price-fraction">99</span>`      
  * delivery HTML: `<div class="a-spacing-base" id="mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE"><span data-csa-c-type="element" data-csa-c-content-id="DEXUnifiedCXPDM" data-csa-c-delivery-price="FREE" data-csa-c-value-proposition="" data-csa-c-delivery-type="delivery" data-csa-c-delivery-time="Wednesday, June 3" data-csa-c-delivery-origin-country="" data-csa-c-delivery-destination="" data-csa-c-delivery-condition="" data-csa-c-pickup-location="" data-csa-c-distance="" data-csa-c-delivery-cutoff="" data-csa-c-mir-view="CONSOLIDATED_CX" data-csa-c-mir-type="DELIVERY" data-csa-c-mir-sub-type="" data-csa-c-mir-variant="DEFAULT" data-csa-c-delivery-benefit-program-id="prime"> FREE delivery <span class="a-text-bold">Wednesday, June 3</span> </span></div>`
    * find span that has property key/value: `data-csa-c-delivery-type="delivery"` 
      * then we can pull delivery properies
      * `data-csa-c-delivery-time`="Wednesday, June 3" 




* color: blue, size: 15 yards
  * url: `https://www.amazon.com/dp/B0C9GJC6P3?th=1`
  * source: `docs/ai/planning/markdown_linker/planning_references/amazon_html/purple_tape/blue_15_yards.html`
* color: beige, size: 11 yards
  * url: `https://www.amazon.com/dp/B0G2WNYVBZ?th=1`
  * source: `docs/ai/planning/markdown_linker/planning_references/amazon_html/purple_tape/beige_11_yards.html`
* color: beige, size: 15 yards
  * url: `https://www.amazon.com/dp/B0DF7MW3SG?th=1`
  * source: `docs/ai/planning/markdown_linker/planning_references/amazon_html/purple_tape/beige_15_yards.html`


# Product Variants
* as I click on different variants, it seems that this loads new product pages (different `asin` numbers). (at least in this caase)
* this means that product variants likely are not represented by query parameters, rather they have different `asin` numbers. (at least in this case)

> [!NOTE]
> I do recall that soem products work this way and I think others might actually work with query parameters.
> Please re-read `docs/ai/planning/markdown_linker/planning_references/notes/amazon/coding/**/*` to see what you can find. 

Anyhow I did some digging

## variant_1
* search HTML for: `Beige-4 Rolls` (which is what appears in the web page when I click on this color)
  * Possibly: `<span id="inline-twister-expanded-dimension-text-color_name" class="a-size-base a-color-base inline-twister-dim-title-value a-text-bold">Beige-4 Rolls</span>`

## variant_2
* Search HTML for: `15 yards` (which is what appears in the web page when I click on this size)
  * Possibly: `<span id="inline-twister-expanded-dimension-text-size_name" class="a-size-base a-color-base inline-twister-dim-title-value a-text-bold">15 yards</span>`


## Conclusion

* To suppport the product variants, it looks like we could search for all `span` elements where `id=inline-twister-expanded-dimension-text-(.*)_name">(.*)</span>`
  * This is a bad attempt at regex capture groups. 
  * But we could use capture groups to:
    * We could call the variant category by the correct names instead of `variant_1` `variant_2`, etc...
      * $1 - color, size (in this case)
    * Capture the variant description
      * $2 - `Beige-4 Rolls`, `15 yards` (in this case)
    * Support any number of variants. Some products have 0, some have 1, some have 2, ... and so on
  * If this sounds reasonable, then we could back these with a `dictionary` / `hash`
    * keys are $1
    * values are $2 
  * The markdown output: Instead of `* variant_1: Beige-4 Rolls` it would say `* color: Beige-4 Rolls`. 


  Make sense?
  


---


* Below are some more observation on how to extract some of the properies we need for the new markdown format. Also some additoinal ones for later
* These are my guesses but might not work for every product, or might not be the best way to do to things. 
* If the amazon_toolkit already has pathways coded, please just use those
* Multiple properties from below say to search for `id="mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE"`. Is this contradictory? It might be the wrong way for some. 



# confirm product can be shipped to a locker
* Assuming that the user's shipping address is configured as a locker, then



```html
<span class="a-declarative" data-action="dpContextualIngressPt" data-dpcontextualingresspt="{}"> <a
        id="contextualIngressPtLink" aria-label="Amazon Locker - Frio - Boise 83703" class="a-link-normal" href="#"
        role="button">
```

## Summary:
* Search for a `<span>` with `id="contextualIngressPtLink"`
  * and also contains a property `aria-label`
  * and the property label contains `Amazon Locker` 
* If found, then the shipping destination is amazon locker.
  * we can parse two more pieces of info out of this property value:
    * locker name: `Frio` in this case
    * locker location; `Boise 83703` in this case
* If not found, then we want to look for teh following


# Confirming that a product cannot be shipped to a locker
* Assuming that the user's shipping address is configured as a locker, then

```html
<div id="deliveryBlock_feature_div" 
  class="celwidget" 
  data-feature-name="deliveryBlock" 
  data-csa-c-type="widget"
  data-csa-c-content-id="deliveryBlock" 
  data-csa-c-slot-id="newAccordionRow_0" 
  data-csa-c-asin="B008JGIZGS"
  data-csa-c-is-in-initial-active-row="true" 
  data-csa-c-id="zd3c3c-bzexgj-bcp66v-4tkq96"
  data-cel-widget="deliveryBlock_feature_div">
  <div 
    id="deliveryBlockMessage" 
    class="a-section a-spacing-none"
  >
    <div 
      id="mir-layout-DELIVERY_BLOCK"
    >
      <div 
        class="a-spacing-base" 
        id="mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE"
      >
        <span 
          class="a-color-error"
        >
          Sorry, this Amazon Pickup Location is currently full and cannot accept more deliveries. Please choose a
          different delivery location or pickup location.
          <a href="/gp/help/customer/display.html?nodeId=G8UUV583T397XQ3R">Learn more</a>
        </span>
      </div>
    </div>
  </div>
  <script type="a-state" data-a-state="{&quot;key&quot;:&quot;delivery-block-ajax-params-0&quot;}">
    {"merchantId":"ATVPDKIKX0DER","asin":"B008JGIZGS"}
  </script>
</div>
```

## conslusion
* search for a `<div>` with `id="mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE"`
  * which contains a `<span>` with `class="a-color-error"`
* If foudn, then this means that the user is trying to ship to a locker but that product cannot be shipped to a locker
  * We can parse the reason why which is the span's value
    * `no_locker_reason`: `Sorry, this Amazon Pickup Location is currently full and cannot accept more deliveries. Please choose a
          different delivery location or pickup location.` in this case
* A quicker way might be to (see Delivery Date below), `data-csa-c-delivery-type="pickup"`. This might infer picing up from a locker

# Delivery Date


```html

<div id="deliveryBlockContainer" class="celwidget" data-feature-name="deliveryBlockContainer" data-csa-c-type="widget"
  data-csa-c-content-id="deliveryBlockContainer" data-csa-c-slot-id="deliveryBlockContainer"
  data-csa-c-asin="B0DB849TSB" data-csa-c-is-in-initial-active-row="false" data-csa-c-id="uufi3q-597n6q-5upjpc-53gx96"
  data-cel-widget="deliveryBlockContainer">
  <div id="deliveryBlock_feature_div" class="celwidget" data-feature-name="deliveryBlock" data-csa-c-type="widget"
    data-csa-c-content-id="deliveryBlock" data-csa-c-slot-id="deliveryBlock_feature_div" data-csa-c-asin="B0DB849TSB"
    data-csa-c-is-in-initial-active-row="false" data-csa-c-id="w3epp-ezxb0w-9ujwxo-8k8d7l"
    data-cel-widget="deliveryBlock_feature_div">
    <div id="deliveryBlockMessage" class="a-section a-spacing-none">
      <div id="mir-layout-DELIVERY_BLOCK">
        <div class="a-spacing-base" id="mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE"><span
            data-csa-c-type="element" data-csa-c-content-id="DEXUnifiedCXPDM" data-csa-c-delivery-price="FREE"
            data-csa-c-value-proposition="" data-csa-c-delivery-type="pickup"
            data-csa-c-delivery-time="Tomorrow, June 1" data-csa-c-delivery-origin-country=""
            data-csa-c-delivery-destination="" data-csa-c-delivery-condition="" data-csa-c-pickup-location=""
            data-csa-c-distance="" data-csa-c-delivery-cutoff="" data-csa-c-mir-view="CONSOLIDATED_CX"
            data-csa-c-mir-type="DELIVERY" data-csa-c-mir-sub-type="" data-csa-c-mir-variant="DEFAULT"
            data-csa-c-delivery-benefit-program-id="prime" data-csa-c-id="3qfczu-gipdkw-tusyqo-a6qb3s"> FREE pickup
            <span class="a-text-bold">Tomorrow, June 1</span> </span></div>
      </div>
    </div>
    <script type="a-state" data-a-state="{&quot;key&quot;:&quot;delivery-block-ajax-params-0&quot;}">
      {"merchantId":"A1F8NLY6BQBL7M","asin":"B0DB849TSB"}</script>
  </div>
  <div id="cipInsideDeliveryBlock_feature_div" class="celwidget" data-feature-name="cipInsideDeliveryBlock"
    data-csa-c-type="widget" data-csa-c-content-id="cipInsideDeliveryBlock"
    data-csa-c-slot-id="cipInsideDeliveryBlock_feature_div" data-csa-c-asin="B0DB849TSB"
    data-csa-c-is-in-initial-active-row="false" data-csa-c-id="2nsuh1-tni15b-wpbdes-kg7fa2"
    data-cel-widget="cipInsideDeliveryBlock_feature_div">
    <span class="a-declarative" data-action="dpContextualIngressPt" data-dpcontextualingresspt="{}"> <a
        id="contextualIngressPtLink" aria-label="Amazon Locker - Frio - Boise 83703" class="a-link-normal" href="#"
        role="button">
        <div aria-hidden="true" class="a-row a-spacing-small">
          <div class="a-column a-span12 a-text-left">
            <div id="contextualIngressPt">
              <div id="contextualIngressPtPin"></div>
              <span id="contextualIngressPtLabel" class="cip-a-size-small">
                <div id="contextualIngressPtLabel_deliveryShortLine">Amazon Locker - Frio - Boise 83703</div>
              </span>
            </div>
          </div>
        </div>
      </a> </span> </div>
</div>
```

## conslusion
* serach for a  `<div>` with `id="mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE"`
  * The property value for `data-csa-c-delivery-time` will contain the arrrival date
    * This is userful, but we also need to convert this into `# of days` so that we can format it like `#d` in the markdown
      * This value might be a specific date or might be formatted for today or tomorrow:
        * `Tomorrow, June 1`
        * `Today`
        * `Today 2 PM - 6 PM`
        * `Thursday, June 4`
      * To compute # of days:
        * contains `Today`: 0
        * contains `Tomorrow`: 1
        * contains a day of month: do some date math
    * I think we should extract multiple properties from this element
      * delivery_actual: the literal value of `data-csa-c-delivery-time`
      * deliveyy_in_days: `#d`
      * Others can be mined from these other property key/values
        * `data-csa-c-delivery-benefit-program-id`: "prime"
          * prime delivery 
        * `data-csa-c-delivery-condition`: ""
        * `data-csa-c-delivery-cutoff`: ""
        * `data-csa-c-delivery-destination`: ""
        * `data-csa-c-delivery-origin-country`: ""
        * `data-csa-c-delivery-price`: "FREE"
          * some products charge extra for shipping, not too common though
        * `data-csa-c-delivery-time`: "Tomorrow, June 1"
        * `data-csa-c-delivery-type`: "pickup"
        * `data-csa-c-distance`: ""
        * `data-csa-c-mir-sub-type`: ""
        * `data-csa-c-mir-type`: "DELIVERY"
        * `data-csa-c-mir-variant`: "DEFAULT"
        * `data-csa-c-mir-view`: "CONSOLIDATED_CX"
        * `data-csa-c-pickup-location`: ""
        * `data-csa-c-type`: "element"    
        * `data-csa-c-value-proposition`: ""
        * `data-csa-c-content-id`: "DEXUnifiedCXPDM"
        * `data-csa-c-id`: "3qfczu-gipdkw-tusyqo-a6qb3s"



# Prime Delivery

Some products have `Prime` delivery (a membership program feature) 
```html
<div class="a-section a-spacing-base a-text-left">                                                                     <span id="priceBadging_feature_div" class="feature" data-feature-name="priceBadging" data-cel-widget="priceBadging_feature_div">
		     <i class="a-icon-wrapper a-icon-prime-with-text aok-nowrap a-text-bold"><i class="a-icon a-icon-prime" role="img" aria-label="prime"></i><span class="a-icon-text">Tomorrow</span></i>
  </span>
                 </div>
```

## Conclusion
* A quicker way might be to use the properties from `# Delivery Date` above: `data-csa-c-delivery-benefit-program-id="prime"`
* a difernt way: parse the html above




---


I tested out an a handful of links. Here are some outputs and some notes where it fell shorts


* [ALLOLO Red Light Therapy for Body, 3 in 1 LEDs Red Light Therapy Belt with Timer Remote Control, 660nm 850nm Infrared Light Therapy Pad for Body Waist Shoulder Knee, 12.6" x 6.3" Large Area](https://www.amazon.com/dp/B0DK35X239?psc=1)
  * price: $29.45
  * rating: 4.4 / 894
  * store: [Click to learn more about this sponsored product](https://www.amazon.com/stores/98286354-F1CF-4035-931E-969101222584/page/98286354-F1CF-4035-931E-969101222584?aaxitk=d20fbbfcfc41f5a7026554e1bcb81ffe&aref=nCvPvrbdcq&sref=AR_581422060451806950_591267764744860192_593838074438074259)

> [!IMPORTANT]
> Sometimes in place of the `store`, there will instead be a `search` link
> I'm not sure why it parsed `[Click to learn more about this sponsored product](https://www.amazon.com/stores/98286354-F1CF-4035-931E-969101222584/page/98286354-F1CF-4035-931E-969101222584?aaxitk=d20fbbfcfc41f5a7026554e1bcb81ffe&aref=nCvPvrbdcq&sref=AR_581422060451806950_591267764744860192_593838074438074259)`, but that's incorrect
> In this case it should find: `[Brand: ALLOLO](https://www.amazon.com/s/ref=bl_dp_s_web_0)`. 
> I didnt' look at the HTML in this case but you should be able to grab it and have a look. 
> Update the code to first look or `store`, then fall back to `search`. Also fix the mis-parse (sponsored product vs store)



* [Radiomaster Pocket Crush ExpressLRS Radio Controller 2.4G 16CH ELRS Transmitter Hall Gimbal For RC FPV Drone Quadcopter Remote Control NEW (Mint Mist-ELRS M2)](https://www.amazon.com/dp/B0DSDBWK2P)
  * price: $79.99
  * delivers: 5d
  * rating: 4.7 / 23
  * store: [Visit the Xiangtat Store](https://www.amazon.com/stores/Xiangtat/page/F5B5565E-A619-4F31-B2AC-EEEE3161E08F?lp_asin=B0DSDBWK2P&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto)

* [Radiomaster Pocket ELRS Hall Gimbal Transmitter Remote Control Portable Lightweight Built in LED Light Foldable Antenna（Black Mode 2）](https://www.amazon.com/dp/B0CG93QM4T)
  * price: $79.99
  * rating: 4.3 / 167
  * store: [Visit the RADIOMASTER Store](https://www.amazon.com/stores/RADiOMASTER/page/679221A9-C18D-4AE7-BFD0-DBDC17E0CD97?lp_asin=B0CG93QM4T&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto)

* [RADIOMASTER TX16S Battey 5000mAh 2S 7.4V XT30 JST-XH Plug TX16s Transmitter 1Pack](https://www.amazon.com/dp/B08FDJT2KC)
  * price: $26.99
  * delivers: 2d
  * rating: 4.7 / 572
  * store: [Visit the RADIOMASTER Store](https://www.amazon.com/stores/RADiOMASTER/page/679221A9-C18D-4AE7-BFD0-DBDC17E0CD97?lp_asin=B08FDJT2KC&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto)

* [Lichamp 20-Pack Colored Electrical Tape Waterproof, 3/4 in x 66ft, Industrial Grade UL/CSA Listed High Temp Electrical Tape Colors Electric Super Vinyl, 2075C1](https://www.amazon.com/dp/B0C9GTV3WN?psc=1)
  * price: $29.99
  * delivers: 1d
  * rating: 4.5 / 34
  * store: [Visit the Lichamp Store](https://www.amazon.com/stores/Lichamp/page/BDC1CD62-094C-4AC8-8F82-B9B1E4FE2608?lp_asin=B0C9GTV3WN&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto)


* [50 Pcs Giant Balloons Kit 18 24 36 Inch Mixed Size Latex pool Balloon, With 10 Colors - Party Decoration Supplies for Birthdays, Weddings, Events](https://www.amazon.com/dp/B0F1CKNFJG?th=1)
  * price: $23.99
  * delivers: 2d
  * rating: 4.6 / 288
  * color: Rainbow
  * size: 18/24/36 Inch
  * store: [Click to learn more about this sponsored product](https://www.amazon.com/stores/98286354-F1CF-4035-931E-969101222584/page/98286354-F1CF-4035-931E-969101222584?aaxitk=d20fbbfcfc41f5a7026554e1bcb81ffe&aref=nCvPvrbdcq&sref=AR_581422060451806950_591267764744860192_593838074438074259)

* [30 Pcs 36 Inch Giant Balloons Latex Large Assorted Color Rainbow Big Balloon for Birthday Wedding Baby Shower Anniversaries Store Party Decorations](https://www.amazon.com/dp/B0G2JLMBFL?th=1)
  * price: $16.89
  * delivers: 2d
  * rating: 4.6 / 655
  * color: Multicolor Balloons.
  * size: 36 inch
  * store: [Click to learn more about this sponsored product](https://www.amazon.com/stores/98286354-F1CF-4035-931E-969101222584/page/98286354-F1CF-4035-931E-969101222584?aaxitk=d20fbbfcfc41f5a7026554e1bcb81ffe&aref=nCvPvrbdcq&sref=AR_581422060451806950_591267764744860192_593838074438074259)


* [Kingsted T-Shirts for Men Pack - Royally Comfortable - Super Soft Premium Fabric - Well-Crafted Classic Tee](https://www.amazon.com/dp/B07NHW8Z3N?th=1&psc=1)
  * price: 49.
  * rating: 4.4 / 12854
  * color: Kingsted Favorites
  * size: Large
  * store: [Visit the Kingsted Store](https://www.amazon.com/stores/Kingsted/page/1722C3AB-2605-4EE9-A39D-5E51FA72E1D7?lp_asin=B0D4YQVQF4&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto&bl_grd_status=override)

> [!WARNING]
> price is missing the `.99`


* [5 Pack Girls Shirts Athletic Dry-Fit T-Shirts Short Sleeve Summer Crew Neck Tops for Girls Kids Teens](https://www.amazon.com/dp/B0G5258MDY?th=1&psc=1)
  * price: 24.
  * delivers: 2d
  * rating: 4.6 / 98
  * color: Bright Purple, Mottled Pink, Mint, Mixed Color a
  * size: 10-12 Years
  * store: [Amazon Brands](https://www.amazon.com/stores/AmazonEssentials/page/F8FB6F3C-F896-455C-BC52-7879F4CEF0CF/?_encoding=UTF8&ref_=sv_sl_7)

> [!WARNING]
> price is missing the `.99`

* [Kingsted T-Shirts for Men Pack - Royally Comfortable - Super Soft Premium Fabric - Well-Crafted Classic Tee](https://www.amazon.com/dp/B09T63N2KN?th=1&psc=1)
  * price: 42.
  * delivers: 2d
  * rating: 4.4 / 12854
  * color: Royal 3 Pack
  * size: Medium
  * store: [Visit the Kingsted Store](https://www.amazon.com/stores/Kingsted/page/1722C3AB-2605-4EE9-A39D-5E51FA72E1D7?lp_asin=B0D4YQVQF4&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto&bl_grd_status=override)

> [!WARNING]
> price is missing the `.99`


# General feedback

> [!NOTE]
> delivery string can include some more variants than what I listed it looks like. Here are some more: `Overnight`, `Two-Day`, `Tomorrow`, `Today`


> [!NOTE]
> When: opt+z+click (on a page, or a link) IF a domain specific ourput is available, that should superscede the preferred format. 


---



* [ALLOLO Red Light Therapy for Body, 3 in 1 LEDs Red Light Therapy Belt with Timer Remote Control, 660nm 850nm Infrared Light Therapy Pad for Body Waist Shoulder Knee, 12.6" x 6.3" Large Area](https://www.amazon.com/dp/B0DK35X239?psc=1)
  * price: $29.45
  * rating: 4.4 / 894
  * store: [Click to learn more about this sponsored product](https://www.amazon.com/stores/98286354-F1CF-4035-931E-969101222584/page/98286354-F1CF-4035-931E-969101222584?aaxitk=d20fbbfcfc41f5a7026554e1bcb81ffe&aref=nCvPvrbdcq&sref=AR_581422060451806950_591267764744860192_593838074438074259)

* [Radiomaster Pocket Crush ExpressLRS Radio Controller 2.4G 16CH ELRS Transmitter Hall Gimbal For RC FPV Drone Quadcopter Remote Control NEW (Mint Mist-ELRS M2)](https://www.amazon.com/dp/B0DSDBWK2P)
  * price: $79.99
  * delivers: 5d
  * rating: 4.7 / 23
  * store: [Visit the Xiangtat Store](https://www.amazon.com/stores/Xiangtat/page/F5B5565E-A619-4F31-B2AC-EEEE3161E08F?lp_asin=B0DSDBWK2P&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto)

* [Radiomaster Pocket ELRS Hall Gimbal Transmitter Remote Control Portable Lightweight Built in LED Light Foldable Antenna（Black Mode 2）](https://www.amazon.com/dp/B0CG93QM4T)
  * price: $79.99
  * rating: 4.3 / 167
  * store: [Visit the RADIOMASTER Store](https://www.amazon.com/stores/RADiOMASTER/page/679221A9-C18D-4AE7-BFD0-DBDC17E0CD97?lp_asin=B0CG93QM4T&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto)

* [RADIOMASTER TX16S Battey 5000mAh 2S 7.4V XT30 JST-XH Plug TX16s Transmitter 1Pack](https://www.amazon.com/dp/B08FDJT2KC)
  * price: $26.99
  * delivers: 2d
  * rating: 4.7 / 572
  * store: [Visit the RADIOMASTER Store](https://www.amazon.com/stores/RADiOMASTER/page/679221A9-C18D-4AE7-BFD0-DBDC17E0CD97?lp_asin=B08FDJT2KC&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto)

* [Lichamp 20-Pack Colored Electrical Tape Waterproof, 3/4 in x 66ft, Industrial Grade UL/CSA Listed High Temp Electrical Tape Colors Electric Super Vinyl, 2075C1](https://www.amazon.com/dp/B0C9GTV3WN?psc=1)
  * price: $29.99
  * delivers: 1d
  * rating: 4.5 / 34
  * store: [Visit the Lichamp Store](https://www.amazon.com/stores/Lichamp/page/BDC1CD62-094C-4AC8-8F82-B9B1E4FE2608?lp_asin=B0C9GTV3WN&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto)


* [50 Pcs Giant Balloons Kit 18 24 36 Inch Mixed Size Latex pool Balloon, With 10 Colors - Party Decoration Supplies for Birthdays, Weddings, Events](https://www.amazon.com/dp/B0F1CKNFJG?th=1)
  * price: $23.99
  * delivers: 2d
  * rating: 4.6 / 288
  * color: Rainbow
  * size: 18/24/36 Inch
  * store: [Click to learn more about this sponsored product](https://www.amazon.com/stores/98286354-F1CF-4035-931E-969101222584/page/98286354-F1CF-4035-931E-969101222584?aaxitk=d20fbbfcfc41f5a7026554e1bcb81ffe&aref=nCvPvrbdcq&sref=AR_581422060451806950_591267764744860192_593838074438074259)

* [30 Pcs 36 Inch Giant Balloons Latex Large Assorted Color Rainbow Big Balloon for Birthday Wedding Baby Shower Anniversaries Store Party Decorations](https://www.amazon.com/dp/B0G2JLMBFL?th=1)
  * price: $16.89
  * delivers: 2d
  * rating: 4.6 / 655
  * color: Multicolor Balloons.
  * size: 36 inch
  * store: [Click to learn more about this sponsored product](https://www.amazon.com/stores/98286354-F1CF-4035-931E-969101222584/page/98286354-F1CF-4035-931E-969101222584?aaxitk=d20fbbfcfc41f5a7026554e1bcb81ffe&aref=nCvPvrbdcq&sref=AR_581422060451806950_591267764744860192_593838074438074259)


* [Kingsted T-Shirts for Men Pack - Royally Comfortable - Super Soft Premium Fabric - Well-Crafted Classic Tee](https://www.amazon.com/dp/B07NHW8Z3N?th=1&psc=1)
  * price: 49.
  * rating: 4.4 / 12854
  * color: Kingsted Favorites
  * size: Large
  * store: [Visit the Kingsted Store](https://www.amazon.com/stores/Kingsted/page/1722C3AB-2605-4EE9-A39D-5E51FA72E1D7?lp_asin=B0D4YQVQF4&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto&bl_grd_status=override)

> [!WARNING]
> price is missing the `.99`


* [5 Pack Girls Shirts Athletic Dry-Fit T-Shirts Short Sleeve Summer Crew Neck Tops for Girls Kids Teens](https://www.amazon.com/dp/B0G5258MDY?th=1&psc=1)
  * price: 24.
  * delivers: 2d
  * rating: 4.6 / 98
  * color: Bright Purple, Mottled Pink, Mint, Mixed Color a
  * size: 10-12 Years
  * store: [Amazon Brands](https://www.amazon.com/stores/AmazonEssentials/page/F8FB6F3C-F896-455C-BC52-7879F4CEF0CF/?_encoding=UTF8&ref_=sv_sl_7)

> [!WARNING]
> price is missing the `.99`

* [Kingsted T-Shirts for Men Pack - Royally Comfortable - Super Soft Premium Fabric - Well-Crafted Classic Tee](https://www.amazon.com/dp/B09T63N2KN?th=1&psc=1)
  * price: 42.
  * delivers: 2d
  * rating: 4.4 / 12854
  * color: Royal 3 Pack
  * size: Medium
  * store: [Visit the Kingsted Store](https://www.amazon.com/stores/Kingsted/page/1722C3AB-2605-4EE9-A39D-5E51FA72E1D7?lp_asin=B0D4YQVQF4&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto&bl_grd_status=override)

> [!WARNING]
> price is missing the `.99`


# General feedback

> [!NOTE]
> delivery: `Overnight`, `Two-Day`, `Tomorrow`, `Today`


> [!NOTE]
> When: opt+z+click, default formatter should be domain specific format if one is avaiable




---























---



* [OK TAPE 4 Rolls Athletic Tape, Sports Tape for Injuries, Rigid, Easy Tear Medical Tape, Wrist Tape, No Sticky Residue | Secure Ankle, Finger, Knee- 1.5inch x 15yards (Purple)](https://www.amazon.com/dp/B0DF7NX1D8?crid=2L3XETA3O5CR1&th=1)
  * price: $9.99
  * shipping: 0d 
  * rating: 4.4 / 653
  * variant_1: Purple-4 Rolls
  * variant_2: 15 yards
  * seller: HTT Health Care
  * store: [Visit the OK TAPE Store](https://www.amazon.com/stores/OKTAPE/page/863F38C9-4A34-42F5-8D5E-A91EF70C815D)



* delivery_is_prime: true/false
  * HTML: `data-csa-c-delivery-benefit-program-id="prime"`
