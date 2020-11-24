try{
    class Slider{
      constructor({el, active, duration, direction, autoplay, autoplayTime, indicatorsTouch}){ //деструктуризируем данные 
          if(el instanceof HTMLElement) this.slider = el;
          else if(typeof el == 'string') this.slider = document.querySelector(el); //блок со слайдером
          this.sliderLines = this.slider.querySelector('.sliderLines');//блок со слайдами
          this.slides = [...this.sliderLines.querySelectorAll('.slide')];//слайды
          this.active = active;//активный слайд
          this.duration = (duration != undefined && duration < 400)  ? duration : 400; //transition
          this.direction = direction.toUpperCase();//в какое направление двигать слайд
          this.width = this.sliderLines.clientWidth; //ширина слайда
          this.height = this.sliderLines.clientHeight; //высота слайда
          this.indicatorsName = [...this.slider.querySelectorAll('.controlsNameOne')]; //названия категорий индикаторов
          this.moveSize = (this.direction == 'X') ? this.width : this.height; //на сколько двигать слайд
        
          this.indicators = [...this.slider.querySelectorAll('.step')]; //сами индикаторы
          this.indicatorsTouch = indicatorsTouch; //включение или отключение перехода по индикаторам и слайдам
        
          this.prev = this.slider.querySelector('.slider__prev'); // кнопка переключения слайдера назад
          this.next = this.slider.querySelector('.slider__next'); //кнопка переключения слайдера вперед
          this.autoplay = autoplay; //включение или отключение автоплея
          this.touch = true; //отключение тауча при отпускании кнопки мыши
          this.autoplayTime = autoplayTime; //через какое время переключать слайдер при автоплее
          this.slides.forEach(item=>{ //даем всем слайдам одинаковую высоту и ширину и абслютное позиционирование
              item.style = `
              width: ${this.width}px;
              height: ${this.height}px;
              position: absolute;
              `
          })
          //переменные для записи координат нажатия и дальнейшего его сдвига при тауче
          this.posX1 = 0; 
          this.posX2 = 0;
          this.posInit = 0;
          this.posFinal = 0;
          this.posHold = window.innerWidth > 1000 ? 200 : 50;
          //раставляем слайды
          this.slides.forEach(item=>{
              if(item != this.slides[this.active]) {
                  item.style.transform = `translate${this.direction}(${this.moveSize}px)`;
              }if(item == this.slides[this.slides.length-1]) {
                  item.style.transform = `translate${this.direction}(${this.moveSize*-1}px)`;
              }
          })
          //запускаем обработчики
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
          //запускаем автоплей
          setTimeout(() => {
              this.autoplaying();
          }, autoplayTime);
          document.addEventListener('dragstart', function () { //запрещаем перетаскивание элементов по умолчанию
              return false;
           });
           //даем необходимые классы слайдам 
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
  }catch(e){
    console.log(e);
  }