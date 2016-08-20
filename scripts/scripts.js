var recipeApp = {};

recipeApp.apiKey = 'bd72e648e0c97c7d8ca010e2f3f5c766';
recipeApp.apiID = '665f8143';
recipeApp.start = 0;

//geolocation for map to find nearby restaurants
navigator.geolocation.watchPosition(function(position) {
      recipeApp.latitude = position.coords.latitude;
      recipeApp.longitude = position.coords.longitude;    
});

recipeApp.getRecipes = function(timeToPrep, chosenCuisine, start){
    $.ajax({
        url:'https://api.yummly.com/v1/api/recipes',
        type: 'GET',
        data:{
            format: 'jsonp',
            _app_id: recipeApp.apiID,
            _app_key: recipeApp.apiKey,
            requirePictures: true,
            maxResult: 10,
            start: start,
            maxTotalTimeInSeconds: timeToPrep * 60,
            imgonly: true,
            allowedCourse: ['course^course-Main Dishes'],
            allowedCuisine: ['cuisine^cuisine-'+chosenCuisine.toLowerCase()], 
            },
        dataType: 'jsonp'
    }).done(function(recipes) {
        recipes.matches.map(function(recipe)
         {
            recipeApp.displayRecipes(recipe);
        }) //closes map
    });//closes ajax
};//closes getRecipes
    
recipeApp.displayRecipes = function(recipe) {
    var recipeHTML = `
    <div class="recipe">
      <h2>${recipe.recipeName}</h2>
      <img class="food" src=${recipe.smallImageUrls.toString().replace("=s90", "")}></img>
      <p class="food"><span class="bold">Ingredients:</span> ${recipe.ingredients.join(', ')}</p>
      <p class="food"><span class="bold">Prep & cook time:</span> ${recipe.totalTimeInSeconds / 60} min</p>
      <p class="food">Click <a href='http://www.yummly.com/recipe/ + ${recipe.id}' target='_blank'>here</a> for the full recipe</p>  
    </div>`;
    console.log(recipe)
    $('#recipes').append(recipeHTML);
}  //end recipeApp.displayRecipes

//if choose 0 for time, change submit button message
$( "#time" ).change(function() {
      if ($('#time').val() == 0){
        $('#submit').val("Find me food!");
      } else {
        $('#submit').val("Lets get cookin'!");
      }
});

$('#submit').on('click', function() {
    recipeApp.timeToPrep = $('#time').val();
    recipeApp.chosenCuisine = $('#cuisine').val();

    //clear any previous error messages
    var timeError = $('#timeError');
    var cuisineError = $('#cuisineError');
    timeError.empty();
    cuisineError.empty();
    
    var isValid = true;

    //if don't enter time in minutes
    if (recipeApp.timeToPrep == "" || !$.isNumeric(recipeApp.timeToPrep))
    {
        timeError.html("Please enter a time in minutes");
        isValid = false;
    }
    else if (Math.floor(recipeApp.timeToPrep) != recipeApp.timeToPrep)
    {
        timeError.html("Please enter a whole number for the time in minutes");
        isValid = false;
    } else if (recipeApp.timeToPrep < 0){
        timeError.html("You can't enter a negative time!");
        isValid = false;
    }
    //if don't choose cuisine 
    if($('#cuisine').val() == 'default')
    {
        cuisineError.html("Please choose a cuisine");
        isValid = false;
    } 
    //to prevent recipes from generating when one of the fields is not properly filled in/selected
    $('#recipes').empty();

    if (isValid) {
        //to smooth scroll to results
         $('html, body').animate({
            scrollTop: $("#recipes").offset().top
        }, 1000);

        // if don't have time to prep, show takeout options on Google Maps
        if (recipeApp.timeToPrep == 0)
        { 
            $('#gmaps').attr(`src`, `https://www.google.com/maps/embed/v1/search?key=AIzaSyBwTt_fQnSWl7cIj_H_iy37tbrlBgPPafE&q=${recipeApp.chosenCuisine}+restaurant&zoom=14&center=${recipeApp.latitude},${recipeApp.longitude}`);
            //to display results for takeout options
            $('.map').css('display', 'flex');
            $('.map').css('justify-content', 'center');
            $('#ideas').html("Here are some places you can get takeout from:");
            $('#loadMore').css('display', 'none');
        } 
            //if have time to prep, display recipe ideas
        else if (recipeApp.timeToPrep != 0 ) {
            $('.map').css('display', 'none');
            $('#ideas').html("Here are some recipe ideas:");
            $('#loadMore').css('display', 'block');
            recipeApp.start = 0;
            recipeApp.getRecipes(recipeApp.timeToPrep, recipeApp.chosenCuisine, recipeApp.start);
        }
        //to load more recipe ideas (10 at a time)
        $('#loadMore').on('click', function(){
            recipeApp.start += 10;
            recipeApp.getRecipes(recipeApp.timeToPrep, recipeApp.chosenCuisine, recipeApp.start);
        }); //closes loadMore
    } //closes isValid 
}); //closes submit function
