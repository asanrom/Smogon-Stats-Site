/**
 * GUI functionality for formats lists.
 */

window.formatsCards = [];

$(document).ready(function () {
    window.formatCardsOptions = {
        sortedAlphabetically: !$("#option-sort-total").prop("checked"),
        sortedByTotal: !!$("#option-sort-total").prop("checked"),
        showOnlyTopBaselines: !!$("#check-only-top").prop("checked"),
        filter: "",
    };

    $("#input-text-search").on("change", function (event) {
        formatCardsOptions.filter = $("#input-text-search").prop("value");
        searchInFormats();
        updateFormatsCards();
    });

    $("#check-only-top").on("change", function (event) {
        formatCardsOptions.showOnlyTopBaselines = !!$("#check-only-top").prop("checked");
        if (formatCardsOptions.showOnlyTopBaselines) {
            document.cookie = "onlytop=yes; path=/;";
        } else {
            document.cookie = "onlytop=no; path=/;";
        }
        updateFormatsCards();
    });

    $("#option-sort-total").on("change", function (event) {
        formatCardsOptions.sortedAlphabetically = !$("#option-sort-total").prop("checked");
        formatCardsOptions.sortedByTotal = !formatCardsOptions.sortedAlphabetically;
        if (formatCardsOptions.sortedAlphabetically) {
            document.cookie = "sorted=abc; path=/;";
        } else {
            document.cookie = "sorted=total; path=/;";
        }
        if (formatCardsOptions.filter) {
            searchInFormats();
        } else {
            sortFormats();
        }
        updateFormatsCards();
    });

    $("#option-sort-abc").on("change", function (event) {
        formatCardsOptions.sortedAlphabetically = !!$("#option-sort-abc").prop("checked");
        formatCardsOptions.sortedByTotal = !formatCardsOptions.sortedAlphabetically;
        if (formatCardsOptions.sortedAlphabetically) {
            document.cookie = "sorted=abc; path=/;";
        } else {
            document.cookie = "sorted=total; path=/;";
        }
        if (formatCardsOptions.filter) {
            searchInFormats();
        } else {
            sortFormats();
        }
        updateFormatsCards();
    });

    loadFormatsCards();
    sortFormats();
    updateFormatsCards();
});

function loadFormatsCards() {
    window.formatsCards = [];
    var elements = $(".format-card");
    for (var i = 0; i < elements.length; i++) {
        var elem = elements[i];
        var nameProp = (elem.id + "").split("-");
        var format = nameProp[0] + "";
        var baseline = parseInt(nameProp[1]);
        var total = parseInt(nameProp[2]);
        var title = $("#" + elements[i].id).children(".mdl-card__title").first()
            .children(".format-card-title").first().html();
        formatsCards.push({
            el: $("#" + elements[i].id),
            format: format,
            baseline: baseline,
            total: total,
            found: -1,
            title: title,
        });
    }
}

function sortFormats() {
    if (formatCardsOptions.sortedAlphabetically) {
        window.formatsCards = formatsCards.sort(function (a, b) {
            return (a.format.localeCompare(b.format) ||
                (a.baseline > b.baseline ? -1 : 1));
        });
    } else {
        window.formatsCards = formatsCards.sort(function (a, b) {
            if (a.total > b.total) {
                return -1;
            } else if (a.total < b.total) {
                return 1;
            } else {
                return (a.format.localeCompare(b.format) ||
                    (a.baseline > b.baseline ? -1 : 1));
            }
        });
    }
}

function searchInFormats() {
    var filter = (formatCardsOptions.filter + "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!filter) {
        for (var i = 0; i < formatsCards.length; i++) {
            formatsCards[i].el.children(".mdl-card__title").first()
                .children(".format-card-title").first().html(formatsCards[i].title);
        }
        sortFormats();
        return;
    }
    for (var i = 0; i < formatsCards.length; i++) {
        formatsCards[i].found = formatsCards[i].format.indexOf(filter);
        var newTitle = "";
        var found = findText(formatsCards[i].title, filter);
        if (found) {
            newTitle = formatsCards[i].title.substr(0, found.pos)
                + "<span class=\"filter-match\">" + formatsCards[i].title.substr(found.pos, found.length) + "</span>"
                + formatsCards[i].title.substr(found.pos + found.length);
        } else {
            newTitle = formatsCards[i].title;
        }
        formatsCards[i].el.children(".mdl-card__title").first()
            .children(".format-card-title").first().html(newTitle);
    }
    if (formatCardsOptions.sortedAlphabetically) {
        window.formatsCards = formatsCards.sort(function (a, b) {
            if (a.found < b.found) {
                return -1;
            } else if (a.found > b.found) {
                return 1;
            } else {
                return (a.format.localeCompare(b.format) ||
                    (a.baseline > b.baseline ? -1 : 1));
            }
        });
    } else {
        window.formatsCards = formatsCards.sort(function (a, b) {
            if (a.found < b.found) {
                return -1;
            } else if (a.found > b.found) {
                return 1;
            } else {
                if (a.total > b.total) {
                    return -1;
                } else if (a.total < b.total) {
                    return 1;
                } else {
                    return (a.format.localeCompare(b.format) ||
                        (a.baseline > b.baseline ? -1 : 1));
                }
            }

        });
    }
}

function updateFormatsCards() {
    if (formatCardsOptions.filter) {
        for (var i = 0; i < formatsCards.length; i++) {
            if (formatCardsOptions.showOnlyTopBaselines) {
                if (formatsCards[i].baseline <= 1500) {
                    formatsCards[i].el.detach();
                    continue;
                }
            }
            if (formatsCards[i].found < 0) {
                formatsCards[i].el.detach();
                continue;
            }
            formatsCards[i].el.detach().appendTo('#format-cards-container');
        }
    } else {
        for (var i = 0; i < formatsCards.length; i++) {
            if (formatCardsOptions.showOnlyTopBaselines) {
                if (formatsCards[i].baseline <= 1500) {
                    formatsCards[i].el.detach();
                    continue;
                }
            }
            formatsCards[i].el.detach().appendTo('#format-cards-container');
        }
    }
}

function findText(text, filter) {
    var l = filter.length;
    while (l <= text.length) {
        for (var i = 0; i <= (text.length - l); i++) {
            var part = text.substr(i, l).toLowerCase().replace(/[^a-z0-9]+/g, "");
            if (part === filter) {
                return { pos: i, length: l };
            }
        }
        l++;
    }
    return null;
}
