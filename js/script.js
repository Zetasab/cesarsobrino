var proyectosid;
var $flecha;


$(document).ready(function() {
    $(this).scrollTop(0);

});

$(window).load(function() {
    $('#loader').css('transition', '1s');
    $('#test1').css('opacity', '1');
    $('#test1').css('animation', 'stretchRight 3s forwards ease-in-out');

    var pheight = $(window).height();

    $(".fullheight").each(function(index) {
        $(this).css('height', pheight + "px");
    });

    setTimeout(function() {
        $('#loader').css('opacity', '0');
        $('#loader').css('display', 'none');
        $("body").css('overflow-y', 'scroll');

        // $('.presentacion').addClass('fadeIn');
        $('.presentacioncv').addClass('slide-in-elliptic-top-fwd');
        //deberia ser 3000,
    }, 3000);


    $("body").mousemove(function(e) {
        var x = event.clientX; // Get the horizontal coordinate
        var y = event.clientY; // Get the vertical coordinate

        var pheight = $(window).height();
        pheight = pheight / 2;
        var wheight = $(window).width();
        wheight = wheight / 2;
        x = x - wheight;
        y = y - pheight;
        // var coor = "X coords: " + x + ", Y coords: " + y+" h:"+pheight+" wh:"+wheight;
        // console.log(coor);
        var xm = x * 0.05;
        var ym = y * 0.03;
        var xm2 = x * 0.1;
        var ym2 = y * 0.1;
        $('#seguidor').css('transform', 'translate(' + xm2 + 'px,' + ym2 + 'px)');

        $('#presentacionseguidor').css('transform', 'translate(' + xm + 'px,' + ym + 'px)');


    });

    $('#menuinicio').on('click', function(event) {
        disableScroll();
        event.preventDefault();
        let position = $('#portada').offset().top;
        let headerHeight = $('header').outerHeight();
        let distance = (position - headerHeight);
        distance = distance;

        $('body').velocity('scroll', {
            duration: 3500,
            offset: distance,
            queue: false,
            easing: 'easeInOutQuart',
            complete: function() {
                enableScroll();
            }

        });

    });
    $('#menusobremi').on('click', function(event) {
        disableScroll();
        event.preventDefault();
        let position = $('#sobremired').offset().top;
        let headerHeight = $('header').outerHeight();
        let distance = (position - headerHeight);
        distance = distance;

        $('body').velocity('scroll', {
            duration: 3500,
            offset: distance,
            queue: false,
            easing: 'easeInOutQuart',
            complete: function() {
                enableScroll();
            }
        });

    });
    $('#menuproyectos').on('click', function(event) {
        disableScroll();
        event.preventDefault();
        let position = $('#proyectosa').offset().top;
        let headerHeight = $('header').outerHeight();
        let distance = (position - headerHeight);
        distance = distance;

        $('body').velocity('scroll', {
            duration: 3500,
            offset: distance,
            queue: false,
            easing: 'easeInOutQuart',
            complete: function() {
                enableScroll();
            }
        });

    });
    $('#menuconocimientos').on('click', function(event) {
        disableScroll();
        event.preventDefault();
        let position = $('#skills').offset().top;
        let headerHeight = $('header').outerHeight();
        let distance = (position - headerHeight);
        distance = distance;

        $('body').velocity('scroll', {
            duration: 3500,
            offset: distance,
            queue: false,
            easing: 'easeInOutQuart',
            complete: function() {
                enableScroll();
            }
        });
    });
    $('#menucontacto').on('click', function(event) {
        disableScroll();
        event.preventDefault();
        let position = $('#contacto').offset().top;
        let headerHeight = $('header').outerHeight();
        let distance = (position - headerHeight);
        distance = distance + 200;

        $('body').velocity('scroll', {
            duration: 3500,
            offset: distance,
            queue: false,
            easing: 'easeInOutQuart',
            complete: function() {
                enableScroll();
            }
        });
    });


    $('#paginawebactual').on("click", function() {
        window.location.href = 'index.html';
    });
    $('#paginawebantigua').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/websites/antiguo_portfolio/index.html");
    });
    $('#paginawebjuegos').on("click", function() {
        window.open("https://extraordinary-kindness-zetap-roduction.up.railway.app/languages/es/inicio/");
    });
    $('#fullpageid').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/js/forcescroll/fullPage.js-master/examples/simple.html");
    });
    $('#parrallaxid').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/js/backgroundparallaxonscroll/html/index.html");
    });
    $('#onscrollid').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/js/onscrollbg/index.html");
    });
    $('#animacionesid').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/css/animations/index.html");
    });
    $('#loadingid').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/css/loader/loading/index.html");
    });
    $('#socialmediaid').on("click", function() {
        window.open("https://cesarsobrinoarribas.000webhostapp.com/Portfolio/cesar/css/socialnetworks/");
    });
    $('#caracruzid').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/games/caracruz/index.html");
    });
    $('#precisionid').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/games/preciosion/index.html");
    });
    $('#quieresnoviaid').on("click", function() {
        window.open("https://zetasab.github.io/ZetaProyectos/repositories/games/quiereserminovia/index.html");
    });

    proyectosid = Math.floor(Math.random() * (4)) + 1;;




    if (proyectosid == 1) {

        $('#proyectos1').css('left', '0');
        $('#proyectos2').css('left', '100%');
        $('#proyectos3').css('left', '200%');
        $('#proyectos4').css('left', '300%');

        $('#proyectos1').css('opacity', '1');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '0');

    } else if (proyectosid == 2) {

        $('#proyectos1').css('left', '-100%');
        $('#proyectos2').css('left', '0');
        $('#proyectos3').css('left', '100%');
        $('#proyectos4').css('left', '200%');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '1');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '0');
    } else if (proyectosid == 3) {

        $('#proyectos1').css('left', '-200%');
        $('#proyectos2').css('left', '-100%');
        $('#proyectos3').css('left', '0');
        $('#proyectos4').css('left', '100%');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '1');
        $('#proyectos4').css('opacity', '0');
    } else if (proyectosid == 4) {

        $('#proyectos1').css('left', '-300%');
        $('#proyectos2').css('left', '-200%');
        $('#proyectos3').css('left', '-100%');
        $('#proyectos4').css('left', '0');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '1');
    }
    $flecha = $('.flecha');

});

