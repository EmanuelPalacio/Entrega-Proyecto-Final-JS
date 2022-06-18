// ARRAYS ⬇
let lista = [];
let carrito = [];

// Variables Globales ⬇
/* ubicacion en DOM */
const carritobtn = document.querySelector(".carrito__btn");
const btnVaciarCarrito = document.querySelector(".btn--vaciar");
const btnCarritoCompra = document.querySelector(".btn--comprar");
const contenedorProductos = document.querySelector("table tbody");
const contenedorTotal = document.querySelector("table tfoot");
let avisoCantidad = document.querySelector(".carrito__btn");
// FUNCIONES ⬇
/*  Genera las cards en el HTML */
const cards = () => {
    for (const card of lista) {
        let contenedor = document.querySelector(".producto");
        let cards = document.createElement("div");
        cards.className = "producto__card"
        cards.innerHTML = 
        `
            <img class="producto__img" src=${card.imagen} alt="">
            <div class="producto__datos">
                <h3>${card.nombre}-$${card.precio}</h3>
                <div id="${card.id}" class="producto__comprar">
                    <input class="acumulador" type="number">
                    <button class="btn-cantidad btn-cantidad--sumar">
                        <i class="fi fi-br-plus"></i>
                            </button>
                    <button class="btn-cantidad btn-cantidad--restar">
                        <i class="fi fi-br-minus"></i>
                    </button>
                    <button class="btn--agregar"><i class="fi fi-br-shopping-cart-add"></i></button>
                </div>
            </div>
                
        `
        contenedor.append(cards);
    }
};
/*  Sumar y restar productos, cada card individualmente */
const eventosCards = () => {
    for (const producto of lista) {
        let ids = `#${producto.id} .btn-cantidad--sumar`;
        let botonSuma = document.querySelector(ids);
        let acumular = 0;
        botonSuma.addEventListener("click", function() {
            ids = `#${producto.id} .acumulador`;
            let id = document.querySelector(ids);
            id.value = ++acumular;
        })
        ids = `#${producto.id} .btn-cantidad--restar`;
        let botonRestar = document.querySelector(ids);
            botonRestar.addEventListener("click", function() {
            ids = `#${producto.id} .acumulador`;
            let id = document.querySelector(ids);
            (parseInt(id.value) > 0 && parseInt(id.value) != 1) ? id.value = --acumular : id.value = "";
            }
        )
    };
}
const ListaDeCompra = () => {
    contenedorProductos.innerHTML = "";
    contenedorTotal.innerHTML = "";
    totalProductos = [];
    for (const producto of carrito) {
    //creo la fila para cada producto seleccionado
    let fila = document.createElement("tr");
    fila.innerHTML =
        `
        <td>${producto.nombre}</td>
        <td>${producto.unidad}</td>
        <td>$${producto.precio*producto.unidad}</td>
        `
    contenedorProductos.append(fila);
    //Suma del precio Total de los productos
    totalProductos.push(producto.precio*producto.unidad)
    }
    let total = document.createElement("tr");
    if (totalProductos != 0){
    const sumar = totalProductos.reduce(function(valorAnterior, valorActual){
        return valorAnterior + valorActual;
        });
    total.innerHTML = 
        `
        <td>Total</td>
        <td colspan="2">$${sumar}</td>
        `
    contenedorTotal.append(total);
}
}
const pedirDatosLocalStorage = () => {
    for (let i = 0; i < localStorage.length; i++) {
        let clave = localStorage.key(i);
        JSON.parse(localStorage.getItem(clave));
        carrito.push(JSON.parse(localStorage.getItem(clave)));
    }
}
/* Cargar cantidad seleccionada del producto al carrito y localstorage */
const AgregarAlCarrito = () => {
    for (const producto of lista) {
        let cantidad = document.querySelector(`#${producto.id} .acumulador`)
        let btnAgregar = document.querySelector(`#${producto.id} .btn--agregar`);
        
        btnAgregar.addEventListener("click", function(){
        producto.unidad = parseInt(cantidad.value);
        localStorage.setItem(`${producto.nombre}`, JSON.stringify(producto));
        carrito = [];
        pedirDatosLocalStorage();
        ListaDeCompra();
        avisoCantidad.innerHTML =
            `
            <i class="fi fi-br-shopping-cart"></i>
            <span>${localStorage.length}</span>                        
            `
        });
    }
}

const pedirProductos = async () => {
    let pedir = await fetch("../productos.JSON");
    /* lista es un array */
    lista = await pedir.json();

    cards();
    eventosCards();
    AgregarAlCarrito();
}
const pagar = async () => {
    const productosToMap = carrito.map(Element => {
            let nuevoElemento = 
            {
                title: Element.nombre,
                description: "...",
                picture_url: Element.imagen,
                category_id: Element.id,
                quantity: Element.unidad,
                currency_id: "ARS",
                unit_price: Element.precio
            }
            return nuevoElemento
    })
    let response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
            Authorization: "Bearer TEST-3505085526454340-060216-be6008bf3dea6167714bbb9dd785b006-386559401"
        },
        body: JSON.stringify({
            items: productosToMap
        })
    })
    console.log(productosToMap);
    let data = await response.json()
    console.log(data)
    window.open(data.init_point, "_blank")
}
// Codigo ⬇
/* si ya hay datos cargados en el localStorage se los paso al array carrito */
if (localStorage.length != 0) {
    pedirDatosLocalStorage();
    avisoCantidad.innerHTML = 
            `
            <i class="fi fi-br-shopping-cart"></i>
            <span>${localStorage.length}</span>
                                    
            `
}
ListaDeCompra();
pedirProductos();
/* desplegar o ocultar carrito de compras */
carritobtn.addEventListener("click", function(){
    let activar = document.querySelector("#carrito")
    activar.classList.toggle("carrito__contenedor--ocultar")
    }
);
/* confirmacion o cancelacion de compra */
btnCarritoCompra.addEventListener("click", function (){
    pagar(); 
});
btnVaciarCarrito.addEventListener("click", function(){
    swal({
        title: "Vaciar carrito de Compra",
        text: "¿esta seguro?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
        swal("Se ah vaciado con exito el carrito", {
            icon: "success",   
        });
        contenedorProductos.innerHTML = "";
        contenedorTotal.innerHTML = "";
        localStorage.clear();
        avisoCantidad.innerHTML = 
            `
            <i class="fi fi-br-shopping-cart"></i>
            <span></span>
                                    
            `
        }
    });
});

