// let r = ['c', '', '1', '2',':','4','6','','ghbdtn'];
// let d = r.splice(2, 5);
// console.log(d.join().replaceAll(',', ''));

class Slider{
    constructor({el, active, duration, direction, autoplay, autoplayTime, indicatorsTouch}){
        if(el instanceof HTMLElement) this.slider = el;
        else if(typeof el == 'string') this.slider = document.querySelector(el);
        this.sliderLines = this.slider.querySelector('.sliderLines');
        this.slides = [...this.sliderLines.querySelectorAll('.slide')];
        this.active = active;
        this.duration = (duration != undefined && duration < 400)  ? duration : 400;
        this.direction = direction.toUpperCase();
        this.width = this.sliderLines.clientWidth;
        console.log(this.width);
        this.height = this.sliderLines.clientHeight;
        this.indicatorsName = [...this.slider.querySelectorAll('.controlsNameOne')];
        this.moveSize = (this.direction == 'X') ? this.width : this.height;
        // this.sliderLines.style.width = this.width+'px';
        this.indicators = [...this.slider.querySelectorAll('.step')];
        this.indicatorsTouch = indicatorsTouch;
        // this.sliderLines.style.height = this.height+'px';
        this.prev = this.slider.querySelector('.slider__prev');
        this.next = this.slider.querySelector('.slider__next');
        this.autoplay = autoplay;
        this.touch = true;
        this.autoplayTime = autoplayTime;
        this.slides.forEach(item=>{
            item.style = `
            width: ${this.width}px;
            height: ${this.height}px;
            position: absolute;
            `
        })
        console.log(this.slides);
        this.posX1 = 0;
        this.posX2 = 0;
        this.posInit = 0;
        this.posFinal = 0;
        this.posHold = window.innerWidth > 1000 ? 200 : 50;
        this.slides.forEach(item=>{
            if(item != this.slides[this.active]) {
                item.style.transform = `translate${this.direction}(${this.moveSize}px)`;
            }if(item == this.slides[this.slides.length-1]) {
                item.style.transform = `translate${this.direction}(${this.moveSize*-1}px)`;
            }
        })
        this.prev.addEventListener('click', ()=>this.moveLeft(this.prev));
        this.next.addEventListener('click', ()=>this.moveRight(this.next));
        this.sliderLines.addEventListener('touchstart', (e)=>this.swipeStart(e));
        this.sliderLines.addEventListener('mousedown', (e)=>this.swipeStart(e));
        this.indicatorsName.forEach(element => {
            element.addEventListener('click', e=>this.tabPanel(e))
        });
        if(indicatorsTouch){
            this.indicators.forEach(item=>{
                item.addEventListener('click', e=>this.indicatorsNav(e));
            });
        }
        setTimeout(() => {
            this.autoplaying();
        }, autoplayTime);
        document.addEventListener('dragstart', function () { 
            return false;
         });
        this.slides[this.active].classList.add('active');
        this.slides[this.slides.length-1].classList.add('previous');
        this.slides[this.active+1].classList.add('nextSl');
    }
    changeClasses(){//меняем классы индикаторам при переключении слайдера или автоплее
        this.indicatorsName.forEach(item=>item.classList.remove('active'));
        this.indicators.forEach(item=>item.classList.remove('active'));
        this.indicators[this.active].classList.add('active');
        for (let i = 0; i < this.indicatorsName.length; i++) {
            if(this.indicators[this.active].getAttribute('data-name') == this.indicatorsName[i].getAttribute('data-name')){
                this.indicatorsName[i].classList.add('active');
            }
        }
    }
    tabPanel(e){//переключаемся с одной категории на другую и меняем слайды согласно ней
        e.preventDefault();
        this.indicatorsName.forEach(item=>item.classList.remove('active'));
        this.indicators.forEach(item=>item.classList.remove('active'));
        e.target.classList.add('active');
        e.target.nextElementSibling.children[0].classList.add('active');
        this.slidePosition();
    }
    slidePosition(){ //расставляем слайды по нужным позициям при нажатии на индикатор или категорию индикатора
        let index = this.indicators.findIndex(item=>item.classList.contains('active'));
        this.active = index;
        this.slides.forEach(item=>{   
            if(item !== this.slides[this.active]){
                item.style.display = 'none';
                item.style.transform = `translate${this.direction}(${this.moveSize}px)`
                setTimeout(() => {
                    item.style.display = 'flex';
                }, 200);
            }
            if(item == this.slides[this.active]){
                this.slides[this.active].style.transform = `translate${this.direction}(${0})`;
            }
            this.setClass();
            if(item.classList.contains('previous')){
                item.style.transform = `translate${this.direction}(${this.moveSize*-1}px)`;
            }
            if(item.classList.contains('nextSl')){
                item.style.transform = `translate${this.direction}(${this.moveSize}px)`;
            }
        })
    }
    indicatorsNav(e){//переулючаемся по индикаторам и категориям индикаторов, параллельно переходя на нужный слайд
        e.preventDefault();
        this.indicators.forEach(item=>item.classList.remove('active'));
        this.indicatorsName.forEach(item=>item.classList.remove('active'));
        e.target.classList.add('active');
        for (let i = 0; i < this.indicatorsName.length; i++) {
            if(e.target.getAttribute('data-name') == this.indicatorsName[i].getAttribute('data-name')){
                this.indicatorsName[i].classList.add('active');
            } 
        }
        this.slidePosition();
    }
    changeTransition(btn){//корректировка плавности при переключении слайдера
        this.slides.forEach(item=>{
            item.style.transition = '0ms';
            let mover = btn == this.next ? this.moveSize*-1 : this.moveSize; 
            if(item != this.slides[this.active]){
                item.style.transform = `translate${this.direction}(${mover*-1}px)`
            }
        })
    }