function toright() {


    if (proyectosid == 4) {
        proyectosid = 0;
    }
    proyectosid = proyectosid + 1;

    if (proyectosid == 1) {

        $('#proyectos1').css('left', '0');
        $('#proyectos2').css('left', '100%');
        $('#proyectos3').css('left', '200%');
        $('#proyectos4').css('left', '300%');

        $('#proyectos1').css('opacity', '1');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '0');

    } else if (proyectosid == 2) {

        $('#proyectos1').css('left', '-100%');
        $('#proyectos2').css('left', '0');
        $('#proyectos3').css('left', '100%');
        $('#proyectos4').css('left', '200%');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '1');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '0');
    } else if (proyectosid == 3) {

        $('#proyectos1').css('left', '-200%');
        $('#proyectos2').css('left', '-100%');
        $('#proyectos3').css('left', '0');
        $('#proyectos4').css('left', '100%');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '1');
        $('#proyectos4').css('opacity', '0');
    } else if (proyectosid == 4) {

        $('#proyectos1').css('left', '-300%');
        $('#proyectos2').css('left', '-200%');
        $('#proyectos3').css('left', '-100%');
        $('#proyectos4').css('left', '0');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '1');
    }
}

function toleft() {
    if (proyectosid == 1) {
        proyectosid = 5;
    }
    proyectosid = proyectosid - 1;
    if (proyectosid == 1) {

        $('#proyectos1').css('left', '0');
        $('#proyectos2').css('left', '100%');
        $('#proyectos3').css('left', '200%');
        $('#proyectos4').css('left', '300%');

        $('#proyectos1').css('opacity', '1');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '0');

    } else if (proyectosid == 2) {

        $('#proyectos1').css('left', '-100%');
        $('#proyectos2').css('left', '0');
        $('#proyectos3').css('left', '100%');
        $('#proyectos4').css('left', '200%');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '1');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '0');
    } else if (proyectosid == 3) {

        $('#proyectos1').css('left', '-200%');
        $('#proyectos2').css('left', '-100%');
        $('#proyectos3').css('left', '0');
        $('#proyectos4').css('left', '100%');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '1');
        $('#proyectos4').css('opacity', '0');
    } else if (proyectosid == 4) {

        $('#proyectos1').css('left', '-300%');
        $('#proyectos2').css('left', '-200%');
        $('#proyectos3').css('left', '-100%');
        $('#proyectos4').css('left', '0');

        $('#proyectos1').css('opacity', '0');
        $('#proyectos2').css('opacity', '0');
        $('#proyectos3').css('opacity', '0');
        $('#proyectos4').css('opacity', '1');
    }
}






