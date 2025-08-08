window.onload = () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;

    let camaraX = 0;
    let atacandoTim = false;
    let direccionTim = 1; // 1: derecha, -1: izquierda

    let direccionJhoabxi = 1;
    let disparandoJhoabxi = false;

    // Estado del juego: "menu", "cinematica", "jugando", "derrota", "victoria"
    let estado = "menu";

    // Sistema de monedas y upgrades persistentes
    let monedas = parseInt(localStorage.getItem("monedas") || "0");
    let monedasRecoleccionPartida = 0;
    let upgradeDanio = localStorage.getItem("upgradeDanio") === "true";
    let upgradeVelocidad = localStorage.getItem("upgradeVelocidad") === "true";
    let upgradeVida = localStorage.getItem("upgradeVida") === "true";
    let upgradeBonkChanti = localStorage.getItem("upgradeBonkChanti") === "true";

    // Rondas
    let ronda = 1;
    let enemigosPorRonda = 2;
    let jefeFinalDerrotado = false;

    // Récord de ronda (máxima ronda alcanzada, guardada en localStorage)
    let recordRonda = parseInt(localStorage.getItem("recordRonda") || "0");

    // Control de invocación del jefe
    let jefeInvocando = false;
    let jefeUltimaInvocacion = 0;
    const JEFE_INTERVALO_INVOCACION = 2000; // 2 segundos
    const JEFE_MAX_INVOCADOS = 5;

    // Botón jugar
    const botonJugar = {
        x: canvas.width / 2 - 100,
        y: canvas.height / 2 + 50,
        width: 200,
        height: 50,
        hover: false
    };
    
    // Botón tienda
    const botonTienda = { x: 20, y: 20, width: 110, height: 60, hover: false };

    // Botón para saltar cinemática
    const botonSaltar = {
        x: canvas.width - 240,
        y: canvas.height - 90,
        width: 200,
        height: 50,
        hover: false
    };

    // Botones de derrota y victoria
    const botonMenu = {
        x: canvas.width / 2 - 220,
        y: canvas.height / 2 + 60,
        width: 180,
        height: 50,
        hover: false
    };
    const botonRetry = {
        x: canvas.width / 2 + 40,
        y: canvas.height / 2 + 60,
        width: 220,
        height: 50,
        hover: false
    };
    
const btnCompraDanio = { x: 180, y: 180, width: 120, height: 120, hover: false };
const btnCompraVelocidad = { x: 420, y: 180, width: 120, height: 120, hover: false };
const btnCompraVida = { x: 660, y: 180, width: 120, height: 120, hover: false };
const btnCompraBonkChanti = { x: 180, y: 180, width: 120, height: 120, hover: false };
const btnSalirTienda = { x: canvas.width / 2 - 100, y: 400, width: 200, height: 50, hover: false };

// ---- PAGINACIÓN DE TIENDA ----
let paginaTienda = 0;
const ITEMS_POR_PAGINA = 3;
const flechaIzq = { x: 40, y: 260, width: 50, height: 50, hover: false };
const flechaDer = { x: canvas.width - 90, y: 260, width: 50, height: 50, hover: false };
// Agrega al inicio de variables persistentes:
let upgradeMonedasX2 = localStorage.getItem("upgradeMonedasX2") === "true";
let upgradeArmadura = localStorage.getItem("upgradeArmadura") === "true";
let upgradeOtarin = localStorage.getItem("upgradeOtarin") === "true";
let upgradeGuille = localStorage.getItem("upgradeGuille") === "true";
const btnCompraGuille = { x: 180, y: 180, width: 120, height: 120, hover: false };
const btnCompraOtarin = { x: 180, y: 180, width: 120, height: 120, hover: false };
const btnCompraMonedasX2 = { x: 420, y: 180, width: 120, height: 120, hover: false };
const btnCompraArmadura = { x: 660, y: 180, width: 120, height: 120, hover: false };
    const itemsTodos = [
    {
        btn: btnCompraDanio,
        color: "rgba(201, 73, 63, 1)",
        icon: "💥",
        name: "Doble Daño",
        price: 300,
        upgrade: upgradeDanio,
        key: "danio"
    },
    {
        btn: btnCompraVelocidad,
        color: "rgba(183, 226, 226, 1)",
        icon: "💨",
        name: "Doble Velocidad",
        price: 200,
        upgrade: upgradeVelocidad,
        key: "velocidad"
    },
    {
        btn: btnCompraVida,
        color: "rgba(0, 202, 0, 1)",
        icon: "❤️",
        name: "Doble Vida",
        price: 500,
        upgrade: upgradeVida,
        key: "vida"
    },
    {
        btn: btnCompraBonkChanti,
        color: "#a9ff09ff",
        icon: "🟩",
        name: "BonkChanti",
        price: 1250,
        upgrade: upgradeBonkChanti,
        key: "bonkchanti"
    },
    {
        btn: btnCompraMonedasX2,
        color: "#f7d516ff",
        icon: "💰",
        name: "X2 Monedas",
        price: 675,
        upgrade: upgradeMonedasX2,
        key: "monedasx2"
    },
    {
        btn: btnCompraArmadura,
        color: "#8b8b8bff",
        icon: "🛡️",
        name: "Armadura",
        price: 800,
        upgrade: upgradeArmadura,
        key: "armadura"
    },
    {
        btn: btnCompraOtarin,
        color: "#6AEAFF",
        icon: "❄️",
        name: "Otarin",
        price: 1850,
        upgrade: upgradeOtarin,
        key: "otarin"
    },
    {
    btn: btnCompraGuille,
    color: "#FF2222",
    icon: "✂️",
    name: "Guille",
    price: 2500,
    upgrade: upgradeGuille,
    key: "guille"
}
];
// ===== SISTEMA DE MISIONES =====
const misiones = [
    { nombre: "Principiante Honrado", descripcion: "Llega a la ronda 15 en adelante.", recompensa: 100, tipo: "ronda", objetivo: 15 },
    { nombre: "Boxeador", descripcion: "Mata 40 enemigos con Lanzziano.", recompensa: 120, tipo: "killsLanzziano", objetivo: 40 },
    { nombre: "Mike Lanzz-Tyson", descripcion: "Mata 260 enemigos con Lanzziano.", recompensa: 500, tipo: "killsLanzziano", objetivo: 260 },
    { nombre: "Tirador", descripcion: "Mata 40 enemigos con Jhoabxi.", recompensa: 100, tipo: "killsJhoabxi", objetivo: 40 },
    { nombre: "Tiro Fijo-xi", descripcion: "Mata 260 enemigos con Jhoabxi.", recompensa: 400, tipo: "killsJhoabxi", objetivo: 260 },
    { nombre: "GANADOR!!!", descripcion: "Completa en modo normal y vence al jefe final.", recompensa: 600, tipo: "jefeNormal", objetivo: 1 },
    { nombre: "Ganador Otra Vez?", descripcion: "Llega a la ronda 21 en el modo supervivencia.", recompensa: 601, tipo: "rondaSupervivencia", objetivo: 21 },
    { nombre: "CUANDO ACABA!?", descripcion: "Llega a la ronda 60 en el modo supervivencia.", recompensa: 1050, tipo: "rondaSupervivencia", objetivo: 60 },
    { nombre: "Como Llegamos hasta aqui?!", descripcion: "Llega a la ronda 100 en el modo supervivencia.", recompensa: 1500, tipo: "rondaSupervivencia", objetivo: 100 },
    { nombre: "Comprador", descripcion: "Compra 3 objetos en la tienda.", recompensa: 300, tipo: "compras", objetivo: 3 },
    { nombre: "LOTERIA", descripcion: "Compra TODA LA TIENDA.", recompensa: 2000, tipo: "comprasTotal", objetivo: 8 },
    { nombre: "A Curar", descripcion: "Compra a BonkChanti.", recompensa: 490, tipo: "compraBonkChanti", objetivo: 1 },
    { nombre: "Hace Frio en la Cima", descripcion: "Compra a Otarin.", recompensa: 700, tipo: "compraOtarin", objetivo: 1 },
    { nombre: "A Oliver le Callo un Meteorito", descripcion: "Compra a Guille.", recompensa: 1111, tipo: "compraGuille", objetivo: 1 }
];

// Progreso de misiones, guardado en localStorage
let progresoMisiones = JSON.parse(localStorage.getItem("progresoMisiones") || "{}");
let paginaMisiones = 0;
const MISIONES_POR_PAGINA = 3;

// Variables para el botón misiones y paginación
const botonMisiones = { x: 20, y: 100, width: 110, height: 60, hover: false };
const flechaIzqMisiones = { x: 40, y: 260, width: 50, height: 50, hover: false };
const flechaDerMisiones = { x: 830, y: 260, width: 50, height: 50, hover: false };
const btnSalirMisiones = { x: 380, y: 400, width: 200, height: 50, hover: false };

// Contadores para misiones de kills y compras
let killsLanzziano = 0;
let killsJhoabxi = 0;
let comprasRealizadas = 0;

    // ===== ELEMENTOS DEL JUEGO =====
    const nubes = [
        { x: 100, y: 80, width: 80, height: 40 },
        { x: 300, y: 120, width: 100, height: 50 },
        { x: 600, y: 60, width: 90, height: 41 },
        { x: 800, y: 100, width: 110, height: 55 }
    ];

    const suelo = {
        x: 0,
        y: canvas.height - 60,
        width: 5000,
        height: 60,
        color: "#228B22"
    };

    const plataformas = [
        { x: 200, y: 400, width: 120, height: 20, color: "#dfd331ff" },
        { x: 450, y: 350, width: 100, height: 20, color: "#228B22" },
        { x: 700, y: 300, width: 150, height: 20, color: "#A0522D" },
        { x: 1000, y: 300, width: 200, height: 20, color: "#50c750ff" },
        { x: 1300, y: 400, width: 150, height: 20, color: "#A0522D" },
        { x: 1600, y: 350, width: 135, height: 20, color: "#228B22" },
        { x: 1900, y: 400, width: 120, height: 20, color: "#A0522D" },
        { x: 2200, y: 350, width: 100, height: 20, color: "#50a150ff" },
        { x: 2500, y: 300, width: 150, height: 20, color: "#A0522D" },
        { x: 2800, y: 300, width: 200, height: 20, color: "#228B22" },
        { x: 3100, y: 400, width: 150, height: 20, color: "#A0522D" },
        { x: 3400, y: 350, width: 135, height: 20, color: "#228B22" },
        { x: 3700, y: 400, width: 120, height: 20, color: "#bb5a2dff" },
        { x: 4000, y: 350, width: 100, height: 20, color: "#228B22" },
        { x: 4300, y: 300, width: 150, height: 20, color: "#A0522D" },
        { x: 4600, y: 300, width: 200, height: 20, color: "#228B22" },
        { x: 4900, y: 450, width: 150, height: 20, color: "#975131ff" },
        
        
        
    ];

    // ==== JUGADORES ====
    let jugadores = [];
     function crearJugador(nombre) {
    let base = {
        x: nombre === "Jhoabxi" ? 250 : 150,
        y: 100,
        width: 40,
        height: 40,
        color: nombre === "Jhoabxi" ? "#003366" : "#FFFF99",
        velX: 0,
        velY: 0,
        velocidad: (upgradeVelocidad ? 8 : 4),
        salto: -12,
        enElSuelo: false,
        izquierda: nombre === "Jhoabxi" ? "KeyA" : "ArrowLeft",
        derecha: nombre === "Jhoabxi" ? "KeyD" : "ArrowRight",
        saltar: nombre === "Jhoabxi" ? "KeyW" : "ArrowUp",
        saltosDisponibles: 2,
        puedeSaltar: true,
        vida: (upgradeVida ? 200 : 100),
        vidaMax: (upgradeVida ? 200 : 100)
    };
    if (nombre === "Jhoabxi") {
        base.disparar = "KeyF";
        base.balaCooldown = 0;
    }
    return { nombre, ...base };
}
    jugadores = [crearJugador("Lanzziano"), crearJugador("Jhoabxi")];
    // BonkChanti
    let bonkchanti = null;
let balasCurativas = [];
// ---- Agrega esto debajo ----
let otarin = null;
let balasHielo = [];
let guille = null;
let rayosGuille = [];
let tijerasGuille = [];

