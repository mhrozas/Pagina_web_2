/* Artículos del blog (migrados de detalle_blogs1.html y detalle_blogs2.html) */

const IMG_BLAZER = 'https://froens.cl/cdn/shop/files/blazer-alondra-mujer-beige-lifestyle-froens-1_d1653926-de0c-4259-9101-dafda13822c6.webp?v=1784055114&width=1282';
const IMG_VESTIDO = 'https://froens.cl/cdn/shop/files/VESTIDOTROPICNEGRO_2.webp?v=1768960021&width=1067';

export const BLOGS = [
    {
        id: 1,
        categoria: 'Guías de compra',
        fecha: '15 sep 2026 · 2 min de lectura',
        titulo: 'Cómo elegir la talla correcta al comprar online',
        resumen: 'Comprar ropa por internet sin probársela genera dudas. Te explicamos cómo tomar tus medidas en casa y leer nuestra tabla de tallas para acertar a la primera.',
        imagen: IMG_BLAZER,
        secciones: [
            { parrafo: 'La principal razón por la que una compra de ropa online termina en cambio o devolución es la talla. A diferencia de una tienda física, aquí no puedes probarte la prenda antes de decidir. La buena noticia es que con tres medidas y cinco minutos puedes acertar casi siempre.' },
            { subtitulo: 'Toma tus medidas en casa', parrafo: 'Necesitas una huincha de medir flexible. Mídete sobre ropa liviana, de pie y relajada, sin apretar la huincha contra el cuerpo. Las tres medidas que usamos son:', lista: ['Busto: rodea la parte más ancha del pecho, pasando la huincha por debajo de los brazos.', 'Cintura: mide en la parte más angosta del torso, generalmente a la altura del ombligo.', 'Cadera: rodea la parte más ancha de la cadera, aproximadamente 20 cm bajo la cintura.'] },
            { subtitulo: 'Compara contra la tabla, no contra tu talla habitual', parrafo: 'Un error frecuente es asumir que si usas talla M en una marca, usarás M en todas. El tallaje varía entre fabricantes e incluso entre modelos de una misma marca. Cada ficha de producto de Ch.Store incluye su tabla de medidas en centímetros: esa es la referencia que debes usar.' },
            { subtitulo: 'Considera el calce de la prenda', parrafo: 'Una prenda de calce ajustado con la misma medida de busto se sentirá muy distinta a una de calce holgado. Si estás entre dos tallas y la prenda es de calce ajustado, conviene elegir la mayor.' },
            { subtitulo: 'Revisa el material', parrafo: 'Las telas con elastano ceden y perdonan un par de centímetros. El lino y el algodón rígido no. Si la prenda no tiene elasticidad y tus medidas quedan justo en el límite superior de una talla, sube a la siguiente.' },
            { subtitulo: 'En resumen', parrafo: 'Mide, compara contra la tabla del producto específico, revisa el calce y considera el material. Y si de todas formas no quedó como esperabas, nuestro plazo de cambio es de 30 días.' }
        ]
    },
    {
        id: 2,
        categoria: 'Cuidado de prendas',
        fecha: '22 sep 2026 · 2 min de lectura',
        titulo: 'Cinco formas de cuidar tus prendas para que duren más',
        resumen: 'El lavado y el secado son los dos momentos donde más se dañan las prendas. Reunimos cinco recomendaciones simples que alargan la vida útil de tu ropa.',
        imagen: IMG_VESTIDO,
        secciones: [
            { parrafo: 'Una prenda bien cuidada puede durar años; la misma prenda mal lavada se deforma o destiñe en pocos meses. Estas cinco prácticas son simples y marcan una diferencia real en la vida útil de tu ropa.' },
            { subtitulo: '1. Lava con agua fría', parrafo: 'El agua caliente abre las fibras y acelera la pérdida de color, además de encoger prendas de algodón. El agua fría limpia igual de bien con un buen detergente y consume menos energía.' },
            { subtitulo: '2. Da vuelta la prenda antes de lavar', parrafo: 'Lavar del revés protege el estampado, los bordados y el color de la cara visible. El roce del tambor se concentra en el interior de la prenda, que nadie ve.' },
            { subtitulo: '3. No sobrecargues la lavadora', parrafo: 'Cuando la carga es excesiva las prendas no tienen espacio para moverse, se lavan mal y el roce entre ellas genera pilling. Deja al menos un cuarto del tambor libre.' },
            { subtitulo: '4. Evita la secadora en prendas delicadas', parrafo: 'El calor de la secadora es el principal enemigo del elastano, la viscosa y el lino. Secar a la sombra y en horizontal mantiene la forma original de la prenda.' },
            { subtitulo: '5. Guarda correctamente según el tipo de prenda', parrafo: 'Los vestidos, blusas y blazers van colgados en perchas anchas. Los tejidos de punto y las prendas pesadas van doblados. Guarda siempre con la ropa completamente seca.' },
            { subtitulo: 'Un último consejo', parrafo: 'Revisa siempre la etiqueta de composición antes del primer lavado. Dos minutos de lectura evitan arruinar una prenda que podrías haber usado por años.' }
        ]
    }
];
