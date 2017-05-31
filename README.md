# jQuery autoComplete
#### Auto complete searches while typing.

## Example
This example is created to find new destinations to travel to.
For a live preview: [Follow your heart campaign](http://www.travellink-campaign.com/followyourheart/)

## How does it work
As user starts typing, suggestions are presented. Pressing → will accept the suggestion, pressing ↑ or ↓ scrolls through the alternatives and pressing ENTER will submit the form.

Matches are fetched from database and returned as json array of objects. The result can of course be customized. This example uses:

* _language_ to specify what language the results should be in 
* _friendlyName_ is the suggestion that will be shown
* _url_ is the url that the user will be sent to when clicking submit 

Result example:
```json
[
  {
    "url"          : "/path/for/submit/button",
    "friendlyName" : "Aberdeen (South Dakota)",
    "language"     : "SE"
  }
]
```


### Fuzzy search
The plugin implements a _fuzzy search_, meaning that it looks for matches to any character. A search string such as '**sthlm**' will find the result  '**St**ock**h**o**lm**'. To prevent confusing results, a few constraints are present:

*   The first letter must be an exact match.
*   The following letters must be in the same order. The search **hlmst** will **not match** 'Stockholm'. (It will, however, match 'Halmstad'.)




