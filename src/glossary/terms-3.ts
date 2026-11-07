// Glossary terms F to O (by their Spanish name). Original definitions written for PokerToolBox.
import type { Term } from './types';

export const TERMS_F_O: Term[] = [
  {
    category: 'stats',
    en: { term: 'Aggression factor', def: 'A stat that measures how aggressive you are postflop: (bets + raises) / calls. Above 2–3 is considered aggressive.' },
    es: { term: 'Factor de agresión', aka: ['Aggression factor', 'Agression factor', 'AF'], def: 'Estadística que mide lo agresivo que eres postflop: (apuestas + subidas) / pagos. Por encima de 2–3 se considera agresivo.' },
  },
  {
    category: 'actions',
    en: { term: 'Bluff', def: 'Betting or raising with a bad hand so the opponent folds a better one.' },
    es: { term: 'Farol', aka: ['Bluff', 'Farolear', 'Bluffear'], def: 'Apostar o subir con una mano mala para que el rival se retire con una mejor.' },
  },
  {
    category: 'table',
    en: { term: 'Chip', def: 'A disc that represents money or points at the table.' },
    es: { term: 'Ficha', aka: ['Chip', 'Chips'], def: 'Disco que representa dinero o puntos en la mesa.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Field', def: 'All the players entered in a tournament. "A soft field" has many weak players.' },
    es: { term: 'Field', aka: ['Campo'], def: 'El conjunto de jugadores inscritos en un torneo. "Un field blando" tiene muchos jugadores flojos.' },
  },
  {
    category: 'players',
    en: { term: 'Fish', def: 'A weak or inexperienced player who loses money in the long run.' },
    es: { term: 'Fish', aka: ['Pez', 'Donkey'], def: 'Jugador débil o inexperto que pierde dinero a largo plazo.' },
  },
  {
    category: 'rooms',
    en: { term: 'Fixed limit', def: 'A format where bets and raises have a fixed size on each street.' },
    es: { term: 'Fixed limit', aka: ['Limit', 'Límite fijo', 'FL'], def: 'Modalidad en la que las apuestas y subidas tienen un tamaño fijo en cada calle.' },
  },
  {
    category: 'actions',
    en: { term: 'Flat call', def: 'Just calling a raise when you could re-raise, often to disguise a strong hand or control the pot.' },
    es: { term: 'Flat call', aka: ['Flat'], def: 'Solo pagar una subida pudiendo resubir, a menudo para disimular una mano fuerte o controlar el bote.' },
  },
  {
    category: 'rooms',
    en: { term: 'Floor', def: 'The live-room manager who settles disputes and enforces the rules.' },
    es: { term: 'Floor', aka: ['Floorman', 'Encargado de sala'], def: 'Responsable de la sala en vivo que resuelve disputas y hace cumplir las reglas.' },
  },
  {
    category: 'table',
    en: { term: 'Flop', def: 'The first three community cards, dealt together after the preflop round.' },
    es: { term: 'Flop', def: 'Las tres primeras cartas comunitarias, que se reparten a la vez tras la ronda preflop.' },
  },
  {
    category: 'table',
    en: { term: 'Three-straight flop', def: 'A flop with three consecutive cards (like 7-8-9). Very dangerous, because many hands have a straight or a draw.' },
    es: { term: 'Flop 3-straight', aka: ['Flop de tres seguidas'], def: 'Flop con tres cartas consecutivas (como 7-8-9), muy peligroso porque muchas manos ligan escalera o proyecto.' },
  },
  {
    category: 'table',
    en: { term: 'Coordinated flop', def: 'A flop with many flush and straight possibilities. Practise reading them in Read the Board.' },
    es: { term: 'Flop coordinado', aka: ['Mojado', 'Wet', 'Drawy'], def: 'Flop con muchas posibilidades de color y escalera. Practica su lectura en Lee la mesa.' },
  },
  {
    category: 'table',
    en: { term: 'Dry flop', def: 'A flop with few connections, like K-7-2 of different suits: hardly anyone has a draw.' },
    es: { term: 'Flop seco', aka: ['Dry', 'Mesa seca'], def: 'Flop con pocas conexiones, como K-7-2 de distintos palos: casi nadie tiene proyectos.' },
  },
  {
    category: 'table',
    en: { term: 'Two-wrapped flop', def: 'A flop with two cards that leave many straight combinations around them, like 8-9 with an unrelated third card.' },
    es: { term: 'Flop two wrapped', aka: ['Two-wrapped'], def: 'Flop con dos cartas que dejan muchas combinaciones de escalera alrededor, como 8-9 con una tercera suelta.' },
  },
  {
    category: 'actions',
    en: { term: 'Float', def: 'Calling a bet with little, planning to take the pot on a later street if the opponent shows weakness.' },
    es: { term: 'Flotar', aka: ['Float', 'Floating'], def: 'Pagar una apuesta con poco, con la idea de robar el bote en una calle posterior si el rival muestra debilidad.' },
  },
  {
    category: 'slang',
    en: { term: 'FML', def: 'Abbreviation of a rude complaint after a bad beat ("my luck is cursed").' },
    es: { term: 'FML', def: 'Siglas en inglés de una queja malsonante tras un mal golpe ("maldita sea mi suerte").' },
  },
  {
    category: 'strategy',
    en: { term: 'Fold equity', def: 'The part of a bet’s value that comes from the opponent folding. It makes semi-bluffs profitable.' },
    es: { term: 'Fold equity', def: 'Parte del valor de una apuesta que viene de que el rival se retire. Hace rentables los semifaroles.' },
  },
  {
    category: 'rooms',
    en: { term: 'Free play', def: 'A promotion or mode for playing without risking your own money.' },
    es: { term: 'Free play', aka: ['Juego gratis'], def: 'Promoción o modo para jugar sin arriesgar dinero propio.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Freeroll', def: 'A free tournament with real prizes. Also, in a hand, being guaranteed at least half the pot with a chance to win all of it.' },
    es: { term: 'Freeroll', def: 'Torneo gratuito con premios reales. También, en una mano, tener ganada al menos la mitad del bote y opciones de llevártelo todo.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Freezeout', def: 'A tournament without rebuys: if you lose your chips, you are out.' },
    es: { term: 'Freezeout', aka: ['Freezout'], def: 'Torneo sin recompras: si pierdes tus fichas, quedas eliminado.' },
  },
  {
    category: 'table',
    en: { term: 'Out of position', def: 'Having to act before your opponent on the postflop streets, with less information.' },
    es: { term: 'Fuera de posición', aka: ['Out of position', 'OOP'], def: 'Tener que actuar antes que tu rival en las calles postflop, con menos información.' },
  },
  {
    category: 'hands',
    en: { term: 'Full house', def: 'Three of a kind plus a pair, like K-K-K-7-7. It beats a flush and loses to four of a kind.' },
    es: { term: 'Full', aka: ['Full house'], def: 'Trío más pareja, como K-K-K-7-7. Gana al color y pierde contra el póker.' },
  },
  {
    category: 'slang',
    en: { term: 'Gamble', def: 'Playing riskily for fun or without a clear edge. "Gambling" is betting games in general.' },
    es: { term: 'Gamblear', aka: ['Gamble', 'Gambling'], def: 'Jugar arriesgando por diversión o sin ventaja clara. "Gambling" es el juego de apuestas en general.' },
  },
  {
    category: 'hands',
    en: { term: 'Gap', def: 'A missing rank between two cards. 9-7 has one gap (the 8). Gaps matter when reading flop texture.' },
    es: { term: 'Gap', aka: ['Hueco'], def: 'Rango que falta entre dos cartas. 9-7 tiene un gap (el 8). Los huecos importan para leer la coordinación del flop.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Guaranteed', def: 'A minimum prize pool the room guarantees for a tournament even if not enough players enter.' },
    es: { term: 'Garantizado', aka: ['Guaranteed', 'GTD'], def: 'Premio mínimo que la sala asegura en un torneo aunque no se inscriban suficientes jugadores.' },
  },
  {
    category: 'slang',
    en: { term: 'GG', def: '"Good game": said at the end of a game or when knocked out.' },
    es: { term: 'GG', def: '"Good game": buena partida, se dice al terminar o al ser eliminado.' },
  },
  {
    category: 'slang',
    en: { term: 'GL', def: '"Good luck".' },
    es: { term: 'GL', def: '"Good luck": buena suerte.' },
  },
  {
    category: 'players',
    en: { term: 'Grinder', def: 'A player who puts in lots of hours and volume, looking for small but steady profits.' },
    es: { term: 'Grinder', aka: ['Grindear', 'Grind'], def: 'Jugador que acumula muchas horas y volumen, buscando ganancias pequeñas pero constantes.' },
  },
  {
    category: 'strategy',
    en: { term: 'GTO', def: 'Game Theory Optimal: a theoretically optimal, unexploitable strategy. Solvers calculate it.' },
    es: { term: 'GTO', aka: ['Game Theory Optimal', 'Teoría de juegos'], def: 'Estrategia teóricamente óptima e inexplotable, basada en la teoría de juegos. Los solvers la calculan.' },
  },
  {
    category: 'hands',
    en: { term: 'Gutshot', def: 'A straight draw missing a middle card (like 9-8-6-5 waiting for a 7). It has 4 outs.' },
    es: { term: 'Gutshot', aka: ['Escalera interna', 'Inside straight draw'], def: 'Proyecto de escalera al que le falta una carta del medio (como 9-8-6-5 esperando el 7). Tiene 4 outs.' },
  },
  {
    category: 'rooms',
    en: { term: 'HORSE', def: 'A game that rotates between Hold’em, Omaha Hi-Lo, Razz, Stud and Stud Hi-Lo.' },
    es: { term: 'HORSE', aka: ['H.O.R.S.E.'], def: 'Partida que rota entre Hold’em, Omaha Hi-Lo, Razz, Stud y Stud Hi-Lo.' },
  },
  {
    category: 'rooms',
    en: { term: 'HOSE', def: 'HORSE without Razz: Hold’em, Omaha Hi-Lo, Stud and Stud Hi-Lo.' },
    es: { term: 'HOSE', def: 'Variante de HORSE sin Razz: Hold’em, Omaha Hi-Lo, Stud y Stud Hi-Lo.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Hand-for-hand', def: 'On the bubble, every table waits for each hand to finish before starting the next, so nobody stalls on purpose.' },
    es: { term: 'Hand-for-hand', aka: ['Mano por mano'], def: 'En la burbuja, todas las mesas esperan a terminar cada mano antes de empezar la siguiente, para que nadie retrase a propósito.' },
  },
  {
    category: 'table',
    en: { term: 'Heads-up', def: 'A hand or game between only two players.' },
    es: { term: 'Heads-up', aka: ['Heads up', 'HU', 'Mano a mano'], def: 'Mano o partida entre solo dos jugadores.' },
  },
  {
    category: 'slang',
    en: { term: 'Hero', def: 'In hand reviews, the player whose point of view is told (you). The opponent is the "villain".' },
    es: { term: 'Hero', def: 'En los análisis de manos, el jugador desde cuyo punto de vista se cuenta (tú). El rival es el "villano".' },
  },
  {
    category: 'actions',
    en: { term: 'Hero call', def: 'Calling a big bet with a weak hand because you believe the opponent is bluffing.' },
    es: { term: 'Hero call', def: 'Pagar una apuesta grande con una mano floja porque crees que el rival va de farol.' },
  },
  {
    category: 'rooms',
    en: { term: 'High stakes', def: 'Games with very high blinds and buy-ins.' },
    es: { term: 'High stakes', aka: ['Altos límites'], def: 'Partidas con ciegas y entradas muy altas.' },
  },
  {
    category: 'tournaments',
    en: { term: 'High roller', def: 'A tournament with a very expensive buy-in, or a player who plays for those amounts.' },
    es: { term: 'Highroller', aka: ['High roller'], def: 'Torneo de entrada muy cara, o jugador que juega a esas cantidades.' },
  },
  {
    category: 'table',
    en: { term: 'Hijack', def: 'The seat to the right of the cutoff, two places before the button.' },
    es: { term: 'Hijack', aka: ['HJ'], def: 'Posición a la derecha del cutoff, dos puestos antes del botón.' },
  },
  {
    category: 'slang',
    en: { term: 'Hit', def: 'When the community cards give you a hand ("I hit the flop").' },
    es: { term: 'Hit', aka: ['Ligar'], def: 'Que las cartas comunitarias te den jugada ("he ligado el flop").' },
  },
  {
    category: 'slang',
    en: { term: 'Hit and run', def: 'Winning a big pot and leaving the table right away.' },
    es: { term: 'Hit and run', def: 'Ganar un bote grande y levantarse de la mesa enseguida.' },
  },
  {
    category: 'stats',
    en: { term: 'Hold’em Manager', def: 'Software that stores your online hands and shows stats on you and your opponents.' },
    es: { term: 'Hold’em Manager', aka: ['HM', 'Holdem Manager'], def: 'Programa que guarda tus manos online y muestra estadísticas de ti y de tus rivales.' },
  },
  {
    category: 'rooms',
    en: { term: 'Home game', def: 'A private game among friends at home.' },
    es: { term: 'Home game', aka: ['Partida casera'], def: 'Partida privada entre amigos, en casa.' },
  },
  {
    category: 'stats',
    en: { term: 'HUD', def: 'Heads-up display: a panel that overlays stats on each opponent at the online table (VPIP, PFR…).' },
    es: { term: 'HUD', aka: ['Heads-up display'], def: 'Panel que superpone estadísticas de cada rival sobre la mesa online (VPIP, PFR…).' },
  },
  {
    category: 'strategy',
    en: { term: 'ICM', def: 'Independent Chip Model: converts tournament chips into real prize value. It explains why you should risk less on the bubble.' },
    es: { term: 'ICM', aka: ['Independent Chip Model'], def: 'Modelo que convierte fichas de torneo en valor real en premios. Explica por qué en la burbuja hay que arriesgar menos.' },
  },
  {
    category: 'strategy',
    en: { term: 'Table image', def: 'How opponents see you based on what you have shown. If they see you as tight, your bluffs work better.' },
    es: { term: 'Imagen', aka: ['Table image', 'Imagen de mesa'], def: 'Cómo te ven los rivales según lo que has mostrado. Si te ven tight, tus faroles funcionan mejor.' },
  },
  {
    category: 'tournaments',
    en: { term: 'In the money', def: 'Having passed the bubble: everyone left is guaranteed a prize.' },
    es: { term: 'In the money', aka: ['ITM', 'En premios'], def: 'Haber superado la burbuja: todos los que quedan ya cobran.' },
  },
  {
    category: 'strategy',
    en: { term: 'Induce', def: 'Deliberately showing weakness (checking, betting small) so the opponent bets or bluffs.' },
    es: { term: 'Inducir', aka: ['Induce'], def: 'Mostrar debilidad a propósito (pasar, apostar poco) para que el rival apueste o farolee.' },
  },
  {
    category: 'strategy',
    en: { term: 'Initiative', def: 'The advantage of being the last aggressor: your bets on the next street are more credible.' },
    es: { term: 'Iniciativa', aka: ['Initiative'], def: 'Ventaja de haber sido el último agresor: tus apuestas en la siguiente calle resultan más creíbles.' },
  },
  {
    category: 'actions',
    en: { term: 'Insta-call', def: 'Calling instantly, without thinking, usually with a very strong hand.' },
    es: { term: 'Insta-call', aka: ['Snap call', 'Snap'], def: 'Pagar al instante, sin pensarlo, normalmente con una mano muy fuerte.' },
  },
  {
    category: 'actions',
    en: { term: 'Insta-fold', def: 'Folding instantly, without thinking.' },
    es: { term: 'Insta-fold', aka: ['Snap fold'], def: 'Retirarse al instante, sin pensarlo.' },
  },
  {
    category: 'rooms',
    en: { term: 'Insurance', def: 'A side bet some rooms offer to cover you against losing an all-in as the favorite.' },
    es: { term: 'Insurance', aka: ['Seguro'], def: 'Apuesta paralela que ofrecen algunas salas para cubrirte de perder un all-in siendo favorito.' },
  },
  {
    category: 'strategy',
    en: { term: 'Behind', def: 'Having the worse hand at that moment and needing to improve to win.' },
    es: { term: 'Ir por detrás', aka: ['Behind', 'Ir detrás'], def: 'Tener en ese momento la peor mano y necesitar ligar para ganar.' },
  },
  {
    category: 'rooms',
    en: { term: 'Jackpot', def: 'An accumulated prize paid out under certain conditions, such as losing with a very strong hand.' },
    es: { term: 'Jackpot', aka: ['Bad beat jackpot'], def: 'Bote acumulado que se reparte en ciertas condiciones, como perder con una jugada muy alta.' },
  },
  {
    category: 'table',
    en: { term: 'Joker', def: 'A wild card. It is not used in Hold’em, but appears in some home variants.' },
    es: { term: 'Joker', aka: ['Comodín'], def: 'Carta comodín. No se usa en Hold’em, pero sí en algunas variantes caseras.' },
  },
  {
    category: 'players',
    en: { term: 'Weak player', def: 'A player who makes frequent mistakes. You beat them mainly by value betting.' },
    es: { term: 'Jugador débil', aka: ['Weak player'], def: 'Jugador que comete errores frecuentes. Contra él se gana sobre todo apostando por valor.' },
  },
  {
    category: 'players',
    en: { term: 'Recreational player', def: 'Someone who plays for fun without studying. They usually lose in the long run.' },
    es: { term: 'Jugador recreacional', aka: ['Recreativo', 'Recreational player', 'Rec'], def: 'Persona que juega por diversión, sin estudiar. Suele perder a largo plazo.' },
  },
  {
    category: 'players',
    en: { term: 'Regular', def: 'A regular player at a stake, usually with a solid strategy and lots of volume.' },
    es: { term: 'Jugador regular', aka: ['Reg', 'Regular'], def: 'Jugador habitual de un límite, normalmente con estrategia sólida y mucho volumen.' },
  },
  {
    category: 'slang',
    en: { term: 'Juicy', def: 'A table or game with many weak players and big pots: very profitable.' },
    es: { term: 'Juicy', aka: ['Mesa jugosa'], def: 'Mesa o partida con muchos jugadores débiles y botes grandes: muy rentable.' },
  },
  {
    category: 'hands',
    en: { term: 'Kicker', def: 'The card that breaks a tie between two equal hands. With AK on a K-7-2 flop, your pair of kings has an ace kicker.' },
    es: { term: 'Kicker', aka: ['Apoyo', 'Acompañante'], def: 'Carta que desempata entre dos manos iguales. Con AK en un flop K-7-2, tu pareja de K tiene "kicker" As.' },
  },
  {
    category: 'players',
    en: { term: 'LAG', def: 'Loose-aggressive: a player who plays many hands aggressively. Done well, very hard to play against.' },
    es: { term: 'LAG', aka: ['Loose aggressive', 'Loose agresivo'], def: 'Jugador que juega muchas manos y de forma agresiva. Bien hecho es muy difícil de jugar en contra.' },
  },
  {
    category: 'table',
    en: { term: 'Late position', def: 'The last seats to act: cutoff and button. They let you play more hands.' },
    es: { term: 'Late position', aka: ['Late', 'LP', 'Posición tardía'], def: 'Últimas posiciones en hablar: cutoff y botón. Permiten jugar más manos.' },
  },
  {
    category: 'actions',
    en: { term: 'Lead', def: 'Betting first on a street, especially out of position.' },
    es: { term: 'Lead', aka: ['Lead bet', 'Liderar'], def: 'Apostar el primero en una calle, sobre todo fuera de posición.' },
  },
  {
    category: 'strategy',
    en: { term: 'Leak', def: 'A repeated mistake in your game that costs you money, such as calling too much on the river.' },
    es: { term: 'Leak', aka: ['Fuga'], def: 'Error repetido en tu juego que te hace perder dinero, como pagar demasiado en el river.' },
  },
  {
    category: 'strategy',
    en: { term: 'Leveling', def: 'Thinking about what the opponent thinks you have (and so on). Overdoing it against simple players is a common mistake.' },
    es: { term: 'Levelear', aka: ['Leveling', 'Niveles de pensamiento'], def: 'Pensar en qué cree el rival que tienes tú (y así sucesivamente). Pasarse de nivel contra jugadores simples es un error común.' },
  },
  {
    category: 'actions',
    en: { term: 'Limp', def: 'Entering the pot preflop by just calling the big blind instead of raising. An "open limp" is doing it first in.' },
    es: { term: 'Limp', aka: ['Limpear', 'Open limp'], def: 'Entrar al bote preflop pagando solo la ciega grande en lugar de subir. Un "open limp" es hacerlo siendo el primero.' },
  },
  {
    category: 'actions',
    en: { term: 'Limp-raise', def: 'Limping and then re-raising when someone raises behind. It usually means a very strong hand.' },
    es: { term: 'Limp-raise', aka: ['Limp reraise', 'Limp-reraise'], def: 'Hacer limp y luego resubir cuando alguien sube detrás. Suele indicar una mano muy fuerte.' },
  },
  {
    category: 'players',
    en: { term: 'Limper', def: 'A player who entered the pot by limping.' },
    es: { term: 'Limper', def: 'Jugador que ha entrado al bote haciendo limp.' },
  },
  {
    category: 'players',
    en: { term: 'Loose', def: 'A style that plays many hands.' },
    es: { term: 'Loose', aka: ['Suelto'], def: 'Estilo que juega muchas manos.' },
  },
  {
    category: 'players',
    en: { term: 'Loose-passive', def: 'Plays many hands but rarely raises: calls a lot. The classic "calling station" profile.' },
    es: { term: 'Loose pasivo', aka: ['Loose passive'], def: 'Juega muchas manos pero rara vez sube: paga mucho. Es el perfil de la "calling station".' },
  },
  {
    category: 'rooms',
    en: { term: 'Low stakes', def: 'Games with low blinds, one step above micro stakes.' },
    es: { term: 'Low limit', aka: ['Small stakes', 'Bajos límites'], def: 'Partidas con ciegas bajas, un paso por encima de los microlímites.' },
  },
  {
    category: 'rooms',
    en: { term: 'Makeup', def: 'Losses a staked player must win back before splitting profits with their backer.' },
    es: { term: 'Makeup', def: 'Pérdidas que un jugador bancado debe recuperar antes de repartir ganancias con su bancador.' },
  },
  {
    category: 'players',
    en: { term: 'Maniac', def: 'A hyper-aggressive player who bets and raises with almost any hand.' },
    es: { term: 'Maníaco', aka: ['Maniac'], def: 'Jugador hiperagresivo que apuesta y sube casi con cualquier mano.' },
  },
  {
    category: 'hands',
    en: { term: 'Hand', def: 'Both each individual deal (from the deal until the pot is won) and your cards or your made hand.' },
    es: { term: 'Mano', aka: ['Hand'], def: 'Tanto cada partida individual (desde que se reparte hasta que se gana el bote) como tus cartas o tu jugada.' },
  },
  {
    category: 'hands',
    en: { term: 'Trash hand', def: 'A very bad starting hand that should almost always be folded, like 7-2 offsuit.' },
    es: { term: 'Mano basura', aka: ['Trash hand', 'Trash hands', 'Basura'], def: 'Mano inicial muy mala que casi siempre hay que tirar, como 7-2 de distinto palo.' },
  },
  {
    category: 'hands',
    en: { term: 'Speculative hand', def: 'A hand that rarely wins unimproved but can make strong hands, like small pairs or suited connectors.' },
    es: { term: 'Mano especulativa', aka: ['Speculative hand'], def: 'Mano que rara vez gana sin ligar pero puede formar jugadas fuertes, como parejas bajas o conectores del mismo palo.' },
  },
  {
    category: 'hands',
    en: { term: 'Made hand', def: 'A hand that already has something (a pair or better) and does not depend on a draw.' },
    es: { term: 'Mano hecha', aka: ['Made hand'], def: 'Mano que ya tiene una jugada (pareja o mejor) y no depende de un proyecto.' },
  },
  {
    category: 'hands',
    en: { term: 'Marginal hand', def: 'A hand on the edge between playing and folding, whose value depends heavily on the situation.' },
    es: { term: 'Mano marginal', aka: ['Marginal hand'], def: 'Mano en el límite entre jugarla o tirarla, cuyo valor depende mucho de la situación.' },
  },
  {
    category: 'rooms',
    en: { term: 'Markup', def: 'The premium a player charges when selling part of their action in a tournament.' },
    es: { term: 'Markup', def: 'Sobreprecio que pide un jugador al vender parte de su acción en un torneo.' },
  },
  {
    category: 'table',
    en: { term: 'Deck', def: 'The 52 cards of the standard deck used to play.' },
    es: { term: 'Mazo', aka: ['Baraja', 'Deck'], def: 'Las 52 cartas de la baraja francesa con las que se juega.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Final table', def: 'The last table of a tournament, where the biggest prizes are paid.' },
    es: { term: 'Mesa final', aka: ['Final table', 'FT'], def: 'La última mesa de un torneo, donde se reparten los premios más altos.' },
  },
  {
    category: 'strategy',
    en: { term: 'Metagame', def: 'Everything outside the specific hand that matters: history between players, image, mutual adjustments.' },
    es: { term: 'Metagame', aka: ['Metajuego'], def: 'Todo lo que influye fuera de la mano concreta: historial entre jugadores, imagen, ajustes mutuos.' },
  },
  {
    category: 'rooms',
    en: { term: 'Micro stakes', def: 'The lowest real-money stakes (cents). Ideal for starting out.' },
    es: { term: 'Microlímites', aka: ['Micro stakes', 'Micros'], def: 'Los límites más bajos con dinero real (céntimos). Ideales para empezar.' },
  },
  {
    category: 'rooms',
    en: { term: 'Mid stakes', def: 'Stakes between low and high.' },
    es: { term: 'Mid-stakes', aka: ['Middle limit', 'Límites medios'], def: 'Límites intermedios entre los bajos y los altos.' },
  },
  {
    category: 'table',
    en: { term: 'Middle position', def: 'The seats between early and late position.' },
    es: { term: 'Middle position', aka: ['Middle', 'MP', 'Posición media'], def: 'Posiciones entre las tempranas y las tardías.' },
  },
  {
    category: 'actions',
    en: { term: 'Min-raise', def: 'Raising the minimum allowed amount (double the previous bet).' },
    es: { term: 'Min-raise', aka: ['Mini raise', 'Min raise'], def: 'Subir la cantidad mínima permitida (el doble de la apuesta anterior).' },
  },
  {
    category: 'slang',
    en: { term: 'Misclick', def: 'Pressing the wrong button by mistake online.' },
    es: { term: 'Misclick', def: 'Pulsar el botón equivocado en online por error.' },
  },
  {
    category: 'table',
    en: { term: 'Monotone', def: 'A board where all the cards share a suit. Two cards of that suit already make a flush.' },
    es: { term: 'Monocolor', aka: ['Monotone', 'Flop monocolor'], def: 'Mesa con todas las cartas del mismo palo. Con dos cartas de ese palo ya tienes color.' },
  },
  {
    category: 'hands',
    en: { term: 'Monster', def: 'A huge hand, almost unbeatable in that spot.' },
    es: { term: 'Monster', aka: ['Monster hand', 'Monstruo'], def: 'Mano enorme, casi imbatible en esa situación.' },
  },
  {
    category: 'tournaments',
    en: { term: 'MTT', def: 'Multi-table tournament: a tournament with several tables that are merged as players are knocked out.' },
    es: { term: 'MTT', aka: ['Multi-table tournament', 'Torneo multimesa'], def: 'Torneo de varias mesas que se van juntando a medida que se elimina gente.' },
  },
  {
    category: 'actions',
    en: { term: 'Muck', def: 'Throwing away your cards without showing them, or the pile of discarded cards.' },
    es: { term: 'Muck', aka: ['Tirar al muck'], def: 'Tirar tus cartas sin enseñarlas, o el montón de cartas descartadas.' },
  },
  {
    category: 'slang',
    en: { term: 'NH', def: '"Nice hand". Sometimes said ironically.' },
    es: { term: 'NH', def: '"Nice hand": buena mano. A veces se dice con ironía.' },
  },
  {
    category: 'players',
    en: { term: 'Nit', def: 'An extremely tight player who only plays premium hands. If they bet big, they usually have it.' },
    es: { term: 'Nit', def: 'Jugador extremadamente tight que solo juega manos premium. Si apuesta fuerte, suele tener algo.' },
  },
  {
    category: 'rooms',
    en: { term: 'No limit', def: 'A format where you can bet all your chips at any time. The most popular way to play Hold’em.' },
    es: { term: 'No limit', aka: ['NL', 'Sin límite'], def: 'Modalidad en la que puedes apostar todas tus fichas en cualquier momento. Es la forma más popular de Hold’em.' },
  },
  {
    category: 'players',
    en: { term: 'Noob', def: 'A beginner.' },
    es: { term: 'Noob', aka: ['Newbie', 'Novato'], def: 'Jugador novato.' },
  },
  {
    category: 'rooms',
    en: { term: 'Nosebleed stakes', def: 'The highest stakes there are.' },
    es: { term: 'Nosebleed', def: 'Los límites más altos que existen.' },
  },
  {
    category: 'stats',
    en: { term: 'Note', def: 'A note you save about an opponent in the online room to remember how they play.' },
    es: { term: 'Nota', aka: ['Notes', 'Notas'], def: 'Apunte que guardas sobre un rival en la sala online para recordar cómo juega.' },
  },
  {
    category: 'hands',
    en: { term: 'Nuts', def: 'The best possible hand on that board. If you have it you cannot lose (at worst you split).' },
    es: { term: 'Nuts', aka: ['Absolute nuts', 'La nuts', 'Mejor mano posible'], def: 'La mejor jugada posible con esa mesa. Si la tienes, no puedes perder (como mucho empatar).' },
  },
  {
    category: 'strategy',
    en: { term: 'Odds', def: 'A probability expressed as a ratio (e.g. 4 to 1). Compared with pot odds to decide whether to call.' },
    es: { term: 'Odds', aka: ['Probabilidades'], def: 'Probabilidad expresada como proporción (por ejemplo, 4 a 1). Se compara con las pot odds para saber si pagar.' },
  },
  {
    category: 'strategy',
    en: { term: 'Implied odds', def: 'What you expect to win on later streets if you hit. They justify calling with draws even when pot odds fall short.' },
    es: { term: 'Odds implícitas', aka: ['Implied odds'], def: 'Lo que esperas ganar en calles futuras si ligas. Justifican pagar con proyectos aunque las pot odds no alcancen.' },
  },
  {
    category: 'hands',
    en: { term: 'Open-ended straight draw', def: 'A straight draw open at both ends (like 9-8-7-6): 8 outs. Practise it in Outs.' },
    es: { term: 'OESD', aka: ['Open-ended straight draw', 'Open ended', 'OE', 'Escalera abierta'], def: 'Proyecto de escalera abierto por los dos lados (como 9-8-7-6): 8 outs. Practícalo en Outs.' },
  },
  {
    category: 'hands',
    en: { term: 'Offsuit', def: 'Two starting cards of different suits, like AKo.' },
    es: { term: 'Offsuit', aka: ['Offsuited', 'Off'], def: 'Dos cartas iniciales de distinto palo, como AKo.' },
  },
  {
    category: 'slang',
    en: { term: 'One time', def: 'What players ask for (jokingly) in an all-in: "just this once", for the card they need to come.' },
    es: { term: 'One time', def: 'Lo que se pide (en broma) en un all-in: "solo esta vez", que salga la carta que necesitas.' },
  },
  {
    category: 'hands',
    en: { term: 'One-outer', def: 'A spot where only one card in the deck makes you win.' },
    es: { term: 'One-outer', def: 'Situación en la que solo una carta de la baraja te hace ganar.' },
  },
  {
    category: 'actions',
    en: { term: 'Open raise', def: 'Being the first to raise preflop when nobody has entered yet.' },
    es: { term: 'Open raise', aka: ['Open', 'Abrir', 'OR'], def: 'Ser el primero en subir preflop cuando nadie ha entrado aún.' },
  },
  {
    category: 'actions',
    en: { term: 'Open shove', def: 'Going all-in as the first player into the pot preflop. Typical with short stacks in tournaments.' },
    es: { term: 'Open shove', aka: ['Open push'], def: 'Ir all-in siendo el primero en entrar al bote preflop. Típico con stacks cortos en torneos.' },
  },
  {
    category: 'slang',
    en: { term: 'OTF', def: 'Short for "on the flop" in hand histories.' },
    es: { term: 'OTF', aka: ['On the flop'], def: 'Abreviatura de "en el flop" en historiales de manos.' },
  },
  {
    category: 'slang',
    en: { term: 'OTT', def: 'Short for "on the turn".' },
    es: { term: 'OTT', aka: ['On the turn'], def: 'Abreviatura de "en el turn".' },
  },
  {
    category: 'slang',
    en: { term: 'OTR', def: 'Short for "on the river".' },
    es: { term: 'OTR', aka: ['On the river'], def: 'Abreviatura de "en el river".' },
  },
  {
    category: 'hands',
    en: { term: 'Outkicked', def: 'Losing with the same hand as the opponent because their kicker is better.' },
    es: { term: 'Outkicked', aka: ['Superado por el kicker'], def: 'Perder con la misma jugada que el rival porque su carta de apoyo es mejor.' },
  },
  {
    category: 'hands',
    en: { term: 'Outs', def: 'Cards that can come and improve your hand to a probable winner. Train them in the Outs tool.' },
    es: { term: 'Outs', aka: ['Out'], def: 'Cartas que pueden salir y mejorar tu mano a una probablemente ganadora. Entrénalas en la herramienta Outs.' },
  },
  {
    category: 'actions',
    en: { term: 'Overbet', def: 'Betting more than the size of the pot.' },
    es: { term: 'Overbet', def: 'Apostar más que el tamaño del bote.' },
  },
  {
    category: 'actions',
    en: { term: 'Overcall', def: 'Calling a bet after another player has already called it.' },
    es: { term: 'Overcall', def: 'Pagar una apuesta después de que otro jugador ya la haya pagado.' },
  },
  {
    category: 'hands',
    en: { term: 'Overcard', def: 'One of your cards that is higher than every card on the board. Each overcard usually gives 3 outs to top pair.' },
    es: { term: 'Overcard', aka: ['Overcards', 'Sobrecarta'], def: 'Carta tuya más alta que todas las de la mesa. Cada overcard suele dar 3 outs para pareja máxima.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Overlay', def: 'When a guaranteed tournament does not reach the prize pool through entries and the room covers the difference. Extra value for players.' },
    es: { term: 'Overlay', def: 'Cuando un torneo garantizado no llega al premio con las inscripciones y la sala pone la diferencia. Es valor extra para los jugadores.' },
  },
  {
    category: 'hands',
    en: { term: 'Overpair', def: 'A pocket pair higher than every card on the board, like QQ on J-7-3.' },
    es: { term: 'Overpair', def: 'Pareja en mano más alta que todas las cartas de la mesa, como QQ en J-7-3.' },
  },
  {
    category: 'hands',
    en: { term: 'Set over set', def: 'Holding a higher set than the opponent’s set.' },
    es: { term: 'Overset', aka: ['Set over set'], def: 'Tener un trío más alto que el trío del rival.' },
  },
];
