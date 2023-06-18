"use strict";

//Kodblock tagen från bootstrap, modifierat med eget variabelnamn och antalet pixlar tills knappen syns
//********************************************************** 
//Get the button
let buttonToTop = document.querySelector("#button-to-top");
// When the user scrolls down 800px from the top of the document, show the button
window.onscroll = function () {
    scrollFunction();
};
function scrollFunction() {
    if (document.documentElement.scrollTop > 800) {
        buttonToTop.style.display = "block";
    } else {
        buttonToTop.style.display = "none";
    }
}
// When the user clicks on the button, scroll to the top of the document
buttonToTop.addEventListener("click", backToTop);
function backToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}
//************************************************************

//Lyssnare när sidan laddat klart
window.addEventListener('load', function () {
    //Gör laddnings-spinner osynlig
    document.querySelector('#preloader').classList.add('d-none');
    //Gör div för sökresultaten till flex
    document.querySelector('#content').classList.add('d-flex', 'flex-wrap', 'justify-content-center');

    //Lyssnare på "Search By"-knappar, vilket kategori man vill söka efter
    document.querySelector('#search-by').addEventListener('click', handleSearchBy);
    //lägger till lyssnare på submit som anropar funktion
    document.querySelector('#search-form').addEventListener('submit', handleSearchSubmit);
    //Lyssnare på filter-länkar vid val av filter
    document.querySelector('#filter').addEventListener('click', handleFilter);
    //Lyssnare på random-knapp för ett slumpat cocktail-recept
    document.querySelector('#random-button').addEventListener('click', randomCocktail);
});

//Sätter alla filter-by-länkar till ursprungsläge
function filterByDefault() {
    let aRefs = document.querySelectorAll('#filter a');
    for (let i = 0; i < aRefs.length; i++) {
        aRefs.item(i).className = 'a';
    }
}

//Hanterar val av sökväg
function handleSearchBy(event) {
    //Tömmer sökresultat och gör laddnings-spinner osynlig
    document.querySelector("#search").value = "";
    document.querySelector('#preloader').classList.add('d-none');
    //Sätter fokus i sökruta
    document.querySelector('#search').focus();

    //Sätter alla searchBy-knappar till ursprungsläge
    let buttonRefs = document.querySelectorAll('#search-by button');
    for (let i = 0; i < buttonRefs.length; i++) {
        buttonRefs.item(i).className = 'btn btn-outline-info';
    }
    //Lägger ny klass på klickad knapp och säkerställer att det är knapp man klickat på
    let searchByChoice = event.target;
    if (searchByChoice.type === 'button') {
        searchByChoice.className = 'btn btn-info';
    }
    //Ändrar text i placeholder till aktuell kategori
    document.querySelector('#search').placeholder = 'Enter ' + searchByChoice.value;
}

//Hanterar sök-klick
function handleSearchSubmit(event) {
    //Stoppar default-beteende
    event.preventDefault();
    //Gör laddnings-spinner synlig igen
    document.querySelector('#preloader').classList.remove('d-none');
    //Rensar div för sökresultat
    document.querySelector('#content').innerHTML = null;
    
    //Anropar funktion med sökvärde och diven där resultat ska synas
    search(document.querySelector('#search').value, document.querySelector('#content'));
}