    setClass(){ //функция которая назначает слайдам классы и на их основании уже слайды будут сдвигаться при свайпе
        for (let i = 0; i < this.slides.length; i++) {
            this.slides[i].classList.remove('previous');
            this.slides[i].classList.remove('active');
            this.slides[i].classList.remove('nextSl');
        }
        this.slides.forEach(item=>{
            if(item == this.slides[this.active]) {
                item.classList.add('active');
                if(item == this.slides[0]) this.slides[this.slides.length-1].classList.add('previous');
                else item.previousElementSibling.classList.add('previous');
                if(item == this.slides[this.slides.length-1]) this.slides[0].classList.add('nextSl');
                else item.nextElementSibling.classList.add('nextSl');   
            }
        })
    }
    moveLeft(btn){//переключить на предыдущий слайд
        this.changeTransition(btn);
        this.slides[this.active].style.transition = `${this.duration}ms`;
        this.slides[this.active].style.transform = `translate${this.direction}(${this.moveSize}px)`;
        this.active--;
        if(this.active < 0) this.active = this.slides.length-1;
        this.slides[this.active].style.transition = `${this.duration}ms`;
        this.changeClasses();
        this.slides[this.active].style.transform = `translate${this.direction}(${0}px)`;
        this.setClass();
    }
    moveRight(btn){//переключение на следующий слайд
        this.slider.removeEventListener('touchstart', this.swipeStart);
        this.slider.removeEventListener('mousedown', this.swipeStart);
        this.changeTransition(btn);
        this.slides[this.active].style.transition = `${this.duration}ms`;
        this.slides[this.active].style.transform = `translate${this.direction}(${this.moveSize*-1}px)`;
        this.active++;
        if(this.active == this.slides.length) this.active = 0;
        this.slides[this.active].style.transition = `${this.duration}ms`;
        this.changeClasses();
        this.slides[this.active].style.transform = `translate${this.direction}(${0}px)`;
        this.setClass();
    }
    moveCenter(){//оцентровка слайдера, если слайд не достаточно сдвинули в нужную сторону
        this.slides.forEach(item=>{
            this.slides[this.active].style.transform = `translate${this.direction}(0)`;
            if(item.classList.contains('previous')) item.style.transform = `translate${this.direction}(${this.moveSize*-1}px)`
            if(item.classList.contains('nextSl')) item.style.transform = `translate${this.direction}(${this.moveSize}px)`
        })
    }
    swipeStart(e){//вешаем обработчик касаний на слайдер
        this.sliderLines.style.cursor = 'grabbing';
        this.touch = true;
        this.posX1 = e.type == 'touchstart' ? e.touches[0].clientX : e.clientX;
        this.sliderLines.addEventListener('touchmove', e=>this.swipeMove(e));
        this.sliderLines.addEventListener('mousemove', e=>this.swipeMove(e));
        document.addEventListener('touchend', e=>this.swipeEnd(e));
        document.addEventListener('mouseup', e=>this.swipeEnd(e));
        
    }
    swipeMove(e){ //двигаем слайдер в нужную сторону
        if(this.touch){
            this.posInit = e.type == 'touchmove' ? e.changedTouches[0].clientX : e.clientX;
        this.posX2 = this.posX1 - this.posInit;
            this.slides.forEach(item=>{
                item.style.transition = `${this.duration}ms`;
                this.slides[this.active].style.transform = `translateX(${this.posX2*-1}px)`;
                if(item.classList.contains('previous')) item.style.transform = `translate${this.direction}(${(this.moveSize+this.posX2)*-1}px)`
                if(item.classList.contains('nextSl')) {
                    item.style.transform = `translate${this.direction}(${this.moveSize-this.posX2}px)`
                }
            })
        }
    }
    swipeEnd(e){//либо переключаем слайдер либо оставляем текущий
        this.sliderLines.style.cursor = 'grab'
        this.posFinal = e.type == 'touchend' ? e.changedTouches[0].clientX : e.clientX;
       
        if(this.posHold < this.posX2){
            this.moveRight(this.next);
        }else if(this.posX2 < 0 && this.posX2 < -this.posHold){
            this.moveLeft(this.prev);
        }else{
            this.moveCenter();
        }
        this.touch = false
        this.posFinal = 0;
        this.posInit = 0;
        this.posX1 = 0;
        this.posX2 = 0;
    }
    autoplaying(){//функция автоплея
        if(this.autoplay){
            this.changeTransition(this.next);
        this.changeClasses();
        this.setClass();
        this.moveRight(this.next);
        setTimeout(() => {
            this.autoplaying();
        }, this.autoplayTime);
        }
    }

}
let mySlider = new Slider({
    el: '.slider',
    active: 0,
    duration: '400',
    direction: 'x',
    indicatorsTouch: false,
    autoplay: true,
    autoplayTime: 5000
})
