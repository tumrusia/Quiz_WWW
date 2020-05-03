var jsonDaneQuizu = "{\n    \"pytania\": [\n        \"Ile to 2-3?\",\n        \"Ile to 1+1?\",\n        \"Ile to 5*0?\",\n        \"Ile to 36:9?\"\n    ],\n    \"odp1\": [\n        \"1\",\n        \"11\",\n        \"0\",\n        \"5\"\n    ],\n    \"odp2\": [\n        \"2\",\n        \"2\",\n        \"-5\",\n        \"4\"\n    ],\n    \"odp3\": [\n        \"-1\",\n        \"1\",\n        \"5\",\n        \"3\"\n    ],\n    \"odpPoprawnaId\": [\n        2,\n        1,\n        0,\n        1\n    ]\n}";
function zaktualizujOdpowiedzi() {
    opcjeOdp.forEach(function (item, index) {
        var input = item.childNodes[1];
        if (input.checked) {
            odpowiedziGracza[aktualnePytanie] = index;
        }
    });
    console.log(odpowiedziGracza);
    wszystkieOdp = true;
    odpowiedziGracza.forEach(function (item, index) {
        if (item === -1) {
            wszystkieOdp = false;
        }
    });
    console.log("czy wszystkie odpowiedzi już są: ", wszystkieOdp);
    if (wszystkieOdp) {
        zakoncz.style.pointerEvents = "auto";
        zakoncz.style.opacity = "1.0";
    }
}
function zaktualizujCzasDlaPytania() {
    czasDlaPytania[aktualnePytanie][0] += mm - mmPytanie;
    czasDlaPytania[aktualnePytanie][1] += ss - ssPytanie;
    console.log("czas dla pytania", aktualnePytanie + 1, "to już", czasDlaPytania[aktualnePytanie][0], "m", czasDlaPytania[aktualnePytanie][1], "s");
    if (ss < ssPytanie) {
        czasDlaPytania[aktualnePytanie][0] -= 1;
        czasDlaPytania[aktualnePytanie][1] += 60;
    }
    if (czasDlaPytania[aktualnePytanie][1] >= 60) {
        czasDlaPytania[aktualnePytanie][0] += 1;
        czasDlaPytania[aktualnePytanie][1] -= 60;
    }
    ssPytanie = ss;
    mmPytanie = mm;
}
function nastepnePytanie() {
    zaktualizujCzasDlaPytania();
    aktualnePytanie++;
    poprzednie.style.pointerEvents = "auto";
    poprzednie.style.opacity = "1.0";
    if (aktualnePytanie === ilePytan - 1) {
        nastepne.style.pointerEvents = "none";
        nastepne.style.opacity = "0.5";
    }
    pytanie.textContent = daneQuizu.pytania[aktualnePytanie];
    odp1.textContent = daneQuizu.odp1[aktualnePytanie];
    odp2.textContent = daneQuizu.odp2[aktualnePytanie];
    odp3.textContent = daneQuizu.odp3[aktualnePytanie];
    licznikPytan.textContent = "Pytanie " + (aktualnePytanie + 1).toString() + "/" + ilePytan.toString();
    opcjeOdp.forEach(function (item, index) {
        var input = item.childNodes[1];
        if (odpowiedziGracza[aktualnePytanie] === index) {
            input.checked = true;
        }
        else {
            input.checked = false;
        }
    });
}
function poprzedniePytanie() {
    zaktualizujCzasDlaPytania();
    aktualnePytanie--;
    nastepne.style.pointerEvents = "auto";
    nastepne.style.opacity = "1.0";
    if (aktualnePytanie === 0) {
        poprzednie.style.pointerEvents = "none";
        poprzednie.style.opacity = "0.5";
    }
    pytanie.textContent = daneQuizu.pytania[aktualnePytanie];
    odp1.textContent = daneQuizu.odp1[aktualnePytanie];
    odp2.textContent = daneQuizu.odp2[aktualnePytanie];
    odp3.textContent = daneQuizu.odp3[aktualnePytanie];
    licznikPytan.textContent = "Pytanie " + (aktualnePytanie + 1).toString() + "/" + ilePytan.toString();
    opcjeOdp.forEach(function (item, index) {
        var input = item.childNodes[1];
        if (odpowiedziGracza[aktualnePytanie] === index) {
            input.checked = true;
        }
        else {
            input.checked = false;
        }
    });
}
function ustawWidokWyniku() {
    przerwij.style.display = "none";
    zakoncz.style.display = "none";
    nastepne.style.display = "none";
    poprzednie.style.display = "none";
    licznikPytan.style.display = "none";
    timer.style.display = "none";
    calyBoxPytania.style.display = "none";
    document.body.style.backgroundImage = "url(\"background.jpg\")";
    wyniki.style.display = "flex";
    punktacja.style.display = "flex";
}
function sortujRanking(a, b) {
    if (a[0] < b[0]) {
        return -1;
    }
    else if (a[0] > b[0]) {
        return 1;
    }
    else {
        return a[1] - b[1];
    }
}
function ifPoprawnaOdp(item, index, mmSumaCzasu, ssSumaCzasu) {
    item.textContent = "Pytanie " + (index + 1).toString() + ":  DOBRZE, " + czasDlaPytania[index][0] + "m " + czasDlaPytania[index][1] + "s";
    ssSumaCzasu += czasDlaPytania[index][1];
    mmSumaCzasu += czasDlaPytania[index][0];
    if (ssSumaCzasu >= 60) {
        mmSumaCzasu += 1;
        ssSumaCzasu -= 60;
    }
    return [mmSumaCzasu, ssSumaCzasu];
}
function ifNiepoprawnaOdp(item, index, mmSumaCzasu, ssSumaCzasu) {
    item.textContent = "Pytanie " + (index + 1).toString() + ":  ŹLE, " + czasDlaPytania[index][0] + "m " + czasDlaPytania[index][1] + "s + 30s kary";
    czasDlaPytania[index][1] += 30;
    if (czasDlaPytania[index][1] >= 60) {
        czasDlaPytania[index][0] += 1;
        czasDlaPytania[index][1] -= 60;
    }
    ssSumaCzasu += czasDlaPytania[index][1];
    mmSumaCzasu += czasDlaPytania[index][0];
    if (ssSumaCzasu >= 60) {
        mmSumaCzasu += 1;
        ssSumaCzasu -= 60;
    }
    return [mmSumaCzasu, ssSumaCzasu];
}
function zsumujCzasGry() {
    var mmSumaCzasu = 0;
    var ssSumaCzasu = 0;
    wynikiSingle.forEach(function (item, index) {
        console.log("id poprawnej odp i odp gracza", daneQuizu.odpPoprawnaId[index], odpowiedziGracza[index]);
        if (daneQuizu.odpPoprawnaId[index] === odpowiedziGracza[index]) {
            var ans = ifPoprawnaOdp(item, index, mmSumaCzasu, ssSumaCzasu);
            mmSumaCzasu = ans[0];
            ssSumaCzasu = ans[1];
        }
        else {
            var ans = ifNiepoprawnaOdp(item, index, mmSumaCzasu, ssSumaCzasu);
            mmSumaCzasu = ans[0];
            ssSumaCzasu = ans[1];
        }
    });
    console.log("sumaryczny czas: ", mmSumaCzasu, "m ", ssSumaCzasu, "s");
    twojWynik.textContent = "Twój wynik: " + mmSumaCzasu + "m " + ssSumaCzasu + "s";
    return [mmSumaCzasu, ssSumaCzasu];
}
function zapiszDoLocalStorage() {
    jsonRanking = JSON.stringify(daneRanking);
    localStorage.setItem("jsonRanking", jsonRanking);
    console.log(daneRanking);
    console.log(jsonRanking);
}
function zakonczQuiz() {
    ustawWidokWyniku();
    zaktualizujCzasDlaPytania();
    var ans = zsumujCzasGry();
    var mmSumaCzasu = ans[0];
    var ssSumaCzasu = ans[1];
    rankingTabela.sort(sortujRanking);
    rankingPole.forEach(function (item, index) {
        item.textContent = (index + 1).toString() + ". miejsce   " + rankingTabela[index][0] + "m " + rankingTabela[index][1] + "s";
    });
    console.log(rankingTabela);
    daneRanking.mm.push(mmSumaCzasu);
    daneRanking.ss.push(ssSumaCzasu);
    daneRanking.stat.push([[-1, -1], [-1, -1], [-1, -1], [-1, -1]]);
    zapiszDoLocalStorage();
}
function zapiszStatystyki() {
    for (var i = 0; i < ilePytan; i++) {
        daneRanking.stat[daneRanking.stat.length - 1][i][0] = czasDlaPytania[i][0];
        daneRanking.stat[daneRanking.stat.length - 1][i][1] = czasDlaPytania[i][1];
    }
    zapiszDoLocalStorage();
}
var daneQuizu = JSON.parse(jsonDaneQuizu);
var ilePytan = 4;
var aktualnePytanie = 0;
var odpowiedziGracza = [-1, -1, -1, -1];
var czasDlaPytania = [[0, 0], [0, 0], [0, 0], [0, 0]];
var wszystkieOdp = false;
var rankingTabela = [];
var jsonRanking = "{\n    \"mm\": [\n        0,\n        1,\n        1\n    ],\n    \"ss\": [\n        55,\n        5,\n        7\n    ],\n    \"stat\": [\n        [[-1,-1], [-1,-1], [-1,-1], [-1,-1]],\n        [[-1,-1], [-1,-1], [-1,-1], [-1,-1]],\n        [[-1,-1], [-1,-1], [-1,-1], [-1,-1]]\n    ]\n}"; // dafault fake ranking
// stat -1 oznacza ze gracz nie chcial zapisac statystyk
// localStorage.setItem("jsonRanking", jsonRanking); //odkomentowanie tej linijki i zagranie w quiz spowoduje przywrócenie deafultowych wartości (plus nowy wynik)
if (localStorage.getItem("jsonRanking") === null) {
    console.log("nie bylo");
    localStorage.setItem("jsonRanking", jsonRanking);
}
else {
    console.log("juz byl");
    jsonRanking = localStorage.getItem("jsonRanking");
}
console.log(jsonRanking);
var daneRanking = JSON.parse(jsonRanking);
for (var i = 0; i < daneRanking.mm.length; i++) {
    console.log(daneRanking.mm[i], daneRanking.ss[i]);
    rankingTabela.push([daneRanking.mm[i], daneRanking.ss[i]]);
}
console.log(rankingTabela);
var pytanie = document.querySelector(".question__label");
var odp1 = document.querySelector(".option--1");
var odp2 = document.querySelector(".option--2");
var odp3 = document.querySelector(".option--3");
var calyBoxPytania = document.querySelector(".question");
var przerwij = document.querySelector(".navigation__break");
var zakoncz = document.querySelector(".navigation__finish");
var poprzednie = document.querySelector(".navigation__prev");
var nastepne = document.querySelector(".navigation__next");
var opcjeOdp = document.querySelectorAll(".question__option");
var timer = document.querySelector(".timer");
var licznikPytan = document.querySelector(".header__subtitle");
var wyniki = document.querySelector(".wyniki");
var wynikiSingle = document.querySelectorAll(".wyniki__single");
var twojWynik = document.querySelector(".twoj_wynik");
var rankingPole = document.querySelectorAll(".ranking__pole");
var zapiszWynikStat = document.querySelector(".btn-zapisz-stat");
var punktacja = document.querySelector(".points");
poprzednie.setAttribute("onclick", "poprzedniePytanie()");
nastepne.setAttribute("onclick", "nastepnePytanie()");
zakoncz.setAttribute("onclick", "zakonczQuiz()");
opcjeOdp.forEach(function (item, index) {
    item.setAttribute("onclick", "zaktualizujOdpowiedzi()");
});
zapiszWynikStat.setAttribute("onclick", "zapiszStatystyki()");
var ss = 0;
var mm = 0;
var ssPytanie = 0;
var mmPytanie = 0;
var x = setInterval(function () {
    ss++;
    if (ss >= 60) {
        ss = 0;
        mm++;
    }
    var seconds = ss.toString();
    if (seconds.length === 1) {
        seconds = '0' + seconds;
    }
    timer.innerHTML = mm + ":" + seconds;
}, 1000); // Aktualizuje się co sekundę