//Visar alla cocktail inom sökresultatet
function search(query, container) {
    filterByDefault();

    //Beroende på vilken "search-by"-typ användaren har valt
    let search = document.querySelector('#search').placeholder;
    let fetchURL = null;
    let searchType = null;
    if (search === 'Enter ingredient') {
        fetchURL = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=' + encodeURIComponent(query);
        searchType = 'Ingredient';
    }
    else if (search === 'Enter cocktail name') {
        fetchURL = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(query);
        searchType = 'Cocktail Name';
    }
    else if (search === 'Enter first letter') {
        fetchURL = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=' + encodeURIComponent(query);
        searchType = 'First Letter';
    }

    window.fetch(fetchURL)
        .then(function (response) {
            return response.json();
        })
        //Vid fel inmatning eller error sker vid hämtning av json-data
        .catch(function (error) {
            console.error(error); 
            let errorTxt = document.createElement('h2');
            errorTxt.style.textAlign = 'center';
            if (query.length == '0'){
                errorTxt.textContent = 'Enter a search and try again.';
            }
            else if (searchType === 'Ingredient') {
                errorTxt.textContent = 'Write an ingredient and try again.';
            }
            else if (searchType === 'First Letter' && query.length > 1) {
                errorTxt.textContent = 'Only write the first letter and try again.';
            }
            else {
                errorTxt.textContent = 'Reload the page or wait a few minutes.';
            }
            container.appendChild(errorTxt);
            return 'error';
        })
        .then(function (data) {
            if (data !== 'error') {
                //Gör laddnings-spinner synlig och gömmer bild 
                document.querySelector('#preloader').classList.add('d-none');
                document.querySelector('#frontpage-pic').classList.add('d-none');

                //Skapar och lägger till avbrytare
                let hr = document.createElement('hr');
                container.appendChild(hr);

                //Skapar och lägger in aktuell titel för söktyp
                let title = document.createElement('h5');
                title.classList.add('filter-title');
                title.textContent = 'Searched by: ' + searchType + ' - ' + query;
                container.appendChild(title);

                //loopar igenom och skiver ut aktuella cocktails från sökresultatet
                for (let cocktailData of data.drinks) {
                    //skapar och lägger in ram till produktfakta
                    let card = document.createElement('div');
                    card.classList.add('card', 'card-search');
                    container.appendChild(card);

                    //Skapar och lägger in img-tagg med aktuell bild på cocktail
                    let cardImage = document.createElement('img');
                    cardImage.className = 'card-img-top';
                    cardImage.src = cocktailData.strDrinkThumb;
                    cardImage.alt = 'Image of cocktail ' + cocktailData.strDrink;
                    card.appendChild(cardImage);

                    //Skapar och lägger in p-tagg med aktuell titel på cocktail
                    let cardTitle = document.createElement('h5');
                    cardTitle.classList.add('search-title');
                    cardTitle.textContent = cocktailData.strDrink;
                    card.appendChild(cardTitle);

                    //Lyssnare om man klickar på cocktail så anropas funktioin som visar info om just denna cocktail
                    card.addEventListener('click', function () {
                        //Tömmer sökresultat
                        document.querySelector("#search").value = "";
                        //Anropar funktion som visar detaljer om vald cocktail
                        cocktailById(cocktailData.idDrink, document.querySelector('#content'));
                    });
                }
            }
        });
}

//Hantera val av filter
function handleFilter(event) {
    //Sätter alla filter-by-länkar till ursprungsläge och gör laddnings-spinner osynlig
    filterByDefault();
    document.querySelector('#preloader').classList.add('d-none');

    

    //Lägger ny klass på klickad länk och säkerställer att det är länk man klickat på
    let filterByChoice = event.target;
    if (filterByChoice.nodeName === 'A') {
        filterByChoice.className = 'a-filter';
    }

    //Beroende på vilken filter-typ användaren har valt
    let filterType = event.target.textContent;
    let fetchURL = null;
    if (filterType === 'Category') {
        fetchURL = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list';
    }
    if (filterType === 'Glass-type') {
        fetchURL = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?g=list';
    }
    if (filterType === 'Alcoholic') {
        fetchURL = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?a=list';
    }

    window.fetch(fetchURL)
        .then(function (response) {
            return response.json();
        })
        //Om error sker vid hämtning av json-data
        .catch(function (error) {
            console.error(error);
            let errorTxt = document.createElement('h2');
            errorTxt.textContent = 'Reload the page or wait a few minutes.';
            let container = document.querySelector('#content');
            container.appendChild(errorTxt);
        })
        .then(function (data) {
            //Tömmer sökresultat, sidoinnehåll och gömmer bild
            document.querySelector("#search").value = "";
            document.querySelector('#content').innerHTML = null;
            document.querySelector('#frontpage-pic').classList.remove('d-none');

            //Skapar och lägger in 
            let filterContainer = document.createElement('div');
            filterContainer.classList.add('filter-container');
            document.querySelector('#content').appendChild(filterContainer);

            //Loopar igenom och skriver ut aktuella cocktails för filterval
            for (let cocktailData of data.drinks) {
                //Skapar och lägger till länk-tagg för filter-typ beroende på aktuellt filter
                let aFilter = document.createElement('a');
                aFilter.href = '#';
                if (filterType === 'Category') {
                    aFilter.textContent = cocktailData.strCategory;
                }
                if (filterType === 'Glass-type') {
                    aFilter.textContent = cocktailData.strGlass;
                }
                if (filterType === 'Alcoholic') {
                    aFilter.textContent = cocktailData.strAlcoholic;
                }
                filterContainer.appendChild(aFilter);

                //Skapar och lägger in p-tagg med avskiljare
                let p = document.createElement('p');
                p.style.display = 'inline';
                p.textContent = ' | ';
                filterContainer.appendChild(p);
            }
            //Tar bort den sista avskiljaren
            filterContainer.removeChild(filterContainer.lastChild);

            //Lyssnare om man klickar på filter-typ som anropar och visar alla cocktails inom den kategorin
            filterContainer.addEventListener('click', function (event) {
                //Gör laddnings-spinner synliga igen och anropar filter-resultat om man klickat på en länk
                if (event.target.nodeName === 'A') {
                    filterByDefault();
                    //Gör laddnings-spinner synlig
                    document.querySelector('#preloader').classList.remove('d-none');
                    //Anropar och visar resultat av filtrerade cocktails
                    filteredResult(filterType, event.target.textContent, document.querySelector('#content'));
                }
            });
        });
}

