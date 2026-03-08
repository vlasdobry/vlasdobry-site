(function() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var dow = d.getDay();
    var startOfYear = new Date(d.getFullYear(), 0, 0);
    var dayOfYear = Math.floor((d - startOfYear) / 86400000);
    var theme = 'default';
    var label = 'Page not found';
    var desc = 'Страница не найдена. Возможно, она была перемещена или удалена.';

    // Check URL param for testing: ?theme=halloween
    var params = new URLSearchParams(window.location.search);
    var forced = params.get('theme');

    if (forced) {
        theme = forced;
    } else if (month === 11 && (day === 1 || day === 2)) {
        theme = 'muertos';
    } else if (month === 10 && day >= 25 && day <= 31) {
        theme = 'halloween';
    } else if ((month === 12 && day >= 25) || (month === 1 && day <= 7)) {
        theme = 'newyear';
    } else if (month === 2 && day === 14) {
        theme = 'valentine';
    } else if (month === 4 && day === 1) {
        theme = 'aprilfools';
    } else if (dow === 5 && day === 13) {
        theme = 'friday13';
    } else if (month === 3 && day === 8) {
        theme = 'march8';
    } else if (month === 2 && day === 23) {
        theme = 'feb23';
    } else if (month === 3 && day === 14) {
        theme = 'piday';
    } else if (month === 4 && day === 12) {
        theme = 'cosmo';
    } else if (month === 5 && day === 4) {
        theme = 'starwars';
    } else if (month === 6 && day === 12) {
        theme = 'russia';
    } else if (month === 6 && day === 21) {
        theme = 'solstice';
    } else if (dayOfYear === 256) {
        theme = 'programmer';
    }

    // Theme-specific text
    switch (theme) {
        case 'halloween':
            label = 'Boo!';
            desc = 'Даже призраки не нашли эту страницу.';
            break;
        case 'newyear':
            label = 'Happy 404!';
            desc = 'Эта страница ушла праздновать. Вернётся... может быть.';
            break;
        case 'valentine':
            label = 'Heartbroken';
            desc = 'Эта страница ушла к другому сайту.';
            break;
        case 'aprilfools':
            label = 'Almost...';
            desc = 'Почти получилось. Но нет.';
            break;
        case 'friday13':
            label = 'Friday the 13th';
            desc = 'Мы предупреждали.';
            break;
        case 'march8':
            label = 'Day off';
            desc = 'Эта страница взяла выходной. Имеет право.';
            break;
        case 'muertos':
            label = 'D\u00eda de los Muertos';
            desc = 'Эта страница на том свете. Но мы её помним.';
            break;
        case 'feb23':
            label = 'Равняйсь!';
            desc = 'Страница несёт службу. Вольно!';
            break;
        case 'piday':
            label = '3.14159...';
            desc = 'Страница не найдена. Как и конец числа \u03C0.';
            break;
        case 'programmer':
            label = '110010100';
            desc = '404 в десятичной. 110010100 в двоичной. Не найдено ни в одной.';
            break;
        case 'starwars':
            label = 'May the 4th';
            desc = 'Эта страница в далёкой-далёкой галактике.';
            break;
        case 'cosmo':
            label = 'Поехали!';
            desc = 'Страница вышла на орбиту. Ожидайте приземления.';
            break;
        case 'solstice':
            label = 'Solstice';
            desc = 'Самый длинный день года. И всё равно не хватило.';
            break;
        case 'russia':
            label = 'С Днём России';
            desc = 'Страница на выходном. Празднует!';
            break;
    }

    // Fallback: unknown theme → default
    var validThemes = ['default','halloween','newyear','valentine','aprilfools','friday13','march8','muertos','feb23','piday','programmer','starwars','cosmo','solstice','russia'];
    if (validThemes.indexOf(theme) === -1) theme = 'default';

    document.body.classList.add(theme);
    document.getElementById('label').textContent = label;
    document.getElementById('desc').textContent = desc;

    // Friday 13th: red flash + eyes
    if (theme === 'friday13') {
        var flash = document.getElementById('redFlash');
        var eyes = document.getElementById('eyes');

        // Random red flash every 5-12 seconds
        function redFlash() {
            flash.classList.add('active');
            setTimeout(function() { flash.classList.remove('active'); }, 150);
            setTimeout(redFlash, 5000 + Math.random() * 7000);
        }
        setTimeout(redFlash, 3000 + Math.random() * 4000);

        // Eyes appear at random position, blink, disappear
        function spawnEyes() {
            var x = 15 + Math.random() * 70;
            var y = 10 + Math.random() * 60;
            eyes.style.left = x + '%';
            eyes.style.top = y + '%';
            eyes.classList.remove('blink');
            eyes.classList.add('visible');

            // Blink after 1.5-3s
            var blinkDelay = 1500 + Math.random() * 1500;
            setTimeout(function() {
                eyes.classList.add('blink');
                setTimeout(function() {
                    eyes.classList.remove('blink');
                    // Second blink
                    setTimeout(function() {
                        eyes.classList.add('blink');
                        setTimeout(function() {
                            eyes.classList.remove('blink');
                            // Fade out
                            setTimeout(function() {
                                eyes.classList.remove('visible');
                            }, 800);
                        }, 150);
                    }, 400);
                }, 150);
            }, blinkDelay);

            // Next eyes in 8-18 seconds
            setTimeout(spawnEyes, 8000 + Math.random() * 10000);
        }
        setTimeout(spawnEyes, 5000 + Math.random() * 3000);
    }

    // Pi Day: floating pi digits
    if (theme === 'piday') {
        var pi = '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
        var piC = document.getElementById('piContainer');
        for (var j = 0; j < 30; j++) {
            var el = document.createElement('div');
            el.className = 'pi-digit';
            el.textContent = pi[j % pi.length];
            el.style.left = (Math.random() * 95) + '%';
            el.style.animationDuration = (8 + Math.random() * 8) + 's';
            el.style.animationDelay = (Math.random() * 10) + 's';
            piC.appendChild(el);
        }
    }

    // Programmer's Day: binary rain
    if (theme === 'programmer') {
        var progC = document.getElementById('progContainer');
        for (var j = 0; j < 12; j++) {
            var col = document.createElement('div');
            col.className = 'binary-col';
            col.style.left = (j * 8 + Math.random() * 4) + '%';
            col.style.animationDuration = (6 + Math.random() * 8) + 's';
            col.style.animationDelay = (Math.random() * 5) + 's';
            var txt = '';
            for (var k = 0; k < 50; k++) txt += Math.round(Math.random()) + '\n';
            col.textContent = txt;
            progC.appendChild(col);
        }
    }

    // Star Wars: hyperspace starfield (max 60 stars to prevent DOM bloat)
    if (theme === 'starwars') {
        var swC = document.getElementById('swContainer');
        var starCount = 0;
        function createStar() {
            if (starCount >= 60) return;
            starCount++;
            var s = document.createElement('div');
            s.className = 'sw-star';
            var angle = Math.random() * 360;
            var dur = 1 + Math.random() * 1.5;
            s.style.setProperty('--a', angle + 'deg');
            s.style.setProperty('--dur', dur + 's');
            swC.appendChild(s);
            setTimeout(function() { s.remove(); starCount--; }, dur * 1000 + 100);
        }
        setInterval(createStar, 80);
        for (var j = 0; j < 20; j++) setTimeout(createStar, j * 40);
    }

    // Cosmonautics Day: twinkling starfield
    if (theme === 'cosmo') {
        var cosmoC = document.getElementById('cosmoContainer');
        for (var j = 0; j < 40; j++) {
            var star = document.createElement('div');
            star.className = 'twinkle-star';
            star.style.left = (Math.random() * 100) + '%';
            star.style.top = (Math.random() * 100) + '%';
            star.style.animationDuration = (2 + Math.random() * 3) + 's';
            star.style.animationDelay = (Math.random() * 3) + 's';
            cosmoC.appendChild(star);
        }
    }

    // April Fools: fake loading
    if (theme === 'aprilfools') {
        var fill = document.getElementById('loaderFill');
        var pct = document.getElementById('loaderPercent');
        var progress = 0;
        var steps = [
            [30, 800], [55, 600], [72, 900],
            [88, 500], [94, 700], [97, 1000],
            [98, 800], [99, 1200]
        ];
        var i = 0;
        function step() {
            if (i < steps.length) {
                progress = steps[i][0];
                fill.style.width = progress + '%';
                pct.textContent = progress + '%';
                setTimeout(step, steps[i][1]);
                i++;
            } else {
                // "Fail" at 99%
                setTimeout(function() {
                    document.body.classList.add('revealed');
                }, 600);
            }
        }
        step();
    }
})();