// Arreglar no funciona bien

$(window).resize(function() {
    //     // location.reload();
    //     var pheight = $(window).height();;

    //     $(".fullheight").each(function(index) {
    //         $(this).css('height', pheight + "px");
    //     });
    //     var pheightmax = pheight + 400;
    //     $("#proyectos").css('height', pheightmax + "px");
    //     $("#sobremi").css('height', pheightmax + "px");
    //     $("#skills").css('min-height', (pheight + 200) + "px");
    //     $("#contacto").css('height', (pheight + 200) + "px");
    //     $("#contacto2").css('height', (pheight + 200) + "px");
    $(".vanta-canvas").css('height', "100vh");

});



$(window).scroll(function() {

    var value = window.scrollY;

    var wheight = $(window).height();
    var totald = $(document).height() - wheight;


    //value 

    // console.log(value+","+totald);

    var cuenta = value / totald;
    cuenta = cuenta * 100;

    var rounded = Math.round(cuenta * 10) / 10;



    $('.linea').css('width', rounded + '%');




    var value = window.scrollY;
    var value1 = value * 0.1;
    var value2 = value * 4;
    var value21 = value * 5;
    var value3 = value * 0.9;
    var value4 = value * 1;
    var value5 = value * 0.2;
    var value6 = value * 0.5;
    var value7 = value * 0.01;





    $('.i1').css('margin-top', "-" + value1 + 'px');
    $('.i2').css('margin-top', "-" + value2 + 'px');
    $('.i3').css('margin-top', "-" + value21 + 'px');
    $('.i4').css('margin-top', "-" + value3 + 'px');

    $('.presentacion').css('margin-top', "-" + value5 + 'px');
    //$('.ball').css('margin-top',"-"+value3+'px');
    $("body").css('background-position-y', '-' + value1 + 'px');


    // $('.sombrero').css('margin-left',value6+"px");




    // var valuec = value - $("#sobremi").position().top;


    var wheight = $(window).height();

    var top = window.pageYOffset || document.documentElement.scrollTop;



    if (top > 0) {
        //MOusescrolldown animacion hacia abajo
        $('.scrolldownicondiv').css('opacity', '0');

        // Botones de subir y bajar
        $('#godown').css('opacity', '0');
        $('#godown').css('transform', 'scale(0)');
        $('#goup').css('opacity', '1');
        $('#goup').css('transform', 'scale(1)');






    } else if (top <= 0) {
        //MOusescrolldown animacion hacia arriba

        $('.scrolldownicondiv').css('opacity', '1');

        // Botones de subir y bajar
        $('#godown').css('opacity', '1');
        $('#godown').css('transform', 'scale(1)');
        $('#goup').css('opacity', '1');
        $('#goup').css('transform', 'scale(0)');



    }




    // console.log(top+"."+$("#skills").position().top);


    var reveals = document.querySelectorAll('.reveal');

    for (var i = 0; i < reveals.length; i++) {

        var wheight = $(window).height();
        var revealtop = reveals[i].getBoundingClientRect().top;
        var revealpoint = 200;

        if (revealtop < wheight - revealpoint) {

            reveals[i].classList.add('show');
        } else {
            reveals[i].classList.remove('show');
        }

    }

    var skillstop = $("#skills").position().top;

    if (top > skillstop) {
        $('#contacto2').css('display', 'block');
    } else {
        $('#contacto2').css('display', 'none');
    }

    var puntoshow = 400;
    var portadatop = $("#portada").position().top;
    var sobremitop = $("#sobremi").position().top - puntoshow;
    var proyectostop = $("#proyectos").position().top - puntoshow;
    var skillstop = $("#skills").position().top - puntoshow;
    var contactotop = $("#contacto").position().top - puntoshow;

    if (top > portadatop && top < sobremitop && top < proyectostop && top < skillstop && top < contactotop) {
        $("#spanmenu1").addClass('menuactives');
        $("#lineamenu1").addClass('menuactivel');
        $("#spanmenu2").removeClass('menuactives');
        $("#lineamenu2").removeClass('menuactivel');
        $("#spanmenu3").removeClass('menuactives');
        $("#lineamenu3").removeClass('menuactivel');
        $("#spanmenu4").removeClass('menuactives');
        $("#lineamenu4").removeClass('menuactivel');
        $("#spanmenu5").removeClass('menuactives');
        $("#lineamenu5").removeClass('menuactivel');

    } else if (top > portadatop && top > sobremitop && top < proyectostop && top < skillstop && top < contactotop) {
        $("#spanmenu1").removeClass('menuactives');
        $("#lineamenu1").removeClass('menuactivel');
        $("#spanmenu2").addClass('menuactives');
        $("#lineamenu2").addClass('menuactivel');
        $("#spanmenu3").removeClass('menuactives');
        $("#lineamenu3").removeClass('menuactivel');
        $("#spanmenu4").removeClass('menuactives');
        $("#lineamenu4").removeClass('menuactivel');
        $("#spanmenu5").removeClass('menuactives');
        $("#lineamenu5").removeClass('menuactivel');
    } else if (top > portadatop && top > sobremitop && top > proyectostop && top < skillstop && top < contactotop) {
        $("#spanmenu1").removeClass('menuactives');
        $("#lineamenu1").removeClass('menuactivel');
        $("#spanmenu2").removeClass('menuactives');
        $("#lineamenu2").removeClass('menuactivel');
        $("#spanmenu3").addClass('menuactives');
        $("#lineamenu3").addClass('menuactivel');
        $("#spanmenu4").removeClass('menuactives');
        $("#lineamenu4").removeClass('menuactivel');
        $("#spanmenu5").removeClass('menuactives');
        $("#lineamenu5").removeClass('menuactivel');
    } else if (top > portadatop && top > sobremitop && top > proyectostop && top > skillstop && top < contactotop) {
        $("#spanmenu1").removeClass('menuactives');
        $("#lineamenu1").removeClass('menuactivel');
        $("#spanmenu2").removeClass('menuactives');
        $("#lineamenu2").removeClass('menuactivel');
        $("#spanmenu3").removeClass('menuactives');
        $("#lineamenu3").removeClass('menuactivel');
        $("#spanmenu4").addClass('menuactives');
        $("#lineamenu4").addClass('menuactivel');
        $("#spanmenu5").removeClass('menuactives');
        $("#lineamenu5").removeClass('menuactivel');
    } else if (top > portadatop && top > sobremitop && top > proyectostop && top > skillstop && top > contactotop) {
        $("#spanmenu1").removeClass('menuactives');
        $("#lineamenu1").removeClass('menuactivel');
        $("#spanmenu2").removeClass('menuactives');
        $("#lineamenu2").removeClass('menuactivel');
        $("#spanmenu3").removeClass('menuactives');
        $("#lineamenu3").removeClass('menuactivel');
        $("#spanmenu4").removeClass('menuactives');
        $("#lineamenu4").removeClass('menuactivel');
        $("#spanmenu5").addClass('menuactives');
        $("#lineamenu5").addClass('menuactivel');
    }


});

function asd() {

    alert("fdsf");
}

function hidewrapper() {
    var wraper = $('.wrapper');
    wraper.css('clip-path', 'circle(30px at calc(100% - 45px) 35px)');
    $(".btnwrapper").css("background-image", "url(images/menuw.png)");
    $("body").css('overflow-y', 'scroll');
    menu = true;

}


var menu = true;

function mostrarmenu(params) {
    var wraper = $('.wrapper');
    if (menu) {
        wraper.css('clip-path', 'circle(75%)');

        $(".btnwrapper").css("background-image", "url(images/xw.png)");
        $("body").css('overflow-y', 'hidden');
        menu = false;
    } else {
        wraper.css('clip-path', 'circle(30px at calc(100% - 45px) 35px)');
        $(".btnwrapper").css("background-image", "url(images/menuw.png)");
        $("body").css('overflow-y', 'scroll');
        menu = true;
    }

}


var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e) {
    e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function() { supportsPassive = true; }
    }));
} catch (e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
function disableScroll() {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
    window.removeEventListener('touchmove', preventDefault, wheelOpt);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

// =========