//För att slumpa cocktailrecept
function randomCocktail() {
    filterByDefault();

    fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
        .then(function (response) {
            return response.json();
        })
        //Om error sker vid hämtning av json-data
        .catch(function (error) {
            console.error(error);
            let errorTxt = document.createElement('h2');
            errorTxt.textContent = 'Reload the page or wait a few minutes.';
            let container = document.querySelector('#content');
            container.appendChild(errorTxt);
        })
        .then(function (data) {
            //Gör laddnings-spinner synlig och gömmer bild 
            document.querySelector('#preloader').classList.remove('d-none');
            document.querySelector('#frontpage-pic').classList.add('d-none');

            let indCocktail = data.drinks[0];
            //Anropar funktion för att presentera det slumpade cocktailrecept
            cocktailById(indCocktail.idDrink, document.querySelector('#content'));
        });
}

//Om man klickar på ett cocktail-card
function cocktailById(id, container) {

    fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(function (response) {
            return response.json();
        })
        .catch(function (error) {
            console.error(error);
            //Om error sker vid hämtning av json-data
            let errorTxt = document.createElement('h2');
            errorTxt.textContent = 'Reload the page or wait a few minutes.';
            container.appendChild(errorTxt);
        })
        .then(function (data) {
            //Tar bort sökresultaten, gör laddnings-spinner osynlig och tar bort sidinnehåll
            document.querySelector("#search").value = "";
            document.querySelector('#content').innerHTML = null;
            document.querySelector('#preloader').classList.add('d-none');
            window.scrollTo(0,0);

            let indCocktail = data.drinks[0];
            let selectedFilter = null;

            //skapar och lägger till ram för cocktail-fakta
            let card = document.createElement('div');
            card.classList.add('card', 'id-card');
            container.appendChild(card);

            //Skapar och lägger in h4-tagg med aktuell titel för cocktail
            let cardTitle = document.createElement('h4');
            cardTitle.classList.add('id-title');
            cardTitle.textContent = indCocktail.strDrink;
            card.appendChild(cardTitle);

            //Skapa div för att få bild och ingridienser parallellt
            let infoPicContainer = document.createElement('div');
            infoPicContainer.classList.add('id-outer-div');
            card.appendChild(infoPicContainer);

            //Skapar div för bild så att höjden anpassar sig
            let picDiv = document.createElement('div');
            picDiv.classList.add('pic-div');
            infoPicContainer.appendChild(picDiv);
            //Skapar och lägger in img-tagg med aktuell bild på cocktail
            let cardImage = document.createElement('img');
            cardImage.classList.add('card-img-CSS');
            cardImage.src = indCocktail.strDrinkThumb;
            cardImage.alt = 'Image of cocktail ' + indCocktail.strDrink;
            picDiv.appendChild(cardImage);

            //Skapa div för ingridiens-rubrik och -text
            let ingredientDiv = document.createElement('div');
            infoPicContainer.appendChild(ingredientDiv);

            //Skapar och läägger in h5-tagg med ingridiens-rubrik
            let ingredientTitle = document.createElement('h5');
            ingredientTitle.classList.add('id-subheading', 'inline');
            ingredientTitle.textContent = "Ingredients:";
            ingredientDiv.appendChild(ingredientTitle);

            //Skapar list-tagg
            let ul = document.createElement('ul');
            ul.style.paddingLeft = "0rem";

            //Kolla efter ingridienser och mått, skapar p-tagg och lägger in för det antal som finns
            for (let i = 1; i <= 15; i++) {
                //Lägger in tillhörande ingridienser i en lista
                if (indCocktail["strIngredient" + i] !== null) {
                    //Skapar och lägger in list-tagg
                    let li = document.createElement('li');
                    li.classList.add('d-flex');
                    ul.appendChild(li);
                    ingredientDiv.appendChild(ul);

                    //Lägger till ev mått till ingredienser
                    if (indCocktail["strMeasure" + i] !== null) {
                        let pMeasure = document.createElement('p');
                        pMeasure.style.paddingRight = "1rem";
                        pMeasure.textContent = indCocktail["strMeasure" + i];
                        li.appendChild(pMeasure);
                    }

                    //Skapar p-tagg för gällande ingridienser och lägger till efter mått
                    let pIngredient = document.createElement('p');
                    pIngredient.textContent = indCocktail["strIngredient" + i];
                    li.appendChild(pIngredient);
                }
            }

            //Skapar och lägger in rubrik för instruktioner
            let instructionTitle = document.createElement('h5');
            instructionTitle.classList.add('id-subheading');
            instructionTitle.textContent = "Instructions:";
            card.appendChild(instructionTitle);
            //Skapar och lägger in p-tagg för aktuella instruktioner
            let instructionsText = document.createElement('p');
            instructionsText.textContent = indCocktail.strInstructions;
            card.appendChild(instructionsText);

            //Om video finns i receptet läggs en länk till i DOMen
            if(indCocktail.strVideo !== null){
                //Skapar och lägger in a-tagg för eventuell video
                let videoText = document.createElement('a');
                videoText.href = indCocktail.strVideo;
                videoText.target = '_blank';
                videoText.textContent = 'Click here for instruction video.';
                card.appendChild(videoText);
            }

            //Skapar och lägger in div-element för de 3 extra div med olika filter-kategorier
            let extrasContainer = document.createElement('div');
            extrasContainer.classList.add('d-flex', 'flex-wrap', 'justify-content-between', 'm-1');
            card.appendChild(extrasContainer);

            //Skpar och lägger in div-element för rubrik och text för kategori
            let categoryDiv = document.createElement('div');
            extrasContainer.appendChild(categoryDiv);
            //Skapar och lägger in rubrik för kategori
            let categoryTitle = document.createElement('h5');
            categoryTitle.classList.add('id-subheading');
            categoryTitle.textContent = "Category:";
            categoryDiv.appendChild(categoryTitle);
            //Skapar och lägger in p-tagg för aktuell kategori
            let categoryText = document.createElement('a');
            categoryText.href = '#';
            categoryText.textContent = indCocktail.strCategory;
            categoryDiv.appendChild(categoryText);

            //Lyssnare för klick på text som anropar och visar alla cocktails inom filtret
            categoryText.addEventListener('click', function () {
                //Gör laddnings-spinner synlig
                document.querySelector('#preloader').classList.remove('d-none');

                selectedFilter = 'Category';
                //Anropar funktion som visar alla cocktails inom det valda typen inom kategorin
                filteredResult(selectedFilter, indCocktail.strCategory, document.querySelector('#content'));
            });

            //Skpar och lägger in div-element för rubrik och text för glas-typ
            let glassDiv = document.createElement('div');
            extrasContainer.appendChild(glassDiv);
            //Skapar och lägger in rubrik för glas-typ
            let glassTitle = document.createElement('h5');
            glassTitle.classList.add('id-subheading');
            glassTitle.textContent = "Type of glass:";
            glassDiv.appendChild(glassTitle);
            //Skapar och lägger in p-tagg för aktuell glastyp
            let glassText = document.createElement('a');
            glassText.href = '#';
            glassText.textContent = indCocktail.strGlass;
            glassDiv.appendChild(glassText);

            //Lyssnare för klick på text som anropar och visar alla cocktails inom kategorin
            glassText.addEventListener('click', function () {
                //Gör laddnings-spinner synlig
                document.querySelector('#preloader').classList.remove('d-none');

                selectedFilter = 'Glass-type';
                //Anropar funktion som visar alla cocktails inom det valda typen inom glas-typ
                filteredResult(selectedFilter, indCocktail.strGlass, document.querySelector('#content'));
            });

            //Skpar och lägger in div-element för rubrik och text för alkoholhaltig
            let alcoholicDiv = document.createElement('div');
            extrasContainer.appendChild(alcoholicDiv);
            //Skapar och lägger in rubrik för alkoholhaltig
            let alcoholTitle = document.createElement('h5');
            alcoholTitle.classList.add('id-subheading');
            alcoholTitle.textContent = "Alcoholic:";
            alcoholicDiv.appendChild(alcoholTitle);
            //Skapar och lägger in p-tagg för aktuell alkohol
            let alcoholText = document.createElement('a');
            alcoholText.href = '#';
            alcoholText.textContent = indCocktail.strAlcoholic;
            alcoholicDiv.appendChild(alcoholText);

            //Lyssnare för klick på text som anropar och visar alla cocktails inom kategorin
            alcoholText.addEventListener('click', function () {
                //Gör laddnings-spinner synlig
                document.querySelector('#preloader').classList.remove('d-none');

                selectedFilter = 'Alcoholic';
                //Anropar funktion som visar alla cocktails inom det valda typen inom alkoholhaltig
                filteredResult(selectedFilter, indCocktail.strAlcoholic, document.querySelector('#content'));
            });
        });
}

