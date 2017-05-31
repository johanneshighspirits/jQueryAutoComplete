$(document).ready(function() {

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function numberOfMatchingLetters(string) {
    var matchingLetters = 0;
    while (string.substr(0, matchingLetters + 1) == searchString.substr(0, matchingLetters + 1) && matchingLetters < string.length) {
      matchingLetters++;
    }
    return matchingLetters;
  }

  function bestMatchFirst(a, b) {
    return numberOfMatchingLetters(b.friendlyName) - numberOfMatchingLetters(a.friendlyName);
  }

  function sortNumbers(a, b){
    return a-b;
  }

  var searchString;
  var highlightedSuggestion = 0;

  $('#searchField').on('input propertychange paste', function(){
    searchString = capitalizeFirstLetter($(this).val());
    $('#searchFieldSuggestion').attr("placeholder", '').hide();
    highlightedSuggestion = 0;
    if (searchString !== '') {
      $(this).val(searchString);
      // Send searchString to database and receive json result.
      // NOTE: You have to replace this url with a resource that
      // takes the variables 'q' and 'lang' and returns json in
      // the following format:
      /*
      
      [
        {
          "url"          : "/path/for/submit/button", // Where will the user be sent when submit is clicked?
          "friendlyName" : "Friendly Name that the user will see", // E.g. Aberdeen (South Dakota)
          "language"     : "Two letter country code" // E.g. "SE"
        }
      ]

      */
      $.post('/path/to/json/resource/', { q: searchString, lang: lang }, function(data){
        // suggestions will hold all matches
        var suggestions = [];
        // suggestion is the best match
        var suggestion = '';
        var href = siteRoot;
        if (data.length === 0) {

        }else if (data.length == 1) {
          suggestion = data[0].friendlyName;
          href = data[0].url;
          suggestions.push(data[0]);
        }else{
          $.each(data, function(index, result) {
            suggestions.push(result);
          });
          // Sort suggestions
          suggestions.sort(bestMatchFirst);
          suggestion = suggestions[0].friendlyName;
          href = suggestions[0].url;
        }

        if (suggestion !== '') {
          if (suggestion.substr(0, searchString.length) !== searchString) {
            // Database returned suggestions but they are not equal to the search string. Probably because of lousy åäö conversion.
            var regexString = searchString.replace(/a/gi, "[" + decodeURIComponent(encodeURI("aäåæ")) + "]").replace(/o/gi, "[" + decodeURIComponent(encodeURI("oöø")) + "]");
            var regex = new RegExp(regexString, 'gi');
            if (searchString.match(regex).length <= 0) {
              suggestion = '';
            }else if (numberOfMatchingLetters(suggestion) != searchString.length){
              suggestion = '';
            }
          }
        }
        var output = '';
        var limitedSuggestionLength = suggestions.length < 20 ? suggestions.length : 20;
        for (var i = 0; i < limitedSuggestionLength; i++) {
          var city = suggestions[i].friendlyName;
          var suggestionHref = suggestions[i].url;
          var indexes = [];
          for (var c = 0; c < searchString.length; c++) {
            var character = searchString.charAt(c).toLowerCase();
            var startAt = indexes.length > 0 ? indexes[indexes.length - 1] + 1 : 0;
            var charPos = city.toLowerCase().indexOf(character, startAt);
            if (charPos != -1) {
              indexes.push(charPos);
              indexes.sort(sortNumbers);
            }
          }
          var pieces = [];
          if (indexes[0] !== 0) {
            indexes.unshift(0);
          }
          for (var piece = 0; piece < indexes.length; piece++) {
            var index = indexes[piece];
            var nextIndex = indexes[piece + 1];
            pieces.push("<span style=\"color:#66ccff;\">" + city.substr(index, 1) + "</span>");
            pieces.push(city.substring(index + 1, nextIndex));
          }
          output += '<li data-friendlyName="' + city + '" data-url="' + suggestionHref + '" id="suggestion-' + i + '" style="opacity:' + (1 - (i * 0.05)) + ';"><a href="#">' + pieces.join('') + '</a></li>\n';
        }
        $("#searchSuggestions").html(output);
        $('#searchFieldSuggestion').attr("placeholder", suggestion).fadeIn(200);
        $("#searchForm").attr("action", href);
        $("#searchFieldSubmit").attr("href", href);
        $('#suggestion-' + highlightedSuggestion).addClass("highlighted");
      }, 'json');


    }else{
      $("#searchSuggestions").html('');
    }
  });

  $(document).keydown(function(e) {
      switch(e.which) {
          case 38: // up
          if (highlightedSuggestion > 0) {
            highlightedSuggestion--;
            $('.highlighted').removeClass('highlighted');
            $('#suggestion-' + highlightedSuggestion).addClass("highlighted");
            var suggestion = $('#suggestion-' + highlightedSuggestion).attr("data-friendlyName");
            var href = $('#suggestion-' + highlightedSuggestion).attr("data-url");
        $('#searchFieldSuggestion').attr("placeholder", ''); //.fadeIn(200);
        $("#searchForm").attr("action", href);
        $("#searchFieldSubmit").attr("href", href);
        $('#searchField').val(suggestion);
          }else if (highlightedSuggestion === 0) {
            highlightedSuggestion = -1;
            $('.highlighted').removeClass('highlighted');
            var href = $('#suggestion-0').attr("data-url");
        $("#searchForm").attr("action", href);
        $("#searchFieldSubmit").attr("href", href);
        $('#searchField').val(searchString);
          }
          break;
          case 40: // down
          if (highlightedSuggestion <= 20 && highlightedSuggestion < ($("#searchSuggestions li").length - 1)) {
            highlightedSuggestion++;
            $('.highlighted').removeClass('highlighted');
            $('#suggestion-' + highlightedSuggestion).addClass("highlighted");
            var suggestion = $('#suggestion-' + highlightedSuggestion).attr("data-friendlyName");
            var href = $('#suggestion-' + highlightedSuggestion).attr("data-url");
        $('#searchFieldSuggestion').attr("placeholder", ''); //.fadeIn(200);
        $("#searchForm").attr("action", href);
        $("#searchFieldSubmit").attr("href", href);
        $('#searchField').val(suggestion);
          }
          break;
          case 39: // right
          if (highlightedSuggestion <= 20) {
            var suggestion = $('#suggestion-' + highlightedSuggestion).attr("data-friendlyName");
            var href = $('#suggestion-' + highlightedSuggestion).attr("data-url");
        $('#searchFieldSuggestion').attr("placeholder", ''); //.fadeIn(200);
//        $(this).val(suggestion);
        $("#searchForm").attr("action", href);
        $("#searchFieldSubmit").attr("href", href);
        $('#searchField').val(suggestion);
          }
          break;
          default: return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
  });

  $('body').on('click', '#searchSuggestions li a', function(e) {
    e.preventDefault();
    var suggestion = $(this).parent().attr("data-friendlyName");
    var href = $(this).parent().attr("data-url");
    $('#searchFieldSuggestion').attr("placeholder", ''); //.fadeIn(200);
    $("#searchForm").attr("action", href);
    $("#searchFieldSubmit").attr("href", href);
    $('#searchField').val(suggestion).focus();
  });

});

