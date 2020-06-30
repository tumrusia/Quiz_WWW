function zaktualizujOdpowiedzi() {
    opcjeOdp.forEach( (item, index) => {
        const input = item.childNodes[1] as HTMLInputElement;
        if (input.checked) {
            odpowiedziGracza[aktualnePytanie] = index;
        }
    });
    console.log(odpowiedziGracza);
    wszystkieOdp = true;
    odpowiedziGracza.forEach( (item, index) => {
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
    console.log("czas dla pytania", aktualnePytanie+1, "to już", czasDlaPytania[aktualnePytanie][0], "m", czasDlaPytania[aktualnePytanie][1], "s");
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
    if (aktualnePytanie === ilePytan-1) {
        nastepne.style.pointerEvents = "none";
        nastepne.style.opacity = "0.5";
    }
    pytanie.textContent = daneQuizu.pytania[aktualnePytanie];
    odp1.textContent = daneQuizu.odp1[aktualnePytanie];
    odp2.textContent = daneQuizu.odp2[aktualnePytanie];
    odp3.textContent = daneQuizu.odp3[aktualnePytanie];
    licznikPytan.textContent = "Pytanie " + (aktualnePytanie+1).toString() + "/" + ilePytan.toString();

    opcjeOdp.forEach( (item, index) => {
        const input = item.childNodes[1] as HTMLInputElement;
        if (odpowiedziGracza[aktualnePytanie] === index) {
            input.checked = true;
        } else {
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
    licznikPytan.textContent = "Pytanie " + (aktualnePytanie+1).toString() + "/" + ilePytan.toString();

    opcjeOdp.forEach( (item, index) => {
        const input = item.childNodes[1] as HTMLInputElement;
        if (odpowiedziGracza[aktualnePytanie] === index) {
            input.checked = true;
        } else {
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
    document.body.style.backgroundImage = "url(\"/assets/background.jpg\")";
    wyniki.style.display = "flex";
    punktacja.style.display = "flex";
}

function sortujRanking(a: number[], b: number[]) {
    if (a[0] < b[0]) {
        return -1;
    } else if (a[0] > b[0]) {
        return 1;
    } else {
        return a[1] - b[1];
    }
}

function ifPoprawnaOdp(item, index, mmSumaCzasu, ssSumaCzasu) {
    item.textContent = "Pytanie " + (index+1).toString() + ":  DOBRZE, " + czasDlaPytania[index][0] + "m " + czasDlaPytania[index][1] + "s";
    ssSumaCzasu += czasDlaPytania[index][1];
    mmSumaCzasu += czasDlaPytania[index][0];
    if (ssSumaCzasu >= 60) {
        mmSumaCzasu += 1;
        ssSumaCzasu -= 60;
    }
    return [mmSumaCzasu, ssSumaCzasu];
}

function ifNiepoprawnaOdp(item, index, mmSumaCzasu, ssSumaCzasu) {
    item.textContent = "Pytanie " + (index+1).toString() + ":  ŹLE, " + czasDlaPytania[index][0] + "m " + czasDlaPytania[index][1] + "s + 30s kary";
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
    let mmSumaCzasu = 0;
    let ssSumaCzasu = 0;
    wynikiSingle.forEach( (item, index) => {
        let poprawna = daneQuizu.odpPoprawnaId[index].toString();
        let gracza = odpowiedziGracza[index].toString();
        console.log("id poprawnej odp i odp gracza", poprawna, gracza);
        if (poprawna === gracza) {
            const ans = ifPoprawnaOdp(item, index, mmSumaCzasu, ssSumaCzasu);
            mmSumaCzasu = ans[0];
            ssSumaCzasu = ans[1];
        } else {
            const ans = ifNiepoprawnaOdp(item, index, mmSumaCzasu, ssSumaCzasu);
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

function przeslijNaSerwer() {
    const czasy = document.querySelector("input[name=times]") as HTMLInputElement;
    const odpowiedzi = document.querySelector("input[name=answers]") as HTMLInputElement;
    czasy.value = JSON.stringify(czasDlaPytania);
    odpowiedzi.value = JSON.stringify(odpowiedziGracza);
}

function zakonczQuiz() {
    ustawWidokWyniku();
    zaktualizujCzasDlaPytania();

    const ans = zsumujCzasGry();
    const mmSumaCzasu = ans[0];
    const ssSumaCzasu = ans[1];

    rankingTabela.sort(sortujRanking);
    rankingPole.forEach( (item, index) => {
        item.textContent = (index+1).toString() + ". miejsce   " + rankingTabela[index][0] + "m " + rankingTabela[index][1] + "s";
    });
    console.log(rankingTabela);

    daneRanking.mm.push(mmSumaCzasu);
    daneRanking.ss.push(ssSumaCzasu);
    daneRanking.stat.push([[-1,-1], [-1,-1], [-1,-1], [-1,-1]]);
    zapiszDoLocalStorage();
}

function zapiszStatystyki() {
    for (let i = 0; i < ilePytan; i++) {
        daneRanking.stat[daneRanking.stat.length-1][i][0] = czasDlaPytania[i][0];
        daneRanking.stat[daneRanking.stat.length-1][i][1] = czasDlaPytania[i][1];
    }
    zapiszDoLocalStorage();
    przeslijNaSerwer();
}

const quizContentField = document.querySelector(".quiz-content") as HTMLInputElement;
let daneQuizuString = quizContentField.textContent;
let help = daneQuizuString;
while (daneQuizuString !== daneQuizuString.replace("''", "\"")) {
    daneQuizuString = daneQuizuString.replace("''", "\"");
}
let daneQuizu = JSON.parse(daneQuizuString);

let ilePytan = 4;
let aktualnePytanie = 0;
let odpowiedziGracza = [-1, -1, -1, -1];
let czasDlaPytania = [[0,0], [0,0], [0,0], [0,0]];
let wszystkieOdp = false;


let rankingTabela: number[][] = [];
let jsonRanking: string = `{
    "mm": [
        0,
        1,
        1
    ],
    "ss": [
        55,
        5,
        7
    ],
    "stat": [
        [[-1,-1], [-1,-1], [-1,-1], [-1,-1]],
        [[-1,-1], [-1,-1], [-1,-1], [-1,-1]],
        [[-1,-1], [-1,-1], [-1,-1], [-1,-1]]
    ]
}`; // dafault fake ranking
// stat -1 oznacza ze gracz nie chcial zapisac statystyk

// localStorage.setItem("jsonRanking", jsonRanking); //odkomentowanie tej linijki i zagranie w quiz spowoduje przywrócenie deafultowych wartości (plus nowy wynik)

if (localStorage.getItem("jsonRanking") === null) {
    console.log("nie bylo");
    localStorage.setItem("jsonRanking", jsonRanking);
} else {
    console.log("juz byl");
    jsonRanking = localStorage.getItem("jsonRanking");
}

console.log(jsonRanking);

let daneRanking = JSON.parse(jsonRanking);
for (let i = 0; i < daneRanking.mm.length; i++) {
    console.log(daneRanking.mm[i], daneRanking.ss[i]);
    rankingTabela.push([daneRanking.mm[i], daneRanking.ss[i]]);
}

console.log(rankingTabela);

const pytanie = document.querySelector(".question__label") as HTMLInputElement;
const odp1 = document.querySelector(".option--1") as HTMLInputElement;
const odp2 = document.querySelector(".option--2") as HTMLInputElement;
const odp3 = document.querySelector(".option--3") as HTMLInputElement;
const calyBoxPytania = document.querySelector(".question") as HTMLInputElement;
const przerwij = document.querySelector(".navigation__break") as HTMLInputElement;
const zakoncz = document.querySelector(".navigation__finish") as HTMLInputElement;
const poprzednie = document.querySelector(".navigation__prev") as HTMLInputElement;
const nastepne = document.querySelector(".navigation__next") as HTMLInputElement;
const opcjeOdp = document.querySelectorAll(".question__option");
const timer = document.querySelector(".timer") as HTMLInputElement;
const licznikPytan = document.querySelector(".header__subtitle") as HTMLInputElement;
const wyniki = document.querySelector(".wyniki") as HTMLInputElement;
const wynikiSingle = document.querySelectorAll(".wyniki__single");
const twojWynik = document.querySelector(".twoj_wynik") as HTMLInputElement;
const rankingPole = document.querySelectorAll(".ranking__pole");
const zapiszWynik = document.querySelector(".btn-zapisz-wynik") as HTMLInputElement;
const punktacja = document.querySelector(".points") as HTMLInputElement;

poprzednie.setAttribute("onclick", "poprzedniePytanie()");
nastepne.setAttribute("onclick", "nastepnePytanie()");
zakoncz.setAttribute("onclick", "zakonczQuiz()");
opcjeOdp.forEach( (item, index) => {
    item.setAttribute("onclick", "zaktualizujOdpowiedzi()");
});
zapiszWynik.setAttribute("onclick", "zapiszStatystyki()");

let ss = 0;
let mm = 0;
let ssPytanie = 0;
let mmPytanie = 0;

let x = setInterval( () => {
    ss++;
    if (ss >= 60) {
        ss = 0;
        mm++;
    }
    let seconds = ss.toString();
    if (seconds.length === 1) {
        seconds = '0' + seconds;
    }
    timer.innerHTML = mm + ":" + seconds;
}, 1000); // Aktualizuje się co sekundę