//För att få resultat om alla cocktails inom det filtret
function filteredResult(filter, type, container) {
    //Beroende på vilken "search-by" användaren har valt
    let fetchURL = null;
    if (filter === 'Category') {
        fetchURL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${type}`;
    }
    else if (filter === 'Glass-type') {
        fetchURL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?g=${type}`;
    }
    else if (filter === 'Alcoholic') {
        fetchURL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${type}`;
    }

    fetch(fetchURL)
        .then(function (response) {
            return response.json();
        })
        //Om error sker vid hämtning av json-data
        .catch(function error() {
            console.error(error);
            let errorTxt = document.createElement('h2');
            errorTxt.textContent = 'Reload the page or wait a few minutes.';
            container.appendChild(errorTxt);
        })
        .then(function (data) {
            //Tömmer sökresultat, gömmer laddnings-spinner och tömmer innehåll
            document.querySelector("#search").value = "";
            document.querySelector('#preloader').classList.add('d-none');
            document.querySelector('#content').innerHTML = null;
            document.querySelector('#frontpage-pic').classList.add('d-none');
            window.scrollTo(0,0);

            //Skapar och lägger till avbrytare
            let hr = document.createElement('hr');
            container.appendChild(hr);

            //Skapar och lägger in aktuell titel för filter
            let title = document.createElement('h5');
            title.classList.add('filter-title');
            title.textContent = 'Filtered by: ' + filter + ' - ' + type;
            container.appendChild(title);

            //loopar igenom och skiver ut cocktails inom filtret
            for (let cocktailData of data.drinks) {
                //skapar och lägger in ram till produktfakta
                let card = document.createElement('div');
                card.classList.add('card', 'card-search');
                container.appendChild(card);

                //Skapar och lägger in img-tagg med aktuell bild på cocktail
                let cardImage = document.createElement('img');
                cardImage.className = 'card-img-top';
                cardImage.src = cocktailData.strDrinkThumb;
                cardImage.alt = 'Image of cocktail ' + cocktailData.strDrink;
                card.appendChild(cardImage);

                //Skapar och lägger in p-tagg med aktuell titel på cocktail
                let cardTitle = document.createElement('h5');
                cardTitle.classList.add('search-title');
                cardTitle.textContent = cocktailData.strDrink;
                card.appendChild(cardTitle);

                //Lyssnare om man klickar på en cocktail så anropas funktion som visar info om just denna cocktail
                card.addEventListener('click', function () {
                    //Gör laddnings-spinner synlig
                    document.querySelector('#preloader').classList.remove('d-none');
                    //Anropa funktion för att visa detaljer om vald cocktail
                    cocktailById(cocktailData.idDrink, document.querySelector('#content'));
                });
            }
        });
}