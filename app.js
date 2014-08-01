////////////////////////////////////////////
/// Игра "Пятнашки"
////////////////////////////////////////////

var game = {
    n: [[1, 2, 3, 4],[5, 6, 7, 8],[9, 10, 11, 12],[13, 14, 15, null]],  // масив цифр
    sh: [[1, 2, 3, 4],[5, 6, 7, 8],[9, 10, 11, 12],[13, 14, 15, null]], // масив для перешивания
    msg: 'Вы победили! Время',// сообщение о победе
    colls: 4,           // поличество колонок
    rows: 4,            // колсичество строк
    count: 0,           // количество перемещений
    first_move: false,  // для запуска таймера
    timer_params: {     // тайтер
        minute: 0,      // минуты
        second: 0,      // секунды
        hour: 0,        // чесы
        intervalID: 0,  // ID таймера
        hold: false     // таймер. пауза
    },
    shuffle: function () { // ф-ция для перемешивания
        var rand, x;
        for (var i = 0; i < this.rows; i++) {
            rand = Math.floor(Math.random() * i+1); x = this.sh[i]; this.sh[i] = this.sh[rand]; this.sh[rand] = x;
            for (var jj = 0; jj < this.colls; jj++) {
                rand = Math.floor(Math.random() * jj+1); x = this.sh[i][jj]; this.sh[i][jj] = this.sh[i][rand]; this.sh[i][rand] = x;
            }
        }
    },
    compare: function (a,b) { // ф-ция сравнения
        for (var i=0;i<=a.length-1;i++) {
            if (a[i].toString() != b[i].toString()) {
                return false;
            }
        }
        return true;
    },
    keyboardHandler: function (e) { //ф-ция обработки нажатия на кнопки клавиатуры
        var obj = {};
        for (var i=0;i<game.rows;i++) {
            for (var j=0;j<game.colls;j++) {
                if (null == game.sh[i][j]) {
                    obj.col = j;
                    obj.row = i;
                    break;
                }
            }
        }
        switch (e.keyCode) {
            case 37: // left
                obj.col = obj.col+1;
                break;
            case 39: // right
                obj.col = obj.col-1;
                break;
            case 38: // up
                obj.row = obj.row+1;
                break;
            case 40: // down
                obj.row = obj.row-1;
                break;
        }
        game.keyboard(obj);
    },
    keyboard: function (obj) {  // вызов ф-ции перемещения блока
        this.move(obj.col,obj.row);
    },
    move: function (col,row) { // перемещение блока
        var p = [1,-1];

        if (!this.first_move) {
            this.timer();
            this.first_move = true;
        };

        col = (col <= 0) ? 0 : col;
        row = (row <= 0) ? 0 : row;
        col = (col >= 3) ? 3 : col;
        row = (row >= 3) ? 3 : row;

        for (var i=0,l=p.length;i<l;i++) {
            try {
                if ('undefined' != typeof this.sh[row][col-p[i]]) {
                    if (this.sh[row][col-p[i]] == null) {
                        this.sh[row][col-p[i]] = this.sh[row][col];
                        this.sh[row][col] = null;
                    }
                }
            } catch(e){}
        }
        for (var i=0,l=p.length;i<l;i++) {
            try {
                if ('undefined' != typeof this.sh[row-p[i]][col]) {
                    if (this.sh[row-p[i]][col] == null) {
                        this.sh[row-p[i]][col] = this.sh[row][col];
                        this.sh[row][col] = null;
                    }
                }
            } catch(e){}
        }
        this.changeCount();
        this.view(this.sh);
        if (this.compare(this.n,this.sh)) {
            this.timer_params.hold = this.timer_params.hold ? false : true;
            alert(this.msg +' ' + this.timer_params.minute + ':' + this.timer_params.second);
            this.start();//document.getElementById('block').innerHTML = '';
        }
    },
    mouse: function () { // вызов ф-ции перемещения блока
        var col = parseInt(this.dataset['col']),
            row = parseInt(this.dataset['row']);
        game.move(col,row);
    },
    view: function (a) { // вывести блоки на старницу
        block = document.getElementById("block");
        // очистка
        while (block.firstChild) {
            block.removeChild(block.firstChild);
        }
        var arObj = [];
        for (var i = 0; a.length > i; i++) {
            var divRow = document.createElement("div");
            divRow.className = 'row';
            block.appendChild(divRow);
            arObj[i] = [];
            for (var j = 0; a[i].length > j; j++) {
                arObj[i][j] = new Object();
                arObj[i][j].num = a[i][j];

                // вывод елементов
                var div = document.createElement("div");
                div.innerHTML = arObj[i][j].num;
                div.className = arObj[i][j].num == null ? 'null' : (this.n[i][j] == this.sh[i][j]) ?'bl true':'bl';
                div.addEventListener('click',this.mouse,false);
                div.setAttribute('data-row',i);
                div.setAttribute('data-col',j);
                block.appendChild(div);
            }
        }
    },
    controlEvent: function () { // обработка событий для кнопок старт/рестарт/пауза
        var c = this.dataset['control'];
        switch (c) {
            case 'start':
                game.start();
                break;
            case 'restart':
                if (confirm('Начать игру заново?')) {
                    clearInterval(game.timer_params.intervalID);
                    document.getElementById('timer').innerHTML = '00:00';
                    game.count = 0;
                    document.getElementById('count').innerHTML = '0';
                    game.timer_params.hold = false;
                    block.style.display = 'inline-block';
                    document.getElementById('pause-img').style.display = 'none';
                    document.getElementsByClassName('btn')[1].innerHTML = 'pause';
                    game.start();
                }
                break;
            case 'pause':
                game.pause();
                break;
        }
    },
    timer: function () { // таймер
        var timer  = 0;
        game.timer_params.intervalID = window.setInterval(function(){
            if (!game.timer_params.hold) {
                ++timer;
                game.timer_params.hour   = Math.floor(timer / 3600);
                game.timer_params.minute = Math.floor((timer - game.timer_params.hour * 3600) / 60);
                game.timer_params.second = timer - game.timer_params.hour * 3600 - game.timer_params.minute * 60;
                if (game.timer_params.hour < 10) {game.timer_params.hour = '0' + game.timer_params.hour;}
                if (game.timer_params.minute < 10) {game.timer_params.minute = '0' + game.timer_params.minute;}
                if (game.timer_params.second < 10) {game.timer_params.second = '0' + game.timer_params.second;}
                document.getElementById('timer').innerHTML = game.timer_params.minute + ':' + game.timer_params.second;
            }
        }, 1000);
    },
    changeCount: function () { // увеличить счетчик количества перемещений
        document.getElementById('count').innerHTML = ++this.count
    },
    pause: function () { // пауза
        document.getElementById('pause-img').style.display = game.timer_params.hold ? 'none' :'inline-block';
        game.timer_params.hold = game.timer_params.hold ? false : true;
        block.style.display = game.timer_params.hold ? 'none' : 'inline-block';
        document.getElementsByClassName('btn')[1].innerHTML = game.timer_params.hold ?  'continue' :  'pause';
    },
    start: function () { // старт
        do {
            this.shuffle();
        } while (this.compare(this.n,this.sh));
        this.view(this.sh);
    },
    init: function () { // ф-ция инициализации
        this.start();
        // навешиваем listener на кнопки
        var elements = document.getElementsByClassName('btn');
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('click', this.controlEvent, false);
        }
        window.addEventListener('keyup', this.keyboardHandler, false);
    }
}

game.init();