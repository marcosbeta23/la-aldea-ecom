const fs = require('fs');
let code = fs.readFileSync('d:/Escritorio/CODE/la-aldea-ecom/app/nosotros/page.tsx', 'utf8');

// Mojibake cleaner if it existed
code = code.replace(/AÃ±os/g, 'Años');
code = code.replace(/MÃ¡s/g, 'Más');
code = code.replace(/naciÃ³/g, 'nació');
code = code.replace(/agrÃcolas/g, 'agrícolas');
code = code.replace(/hÃdrica/g, 'hídrica');
code = code.replace(/hÃdrico/g, 'hídrico');
code = code.replace(/clÃ¡sica/g, 'clásica');
code = code.replace(/adaptÃ¡ndose/g, 'adaptándose');
code = code.replace(/expandiÃ©ndose/g, 'expandiéndose');
code = code.replace(/improvisaciÃ³n/g, 'improvisación');
code = code.replace(/rÃ¡pido/g, 'rápido');
code = code.replace(/construcciÃ³n/g, 'construcción');
code = code.replace(/quÃ©/g, 'qué');
code = code.replace(/cÃ³mo/g, 'cómo');
code = code.replace(/lÃneas/g, 'líneas');
code = code.replace(/energÃa/g, 'energía');
code = code.replace(/catÃ¡logo/g, 'catálogo');
code = code.replace(/paÃs/g, 'país');
code = code.replace(/filosofÃa/g, 'filosofía');
code = code.replace(/soluciÃ³n/g, 'solución');
code = code.replace(/serÃ¡/g, 'será');
code = code.replace(/tÃ©cnica/g, 'técnica');
code = code.replace(/especÃfica/g, 'específica');
code = code.replace(/DirecciÃ³n/g, 'Dirección');
code = code.replace(/JosÃ©/g, 'José');
code = code.replace(/AtenciÃ³n/g, 'Atención');
code = code.replace(/SÃ¡bados/g, 'Sábados');
code = code.replace(/VÃas/g, 'Vías');
code = code.replace(/LÃnea/g, 'Línea');
code = code.replace(/UbicaciÃ³n/g, 'Ubicación');
code = code.replace(/comenzÃ³/g, 'comenzó');
code = code.replace(/solluciones/g, 'soluciones'); // typo
code = code.replace(/ssilenciosas/g, 'silenciosas'); // typo 
code = code.replace(/pisscinas/g, 'piscinas'); // typo
code = code.replace(/trabaajo/g, 'trabajo'); // typo

code = code.replace(/1999/g, '2002');
code = code.replace(/2000/g, '2002');

code = code.replace(/25(\s)?aÃ±os/g, '24 años');
code = code.replace(/25\+/g, '24+');
code = code.replace(/25(\s)?años/g, '24 años');

code = code.replace(/Desde el 2002 en Tala/g, 'Desde el 2002 en Tala'); // if it was updated
code = code.replace(/laaldeaedificio\.webp/g, 'laaldeaedificiodia.avif');

let brandOld = 'Un equipo que falla en pleno verano o en el medio de una cosecha es un problema enorme. Por eso mantenemos alianzas directas con marcas que no te dejan tirado: Gianni, DIU, Tigre, y Lusqtoff.';
let brandOld2 = brandOld.replace(/Ã©/g, 'é').replace(/Ã³/g, 'ó');
let brandNew = 'Un equipo que falla en pleno verano o en el medio de una cosecha es un problema enorme. Por eso mantenemos alianzas con marcas de primera línea en bombeo e hidráulica como Gianni, Tigre y Nicoll, junto a insumos y herramientas de confianza para completar cada obra.';

code = code.replace(brandOld, brandNew);
code = code.replace(brandOld2, brandNew);

let founderOld = 'Ese siempre será nuestro mayor diferencial: <strong>nuestra honestidad técnica y humana</strong>.';
let founderOld2 = 'Ese siempre serÃ¡ nuestro mayor diferencial: <strong>nuestra honestidad tÃ©cnica y humana</strong>.';
let founderNew = 'Vendemos productos, pero sobre todo brindamos soluciones que perduran. — Martín Betancor, Fundador';

// if it exists, swap it.
if (code.includes(founderOld)) code = code.replace(founderOld, founderNew);
if (code.includes(founderOld2)) code = code.replace(founderOld2, founderNew);

fs.writeFileSync('d:/Escritorio/CODE/la-aldea-ecom/app/nosotros/page.tsx', code, 'utf8');
console.log('Update2 complete!');
