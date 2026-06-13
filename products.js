const PRODUCTS = [
    {
        "sku": "HDD-SK-350",
        "name": "Rozwieracz Skrzydłowy HDD Standard 350mm",
        "price": 6150.0,
        "image": "images/rozwieracz_skrzydlowy.png",
        "categories": [
            "rozwiertaki"
        ],
        "thread": "2 7/8\" IF",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Rozwieracz Skrzydłowy HDD Standard o średnicy 350mm to solidne narzędzie wiertnicze zaprojektowane dla wiertnic kierunkowych, idealne do poszerzania otworów w gruntach piaszczystych i gliniastych.",
        "specs": {
            "Średnica zewnętrzna": "350 mm",
            "Typ gwintu": "2 7/8\" IF",
            "Zbrojenie": "Węglik spiekany",
            "Waga": "55 kg"
        }
    },
    {
        "sku": "HDD-CH_32",
        "name": "Chwytak do rur DN32 (krótki kołnierz)",
        "price": 183.27,
        "image": "images/hdd-ch_32.jpg",
        "categories": [
            "chwytaki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy chwytak do rur dn32 (krótki kołnierz) przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "0,2 kg"
        }
    },
    {
        "sku": "HDD-CH_63",
        "name": "Chwytak do rur DN63 (długi kołnierz)",
        "price": 331.49,
        "image": "images/hdd-ch_63.jpg",
        "categories": [
            "chwytaki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy chwytak do rur dn63 (długi kołnierz) przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "1,7 kg"
        }
    },
    {
        "sku": "HDD-CH_110",
        "name": "Chwytak do rur DN110 (długi kołnierz)",
        "price": 783.39,
        "image": "images/hdd-ch_110.jpg",
        "categories": [
            "chwytaki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy chwytak do rur dn110 (długi kołnierz) przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "7,5 kg"
        }
    },
    {
        "sku": "HDD-GL_4",
        "name": "Obudowa sondy TRIHAWK 4 1/2 IF box (od 165 mm) DCI",
        "price": 20000.0,
        "image": "images/hdd-gl_4.png",
        "categories": [
            "glowice-obudowy"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy obudowa sondy trihawk 4 1/2 if box (od 165 mm) dci przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "52 kg"
        }
    },
    {
        "sku": "HDD-GL_3",
        "name": "Ząb zapasowy do głowicy TRIHAWK 3 1/2R",
        "price": 127.07,
        "image": "images/hdd-gl_3.png",
        "categories": [
            "glowice-obudowy"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy ząb zapasowy do głowicy trihawk 3 1/2r przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "0,2 kg"
        }
    },
    {
        "sku": "HDD-GL_6",
        "name": "Głowica TRIHAWK HEAD II na płytki VERMEER (6 śrub) – 2 7/8R",
        "price": 1812.48,
        "image": "images/hdd-gl_6.png",
        "categories": [
            "glowice-obudowy"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy głowica trihawk head ii na płytki vermeer (6 śrub) – 2 7/8r przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "23 kg"
        }
    },
    {
        "sku": "HDD-GL_2",
        "name": "Obudowa sondy 2 3/8 box (od 80 mm) D20 DCI",
        "price": 5403.34,
        "image": "images/hdd-gl_2.png",
        "categories": [
            "glowice-obudowy"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy obudowa sondy 2 3/8 box (od 80 mm) d20 dci przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "25 kg"
        }
    },
    {
        "sku": "HDD-KR_5",
        "name": "Krętlik 5T / DN47 (wersja MINI)",
        "price": 1739.0,
        "image": "images/hdd-kr_5.jpg",
        "categories": [
            "kretliki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy krętlik 5t / dn47 (wersja mini) przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "5 kg"
        }
    },
    {
        "sku": "HDD-KR_12",
        "name": "Zestaw naprawczy do krętlika HDD 12T",
        "price": 1920.72,
        "image": "images/hdd-kr_12.jpg",
        "categories": [
            "kretliki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy zestaw naprawczy do krętlika hdd 12t przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "8,1 kg"
        }
    },
    {
        "sku": "HDD-KR_10",
        "name": "Krętlik HDD 10T/CH",
        "price": 1722.0,
        "image": "images/hdd-kr_10.png",
        "categories": [
            "kretliki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy krętlik hdd 10t/ch przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "9,5 kg"
        }
    },
    {
        "sku": "HDD-PL_20",
        "name": "Płytka wiertnicza DITCH WITCH STP-JT20-CUT-100",
        "price": 528.9,
        "image": "images/hdd-pl_20.png",
        "categories": [
            "plyty-pletwy"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy płytka wiertnicza ditch witch stp-jt20-cut-100 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "3,2 kg"
        }
    },
    {
        "sku": "HDD-PL_5",
        "name": "Płytka wiertnicza DITCH WITCH STP-JT5-CRB-75",
        "price": 522.29,
        "image": "images/hdd-pl_5.png",
        "categories": [
            "plyty-pletwy"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy płytka wiertnicza ditch witch stp-jt5-crb-75 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "2,7 kg"
        }
    },
    {
        "sku": "HDD-PL_50",
        "name": "Płytka wiertnicza VERMEER STP-D50-CUT-150",
        "price": 1071.02,
        "image": "images/hdd-pl_50.png",
        "categories": [
            "plyty-pletwy"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy płytka wiertnicza vermeer stp-d50-cut-150 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "6 kg"
        }
    },
    {
        "sku": "HDD-RL_400",
        "name": "Rolka do rur do zgrzewarki 400 mm",
        "price": 499.0,
        "image": "images/hdd-rl_400.jpg",
        "categories": [
            "rolki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rolka do rur do zgrzewarki 400 mm przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "10 kg"
        }
    },
    {
        "sku": "HDD-RL_32",
        "name": "ROLKA DO RUR DN 32-600 mm typu “V”",
        "price": 499.0,
        "image": "images/hdd-rl_32.jpg",
        "categories": [
            "rolki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rolka do rur dn 32-600 mm typu “v” przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "20 kg"
        }
    },
    {
        "sku": "HDD-RL_160",
        "name": "Rolka do przeciągania rur 160-1200 mm",
        "price": 1845.0,
        "image": "images/hdd-rl_160.png",
        "categories": [
            "rolki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rolka do przeciągania rur 160-1200 mm przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "20 kg"
        }
    },
    {
        "sku": "HDD-RL_RD",
        "name": "Rolka do rur do zgrzewarki",
        "price": 499.0,
        "image": "images/hdd-rl_rd.jpg",
        "categories": [
            "rolki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rolka do rur do zgrzewarki przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "10 kg"
        }
    },
    {
        "sku": "HDD-RL_315",
        "name": "Rolka do rur FI315",
        "price": 199.0,
        "image": "images/hdd-rl_315.jpg",
        "categories": [
            "rolki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rolka do rur fi315 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "8 kg"
        }
    },
    {
        "sku": "HDD-RE_450",
        "name": "Rozwiertak baryłkowy KODIAK REAMER 450mm / 18T / 2 7/8R",
        "price": 16460.43,
        "image": "images/hdd-re_450.jpg",
        "categories": [
            "rozwiertaki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rozwiertak baryłkowy kodiak reamer 450mm / 18t / 2 7/8r przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "135 kg"
        }
    },
    {
        "sku": "HDD-RE_350",
        "name": "Rozwiertak baryłkowy KODIAK REAMER 350mm / 12T / 2 7/8R",
        "price": 12960.69,
        "image": "images/hdd-re_350.jpg",
        "categories": [
            "rozwiertaki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rozwiertak baryłkowy kodiak reamer 350mm / 12t / 2 7/8r przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "80 kg"
        }
    },
    {
        "sku": "HDD-RE_250",
        "name": "Rozwiertak baryłkowy HDD FLUTED 250 mm / 10T / 2 3/8R",
        "price": 5890.0,
        "image": "images/hdd-re_250.jpg",
        "categories": [
            "rozwiertaki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rozwiertak baryłkowy hdd fluted 250 mm / 10t / 2 3/8r przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "50 kg"
        }
    },
    {
        "sku": "HDD-RE_400",
        "name": "Rozwiertak baryłkowy KODIAK REAMER 400mm / 24T / 2 7/8R",
        "price": 16426.05,
        "image": "images/hdd-re_400.jpg",
        "categories": [
            "rozwiertaki"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy rozwiertak baryłkowy kodiak reamer 400mm / 24t / 2 7/8r przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "110 kg"
        }
    },
    {
        "sku": "HDD-SN_7",
        "name": "Nawigacja – systemy radiolokalizacji i nawigacji HDD SENSE SNS-7T",
        "price": 68000.0,
        "image": "images/hdd-sn_7.jpg",
        "categories": [
            "sondy-lokalizacja"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy nawigacja – systemy radiolokalizacji i nawigacji hdd sense sns-7t przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "30 kg"
        }
    },
    {
        "sku": "HDD-SN_17",
        "name": "Sonda lokalizacyjna SubSite 17T2G",
        "price": 15375.0,
        "image": "images/hdd-sn_17.jpg",
        "categories": [
            "sondy-lokalizacja"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy sonda lokalizacyjna subsite 17t2g przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "1 kg"
        }
    },
    {
        "sku": "HDD-SN_BD",
        "name": "Bateria do sondy wiertniczej",
        "price": 219.0,
        "image": "images/hdd-sn_bd.jpg",
        "categories": [
            "sondy-lokalizacja"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy bateria do sondy wiertniczej przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "0,1 kg"
        }
    },
    {
        "sku": "HDD-SN_GI",
        "name": "Gumki izolujące ustalające położenie sondy do obudowy",
        "price": 259.0,
        "image": "images/hdd-sn_gi.jpg",
        "categories": [
            "sondy-lokalizacja"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy gumki izolujące ustalające położenie sondy do obudowy przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "0,2 kg"
        }
    },
    {
        "sku": "HDD-SN_AZ",
        "name": "Ładowarka z baterią do DigiTrak F Series",
        "price": 4200.0,
        "image": "images/hdd-sn_az.png",
        "categories": [
            "sondy-lokalizacja"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy ładowarka z baterią do digitrak f series przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "3 kg"
        }
    },
    {
        "sku": "HDD-ZE_24",
        "name": "Żerdzie wiertnicze do wiertnicy HDD DITCH WITCH JT24 – gwint 1.76",
        "price": 1291.5,
        "image": "images/hdd-ze_24.jpg",
        "categories": [
            "zerdzie"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy żerdzie wiertnicze do wiertnicy hdd ditch witch jt24 – gwint 1.76 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "30 kg"
        }
    },
    {
        "sku": "HDD-ZE_520",
        "name": "Żerdzie wiertnicze do wiertnicy HDD DITCH WITCH JT520 – gwint 1.21",
        "price": 739.0,
        "image": "images/hdd-ze_520.jpg",
        "categories": [
            "zerdzie"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy żerdzie wiertnicze do wiertnicy hdd ditch witch jt520 – gwint 1.21 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "15 kg"
        }
    },
    {
        "sku": "HDD-ZE_33",
        "name": "Żerdzie wiertnicze do wiertnicy HDD VERMEER D33x44 / D36x50 / D40x50 – gwint #650",
        "price": 1250.0,
        "image": "images/hdd-ze_33.jpg",
        "categories": [
            "zerdzie"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy żerdzie wiertnicze do wiertnicy hdd vermeer d33x44 / d36x50 / d40x50 – gwint #650 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "30 kg"
        }
    },
    {
        "sku": "HDD-ZE_20",
        "name": "Żerdzie wiertnicze do wiertnicy HDD DITCH WITCH JT20 / JT2020 – gwint 1.94",
        "price": 1250.0,
        "image": "images/hdd-ze_20.jpg",
        "categories": [
            "zerdzie"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy żerdzie wiertnicze do wiertnicy hdd ditch witch jt20 / jt2020 – gwint 1.94 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "30 kg"
        }
    },
    {
        "sku": "HDD-ZE_2",
        "name": "Zworniki do żerdzi rur wiertniczych API 2 (komplet)",
        "price": 369.0,
        "image": "images/hdd-ze_2.jpg",
        "categories": [
            "zerdzie"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy zworniki do żerdzi rur wiertniczych api 2 (komplet) przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "5 kg"
        }
    },
    {
        "sku": "HDD-ZB_2",
        "name": "Ząb wiertniczy BR2 – 25 mm",
        "price": 55.35,
        "image": "images/hdd-zb_2.jpg",
        "categories": [
            "zeby"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy ząb wiertniczy br2 – 25 mm przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "0,1 kg"
        }
    },
    {
        "sku": "HDD-ZB_767",
        "name": "Półokrągła listwa z zębami wiertniczymi BD767",
        "price": 264.45,
        "image": "images/rozwieracz_skrzydlowy.png",
        "categories": [
            "zeby"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy półokrągła listwa z zębami wiertniczymi bd767 przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "0,2 kg"
        }
    },
    {
        "sku": "HDD-ZB_105",
        "name": "Listwa z zębami wiertniczymi – 105 mm",
        "price": 289.0,
        "image": "images/hdd-zb_105.jpg",
        "categories": [
            "zeby"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy listwa z zębami wiertniczymi – 105 mm przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "0,2 kg"
        }
    },
    {
        "sku": "HDD-ZB_100",
        "name": "Listwa z zębami do rozwiertaków 100 cm",
        "price": 1845.0,
        "image": "images/hdd-zb_100.jpg",
        "categories": [
            "zeby"
        ],
        "thread": "",
        "stock": "W magazynie",
        "badge": "W magazynie",
        "badgeClass": "badge-success",
        "description": "Wysokiej klasy listwa z zębami do rozwiertaków 100 cm przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych.",
        "specs": {
            "Waga": "1 kg"
        }
    }
];
