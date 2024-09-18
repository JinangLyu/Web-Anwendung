// https://www.w3schools.com/howto/howto_js_autocomplete.asp
export function defaultFormatter(i, callbackData, query) {
    let text = "<strong>" + callbackData.slice(0, query.length) + "</strong>";
    text += callbackData.slice(query.length);
    // insert an input field that will hold the current array item's value:
    text += "<input type='hidden' value='" + callbackData + "'>";
    return text;
}

export function defaultIdGetter(element) {
    return element.getElementsByTagName("input")[0].value;
}




/**
 *
 * @param inp HTMLInputElement
 * @param callback (string) => string[]
 * E.g. (search) => ['a', 'b', 'c'].filter((item) => item.contains(search))
 */
export function autocomplete(inp, callback, formatter=defaultFormatter, idGetter=defaultIdGetter) {
    // the autocomplete function takes two arguments,
    // the text field element and an array of possible autocompleted values:
    let currentFocus;
    // execute a function when someone writes in the text field:
    inp.addEventListener("input", async function (e) {
        console.log('autocomplete.input', e);
        let a, b, i, val = this.value;
        // close any already open lists of autocompleted values
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        // create a DIV element that will contain the items (values):
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        // append the DIV element as a child of the autocomplete container:
        this.parentNode.appendChild(a);
        const array = await callback(val)
        console.log('autocomplete.input.array', {val, array});
        // for each item in the array...
        for (i = 0; i < array.length; i++) {
            // our callback already returns items matched by the text field value:
            // create a DIV element for each matching element:
            b = document.createElement("DIV");
            // noinspection ES6RedundantAwait
            b.innerHTML = await formatter(i, array[i], val)
            // make the matching letters bold:

            // execute a function when someone clicks on the item value (DIV element):
            b.addEventListener("click", async function (e) {
                // insert the value for the autocomplete text field:
                // noinspection ES6RedundantAwait
                inp.value = await idGetter(this);
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                // close the list of autocompleted values,
                // (or any other open lists of autocompleted values:
                closeAllLists();
            });
            a.appendChild(b);
        }
    });
    // execute a function presses a key on the keyboard:
    inp.addEventListener("keydown", function (e) {
        console.log('autocomplete.keydown', e);
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) {
            x = x.getElementsByTagName("div");
        }
        if (e.keyCode === 40) {  // down
            console.log('autocomplete.keydown.key: Down', x);
            // If the arrow DOWN key is pressed, increase the currentFocus variable:
            currentFocus++;
            // and make the current item more visible:
            addActive(x);
        } else if (e.keyCode === 38) {  // up
            console.log('autocomplete.keydown.key: Up', x);
            // If the arrow UP key is pressed, decrease the currentFocus variable:
            currentFocus--;
            // and make the current item more visible:
            addActive(x);
        } else if (e.keyCode === 13) {
            // If the ENTER key is pressed, prevent the form from being submitted,
            e.preventDefault();
            if (currentFocus > -1) {
                // and simulate a click on the "active" item:
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        console.log('autocomplete.active', currentFocus, x);
        // a function to classify an item as "active":
        if (!x) return false;
        // start by removing the "active" class on all items:
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        console.log('autocomplete.active.x[currentFocus]', currentFocus, x[currentFocus]);
        // add class "autocomplete-active":
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        // a function to remove the "active" class from all autocomplete items:
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        // close all autocomplete lists in the document,
        // except the one passed as an argument:
        const x = document.getElementsByClassName("autocomplete-items");
        let didRemove = false;
        for (let i = 0; i < x.length; i++) {
            if (elmnt !== x[i] && elmnt !== inp) {
                x[i].parentNode.removeChild(x[i]);
                didRemove = true;
            }
        }
        return didRemove;
    }

    // execute a function when someone clicks in the document:
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}