function crearOtarin() {
    return {
        x: jugadores[0].x + 70,
        y: jugadores[0].y,
        width: 28,
        height: 28,
        color: "#6AEAFF",
        velocidad: 3.7,
        cooldown: 0
    };
}
    function crearBonkChanti() {
    return {
        x: jugadores[0].x + 50, // justo al lado del jugador
        y: jugadores[0].y,      // misma altura
        width: 25,
        height: 25,
        color: "#a4f019ff",
        velocidad: 4,
        cooldown: 0
    };
}
function crearGuille() {
    return {
        x: jugadores[0].x + 90,
        y: jugadores[0].y,
        width: 32,
        height: 32,
        color: "#FF2222",
        cooldownRayo: 0,
        cooldownTijera: 0
    };
}

    // ================== ENEMIGOS ==================
    function crearUnEnemigo(ronda, forJefeInvocacion = false) {
    // En modo supervivencia, jefe cada 20 rondas y con más vida
    let esJefeSupervivencia = window.modoSupervivencia && ronda % 20 === 0 && !forJefeInvocacion;
    if ((!forJefeInvocacion && ronda === 20) || esJefeSupervivencia) {
        let jefeExtra = 0;
        if (window.modoSupervivencia) jefeExtra = Math.floor(ronda / 20 - 1);
        let vidaBase = 1000 + jefeExtra * 700;
        return {
            tipo: "jefe",
            x: 850,
            y: 100,
            width: 90,
            height: 90,
            color: "#333",
            vida: vidaBase,
            vidaMax: vidaBase,
            velX: 0,
            velY: 0,
            velocidad: 2.5,
            salto: -12,
            enElSuelo: false,
            puedeSaltar: true,
            saltosDisponibles: 1,
            disparoCooldown: 0,
            ataqueCooldown: 0,
            nombre: "Jefe Final",
            emoji: "👑"
        };
    }

        let tipo;
        let rand = Math.random();
        if (rand > 0.66) tipo = "fuerte";
        else if (rand > 0.33) tipo = "melee";
        else tipo = "normal";

        let x = 400 + Math.random() * 600;
        let y = 100;

        if (tipo === "normal") {
            return {
                tipo: "normal",
                x, y,
                width: 40,
                height: 40,
                color: "#8B0000",
                vida: 100,
                velX: 0,
                velY: 0,
                velocidad: 2 + 0.2 * (forJefeInvocacion ? 20 : ronda),
                salto: -10,
                enElSuelo: false,
                puedeSaltar: true,
                saltosDisponibles: 1,
                disparoCooldown: 0,
                invocadoPorJefe: forJefeInvocacion || false
            };
        } else if (tipo === "melee") {
            return {
                tipo: "melee",
                x, y,
                width: 42,
                height: 42,
                color: "#FF8800",
                vida: 80 + Math.floor((forJefeInvocacion ? 20 : ronda) * 5),
                velX: 0,
                velY: 0,
                velocidad: 2.5 + 0.23 * (forJefeInvocacion ? 20 : ronda),
                salto: -11,
                enElSuelo: false,
                puedeSaltar: true,
                saltosDisponibles: 1,
                atacando: false,
                ataqueCooldown: 0,
                invocadoPorJefe: forJefeInvocacion || false
            };
        } else if (tipo === "fuerte") {
            return {
                tipo: "fuerte",
                x, y,
                width: 54,
                height: 54,
                color: "#4444FF",
                vida: 200 + Math.floor((forJefeInvocacion ? 20 : ronda) * 12),
                velX: 0,
                velY: 0,
                velocidad: 1.3 + 0.1 * (forJefeInvocacion ? 20 : ronda),
                salto: -9,
                enElSuelo: false,
                puedeSaltar: true,
                saltosDisponibles: 1,
                disparoCooldown: 0,
                invocadoPorJefe: forJefeInvocacion || false
            };
        }
    }

    function crearEnemigosParaRonda(ronda) {
    // En modo supervivencia, jefe cada 20 rondas y enemigosPorRonda no se reinicia
    if ((ronda % 20 === 0 && window.modoSupervivencia) || (ronda === 20 && !window.modoSupervivencia)) {
        enemigosPorRonda = window.modoSupervivencia ? enemigosPorRonda : 1;
        return [crearUnEnemigo(ronda)];
    }
    let arr = [];
    for (let i = 0; i < enemigosPorRonda; i++) {
        arr.push(crearUnEnemigo(ronda));
    }
    return arr;
}
    let enemigos = crearEnemigosParaRonda(ronda);

    let balas = [];
    let balasEnemigas = [];
    const particulas = [];
    const teclas = {};
    const gravedad = 0.6;

    // ===== BOTÓN LLAMATIVO GENERICO =====
    function drawButton(btn, text, options = {}) {
        let gradColors = options.gradColors || ["#0FF", "#00F0A0"];
        let borderColor = options.borderColor || "#FFF";
        let shadowColor = options.shadowColor || "#00FFB4";
        let fontColor = options.fontColor || "#000";
        let fontSize = options.fontSize || 26;
        let borderWidth = options.borderWidth || 5;
        let font = options.font || "Press Start 2P";
        let hover = btn.hover;

        let grad = ctx.createLinearGradient(btn.x, btn.y, btn.x + btn.width, btn.y + btn.height);
        grad.addColorStop(0, gradColors[0]);
        grad.addColorStop(1, gradColors[1]);
        ctx.save();
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = hover ? 35 : 16;
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;

        ctx.beginPath();
        let r = 16;
        ctx.moveTo(btn.x + r, btn.y);
        ctx.lineTo(btn.x + btn.width - r, btn.y);
        ctx.quadraticCurveTo(btn.x + btn.width, btn.y, btn.x + btn.width, btn.y + r);
        ctx.lineTo(btn.x + btn.width, btn.y + btn.height - r);
        ctx.quadraticCurveTo(btn.x + btn.width, btn.y + btn.height, btn.x + btn.width - r, btn.y + btn.height);
        ctx.lineTo(btn.x + r, btn.y + btn.height);
        ctx.quadraticCurveTo(btn.x, btn.y + btn.height, btn.x, btn.y + btn.height - r);
        ctx.lineTo(btn.x, btn.y + r);
        ctx.quadraticCurveTo(btn.x, btn.y, btn.x + r, btn.y);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.font = `${fontSize}px '${font}'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 7;
        ctx.fillStyle = fontColor;
        ctx.fillText(text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 2);
        ctx.restore();
    }

    // ===== EVENTOS =====
    document.addEventListener("keydown", e => {
        if (estado === "jugando") {
            teclas[e.code] = true;
            // Lanzziano controles de ataque (solo cuerpo a cuerpo)
            if (e.code === "ArrowLeft") direccionTim = -1;
            if (e.code === "ArrowRight") direccionTim = 1;
            let multiplicador = upgradeMonedasX2 ? 2 : 1;
if (e.code === "KeyM") {
    atacandoTim = true;
    let jugador = jugadores[0];
    let alcance = 40;
    let multiplicador = upgradeMonedasX2 ? 2 : 1;
    for (let enemigo of enemigos) {
        if (enemigo.vida > 0 && distanciaAtaque(jugador, enemigo, alcance, direccionTim)) {
            enemigo.vida -= 10 * (upgradeDanio ? 2 : 1);
            if (enemigo.vida < 0) enemigo.vida = 0;
            // Suma monedas al morir
            if (enemigo.vida <= 0 && !enemigo.sueltoMoneda) {
                if (enemigo.tipo === "jefe") {
                    monedas += 50 * multiplicador;
                    monedasRecoleccionPartida += 50 * multiplicador;
                } else {
                    monedas += 1 * multiplicador;
                    monedasRecoleccionPartida += 1 * multiplicador;
                }
                enemigo.sueltoMoneda = true;
                localStorage.setItem("monedas", monedas);
            }
        }
    }
}

            // Jhoabxi controles de disparo
            if (e.code === "KeyA") direccionJhoabxi = -1;
            if (e.code === "KeyD") direccionJhoabxi = 1;
            if (e.code === "KeyF") {
                disparandoJhoabxi = true;
            }
        }
    });

    document.addEventListener("keyup", e => {
        if (estado === "jugando") {
            teclas[e.code] = false;
            if (e.code === "KeyM") atacandoTim = false;
            if (e.code === "KeyF") disparandoJhoabxi = false;
        }
    });

    canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    resetHovers();

    if (estado === "cinematica") {
        botonSaltar.hover = mx > botonSaltar.x && mx < botonSaltar.x + botonSaltar.width &&
            my > botonSaltar.y && my < botonSaltar.y + botonSaltar.height;
    } else if (estado === "derrota" || estado === "victoria") {
        botonMenu.hover = mx > botonMenu.x && mx < botonMenu.x + botonMenu.width &&
            my > botonMenu.y && my < botonMenu.y + botonMenu.height;
        botonRetry.hover = mx > botonRetry.x && mx < botonRetry.x + botonRetry.width &&
            my > botonRetry.y && my < botonRetry.y + botonRetry.height;
    } else if (estado === "menu") {
        botonJugar.hover = mx > botonJugar.x && mx < botonJugar.x + botonJugar.width &&
            my > botonJugar.y && my < botonJugar.y + botonJugar.height;
        botonTienda.hover = mx > botonTienda.x && mx < botonTienda.x + botonTienda.width &&
            my > botonTienda.y && my < botonTienda.y + botonTienda.height;
        botonMisiones.hover = mx > botonMisiones.x && mx < botonMisiones.x + botonMisiones.width &&
            my > botonMisiones.y && my < botonMisiones.y + botonMisiones.height;
        // Hover en el botón de supervivencia si está desbloqueado
        if (typeof botonSupervivencia !== 'undefined' && recordRonda >= 20) {
            botonSupervivencia.hover = mx > botonSupervivencia.x && mx < botonSupervivencia.x + botonSupervivencia.width &&
                my > botonSupervivencia.y && my < botonSupervivencia.y + botonSupervivencia.height;
        }
    } else if (estado === "misiones") {
        flechaIzqMisiones.hover = mx > flechaIzqMisiones.x && mx < flechaIzqMisiones.x + flechaIzqMisiones.width &&
            my > flechaIzqMisiones.y && my < flechaIzqMisiones.y + flechaIzqMisiones.height;
        flechaDerMisiones.hover = mx > flechaDerMisiones.x && mx < flechaDerMisiones.x + flechaDerMisiones.width &&
            my > flechaDerMisiones.y && my < flechaDerMisiones.y + flechaDerMisiones.height;
        btnSalirMisiones.hover = mx > btnSalirMisiones.x && mx < btnSalirMisiones.x + btnSalirMisiones.width &&
            my > btnSalirMisiones.y && my < btnSalirMisiones.y + btnSalirMisiones.height;

        let misionesPagina = misiones.slice(paginaMisiones * MISIONES_POR_PAGINA, (paginaMisiones + 1) * MISIONES_POR_PAGINA);
        misionesPagina.forEach(mision => {
            let btn = mision._btnReclamar;
            mision.btnReclamarHover = false;
            if (btn) {
                if (
                    mx > btn.x && mx < btn.x + btn.width &&
                    my > btn.y && my < btn.y + btn.height
                ) {
                    mision.btnReclamarHover = true;
                }
            }
        });

        // Hover en el botón de supervivencia si está desbloqueado
        if (typeof botonSupervivencia !== 'undefined' && recordRonda >= 20) {
            botonSupervivencia.hover = mx > botonSupervivencia.x && mx < botonSupervivencia.x + botonSupervivencia.width &&
                my > botonSupervivencia.y && my < botonSupervivencia.y + botonSupervivencia.height;
        }
    } else if (estado === "tienda") {
        btnCompraDanio.hover = mx > btnCompraDanio.x && mx < btnCompraDanio.x + btnCompraDanio.width &&
    my > btnCompraDanio.y && my < btnCompraDanio.y + btnCompraDanio.height;
btnCompraVelocidad.hover = mx > btnCompraVelocidad.x && mx < btnCompraVelocidad.x + btnCompraVelocidad.width &&
    my > btnCompraVelocidad.y && my < btnCompraVelocidad.y + btnCompraVelocidad.height;
btnCompraVida.hover = mx > btnCompraVida.x && mx < btnCompraVida.x + btnCompraVida.width &&
    my > btnCompraVida.y && my < btnCompraVida.y + btnCompraVida.height;
btnCompraBonkChanti.hover = mx > btnCompraBonkChanti.x && mx < btnCompraBonkChanti.x + btnCompraBonkChanti.width &&
    my > btnCompraBonkChanti.y && my < btnCompraBonkChanti.y + btnCompraBonkChanti.height;
btnCompraMonedasX2.hover = mx > btnCompraMonedasX2.x && mx < btnCompraMonedasX2.x + btnCompraMonedasX2.width &&
    my > btnCompraMonedasX2.y && my < btnCompraMonedasX2.y + btnCompraMonedasX2.height;
btnCompraArmadura.hover = mx > btnCompraArmadura.x && mx < btnCompraArmadura.x + btnCompraArmadura.width &&
    my > btnCompraArmadura.y && my < btnCompraArmadura.y + btnCompraArmadura.height;
btnCompraOtarin.hover = mx > btnCompraOtarin.x && mx < btnCompraOtarin.x + btnCompraOtarin.width &&
    my > btnCompraOtarin.y && my < btnCompraOtarin.y + btnCompraOtarin.height;
btnCompraGuille.hover = mx > btnCompraGuille.x && mx < btnCompraGuille.x + btnCompraGuille.width &&
    my > btnCompraGuille.y && my < btnCompraGuille.y + btnCompraGuille.height;
        btnSalirTienda.hover = mx > btnSalirTienda.x && mx < btnSalirTienda.x + btnSalirTienda.width &&
            my > btnSalirTienda.y && my < btnSalirTienda.y + btnSalirTienda.height;
        flechaIzq.hover = paginaTienda > 0 && mx > flechaIzq.x && mx < flechaIzq.x + flechaIzq.width &&
            my > flechaIzq.y && my < flechaIzq.y + flechaIzq.height;
        flechaDer.hover = (paginaTienda + 1) * ITEMS_POR_PAGINA < itemsTodos.length && mx > flechaDer.x && mx < flechaDer.x + flechaDer.width &&
            my > flechaDer.y && my < flechaDer.y + flechaDer.height;
        // DEPURACIÓN: log de hover
        if (btnSalirTienda.hover) {
            console.log("HOVER en SALIR");
        }
    }
});
canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    if (estado === "menu" && botonJugar.hover) {
    estado = "cinematica";
    resetHovers();
    for (let k in teclas) teclas[k] = false;
    upgradeBonkChanti = localStorage.getItem("upgradeBonkChanti") === "true";
    if (upgradeBonkChanti) bonkchanti = crearBonkChanti();
    else bonkchanti = null;
    balasCurativas = [];
    window.modoSupervivencia = false;
    iniciarCinematica();
    return;
}
// Nuevo click: SUPERVIVENCIA
if (estado === "menu" && typeof botonSupervivencia !== 'undefined' && botonSupervivencia.hover) {
    estado = "cinematica";
    resetHovers();
    for (let k in teclas) teclas[k] = false;
    upgradeBonkChanti = localStorage.getItem("upgradeBonkChanti") === "true";
    if (upgradeBonkChanti) bonkchanti = crearBonkChanti();
    else bonkchanti = null;
    balasCurativas = [];
    window.modoSupervivencia = true;
    iniciarCinematica();
    return;
}
if (estado === "menu" && botonMisiones.hover) {
    estado = "misiones";
    resetHovers();
    return;
}
if (estado === "misiones") {
    if (flechaIzqMisiones.hover && paginaMisiones > 0) {
        paginaMisiones--;
        return;
    }
    if (flechaDerMisiones.hover && (paginaMisiones + 1) * MISIONES_POR_PAGINA < misiones.length) {
        paginaMisiones++;
        return;
    }
    if (btnSalirMisiones.hover) {
        estado = "menu";
        resetHovers();
        return;
    }
    let misionesPagina = misiones.slice(paginaMisiones * MISIONES_POR_PAGINA, (paginaMisiones + 1) * MISIONES_POR_PAGINA);
    misionesPagina.forEach(mision => {
        let key = mision.nombre;
        let puedeReclamar = progresoMisiones[key] && progresoMisiones[key].completada && !progresoMisiones[key].reclamado;
        let btn = mision._btnReclamar;
        if (btn && mision.btnReclamarHover && puedeReclamar) {
            progresoMisiones[key].reclamado = true;
            monedas += mision.recompensa;
            localStorage.setItem("progresoMisiones", JSON.stringify(progresoMisiones));
            localStorage.setItem("monedas", monedas);
        }
    });
}
    else if (estado === "menu" && botonTienda.hover) {
        estado = "tienda";
        resetHovers();
        return;
    } 
    else if (estado === "cinematica" && botonSaltar.hover) {
        estado = "jugando";
        resetHovers();
        return;
    } 
    else if ((estado === "derrota" || estado === "victoria") && botonMenu.hover) {
        estado = "menu";
        jugadores = [crearJugador("Lanzziano"), crearJugador("Jhoabxi")];
ronda = 1;
enemigosPorRonda = 2;
jefeFinalDerrotado = false;
jefeInvocando = false;
enemigos = crearEnemigosParaRonda(ronda);
balas = [];
balasEnemigas = [];
ultimoTickRegeneracion = Date.now();
monedasRecoleccionPartida = 0;

// BLOQUE CORRECTO:
upgradeBonkChanti = localStorage.getItem("upgradeBonkChanti") === "true";
if (upgradeBonkChanti) bonkchanti = crearBonkChanti();
else bonkchanti = null;
balasCurativas = [];
        return;
        // SOLO AQUÍ:
        upgradeBonkChanti = localStorage.getItem("upgradeBonkChanti") === "true";
        if (upgradeBonkChanti) bonkchanti = crearBonkChanti();
       else bonkchanti = null;
       balasCurativas = [];
    } 
    else if ((estado === "derrota" || estado === "victoria") && botonRetry.hover) {
        estado = "jugando";
        jugadores = [crearJugador("Lanzziano"), crearJugador("Jhoabxi")];
ronda = 1;
enemigosPorRonda = 2;
jefeFinalDerrotado = false;
jefeInvocando = false;
enemigos = crearEnemigosParaRonda(ronda);
balas = [];
balasEnemigas = [];
ultimoTickRegeneracion = Date.now();
monedasRecoleccionPartida = 0;

// BLOQUE CORRECTO:
upgradeBonkChanti = localStorage.getItem("upgradeBonkChanti") === "true";
if (upgradeBonkChanti) bonkchanti = crearBonkChanti();
else bonkchanti = null;
balasCurativas = [];
        return;
    }
    else if (estado === "tienda") {
    // Compra DAÑO
    if (btnCompraDanio.hover && monedas >= 100 && !upgradeDanio) {
        monedas -= 300;
        upgradeDanio = true;
        localStorage.setItem("monedas", monedas);
        localStorage.setItem("upgradeDanio", "true");
        return;
    }
    // Compra VELOCIDAD
    if (btnCompraVelocidad.hover && monedas >= 100 && !upgradeVelocidad) {
        monedas -= 200;
        upgradeVelocidad = true;
        localStorage.setItem("monedas", monedas);
        localStorage.setItem("upgradeVelocidad", "true");
        return;
    }
    // Compra VIDA
    if (btnCompraVida.hover && monedas >= 200 && !upgradeVida) {
        monedas -= 500;
        upgradeVida = true;
        localStorage.setItem("monedas", monedas);
        localStorage.setItem("upgradeVida", "true");
        return;
    }
    // Compra BONKCHANTI
    if (btnCompraBonkChanti.hover && monedas >= 500 && !upgradeBonkChanti) {
        monedas -= 1250;
        upgradeBonkChanti = true;
        localStorage.setItem("monedas", monedas);
        localStorage.setItem("upgradeBonkChanti", "true");
        // Si ya estás en partida:
        if (estado === "jugando") {
            bonkchanti = crearBonkChanti();
            balasCurativas = [];
        }
        return;
    }
    // Compra X2 MONEDAS
    if (btnCompraMonedasX2.hover && monedas >= 275 && !upgradeMonedasX2) {
        monedas -= 675;
        upgradeMonedasX2 = true;
        localStorage.setItem("monedas", monedas);
        localStorage.setItem("upgradeMonedasX2", "true");
        return;
    }
    // Compra ARMADURA
    if (btnCompraArmadura.hover && monedas >= 325 && !upgradeArmadura) {
        monedas -= 800;
        upgradeArmadura = true;
        localStorage.setItem("monedas", monedas);
        localStorage.setItem("upgradeArmadura", "true");
        return;
    }
    // Compra OTARIN
if (btnCompraOtarin.hover && monedas >= 700 && !upgradeOtarin) {
    monedas -= 1850;
    upgradeOtarin = true;
    localStorage.setItem("monedas", monedas);
    localStorage.setItem("upgradeOtarin", "true");
    // Si ya estás en partida:
    if (estado === "jugando") {
        otarin = crearOtarin();
        balasHielo = [];
    }
    return;
}

// Compra GUILLE
if (btnCompraGuille.hover && monedas >= 1275 && !upgradeGuille) {
    monedas -= 2500;
    upgradeGuille = true;
    localStorage.setItem("monedas", monedas);
    localStorage.setItem("upgradeGuille", "true");
    // Si ya estás en partida:
    if (estado === "jugando") {
        guille = crearGuille();
        rayosGuille = [];
        tijerasGuille = [];
    }
    return;
}
    // Flechas de paginación
    if (flechaIzq.hover && paginaTienda > 0) {
        paginaTienda--;
        return;
    }
    if (flechaDer.hover && (paginaTienda + 1) * ITEMS_POR_PAGINA < itemsTodos.length) {
        paginaTienda++;
        return;
    }
    // Salir de la tienda
    if (btnSalirTienda.hover) {
        estado = "menu";
        resetHovers();
        setTimeout(() => {
            drawMenu();
        }, 100);
        return;
    }
}
});

    // === BLOQUE DE LA CINEMÁTICA ===
    let frases = [
        "Hace mucho tiempo, Otare era un pueblo pacífico...",
        "Hasta que fuerzas oscuras emergieron del este.",
        "Lanzziano, el dotado, decidio luchar.",
        "Con su Inseparable Amigo Jhoabxi.",
        "para salvar su pueblo sagrado",
        "¡La aventura para salvar Otare comienza ahora!"
    ];
    let index = 0;
    let tiempoPorFrase = 3000;
    let ultimaActualizacion = Date.now();
    let cinemActive = false;

    function iniciarCinematica() {
        index = 0;
        cinemActive = true;
        ultimaActualizacion = Date.now();
        loopCinematica();
    }
   function resetHovers() {
    botonJugar.hover = false;
    botonTienda.hover = false;
    botonSaltar.hover = false;
    botonMenu.hover = false;
    botonRetry.hover = false;
    btnCompraDanio.hover = false;
    btnCompraVelocidad.hover = false;
    btnCompraVida.hover = false;
    btnSalirTienda.hover = false;
}

function drawMonedasPartida() {
    // POSICIÓN (ajusta aquí la ubicación final)
    let x = canvas.width - 160; // 160px desde la derecha
    let y = 110;                // debajo de la ronda

    let w = 140;
    let h = 48;
    let r = 16; // radio esquinas

    ctx.save();

    // Sombra exterior
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 24;

    // Marco
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#FFD700";

    // Fondo degradado
    let grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "#FFF8D7");
    grad.addColorStop(1, "#FFD700");
    ctx.fillStyle = grad;

    // Dibuja cartel redondeado
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Texto de monedas
    ctx.font = "bold 28px 'Press Start 2P'";
    ctx.fillStyle = "#B8860B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#FFF";
    ctx.shadowBlur = 6;
    ctx.fillText("🪙 " + monedas, x + w/2, y + h/2 + 2);

    ctx.restore();
}
    function mostrarFraseCinematica() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0FF";
        ctx.font = "20px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(frases[index], canvas.width / 2, canvas.height / 2);

        drawButton(
            botonSaltar,
            "SALTAR",
            {
                gradColors: botonSaltar.hover ? ["#00FF00", "#FFFF00"] : ["#BBFF00", "#0F0"],
                borderColor: "#FFF",
                shadowColor: botonSaltar.hover ? "#00FF00" : "#0F0",
                fontColor: "#222",
                fontSize: 23
            }
        );
    }

    function loopCinematica() {
        if (estado !== "cinematica") {
            cinemActive = false;
            return;
        }
        let ahora = Date.now();
        if (ahora - ultimaActualizacion > tiempoPorFrase) {
            index++;
            ultimaActualizacion = ahora;
        }

        if (index < frases.length) {
            mostrarFraseCinematica();
            requestAnimationFrame(loopCinematica);
        } else {
            estado = "jugando";
            cinemActive = false;
        }
    }

    // ===== FUNCIONES DE UTILIDAD =====
    function colisiona(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    function distancia(a, b) {
        let dx = (a.x + a.width / 2) - (b.x + b.width / 2);
        let dy = (a.y + a.height / 2) - (b.y + b.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }

    function enemigoMasCercano(px, py) {
        let menor = Infinity, obj = null;
        for (let enemigo of enemigos) {
            if (enemigo.vida > 0) {
                let d = Math.sqrt((enemigo.x + enemigo.width / 2 - px) ** 2 + (enemigo.y + enemigo.height / 2 - py) ** 2);
                if (d < menor) {
                    menor = d;
                    obj = enemigo;
                }
            }
        }
        return obj;
    }

    function distanciaAtaque(jugador, enemigo, alcance, direccion) {
        let ataque;
        if (direccion === 1) {
            ataque = {
                x: jugador.x + jugador.width,
                y: jugador.y + 10,
                width: alcance,
                height: 20
            };
        } else {
            ataque = {
                x: jugador.x - alcance,
                y: jugador.y + 10,
                width: alcance,
                height: 20
            };
        }
        return colisiona(ataque, enemigo);
    }
    function distanciaAtaqueMelee(enemigo, jugador) {
        let alcance = 32;
        let rect = {
            x: enemigo.x + (enemigo.velX >= 0 ? enemigo.width : -alcance),
            y: enemigo.y + 10,
            width: alcance,
            height: 22
        };
        return colisiona(rect, jugador);
    }

    function generarParticulas(x, y, color) {
        for (let i = 0; i < 5; i++) {
            particulas.push({
                x: x + Math.random() * 10 - 5,
                y: y + Math.random() * 5,
                size: 3 + Math.random() * 3,
                color: color,
                vida: 30 + Math.random() * 20,
                velX: (Math.random() - 0.5) * 1.5,
                velY: -Math.random() * 1.5,
                gravedad: 0.1
            });
        }
    }

    // ======== ENEMIGOS: SEGUIMIENTO, GRAVEDAD, SALTO, DISPARO, MELEE ========
    function actualizarEnemigos() {
    let jefe = null;
    for (let enemigo of enemigos) {
        // ---- Si está congelado, lo bloquea ----
        if (enemigo.congelado && enemigo.vida > 0) {
            enemigo.congelado--;
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = "#6AEAFF";
            ctx.fillRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);
            ctx.restore();
            enemigo.velX = 0;
            enemigo.velY = 0;
            continue;
        }
            if (enemigo.vida <= 0) continue;

            // Busca el jugador más cercano
            let target = jugadores[0];
            let minDist = distancia(enemigo, jugadores[0]);
            for (let i = 1; i < jugadores.length; i++) {
                if (jugadores[i].vida > 0) {
                    let d = distancia(enemigo, jugadores[i]);
                    if (d < minDist) {
                        minDist = d;
                        target = jugadores[i];
                    }
                }
            }

            if (enemigo.tipo === "normal" || enemigo.tipo === "jefe") {
                if (target.x > enemigo.x + enemigo.width) {
                    enemigo.velX = enemigo.velocidad;
                } else if (target.x + target.width < enemigo.x) {
                    enemigo.velX = -enemigo.velocidad;
                } else {
                    enemigo.velX = 0;
                }
            } else {
                if (target.x > enemigo.x + enemigo.width) {
                    enemigo.velX = enemigo.velocidad;
                } else if (target.x + target.width < enemigo.x) {
                    enemigo.velX = -enemigo.velocidad;
                } else {
                    enemigo.velX = 0;
                }
            }

            if (target.y + target.height < enemigo.y && enemigo.enElSuelo && enemigo.puedeSaltar && enemigo.saltosDisponibles > 0) {
                enemigo.velY = enemigo.salto;
                enemigo.puedeSaltar = false;
                enemigo.saltosDisponibles--;
            }

            enemigo.velY += gravedad;
            enemigo.x += enemigo.velX;
            enemigo.y += enemigo.velY;
            enemigo.enElSuelo = false;

            if (colisiona(enemigo, suelo)) {
                enemigo.y = suelo.y - enemigo.height;
                enemigo.velY = 0;
                enemigo.enElSuelo = true;
                enemigo.saltosDisponibles = 1;
                enemigo.puedeSaltar = true;
            }
            for (let plataforma of plataformas) {
                if (colisiona(enemigo, plataforma)) {
                    if (enemigo.velY > 0 && enemigo.y + enemigo.height - enemigo.velY <= plataforma.y) {
                        enemigo.y = plataforma.y - enemigo.height;
                        enemigo.velY = 0;
                        enemigo.enElSuelo = true;
                        enemigo.saltosDisponibles = 1;
                        enemigo.puedeSaltar = true;
                    }
                }
            }

            // ----- Disparo y Melee -----
            if (enemigo.tipo === "normal" || enemigo.tipo === "fuerte" || enemigo.tipo === "jefe") {
                if (enemigo.disparoCooldown > 0) enemigo.disparoCooldown--;
                let distanciaJugador = distancia(enemigo, target);
                let puedeDisparar = enemigo.tipo === "normal" ? distanciaJugador < 400 : distanciaJugador < 500;
                if (enemigo.tipo === "jefe") puedeDisparar = distanciaJugador < 700;
                if (puedeDisparar && enemigo.disparoCooldown === 0) {
    let dx = (target.x + target.width / 2) - (enemigo.x + enemigo.width / 2);
    let dy = (target.y + target.height / 2) - (enemigo.y + enemigo.height / 2);
    let dist = Math.sqrt(dx * dx + dy * dy);
    let velocidad = enemigo.tipo === "normal" ? 6 : 4.2;
    if (enemigo.tipo === "jefe") velocidad = 7;
    let radio = enemigo.tipo === "fuerte" ? 12 : 6;
    if (enemigo.tipo === "jefe") radio = 18;
    let color = enemigo.tipo === "fuerte" ? "#00D0FF" : "#FF5050";
    if (enemigo.tipo === "jefe") color = "#FFD700";
    let vx = (dx / dist) * velocidad;
    let vy = (dy / dist) * velocidad;
    balasEnemigas.push({
        x: enemigo.x + enemigo.width / 2,
        y: enemigo.y + enemigo.height / 2,
        vx: vx,
        vy: vy,
        radio: radio,
        color: color,
        jefe: enemigo.tipo === "jefe"
    });

    // CORRECCIÓN: El jefe SIEMPRE debe tener cooldown!
    if (enemigo.tipo === "fuerte") {
        enemigo.disparoCooldown = 105 + Math.floor(Math.random() * 50);
    } else if (enemigo.tipo === "jefe") {
        // En supervivencia, haz el cooldown más corto pero nunca cero
        if (window.modoSupervivencia) {
            enemigo.disparoCooldown = 28 + Math.floor(Math.random() * 22);
        } else {
            enemigo.disparoCooldown = 45 + Math.floor(Math.random() * 28);
        }
    } else {
        enemigo.disparoCooldown = 80 + Math.floor(Math.random() * 40);
    }
}
            }
            if (enemigo.tipo === "melee" || enemigo.tipo === "jefe") {
                if (enemigo.ataqueCooldown > 0) enemigo.ataqueCooldown--;
                if (distanciaAtaqueMelee(enemigo, target) && enemigo.ataqueCooldown === 0) {
    let reducir = upgradeArmadura ? 0.5 : 1;
    target.vida -= (enemigo.tipo === "jefe" ? 18 : 10) * reducir;
    if (target.vida < 0) target.vida = 0;
    enemigo.ataqueCooldown = enemigo.tipo === "jefe" ? 35 : 55;
}
            }

            if (enemigo.tipo === "jefe" && enemigo.vida <= 500 && enemigo.vida > 0) {
                jefe = enemigo;
            }
        }

        if (jefe && estado === "jugando") {
            let ahora = Date.now();
            let invocadosVivos = 0;
            for (let e of enemigos) {
                if (e.invocadoPorJefe && e.vida > 0) {
                    invocadosVivos++;
                }
            }
            if (!jefeInvocando) {
                jefeInvocando = true;
                jefeUltimaInvocacion = ahora;
            }
            if (invocadosVivos < JEFE_MAX_INVOCADOS && (ahora - jefeUltimaInvocacion >= JEFE_INTERVALO_INVOCACION)) {
                let invocado = crearUnEnemigo(20, true);
                invocado.x = jefe.x + (Math.random() < 0.5 ? -70 : 120);
                if (invocado.x < 0) invocado.x = 0;
                if (invocado.x > suelo.width - invocado.width) invocado.x = suelo.width - invocado.width;
                enemigos.push(invocado);
                jefeUltimaInvocacion = ahora;
            }
        } else {
            jefeInvocando = false;
        }
    }

    function actualizarBalasEnemigas() {
        for (let i = balasEnemigas.length - 1; i >= 0; i--) {
            let bala = balasEnemigas[i];
            bala.x += bala.vx;
            bala.y += bala.vy;

            let hit = false;
            for (let j = 0; j < jugadores.length; j++) {
                let jugador = jugadores[j];
                let balaRect = { x: bala.x - bala.radio, y: bala.y - bala.radio, width: bala.radio * 2, height: bala.radio * 2 };
                if (colisiona(balaRect, jugador) && jugador.vida > 0) {
    let reducir = upgradeArmadura ? 0.5 : 1;
    if (bala.jefe) {
        jugador.vida -= 18 * reducir;
    } else {
        jugador.vida -= (bala.color === "#00D0FF" ? 18 : 10) * reducir;
    }
    if (jugador.vida < 0) jugador.vida = 0;
    balasEnemigas.splice(i, 1);
    hit = true;
    break;
}
            }
            if (hit) continue;
            if (bala.x < 0 || bala.x > suelo.width || bala.y < 0 || bala.y > canvas.height) {
                balasEnemigas.splice(i, 1);
            }
        }
    }

    function avanzarRonda() {
    if (!window.modoSupervivencia) {
        if (ronda === 20) {
            jefeFinalDerrotado = true;
            estado = "victoria";
            if (ronda > recordRonda) {
                recordRonda = ronda;
                localStorage.setItem("recordRonda", recordRonda);
            }
            return;
        }
    }
    ronda++;
    enemigosPorRonda++;
    enemigos = crearEnemigosParaRonda(ronda);
    balas = [];
    balasEnemigas = [];
}
    function actualizarBalas() {
    let multiplicador = upgradeMonedasX2 ? 2 : 1;
    for (let i = balas.length - 1; i >= 0; i--) {
        let bala = balas[i];
        bala.x += bala.vx;
        bala.y += bala.vy;

        let impact = false;
        for (let j = 0; j < enemigos.length; j++) {
            let enemigo = enemigos[j];
            if (enemigo.vida > 0) {
                let rect = { x: enemigo.x, y: enemigo.y, width: enemigo.width, height: enemigo.height };
                let balaRect = { x: bala.x - bala.radio, y: bala.y - bala.radio, width: bala.radio * 2, height: bala.radio * 2 };
                if (colisiona(balaRect, rect)) {
                    enemigo.vida -= (bala.danio || 10) * (upgradeDanio ? 2 : 1);
                    if (enemigo.vida < 0) enemigo.vida = 0;

                    // Suma monedas al morir
                    if (enemigo.vida <= 0 && !enemigo.sueltoMoneda) {
                        if (enemigo.tipo === "jefe") {
                            monedas += 50 * multiplicador;
                            monedasRecoleccionPartida += 50 * multiplicador;
                        } else {
                            monedas += 1 * multiplicador;
                            monedasRecoleccionPartida += 1 * multiplicador;
                        }
                        enemigo.sueltoMoneda = true;
                        localStorage.setItem("monedas", monedas);
                    }

                    balas.splice(i, 1);
                    impact = true;
                    break;
                }
            }
        }
        if (impact) continue;
        // Si la bala sale del canvas, se elimina
        if (bala.x < 0 || bala.x > suelo.width || bala.y < 0 || bala.y > canvas.height) {
            balas.splice(i, 1);
        }
    }
}

    function actualizarJugador(jugador, idx) {
        let moviendose = false;

        if (teclas[jugador.izquierda]) {
            jugador.velX = -jugador.velocidad;
            moviendose = true;
        } else if (teclas[jugador.derecha]) {
            jugador.velX = jugador.velocidad;
            moviendose = true;
        } else {
            jugador.velX = 0;
        }

        if (teclas[jugador.saltar]) {
            if (jugador.puedeSaltar && jugador.saltosDisponibles > 0) {
                jugador.velY = jugador.salto;
                jugador.puedeSaltar = false;
                jugador.saltosDisponibles--;
            }
        } else {
            jugador.puedeSaltar = true;
        }

        jugador.velY += gravedad;
        jugador.x += jugador.velX;
        jugador.y += jugador.velY;
        jugador.enElSuelo = false;

        if (jugador.x < 0) jugador.x = 0;
        if (jugador.x + jugador.width > suelo.width) jugador.x = suelo.width - jugador.width;

        if (colisiona(jugador, suelo)) {
            jugador.y = suelo.y - jugador.height;
            jugador.velY = 0;
            jugador.enElSuelo = true;
            jugador.saltosDisponibles = 2;
        }

        for (let plataforma of plataformas) {
            if (colisiona(jugador, plataforma)) {
                if (jugador.velY > 0 && jugador.y + jugador.height - jugador.velY <= plataforma.y) {
                    jugador.y = plataforma.y - jugador.height;
                    jugador.velY = 0;
                    jugador.enElSuelo = true;
                    jugador.saltosDisponibles = 2;
                }
            }
        }

        if (jugador.y + jugador.height > canvas.height) {
            jugador.y = suelo.y - jugador.height;
            jugador.velY = 0;
            jugador.enElSuelo = true;
            jugador.saltosDisponibles = 2;
        }

        if (moviendose && jugador.enElSuelo) {
            let superficieColor = suelo.color;
            for (let p of plataformas) {
                if (
                    jugador.x + jugador.width > p.x &&
                    jugador.x < p.x + p.width &&
                    jugador.y + jugador.height >= p.y &&
                    jugador.y + jugador.height <= p.y + 10
                ) {
                    superficieColor = p.color;
                    break;
                }
            }
            generarParticulas(jugador.x + jugador.width / 2, jugador.y + jugador.height, superficieColor);
        }

        // Solo Jhoabxi dispara balas autodirigidas
        if (jugador.nombre === "Jhoabxi") {
            if (jugador.balaCooldown > 0) jugador.balaCooldown--;
            if (disparandoJhoabxi && jugador.balaCooldown === 0) {
                let enemigo = enemigoMasCercano(jugador.x + jugador.width / 2, jugador.y + jugador.height / 2);
                if (enemigo) {
                    let ox = jugador.x + jugador.width / 2;
                    let oy = jugador.y + jugador.height / 2;
                    let ex = enemigo.x + enemigo.width / 2;
                    let ey = enemigo.y + enemigo.height / 2;
                    let dx = ex - ox, dy = ey - oy;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    let vel = 9;
                    balas.push({
                        x: ox,
                        y: oy,
                        vx: (dx / dist) * vel,
                        vy: (dy / dist) * vel,
                        radio: 9,
                        color: "#003366",
                        danio: 20
                    });
                    jugador.balaCooldown = 15;
                }
            }
        }
    }

    function drawVidaJugador(jugador, offsetY = 0) {
        ctx.save();
        ctx.shadowColor = "#FF0";
        ctx.shadowBlur = 18;
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#FFF";
        ctx.strokeRect(28, 28 + offsetY, 304, 34);

        const fondo = ctx.createLinearGradient(30, 30 + offsetY, 330, 60 + offsetY);
        fondo.addColorStop(0, "#333");
        fondo.addColorStop(1, "#111");
        ctx.fillStyle = fondo;
        ctx.fillRect(30, 30 + offsetY, 300, 30);

        let grad = ctx.createLinearGradient(30, 30 + offsetY, 330, 60 + offsetY);
        if (jugador.vida / jugador.vidaMax > 0.5) {
            grad.addColorStop(0, "#11FF44");
            grad.addColorStop(1, "#FFFF00");
        } else {
            grad.addColorStop(0, "#FF5500");
            grad.addColorStop(1, "#FF0000");
        }
        let ancho = Math.max(0, (jugador.vida / jugador.vidaMax) * 300);
        ctx.fillStyle = grad;
        ctx.fillRect(30, 30 + offsetY, ancho, 30);

        ctx.shadowColor = "#000";
        ctx.shadowBlur = 6;
        ctx.fillStyle = "#FFF";
        ctx.font = "20px 'Press Start 2P'";
        ctx.textAlign = "left";
        ctx.fillText(
            "VIDA " + jugador.nombre + ": " + Math.floor(jugador.vida) + " / " + jugador.vidaMax,
            40,
            53 + offsetY
        );

        ctx.restore();
    }

    function drawRonda() {
    ctx.save();
    ctx.shadowColor = "#00FFFF";
    ctx.shadowBlur = 16;
    ctx.lineJoin = "round";
    ctx.lineWidth = 6;

    let x = canvas.width - 270, y = 24, w = 220, h = 52, r = 16;
    ctx.strokeStyle = "#00FFF0";
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();

    let grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "#2222AA");
    grad.addColorStop(0.5, "#00FFFF");
    grad.addColorStop(1, "#2222AA");
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.shadowColor = "#000";
    ctx.shadowBlur = 7;
    ctx.textAlign = "center";

    if (ronda === 20) {
        // TROFEO CON CORONA
        ctx.font = "28px 'Press Start 2P', Arial, sans-serif";
        ctx.fillStyle = "#FFD700";
        ctx.fillText("👑", x + w / 2, y + h / 2 - 6);
        ctx.font = "32px 'Press Start 2P', Arial, sans-serif";
        ctx.fillText("🏆", x + w / 2, y + h / 2 + 27);
    } else {
        ctx.fillStyle = "#fff";
        ctx.font = "26px 'Press Start 2P'";
        ctx.fillText("RONDA " + ronda, x + w / 2, y + h / 2 + 10);
    }

    ctx.restore();
}




    function drawDerrota() {
    // Fondo gradiente oscuro/rojo
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#270B0B");
    grad.addColorStop(1, "#1a1418");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glow de derrota
    ctx.save();
    ctx.font = "65px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.shadowColor = "#e74c3c";
    ctx.shadowBlur = 32;
    ctx.fillStyle = "#e74c3c";
    ctx.globalAlpha = 0.98;
    ctx.fillText("¡DERROTA!", canvas.width / 2, canvas.height / 2 - 80);
    ctx.restore();

    // Monedas recolectadas
    ctx.save();
    ctx.font = "28px 'Press Start 2P'";
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 18;
    ctx.globalAlpha = 1;
    ctx.fillText("🪙 Monedas: " + monedasRecoleccionPartida, canvas.width / 2, canvas.height / 2 - 22);
    ctx.restore();

    // Botón MENÚ
    drawButton(
        botonMenu,
        "MENÚ",
        {
            gradColors: botonMenu.hover ? ["#00FF00", "#FFD700"] : ["#FFD700", "#00FF00"],
            borderColor: "#FFF",
            shadowColor: "#00FF00",
            fontColor: "#222",
            fontSize: 26
        }
    );

    // Botón VOLVER A LA BATALLA
    drawButton(
        botonRetry,
        "VOLVER A LA BATALLA",
        {
            gradColors: botonRetry.hover ? ["#00BFFF", "#FFD700"] : ["#FFD700", "#00BFFF"],
            borderColor: "#FFF",
            shadowColor: "#00BFFF",
            fontColor: "#000",
            fontSize: 19
        }
    );
}

    function drawVictoria() {
    // Fondo gradiente alegre/épico para victoria
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#f9dd6d");
    grad.addColorStop(0.5, "#ffe9a9");
    grad.addColorStop(1, "#fff7e0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glow de victoria
    ctx.save();
    ctx.font = "68px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 38;
    ctx.fillStyle = "#FFD700";
    ctx.fillText("¡VICTORIA!", canvas.width / 2, canvas.height / 2 - 110);
    ctx.restore();

    // Mensaje de victoria
    ctx.save();
    ctx.font = "28px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.shadowColor = "#333";
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#333";
    ctx.fillText("Has vencido al jefe y salvado Otare,", canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText("¡Felicidades!", canvas.width / 2, canvas.height / 2 + 15);
    ctx.restore();

    // Monedas recolectadas
    ctx.save();
    ctx.font = "24px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 10;
    ctx.fillText("🪙 Monedas: " + monedasRecoleccionPartida, canvas.width / 2, canvas.height / 2 + 65);
    ctx.restore();

    // Botón MENÚ (solo ese)
    drawButton(
        botonMenu,
        "MENÚ",
        {
            gradColors: botonMenu.hover ? ["#00FF00", "#FFD700"] : ["#FFD700", "#00FF00"],
            borderColor: "#FFF",
            shadowColor: "#00FF00",
            fontColor: "#222",
            fontSize: 28
        }
    );
}

    function drawParticulas() {
        for (let i = particulas.length - 1; i >= 0; i--) {
            let p = particulas[i];
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.vida / 50;
            ctx.fillRect(p.x - camaraX, p.y, p.size, p.size);
            ctx.globalAlpha = 1;

            p.x += p.velX;
            p.y += p.velY;
            p.velY += p.gravedad;

            p.vida--;
            if (p.vida <= 0) particulas.splice(i, 1);
        }
    }
// --- Sol radiante a la derecha, fijo ---
function drawSunRight() {
    // El sol SIEMPRE a la derecha (en el cielo), sin importar la cámara
    const sunX = canvas.width - 90;
    const sunY = 80;
    const sunRadius = 55;
    ctx.save();
    // Rayos animados
    for (let i = 0; i < 16; i++) {
        let angle = (i / 16) * 2 * Math.PI;
        let r1 = sunRadius + 5;
        let r2 = sunRadius + 34 + Math.sin(Date.now()/400+i)*8;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(angle) * r1, sunY + Math.sin(angle) * r1);
        ctx.lineTo(sunX + Math.cos(angle) * r2, sunY + Math.sin(angle) * r2);
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 7;
        ctx.globalAlpha = 0.28;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Sol central gradiente
    let grad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius);
    grad.addColorStop(0, "#FFF200");
    grad.addColorStop(0.4, "#FFD700");
    grad.addColorStop(1, "#FFB600");
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 28;
    ctx.fill();
    ctx.restore();
}

// --- Nubes grandes y distribuidas ---
function drawCloud(x, y, width, height, color1 = "#fff", color2 = "#d9f4ff") {
    ctx.save();
    let grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x + width * 0.35, y + height * 0.5, width * 0.35, height * 0.32, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.7, y + height * 0.55, width * 0.22, height * 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.55, y + height * 0.35, width * 0.25, height * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.48, y + height * 0.75, width * 0.28, height * 0.18, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.shadowColor = "#CDEAF7";
    ctx.shadowBlur = 12;
    ctx.globalAlpha = 0.93;
    ctx.fill();
    ctx.restore();
}
// --- Montañas de fondo ---
function drawMountains() {
    ctx.save();
    // Montaña lejana
    ctx.beginPath();
    ctx.moveTo(0, 280);
    ctx.lineTo(140, 160);
    ctx.lineTo(310, 260);
    ctx.lineTo(420, 155);
    ctx.lineTo(580, 270);
    ctx.lineTo(760, 190);
    ctx.lineTo(960, 320);
    ctx.lineTo(960, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    let grad = ctx.createLinearGradient(0, 190, 0, 350);
    grad.addColorStop(0, "#d3eafc");
    grad.addColorStop(1, "#a1bedc");
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.48;
    ctx.fill();
    ctx.restore();

    // Montaña cercana
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(170, 220);
    ctx.lineTo(380, 340);
    ctx.lineTo(480, 210);
    ctx.lineTo(630, 330);
    ctx.lineTo(760, 250);
    ctx.lineTo(960, 410);
    ctx.lineTo(960, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    let grad2 = ctx.createLinearGradient(0, 230, 0, 480);
    grad2.addColorStop(0, "#97c8a2");
    grad2.addColorStop(1, "#57a37e");
    ctx.fillStyle = grad2;
    ctx.globalAlpha = 0.52;
    ctx.fill();
    ctx.restore();
}
// --- Árboles y arbustos alineados con el suelo ---
function drawTree(x, sueloY) {
    ctx.save();
    // Tronco
    ctx.fillStyle = "#a86026";
    ctx.fillRect(x + 18, sueloY - 65, 15, 40);
    // Copa
    ctx.beginPath();
    ctx.arc(x + 26, sueloY - 75, 28, 0, Math.PI * 2);
    let grad = ctx.createRadialGradient(x + 26, sueloY - 75, 10, x + 26, sueloY - 75, 28);
    grad.addColorStop(0, "#b9ff9e");
    grad.addColorStop(0.6, "#53be1c");
    grad.addColorStop(1, "#2e7e21");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#53be1c";
    ctx.shadowBlur = 14;
    ctx.globalAlpha = 0.97;
    ctx.fill();
    ctx.restore();
}

function drawBush(x, sueloY) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + 32, sueloY - 18, 32, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 18, sueloY - 10, 18, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 48, sueloY - 12, 18, 10, 0, 0, Math.PI * 2);
    ctx.closePath();
    let grad = ctx.createLinearGradient(x, sueloY - 20, x, sueloY);
    grad.addColorStop(0, "#cfffa2");
    grad.addColorStop(1, "#4ea25b");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#a0f34e";
    ctx.shadowBlur = 13;
    ctx.globalAlpha = 0.94;
    ctx.fill();
    ctx.restore();
}

// --- Flores ---
function drawFlowers(drawStart, drawEnd, sueloY, sueloHeight) {
    ctx.save();
    for (let i = drawStart; i < drawEnd; i += 45) {
        let x = i + 10 + Math.sin(i/60 + Date.now()/600) * 7;
        let y = sueloY + sueloHeight - 9;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = ["#f7e1fa","#f9f7ae","#a1e6f7","#ffb3c6","#b3ffae"][Math.floor((i/45)%5)];
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 7;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
    ctx.restore();
}

    // --- Nueva función drawBackground ---
function drawBackground() {
    // Fondo cielo gradiente
    let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, "#AEEFFF");
    skyGrad.addColorStop(0.6, "#87CEEB");
    skyGrad.addColorStop(1, "#EAF6FF");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Montañas Mejoradas
    drawMountains();

    // Sol SIEMPRE a la derecha del canvas
    drawSunRight();

    // Nubes grandes distribuidas por todo el mapa
    // Genera varias nubes a lo largo del mapa
    let nubeAnchura = [240, 200, 180, 220, 300];
    let nubeAltura = [90, 60, 80, 100, 75];
    let nubesCount = Math.ceil(suelo.width / 400);
    for (let i = 0; i < nubesCount; i++) {
        let x = i * 400 - camaraX * 0.5;
        let y = 40 + (i % 2) * 65;
        let w = nubeAnchura[i % nubeAnchura.length];
        let h = nubeAltura[i % nubeAltura.length];
        if (x + w > 0 && x < canvas.width) {
            drawCloud(x, y, w, h);
        }
    }

    // Suelo (¡SIEMPRE desde x=0 hasta canvas.width! Solo píntalo SIEMPRE, aunque el suelo termine antes)
    ctx.fillStyle = suelo.color;
    let sueloEdge = suelo.x + suelo.width - camaraX;
    let sueloDrawStart = Math.max(0, suelo.x - camaraX);
    let sueloDrawEnd = Math.min(sueloEdge, canvas.width);
    if (sueloDrawStart < canvas.width) {
        ctx.fillRect(sueloDrawStart, suelo.y, Math.max(0, sueloDrawEnd - sueloDrawStart), suelo.height);
    }

    // Árboles y arbustos alineados con el suelo, repartidos por el mapa
    let sueloY = suelo.y;
    let arbolInterval = 500;
    for (let i = 0; i < suelo.width; i += arbolInterval) {
        let arbolX = i - camaraX;
        if (arbolX > -50 && arbolX < canvas.width + 50) {
            drawTree(arbolX, sueloY);
        }
    }
    let arbustoInterval = 370;
    for (let i = 200; i < suelo.width; i += arbustoInterval) {
        let arbustoX = i - camaraX;
        if (arbustoX > -60 && arbustoX < canvas.width + 60) {
            drawBush(arbustoX, sueloY);
        }
    }

    // Flores sobre el suelo
    drawFlowers(sueloDrawStart, sueloDrawEnd, sueloY, suelo.height);

    // Plataformas (solo si visibles)
    for (let plataforma of plataformas) {
        let platX = plataforma.x - camaraX;
        if (platX + plataforma.width > 0 && platX < canvas.width) {
            ctx.fillStyle = plataforma.color;
            ctx.fillRect(platX, plataforma.y, plataforma.width, plataforma.height);
        }
    }
}
    function drawJugadores() {
    ctx.font = "10px 'Press Start 2P'";
    ctx.textAlign = "center";
    for (let jugador of jugadores) {
        if (upgradeArmadura) {
            ctx.save();
            ctx.shadowColor = "#949191ff";
            ctx.shadowBlur = 30;
        }
        ctx.fillStyle = jugador.color;
        ctx.fillRect(jugador.x - camaraX, jugador.y, jugador.width, jugador.height);
        ctx.fillText(jugador.nombre, jugador.x - camaraX + jugador.width / 2, jugador.y - 10);

        if (jugador.nombre === "Lanzziano" && atacandoTim) {
            ctx.fillStyle = "#FFFF66";
            if (direccionTim === 1) {
                ctx.fillRect(jugador.x - camaraX + jugador.width, jugador.y + 10, 40, 20);
            } else {
                ctx.fillRect(jugador.x - camaraX - 40, jugador.y + 10, 40, 20);
            }
        }
        if (upgradeArmadura) ctx.restore();
    }
}

    function drawEnemigos() {
        for (let enemigo of enemigos) {
            if (enemigo.vida > 0) {
                if (enemigo.tipo === "normal") {
                    ctx.fillStyle = "#8B0000";
                    ctx.fillRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);
                    ctx.strokeStyle = "#FFDDDD";
                    ctx.lineWidth = 2.5;
                    ctx.strokeRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);
                } else if (enemigo.tipo === "melee") {
                    ctx.fillStyle = "#FF8800";
                    ctx.fillRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);
                    ctx.strokeStyle = "#FFF000";
                    ctx.lineWidth = 3.5;
                    ctx.strokeRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);
                    if (enemigo.ataqueCooldown > 35) {
                        ctx.fillStyle = "#FFFF66";
                        let puñoX = enemigo.velX >= 0
                            ? enemigo.x - camaraX + enemigo.width
                            : enemigo.x - camaraX - 30;
                        ctx.fillRect(puñoX, enemigo.y + 14, 30, 16);
                    }
                } else if (enemigo.tipo === "fuerte") {
                    let grad = ctx.createLinearGradient(enemigo.x - camaraX, enemigo.y, enemigo.x - camaraX + enemigo.width, enemigo.y + enemigo.height);
                    grad.addColorStop(0, "#00D0FF");
                    grad.addColorStop(1, "#6A00FF");
                    ctx.fillStyle = grad;
                    ctx.fillRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);
                    ctx.strokeStyle = "#FFF";
                    ctx.lineWidth = 4;
                    ctx.strokeRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);
                } else if (enemigo.tipo === "jefe") {
                    let grad = ctx.createRadialGradient(
                        enemigo.x - camaraX + enemigo.width / 2, enemigo.y + enemigo.height / 2, enemigo.width / 4,
                        enemigo.x - camaraX + enemigo.width / 2, enemigo.y + enemigo.height / 2, enemigo.width / 1.1
                    );
                    grad.addColorStop(0, "#FFD700");
                    grad.addColorStop(0.5, "#FF6600");
                    grad.addColorStop(1, "#333");
                    ctx.fillStyle = grad;
                    ctx.fillRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);
                    ctx.strokeStyle = "#FFF";
                    ctx.lineWidth = 6;
                    ctx.strokeRect(enemigo.x - camaraX, enemigo.y, enemigo.width, enemigo.height);

                    ctx.font = "40px 'Press Start 2P'";
                    ctx.fillStyle = "#FFD700";
                    ctx.textAlign = "center";
                    ctx.fillText("👑", enemigo.x - camaraX + enemigo.width / 2, enemigo.y - 10);
                }
                ctx.font = "18px 'Press Start 2P'";
                ctx.fillStyle = "#000";
                ctx.textAlign = "center";
                ctx.fillText(
                    enemigo.tipo === "jefe"
                        ? "JEFE FINAL"
                        : enemigo.tipo.toUpperCase(),
                    enemigo.x - camaraX + enemigo.width / 2,
                    enemigo.y - 30
                );
                ctx.font = "12px 'Press Start 2P'";
                ctx.fillStyle = "#000";
                ctx.textAlign = "center";
                ctx.fillText("HP: " + enemigo.vida, enemigo.x - camaraX + enemigo.width / 2, enemigo.y - 10);
                if (enemigo.congelado > 0) {
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#6AEAFF";
    ctx.fillText("CONGELADO", enemigo.x - camaraX + enemigo.width / 2, enemigo.y - 24);
}

                if (enemigo.tipo === "melee") {
                    ctx.font = "18px 'Press Start 2P'";
                    ctx.fillStyle = "#FFD700";
                    ctx.fillText("🥊", enemigo.x - camaraX + enemigo.width / 2, enemigo.y - 20);
                }
                if (enemigo.tipo === "fuerte") {
                    ctx.font = "18px 'Press Start 2P'";
                    ctx.fillStyle = "#00F0FF";
                    ctx.fillText("💪", enemigo.x - camaraX + enemigo.width / 2, enemigo.y - 20);
                }
            }
        }
    }

    function drawBalas() {
        for (let i = 0; i < balas.length; i++) {
            let bala = balas[i];
            ctx.save();
            ctx.beginPath();
            ctx.arc(bala.x - camaraX, bala.y, bala.radio, 0, Math.PI * 2);
            ctx.fillStyle = bala.color || "#003366";
            ctx.globalAlpha = 0.94;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FFF";
            ctx.stroke();
            ctx.restore();
        }
    }

    function drawBalasEnemigas() {
        for (let bala of balasEnemigas) {
            ctx.fillStyle = bala.color || "#FF5050";
            ctx.beginPath();
            ctx.arc(bala.x - camaraX, bala.y, bala.radio, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = bala.color === "#00D0FF" ? 3 : 1.5;
            ctx.strokeStyle = bala.color === "#00D0FF" ? "#FFF" : "#333";
            if (bala.jefe) {
                ctx.strokeStyle = "#FFD700";
                ctx.lineWidth = 4;
            }
            ctx.stroke();
        }
    }

   function drawMenu() {
    // Fondo gradiente moderno
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#182244");
    grad.addColorStop(1, "#10121B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título con glow
    ctx.save();
    ctx.font = "62px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.shadowColor = "#00FFF0";
    ctx.shadowBlur = 32;
    ctx.fillStyle = "#0FF";
    ctx.fillText("Salvando Otare", canvas.width / 2, 110);
    ctx.restore();

    // Récord destacado
    ctx.save();
    ctx.font = "30px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 20;
    ctx.fillText("RÉCORD DE RONDA: " + recordRonda, canvas.width / 2, 190);
    ctx.restore();

    // Instrucciones y controles, ahora 100% centrado y con espacios agradables
    ctx.save();
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.font = "18px 'Press Start 2P'";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Controla a Lanzziano (flechas + F) y Jhoabxi (WASD + M)", canvas.width / 2, 250);
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#0FF";
    ctx.fillText("Lanzziano: ← → para moverse, ↑ para saltar, F para atacar.", canvas.width / 2, 281);
    ctx.fillStyle = "#FFD700";
    ctx.fillText("Jhoabxi: A D para moverse, W para saltar, M para disparar.", canvas.width / 2, 312);
    ctx.restore();

    // Si ya venciste al jefe final, acomoda los botones:
let supervivenciaDesbloqueado = recordRonda >= 20;
if (supervivenciaDesbloqueado) {
    // Corre JUGAR a la izquierda
    botonJugar.x = canvas.width / 2 - 250;
    drawButton(
        botonJugar,
        "JUGAR",
        {
            gradColors: botonJugar.hover ? ["#0F0", "#FFD700"] : ["#FFD700", "#0F0"],
            borderColor: "#FFF",
            shadowColor: botonJugar.hover ? "#00FF00" : "#FFD700",
            fontColor: "#111",
            fontSize: 32
        }
    );
    drawButton(
    botonMisiones,
    "MISIONES",
    {
        gradColors: botonMisiones.hover ? ["#FA0", "#FFD700"] : ["#FFD700", "#FA0"],
        borderColor: "#FFD700",
        shadowColor: "#FFD700",
        fontColor: "#111",
        fontSize: 22
    }
);
    // Nuevo botón MODO SUPERVIVENCIA
    if (typeof botonSupervivencia === 'undefined') {
        // Defínelo si no existe
        window.botonSupervivencia = {
            x: canvas.width / 2 + 50,
            y: canvas.height / 2 + 50,
            width: 200,
            height: 50,
            hover: false
        };
    }
    drawButton(
        botonSupervivencia,
        "SUPERVIVENCIA",
        {
            gradColors: botonSupervivencia.hover ? ["#FFD700", "#0F0"] : ["#0F0", "#FFD700"],
            borderColor: "#FFD700",
            shadowColor: "#FFD700",
            fontColor: "#111",
            fontSize: 30
        }
    );
} else {
    // Posición original del botón jugar
    botonJugar.x = canvas.width / 2 - 100;
    drawButton(
        botonJugar,
        "JUGAR",
        {
            gradColors: botonJugar.hover ? ["#0F0", "#FFD700"] : ["#FFD700", "#0F0"],
            borderColor: "#FFF",
            shadowColor: botonJugar.hover ? "#00FF00" : "#FFD700",
            fontColor: "#111",
            fontSize: 32
        }
    );
}

    // Botón tienda
    drawButton(
        botonTienda,
        "TIENDA",
        {
            gradColors: botonTienda.hover ? ["#FA0", "#FFD700"] : ["#FFD700", "#FA0"],
            borderColor: "#FFD700",
            shadowColor: "#FFD700",
            fontColor: "#111",
            fontSize: 22
        }
    );

    // Monedas bonito, debajo del botón tienda
    let x = botonTienda.x;
    let y = botonTienda.y + botonTienda.height + 22;
    let w = botonTienda.width;
    let h = 46;
    let r = 16;

    ctx.save();
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#FFD700";
    let grad2 = ctx.createLinearGradient(x, y, x + w, y + h);
    grad2.addColorStop(0, "#FFF8D7");
    grad2.addColorStop(1, "#FFD700");
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.font = "bold 23px 'Press Start 2P'";
    ctx.fillStyle = "#B8860B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#FFF";
    ctx.shadowBlur = 5;
    ctx.fillText("🪙 " + monedas, x + w / 2, y + h / 2 + 1);
    ctx.restore();
}

function drawMisiones() {
    // Fondo gradiente y glow
    ctx.save();
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#23264a");
    grad.addColorStop(1, "#181a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título PRO
    ctx.font = "bold 62px 'Press Start 2P', Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#FFD700";
    ctx.fillText("MISIONES", canvas.width / 2, 90);
    ctx.restore();

    // Layout: misiones arriba, botón salir abajo
    const cardWidth = 740, cardHeight = 92, cardX = 110;
    const baseY = 140, sepY = 115;
    const btnWidth = 100, btnHeight = 32; // REDUCIDO

    // Paginación
    const misionesPagina = misiones.slice(paginaMisiones * MISIONES_POR_PAGINA, (paginaMisiones + 1) * MISIONES_POR_PAGINA);

    misionesPagina.forEach((mision, i) => {
        let y = baseY + i * sepY;
        let key = mision.nombre;
        let completada = progresoMisiones[key] && progresoMisiones[key].completada;
        let reclamado = progresoMisiones[key] && progresoMisiones[key].reclamado;

        // Cartel retro
        ctx.save();
        ctx.globalAlpha = 0.97;
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#FFD700";
        ctx.fillStyle = "#181a2e";
        ctx.beginPath();
        ctx.moveTo(cardX, y);
        ctx.lineTo(cardX + cardWidth, y);
        ctx.lineTo(cardX + cardWidth, y + cardHeight);
        ctx.lineTo(cardX, y + cardHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Nombre misión - AJUSTE DE TAMAÑO
        ctx.save();
        let nombreBase = 28; // px
        let nombreSize = nombreBase;
        ctx.font = `bold ${nombreSize}px 'Press Start 2P', Arial`;
        let nombreWidth = ctx.measureText("N. " + mision.nombre).width;
        if (nombreWidth > cardWidth - 120) {
            while (nombreWidth > cardWidth - 120 && nombreSize > 13) {
                nombreSize -= 1;
                ctx.font = `bold ${nombreSize}px 'Press Start 2P', Arial`;
                nombreWidth = ctx.measureText("N. " + mision.nombre).width;
            }
        }
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "left";
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 0;
        ctx.fillText("N. " + mision.nombre, cardX + 20, y + 32);

        // Estado misión con emoji
        ctx.font = "bold 21px 'Press Start 2P', Arial";
        ctx.textAlign = "right";
        ctx.fillStyle = completada ? "#11FF44" : "#FF2222";
        ctx.shadowColor = completada ? "#11FF44" : "#FF2222";
        ctx.shadowBlur = 0;
        ctx.fillText(completada ? "✅" : "❌", cardX + cardWidth - 20, y + 32);

        // Descripción - AJUSTE DE TAMAÑO
        ctx.textAlign = "left";
        ctx.fillStyle = "#23f3ea";
        let descripcion = mision.descripcion;
        let fontBase = 19; // px
        let fontSize = fontBase;
        ctx.font = fontBase + "px 'Press Start 2P', Arial";
        let descWidth = ctx.measureText(descripcion).width;
        if (descWidth > cardWidth - 60) {
            while (descWidth > cardWidth - 60 && fontSize > 12) {
                fontSize -= 1;
                ctx.font = fontSize + "px 'Press Start 2P', Arial";
                descWidth = ctx.measureText(descripcion).width;
            }
        }
        ctx.fillText(descripcion, cardX + 20, y + 58);

        // Recompensa - debajo de descripción
        ctx.font = "bold 18px 'Press Start 2P', Arial";
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "left";
        ctx.fillText("Recompensa: " + mision.recompensa + " 🪙", cardX + 20, y + 84);

        ctx.restore();

        // Botón reclamar
        let btnReclamar = {
            x: cardX + cardWidth - btnWidth - 18,
            y: y + cardHeight - btnHeight - 8,
            width: btnWidth,
            height: btnHeight,
            hover: mision.btnReclamarHover || false
        };
        let puedeReclamar = completada && !reclamado;
        let reclamarText = puedeReclamar ? "RECLAMAR" : (reclamado ? "RECLAMADO" : "...");
        drawButton(
            btnReclamar,
            reclamarText,
            {
                gradColors: puedeReclamar
                    ? (btnReclamar.hover ? ["#11FF44", "#FFD700"] : ["#FFD700", "#11FF44"])
                    : ["#888", "#444"],
                borderColor: puedeReclamar ? "#FFD700" : "#888",
                fontColor: "#222",
                fontSize: 17,
                shadowColor: btnReclamar.hover ? "#23f3ea" : "#FFD700",
                borderWidth: puedeReclamar ? 3 : 2
            }
        );
        mision._btnReclamar = btnReclamar;
    });

    // Flechas de paginación (más pequeñas y centradas)
    let flechaY = baseY + sepY * 1.1;
    flechaIzqMisiones.x = cardX - 38;
    flechaIzqMisiones.y = flechaY;
    flechaIzqMisiones.width = flechaDerMisiones.width = 38;
    flechaIzqMisiones.height = flechaDerMisiones.height = 38;
    flechaDerMisiones.x = cardX + cardWidth + 5;
    flechaDerMisiones.y = flechaY;

    drawButton(
        flechaIzqMisiones,
        "<",
        {
            gradColors: flechaIzqMisiones.hover ? ["#23f3ea", "#FFD700"] : ["#FFD700", "#23f3ea"],
            borderColor: "#FFD700",
            fontColor: "#222",
            fontSize: 26,
            shadowColor: "#23f3ea",
            borderWidth: 3
        }
    );
    drawButton(
        flechaDerMisiones,
        ">",
        {
            gradColors: flechaDerMisiones.hover ? ["#23f3ea", "#FFD700"] : ["#FFD700", "#23f3ea"],
            borderColor: "#FFD700",
            fontColor: "#222",
            fontSize: 26,
            shadowColor: "#23f3ea",
            borderWidth: 3
        }
    );

    // Botón salir - más arriba y pequeño
    btnSalirMisiones.x = canvas.width / 2 - 70;
    btnSalirMisiones.y = baseY + sepY * MISIONES_POR_PAGINA + 12;
    btnSalirMisiones.width = 140;
    btnSalirMisiones.height = 38;
    drawButton(btnSalirMisiones, "SALIR", {
        gradColors: btnSalirMisiones.hover ? ["#FFD700", "#23f3ea"] : ["#FFD700", "#333"],
        borderColor: "#FFD700",
        fontColor: "#222",
        fontSize: 22,
        shadowColor: "#23f3ea",
        borderWidth: 3
    });
}
function actualizarProgresoMision(tipo, cantidad = 1) {
    // Refresca upgrades de la tienda antes de chequear
    upgradeDanio = localStorage.getItem("upgradeDanio") === "true";
    upgradeVelocidad = localStorage.getItem("upgradeVelocidad") === "true";
    upgradeVida = localStorage.getItem("upgradeVida") === "true";
    upgradeBonkChanti = localStorage.getItem("upgradeBonkChanti") === "true";
    upgradeMonedasX2 = localStorage.getItem("upgradeMonedasX2") === "true";
    upgradeArmadura = localStorage.getItem("upgradeArmadura") === "true";
    upgradeOtarin = localStorage.getItem("upgradeOtarin") === "true";
    upgradeGuille = localStorage.getItem("upgradeGuille") === "true";

    misiones.forEach(mision => {
        let key = mision.nombre;
        if (!progresoMisiones[key]) progresoMisiones[key] = { progreso: 0, completada: false };
        if (!progresoMisiones[key].completada) {
            switch (mision.tipo) {
                case "ronda":
                    if (ronda >= mision.objetivo) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "rondaSupervivencia":
                    if (window.modoSupervivencia && ronda >= mision.objetivo) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "killsLanzziano":
                    progresoMisiones[key].progreso = killsLanzziano;
                    if (killsLanzziano >= mision.objetivo) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "killsJhoabxi":
                    progresoMisiones[key].progreso = killsJhoabxi;
                    if (killsJhoabxi >= mision.objetivo) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "compras":
                    progresoMisiones[key].progreso = comprasRealizadas;
                    if (comprasRealizadas >= mision.objetivo) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "comprasTotal":
                    let totalCompras = [
                        upgradeDanio, upgradeVelocidad, upgradeVida, upgradeBonkChanti,
                        upgradeMonedasX2, upgradeArmadura, upgradeOtarin, upgradeGuille
                    ].filter(Boolean).length;
                    progresoMisiones[key].progreso = totalCompras;
                    if (totalCompras >= mision.objetivo) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "compraBonkChanti":
                    if (upgradeBonkChanti) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "compraOtarin":
                    if (upgradeOtarin) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "compraGuille":
                    if (upgradeGuille) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
                case "jefeNormal":
                    if (!window.modoSupervivencia && jefeFinalDerrotado) {
                        progresoMisiones[key].completada = true;
                    }
                    break;
            }
        }
    });
    localStorage.setItem("progresoMisiones", JSON.stringify(progresoMisiones));
}
    function drawTienda() {
    // Fondo moderno con gradiente
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#323b5a");
    grad.addColorStop(1, "#191e2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título llamativo
    ctx.save();
    ctx.font = "bold 48px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#FFD700";
    ctx.fillText("TIENDA", canvas.width / 2, 70);
    ctx.restore();

    // Monedas
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.fillText("Monedas: 🪙 " + monedas, canvas.width / 2, 120);

    // ------- Paginación de tienda y flechas -------
    // Definición global:
    // let paginaTienda = 0;
    // const ITEMS_POR_PAGINA = 3;
    // const flechaIzq = { x: 40, y: 260, width: 50, height: 50, hover: false };
    // const flechaDer = { x: canvas.width - 90, y: 260, width: 50, height: 50, hover: false };

        const itemsTodos = [
    {
        btn: btnCompraDanio,
        color: "#FA0",
        icon: "💥",
        name: "Doble Daño",
        price: 300,
        upgrade: upgradeDanio,
        key: "danio"
    },
    {
        btn: btnCompraVelocidad,
        color: "#0FF",
        icon: "💨",
        name: "Doble Velocidad",
        price: 200,
        upgrade: upgradeVelocidad,
        key: "velocidad"
    },
    {
        btn: btnCompraVida,
        color: "#0F0",
        icon: "❤️",
        name: "Doble Vida",
        price: 500,
        upgrade: upgradeVida,
        key: "vida"
    },
    {
        btn: btnCompraBonkChanti,
        color: "#C7FF5E",
        icon: "🟩",
        name: "BonkChanti",
        price: 1250,
        upgrade: upgradeBonkChanti,
        key: "bonkchanti"
    },
    {
        btn: btnCompraMonedasX2,
        color: "#FFD700",
        icon: "💰",
        name: "X2 Monedas",
        price: 675,
        upgrade: upgradeMonedasX2,
        key: "monedasx2"
    },
    {
        btn: btnCompraArmadura,
        color: "#D9D9D9",
        icon: "🛡️",
        name: "Armadura",
        price: 800,
        upgrade: upgradeArmadura,
        key: "armadura"
    },
    {
        btn: btnCompraOtarin,
        color: "#6AEAFF",
        icon: "❄️",
        name: "Otarin",
        price: 1850,
        upgrade: upgradeOtarin,
        key: "otarin"
    },
    {
    btn: btnCompraGuille,
    color: "#FF2222",
    icon: "✂️",
    name: "Guille",
    price: 2500,
    upgrade: upgradeGuille,
    key: "guille"
}
];
    const ITEMS_POR_PAGINA = 3;
    const items = itemsTodos.slice(paginaTienda * ITEMS_POR_PAGINA, (paginaTienda + 1) * ITEMS_POR_PAGINA);

    // Flechas:
    const flechaIzq = { x: 40, y: 260, width: 50, height: 50, hover: false };
    const flechaDer = { x: canvas.width - 90, y: 260, width: 50, height: 50, hover: false };

    // Ajustar separación horizontal y vertical
    const baseX = 180, sepX = 280, baseY = 170;

    items.forEach((item, i) => {
        let x = baseX + i * sepX;
        let y = baseY;

        // Cartel del power-up
        ctx.save();
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = item.upgrade ? "#222" : "#292929";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 120, y);
        ctx.quadraticCurveTo(x + 140, y, x + 140, y + 20);
        ctx.lineTo(x + 140, y + 160);
        ctx.quadraticCurveTo(x + 140, y + 180, x + 120, y + 180);
        ctx.lineTo(x, y + 180);
        ctx.quadraticCurveTo(x - 20, y + 180, x - 20, y + 160);
        ctx.lineTo(x - 20, y + 20);
        ctx.quadraticCurveTo(x - 20, y, x, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Icono grande
        ctx.font = "60px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillStyle = item.color;
        ctx.shadowColor = "#FFF";
        ctx.shadowBlur = 0;
        ctx.fillText(item.icon, x + 60, y + 70);

        // Nombre
        ctx.font = "18px 'Press Start 2P'";
        ctx.fillStyle = "#FFD700";
        ctx.shadowBlur = 0;
        ctx.fillText(item.name, x + 60, y + 120);

        // Precio
        ctx.font = "14px 'Press Start 2P'";
        ctx.fillStyle = "#FFF";
        ctx.fillText("🪙 " + item.price, x + 60, y + 145);

        // Botón BUY debajo
        let buyBtn = {
            x: x + 10,
            y: y + 150,
            width: 100,
            height: 34,
            hover: item.btn.hover
        };
        let canBuy = (!item.upgrade && monedas >= item.price);
        let buyText = item.upgrade ? "COMPRADO" : "BUY";
        drawButton(
            buyBtn,
            buyText,
            {
                gradColors: item.upgrade
                    ? ["#888", "#444"]
                    : (buyBtn.hover ? ["#0F0", "#FFD700"] : ["#FFD700", "#0F0"]),
                borderColor: item.upgrade ? "#888" : "#FFD700",
                fontColor: item.upgrade ? "#333" : "#222",
                fontSize: 16
            }
        );

        // Actualiza hitbox para hover y click
        item.btn.x = buyBtn.x;
        item.btn.y = buyBtn.y;
        item.btn.width = buyBtn.width;
        item.btn.height = buyBtn.height;
    });

    // Botón salir
    drawButton(
        btnSalirTienda,
        "SALIR",
        {
            gradColors: btnSalirTienda.hover ? ["#FFD700", "#0F0"] : ["#FFD700", "#333"],
            borderColor: "#FFD700",
            fontColor: "#222",
            fontSize: 22
        }
    );

    // Flechas de página
    if (paginaTienda > 0) {
        drawButton(flechaIzq, "<", {fontSize: 30, gradColors: ["#0F0", "#FFD700"], borderColor: "#FFD700"});
    }
    if ((paginaTienda + 1) * ITEMS_POR_PAGINA < itemsTodos.length) {
        drawButton(flechaDer, ">", {fontSize: 30, gradColors: ["#0F0", "#FFD700"], borderColor: "#FFD700"});
    }
}
    // === REGENERACIÓN DE VIDA ===
    const INTERVALO_REGENERACION = 200;
    const CANTIDAD_REGENERACION = 5;
    let ultimoTickRegeneracion = Date.now();

    function jugadoresMuertos() {
        return jugadores.some(j => j.vida <= 0);
    }

    function loop() {
        console.log("LOOP. ESTADO:", estado);
        if (estado === "menu") {
            drawMenu();
        } else if (estado === "cinematica") {
            mostrarFraseCinematica();
        } 
        
        if (estado === "misiones") {
    drawMisiones();
    //no return aquí, sigue el loop normal
}else if (estado === "jugando") {
            for (let i = 0; i < jugadores.length; i++) {
                actualizarJugador(jugadores[i], i);
            }
            actualizarBalas();
            actualizarEnemigos();
            actualizarBalasEnemigas();


            // REGENERACIÓN DE VIDA para ambos jugadores
            let ahora = Date.now();
            for (let i = 0; i < jugadores.length; i++) {
                let jugador = jugadores[i];
                if (
                    jugador.vida > 0 &&
                    jugador.vida < jugador.vidaMax &&
                    ahora - ultimoTickRegeneracion >= INTERVALO_REGENERACION
                ) {
                    jugador.vida += CANTIDAD_REGENERACION;
                    if (jugador.vida > jugador.vidaMax) jugador.vida = jugador.vidaMax;
                    ultimoTickRegeneracion = ahora;
                }
                if (jugador.vida <= 0) {
                    ultimoTickRegeneracion = Date.now();
                }
            }

            if (enemigos.every(e => e.vida <= 0)) {
                avanzarRonda();
            }


            // CAMARA sigue al centro entre ambos si ambos vivos, si no al vivo
let vivos = jugadores.filter(j => j.vida > 0);
if (vivos.length === 2) {
    let minX = Math.min(vivos[0].x, vivos[1].x);
    let maxX = Math.max(vivos[0].x, vivos[1].x);
    camaraX = (minX + maxX) / 2 - canvas.width / 2 + jugadores[0].width / 2;
} else if (vivos.length === 1) {
    camaraX = vivos[0].x - canvas.width / 2 + vivos[0].width / 2;
} else {
    camaraX = jugadores[0].x - canvas.width / 2 + jugadores[0].width / 2;
}

// Limita la cámara para que nunca muestre fuera del escenario
if (camaraX < 0) camaraX = 0;
if (camaraX > suelo.width - canvas.width) camaraX = suelo.width - canvas.width;
if (suelo.width <= canvas.width) camaraX = 0; // Si el escenario es más pequeño que el canvas, no mover la cámara
            drawBackground();
            drawJugadores();
            drawEnemigos();
            drawBalas();
            drawBalasEnemigas();
            drawParticulas();
            
console.log("BonkChanti:", bonkchanti, "upgrade:", upgradeBonkChanti);

if (bonkchanti) {
    // DEBUG
    // Muestra log cada frame para ver la posición y si existe
    // Puedes quitarlo después de probar
    console.log("BonkChanti:", bonkchanti);

    // LÍMITES: evita que salga del canvas y del suelo
    if (bonkchanti.x < 0) bonkchanti.x = 0;
    if (bonkchanti.x + bonkchanti.width > suelo.width) bonkchanti.x = suelo.width - bonkchanti.width;
    if (bonkchanti.y < 0) bonkchanti.y = 0;
    if (bonkchanti.y + bonkchanti.height > canvas.height) bonkchanti.y = canvas.height - bonkchanti.height;

    // Seguir al más herido (con vida > 0)
    let heridos = jugadores.filter(j => j.vida > 0);
    let objetivo = null;
    if (heridos.length > 0) {
        objetivo = heridos.reduce((a, b) => a.vida < b.vida ? a : b);
        // Movimiento hacia el objetivo
        let dx = (objetivo.x + objetivo.width/2) - (bonkchanti.x + bonkchanti.width/2);
        let dy = (objetivo.y + objetivo.height/2) - (bonkchanti.y + bonkchanti.height/2);
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 2) {
            let vx = (dx/dist) * bonkchanti.velocidad;
            let vy = (dy/dist) * bonkchanti.velocidad;
            bonkchanti.x += vx;
            bonkchanti.y += vy;
        }
        // Disparo curativo
        if (bonkchanti.cooldown <= 0) {
            if (objetivo.vida < objetivo.vidaMax && objetivo.vida > 0) {
                let bx = bonkchanti.x + bonkchanti.width/2;
                let by = bonkchanti.y + bonkchanti.height/2;
                let tx = objetivo.x + objetivo.width/2;
                let ty = objetivo.y + objetivo.height/2;
                let ddx = tx - bx, ddy = ty - by;
                let ddd = Math.sqrt(ddx*ddx + ddy*ddy);
                let velBala = 8;
                balasCurativas.push({
                    x: bx,
                    y: by,
                    vx: (ddx/ddd) * velBala,
                    vy: (ddy/ddd) * velBala,
                    radio: 7,
                    color: "#39e279",
                    objetivo: objetivo
                });
                bonkchanti.cooldown = 30;
            }
        }
        if (bonkchanti.cooldown > 0) bonkchanti.cooldown--;
    }
    // Dibuja BonkChanti (con color visible y borde para debug)
    ctx.save();
    ctx.fillStyle = bonkchanti.color || "#C7FF5E";
    ctx.fillRect(bonkchanti.x - camaraX, bonkchanti.y, bonkchanti.width, bonkchanti.height);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.strokeRect(bonkchanti.x - camaraX, bonkchanti.y, bonkchanti.width, bonkchanti.height);
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("BonkChanti", bonkchanti.x - camaraX + bonkchanti.width/2, bonkchanti.y - 10);
    ctx.restore();
}

// Actualiza y dibuja balas curativas
for (let i = balasCurativas.length - 1; i >= 0; i--) {
    let bala = balasCurativas[i];
    bala.x += bala.vx;
    bala.y += bala.vy;
    // Dibuja
    ctx.save();
    ctx.beginPath();
    ctx.arc(bala.x - camaraX, bala.y, bala.radio, 0, Math.PI * 2);
    ctx.fillStyle = bala.color;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.restore();

    // Colisión con el objetivo (solo si sigue vivo y no ya curado a tope)
    if (
        bala.objetivo &&
        bala.objetivo.vida > 0 &&
        bala.objetivo.vida < bala.objetivo.vidaMax &&
        Math.abs(bala.x - (bala.objetivo.x + bala.objetivo.width/2)) < bala.objetivo.width/2 + bala.radio &&
        Math.abs(bala.y - (bala.objetivo.y + bala.objetivo.height/2)) < bala.objetivo.height/2 + bala.radio
    ) {
        bala.objetivo.vida += 20;
        if (bala.objetivo.vida > bala.objetivo.vidaMax) bala.objetivo.vida = bala.objetivo.vidaMax;
        balasCurativas.splice(i, 1);
        continue;
    }
    // Fuera del canvas
    if (bala.x < 0 || bala.x > suelo.width || bala.y < 0 || bala.y > canvas.height) {
        balasCurativas.splice(i, 1);
    }
}
// ---- Lógica de OTARIN ----
if (upgradeOtarin && otarin == null) {
    otarin = crearOtarin();
    balasHielo = [];
}

if (otarin) {
    // LÍMITES
    if (otarin.x < 0) otarin.x = 0;
    if (otarin.x + otarin.width > suelo.width) otarin.x = suelo.width - otarin.width;
    if (otarin.y < 0) otarin.y = 0;
    if (otarin.y + otarin.height > canvas.height) otarin.y = canvas.height - otarin.height;

    // Seguir al enemigo más cercano con vida > 0
    let objetivo = null;
    let menorDist = Infinity;
    for (let enemigo of enemigos) {
        if (enemigo.vida > 0 && !enemigo.congelado) {
            let d = distancia(otarin, enemigo);
            if (d < menorDist) {
                menorDist = d;
                objetivo = enemigo;
            }
        }
    }
    // Movimiento hacia objetivo
    if (objetivo) {
        let dx = (objetivo.x + objetivo.width/2) - (otarin.x + otarin.width/2);
        let dy = (objetivo.y + objetivo.height/2) - (otarin.y + otarin.height/2);
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 12) {
            let vx = (dx/dist) * otarin.velocidad;
            let vy = (dy/dist) * otarin.velocidad;
            otarin.x += vx;
            otarin.y += vy;
        }
        // Disparo de hielo
        if (otarin.cooldown <= 0 && dist < 260) {
            let bx = otarin.x + otarin.width/2;
            let by = otarin.y + otarin.height/2;
            let tx = objetivo.x + objetivo.width/2;
            let ty = objetivo.y + objetivo.height/2;
            let ddx = tx - bx, ddy = ty - by;
            let ddd = Math.sqrt(ddx*ddx + ddy*ddy);
            let velBala = 8;
            balasHielo.push({
                x: bx,
                y: by,
                vx: (ddx/ddd) * velBala,
                vy: (ddy/ddd) * velBala,
                radio: 9,
                color: "#6AEAFF",
                objetivo: objetivo
            });
            otarin.cooldown = 24;
        }
        if (otarin.cooldown > 0) otarin.cooldown--;
    }
    // Dibuja Otarin
    ctx.save();
    ctx.fillStyle = otarin.color;
    ctx.shadowColor = "#AEEFFF";
    ctx.shadowBlur = 18;
    ctx.fillRect(otarin.x - camaraX, otarin.y, otarin.width, otarin.height);
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#6AEAFF";
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    ctx.fillText("Otarin", otarin.x - camaraX + otarin.width/2, otarin.y - 12);
    ctx.restore();
}

// ---- BALAS DE HIELO ----
for (let i = balasHielo.length - 1; i >= 0; i--) {
    let bala = balasHielo[i];
    bala.x += bala.vx;
    bala.y += bala.vy;
    // Dibuja
    ctx.save();
    ctx.beginPath();
    ctx.arc(bala.x - camaraX, bala.y, bala.radio, 0, Math.PI * 2);
    ctx.fillStyle = bala.color;
    ctx.globalAlpha = 0.80;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.restore();

    // Colisión con el objetivo (solo si sigue vivo y NO congelado)
    if (
        bala.objetivo &&
        bala.objetivo.vida > 0 &&
        !bala.objetivo.congelado &&
        Math.abs(bala.x - (bala.objetivo.x + bala.objetivo.width/2)) < bala.objetivo.width/2 + bala.radio &&
        Math.abs(bala.y - (bala.objetivo.y + bala.objetivo.height/2)) < bala.objetivo.height/2 + bala.radio
    ) {
        bala.objetivo.congelado = 150; // Congelado por 2,5 segundos
        balasHielo.splice(i, 1);
        continue;
    }
    // Fuera del canvas
    if (bala.x < 0 || bala.x > suelo.width || bala.y < 0 || bala.y > canvas.height) {
        balasHielo.splice(i, 1);
    }
}
// ---- Lógica de GUILLE ----
if (upgradeGuille) {
    if (guille == null) {
        guille = crearGuille();
        rayosGuille = [];
        tijerasGuille = [];
    }
} else {
    guille = null;
    rayosGuille = [];
    tijerasGuille = [];
}

if (guille) {
    // Guille sigue al jugador principal
    let objetivo = jugadores[0];
    let dx = (objetivo.x + objetivo.width/2) - (guille.x + guille.width/2);
    let dy = (objetivo.y + objetivo.height/2) - (guille.y + guille.height/2);
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 12) {
        let vx = (dx/dist) * 6;
        let vy = (dy/dist) * 6;
        guille.x += vx;
        guille.y += vy;
    }

    // Disparo de rayo/meteorito cada 1.5s
    if (guille.cooldownRayo <= 0) {
        // Encuentra enemigo más cercano
        let enemigo = enemigoMasCercano(guille.x, guille.y);
        if (enemigo && enemigo.vida > 0) {
            rayosGuille.push({
                x: enemigo.x + enemigo.width/2,
                y: -120,
                objetivo: enemigo,
                tiempo: 0
            });
            guille.cooldownRayo = 90; // 1.5 segundos (60fps)
        }
    }
    if (guille.cooldownRayo > 0) guille.cooldownRayo--;

    // Disparo tijera cada 1s
    if (guille.cooldownTijera <= 0) {
        let enemigo = enemigoMasCercano(guille.x, guille.y);
        if (enemigo && enemigo.vida > 0) {
            let origenX = guille.x + guille.width / 2;
            let origenY = guille.y + guille.height / 2;
            let destinoX = enemigo.x + enemigo.width / 2;
            let destinoY = enemigo.y + enemigo.height / 2;
            let dx = destinoX - origenX;
            let dy = destinoY - origenY;
            let dist = Math.sqrt(dx*dx + dy*dy);
            let vel = 11;
            let vx = (dx / dist) * vel;
            let vy = (dy / dist) * vel;
            tijerasGuille.push({
                x: origenX,
                y: origenY,
                vx: vx,
                vy: vy,
                radio: 20,
                angulo: 0,
                objetivo: enemigo,
                tiempo: 0,
                direccionFija: {vx, vy}
            });
            guille.cooldownTijera = 60; // 1 segundo
        }
    }
    if (guille.cooldownTijera > 0) guille.cooldownTijera--;

    // Dibuja Guille (rojo luminoso)
    ctx.save();
    ctx.fillStyle = guille.color;
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 24;
    ctx.fillRect(guille.x - camaraX, guille.y, guille.width, guille.height);
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#FF2222";
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    ctx.fillText("Guille", guille.x - camaraX + guille.width/2, guille.y - 12);
    ctx.restore();
}

// ---- RAYOS/METEORITOS GUILLE ----
for (let i = rayosGuille.length - 1; i >= 0; i--) {
    let rayo = rayosGuille[i];
    rayo.tiempo++;
    // Baja el meteorito más lento para que sea épico
    rayo.y += 22;
    // Partículas de meteorito
    for (let p = 0; p < 12; p++) {
        particulas.push({
            x: rayo.x - camaraX + (Math.random()-0.5)*80,
            y: rayo.y + Math.random()*55,
            size: 11 + Math.random()*11,
            color: "#FF2222",
            vida: 18 + Math.random()*16,
            velX: (Math.random()-0.5)*5.5,
            velY: Math.random()*2,
            gravedad: 0.4
        });
    }
    // Dibuja meteorito
    ctx.save();
    ctx.beginPath();
    ctx.arc(rayo.x - camaraX, rayo.y + 50, 42, 0, 2*Math.PI);
    let grad = ctx.createRadialGradient(rayo.x - camaraX, rayo.y + 50, 8, rayo.x - camaraX, rayo.y + 50, 42);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(0.4, "#FF4444");
    grad.addColorStop(1, "#FF2222");
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.92;
    ctx.shadowColor = "#FF2222";
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.restore();

    // Cuando llega al objetivo (área de daño mucho más grande)
    if (rayo.y > rayo.objetivo.y && rayo.tiempo > 1) {
        // Daño en área más grande (120px radio en X y Y)
        for (let enemigo of enemigos) {
            if (
                enemigo.vida > 0 &&
                Math.abs(enemigo.x + enemigo.width/2 - rayo.x) < 120 &&
                Math.abs(enemigo.y + enemigo.height/2 - (rayo.objetivo.y + rayo.objetivo.height/2)) < 120
            ) {
                enemigo.vida -= 50;
                if (enemigo.vida < 0) enemigo.vida = 0;

                // SUMA MONEDAS (X2 si tienes el upgrade)
                let multiplicador = upgradeMonedasX2 ? 2 : 1;
                if (!enemigo.sueltoMoneda && enemigo.vida <= 0) {
                    if (enemigo.tipo === "jefe") {
                        monedas += 50 * multiplicador;
                        monedasRecoleccionPartida += 50 * multiplicador;
                    } else {
                        monedas += 1 * multiplicador;
                        monedasRecoleccionPartida += 1 * multiplicador;
                    }
                    enemigo.sueltoMoneda = true;
                    localStorage.setItem("monedas", monedas);
                }
            }
        }
        // Partículas de explosión grandes
        for (let j = 0; j < 36; j++) {
            particulas.push({
                x: rayo.x - camaraX + (Math.random()-0.5)*140,
                y: rayo.objetivo.y + rayo.objetivo.height/2 + (Math.random()-0.5)*140,
                size: 14 + Math.random()*18,
                color: "#FF3333",
                vida: 32 + Math.random()*28,
                velX: (Math.random()-0.5)*8,
                velY: (Math.random()-0.5)*8,
                gravedad: 0.36
            });
        }
        rayosGuille.splice(i, 1);
        continue;
    }
}

// ---- TIJERAS GUILLE ----
for (let i = tijerasGuille.length - 1; i >= 0; i--) {
    let tijera = tijerasGuille[i];
    // AVANZA SIEMPRE RECTO (NO recalcula dirección)
    tijera.x += tijera.direccionFija.vx;
    tijera.y += tijera.direccionFija.vy;
    tijera.angulo += 0.35;
    tijera.tiempo++;
    // Dibuja tijera girando
    ctx.save();
    ctx.translate(tijera.x - camaraX, tijera.y);
    ctx.rotate(tijera.angulo);
    ctx.font = "36px 'Press Start 2P'";
    ctx.fillStyle = "#FFF";
    ctx.shadowColor = "#FF2222";
    ctx.shadowBlur = 16;
    ctx.fillText("✂️", 0, 0);
    ctx.restore();

    // Partículas alrededor de la tijera
    for (let p = 0; p < 2; p++) {
        particulas.push({
            x: tijera.x - camaraX + (Math.random()-0.5)*18,
            y: tijera.y + (Math.random()-0.5)*18,
            size: 5 + Math.random()*4,
            color: "#FF2222",
            vida: 11 + Math.random()*8,
            velX: (Math.random()-0.5)*3,
            velY: (Math.random()-0.5)*3,
            gravedad: 0.15
        });
    }

    // Daño a enemigos + suma monedas
    for (let enemigo of enemigos) {
        if (
            enemigo.vida > 0 &&
            Math.abs(enemigo.x + enemigo.width/2 - tijera.x) < 29 &&
            Math.abs(enemigo.y + enemigo.height/2 - tijera.y) < 29
        ) {
            enemigo.vida -= 30;
            if (enemigo.vida < 0) enemigo.vida = 0;

            // SUMA MONEDAS (X2 si tienes el upgrade)
            let multiplicador = upgradeMonedasX2 ? 2 : 1;
            if (!enemigo.sueltoMoneda && enemigo.vida <= 0) {
                if (enemigo.tipo === "jefe") {
                    monedas += 50 * multiplicador;
                    monedasRecoleccionPartida += 50 * multiplicador;
                } else {
                    monedas += 1 * multiplicador;
                    monedasRecoleccionPartida += 1 * multiplicador;
                }
                enemigo.sueltoMoneda = true;
                localStorage.setItem("monedas", monedas);
            }
        }
    }
    // Fuera del canvas
    if (tijera.x < 0 || tijera.x > suelo.width || tijera.y < 0 || tijera.y > canvas.height) {
        tijerasGuille.splice(i, 1);
    }
}

drawVidaJugador(jugadores[0], 0);
drawVidaJugador(jugadores[1], 38);
drawRonda();
drawMonedasPartida();

            // Derrota si uno muere
            if (jugadoresMuertos()) {
                if (ronda > recordRonda) {
                recordRonda = ronda;
                localStorage.setItem("recordRonda", recordRonda);
}
                estado = "derrota";
            }
        } else if (estado === "derrota") {
            drawBackground();
            drawJugadores();
            drawEnemigos();
            drawBalas();
            drawBalasEnemigas();
            drawParticulas();
            drawVidaJugador(jugadores[0], 0);
            drawVidaJugador(jugadores[1], 38);
            drawRonda();
            drawDerrota();
        }
          else if (estado === "victoria") {
    drawVictoria();
}
else if (estado === "tienda") {
    drawTienda();
    // NO return aquí, deja que siga el loop
}
        if (estado === "cinematica" && cinemActive) {
            let ahora = Date.now();
            if (ahora - ultimaActualizacion > tiempoPorFrase) {
                index++;
                ultimaActualizacion = ahora;
                if (index >= frases.length) {
                    estado = "jugando";
                }
            }
        }

        requestAnimationFrame(loop);
    }

    loop();
};


