// Glossary terms 0–9, A and B (by their Spanish name). Original definitions written for PokerToolBox.
import type { Term } from './types';

export const TERMS_0_B: Term[] = [
  {
    category: 'actions',
    en: { term: '3-bet', def: 'The third bet in a betting round: re-raising someone who has already raised. Preflop the big blind counts as the first bet, so the first re-raise is a 3-bet.' },
    es: { term: '3-bet', aka: ['3bet', 'Three-bet'], def: 'Tercera apuesta de una ronda: resubir a alguien que ya ha subido. Preflop, la ciega grande cuenta como primera apuesta, así que la primera resubida a una subida es un 3-bet.' },
  },
  {
    category: 'actions',
    en: { term: '4-bet', def: 'Re-raising a 3-bet. It usually means a very strong hand or a well-chosen bluff.' },
    es: { term: '4-bet', aka: ['4bet'], def: 'Resubir un 3-bet. Suele indicar una mano muy fuerte o un farol bien elegido.' },
  },
  {
    category: 'actions',
    en: { term: '5-bet', def: 'Re-raising a 4-bet. In practice it almost always means going all-in or close to it.' },
    es: { term: '5-bet', aka: ['5bet'], def: 'Resubir un 4-bet. En la práctica casi siempre supone ir all-in o quedarse muy cerca.' },
  },
  {
    category: 'table',
    en: { term: '6-max', def: 'A table with at most six players. You play more hands per position and ranges are wider than at a full table.' },
    es: { term: '6-max', def: 'Mesa de como máximo seis jugadores. Se juegan más manos por posición y los rangos son más amplios que en mesa completa.' },
  },
  {
    category: 'table',
    en: { term: '9-max', def: 'A table with up to nine players (sometimes ten). The classic format; play is tighter than at 6-max.' },
    es: { term: '9-max', aka: ['Full ring', 'Mesa completa'], def: 'Mesa de hasta nueve jugadores (a veces diez). Es el formato clásico; se juega más tight que en 6-max.' },
  },
  {
    category: 'actions',
    en: { term: 'In the dark', def: 'Acting (betting or checking) before seeing the next community card. Used to show indifference or to avoid giving away timing tells.' },
    es: { term: 'A ciegas', aka: ['In the dark', 'Bet in the dark', 'Check in the dark', 'Pasar a ciegas'], def: 'Actuar (apostar o pasar) antes de ver la siguiente carta comunitaria. Se usa para mostrar despreocupación o para no dar información con el tiempo de reacción.' },
  },
  {
    category: 'slang',
    en: { term: 'A-game', def: 'Your best level of play: focused, off tilt and making good decisions.' },
    es: { term: 'A-Game', def: 'Tu mejor nivel de juego: concentrado, sin tilt y tomando buenas decisiones.' },
  },
  {
    category: 'actions',
    en: { term: 'Leave the table', def: 'Quitting the game or the table. In a tournament, the chips of a player who leaves keep paying blinds until they run out.' },
    es: { term: 'Abandonar', aka: ['Retirarse de la mesa'], def: 'Dejar la partida o la mesa. En torneo, las fichas de quien abandona siguen pagando ciegas hasta que se acaban.' },
  },
  {
    category: 'strategy',
    en: { term: 'ABC poker', def: 'A simple, predictable style: bet good hands, fold bad ones and bluff rarely. It works well against weak players.' },
    es: { term: 'ABC Poker', def: 'Estilo sencillo y predecible: apostar con manos buenas, tirar las malas y farolear poco. Funciona bien contra jugadores flojos.' },
  },
  {
    category: 'slang',
    en: { term: 'Action', def: 'Betting activity in a hand or at a table. "Lots of action" means lots of betting and calling.' },
    es: { term: 'Acción', aka: ['Action'], def: 'Movimiento de apuestas en una mano o mesa. "Hay mucha acción" significa que se apuesta y se paga mucho.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Add-on', def: 'An extra chip purchase some tournaments offer, usually once at the end of the rebuy period.' },
    es: { term: 'Add-on', def: 'Compra extra de fichas que ofrecen algunos torneos, normalmente una sola vez al final del periodo de recompras.' },
  },
  {
    category: 'players',
    en: { term: 'Aggressive', def: 'A player who prefers betting and raising to calling or checking. Combined with good hand selection it is a winning style.' },
    es: { term: 'Agresivo', aka: ['Aggressive', 'Jugador agresivo'], def: 'Jugador que prefiere apostar y subir antes que pagar o pasar. Con buena selección de manos es un estilo ganador.' },
  },
  {
    category: 'strategy',
    en: { term: 'Aggressor', def: 'The last player who bet or raised on the previous street. They usually hold the initiative on the next one.' },
    es: { term: 'Agresor', def: 'El último jugador que apostó o subió en la calle anterior. Suele tener la iniciativa en la siguiente.' },
  },
  {
    category: 'hands',
    en: { term: 'Air', def: 'A hand with nothing: no pair and no draw. Betting with air is a pure bluff.' },
    es: { term: 'Aire', aka: ['Air'], def: 'Mano sin nada: ni pareja ni proyecto. Apostar con aire es un farol puro.' },
  },
  {
    category: 'actions',
    en: { term: 'Isolate', def: 'Raising after one or more limpers to get heads-up with a weak player, ideally in position.' },
    es: { term: 'Aislar', aka: ['Isolate', 'Isolation raise'], def: 'Subir tras uno o varios limpers para quedarte mano a mano con un jugador débil y con posición.' },
  },
  {
    category: 'actions',
    en: { term: 'All-in', def: 'Betting all your chips. You cannot act further in the hand and only compete for the part of the pot you can cover.' },
    es: { term: 'All-in', aka: ['All in', 'Ir all-in'], def: 'Apostar todas tus fichas. A partir de ahí no puedes actuar más en la mano y solo compites por el bote que puedas cubrir.' },
  },
  {
    category: 'slang',
    en: { term: 'Angle shot', def: 'An unethical move that exploits a gap in the rules to mislead an opponent (for example, pretending to call to see their reaction).' },
    es: { term: 'Angle shot', aka: ['Angle', 'Angle-shot'], def: 'Jugada poco ética que aprovecha un vacío de las reglas para confundir al rival (por ejemplo, fingir que pagas para ver su reacción).' },
  },
  {
    category: 'table',
    en: { term: 'Ante', def: 'A small forced contribution every player makes before the deal, on top of the blinds. It makes pots bigger from the start.' },
    es: { term: 'Ante', aka: ['Antes'], def: 'Pequeña aportación obligatoria que ponen todos los jugadores antes de repartir, además de las ciegas. Hace los botes más grandes desde el principio.' },
  },
  {
    category: 'slang',
    en: { term: 'Any two cards', def: 'Playing a hand regardless of what it is, for example when stealing blinds with a big edge.' },
    es: { term: 'Any two', aka: ['Any two cards', 'ATC'], def: '"Cualquier par de cartas": jugar una mano sin importar cuáles sean, por ejemplo al robar ciegas con mucha ventaja.' },
  },
  {
    category: 'actions',
    en: { term: 'Bet', def: 'Putting chips into the pot when nobody has bet yet on that street. The others must call, raise or fold.' },
    es: { term: 'Apostar', aka: ['Bet', 'Apuesta'], def: 'Poner fichas en el bote cuando nadie ha apostado antes en esa calle. Los demás tienen que igualar, subir o retirarse.' },
  },
  {
    category: 'actions',
    en: { term: 'Blocking bet', def: 'A small bet out of position to see the next card or showdown more cheaply than if the opponent bet.' },
    es: { term: 'Apuesta de bloqueo', aka: ['Blocking bet', 'Blocker bet'], def: 'Apuesta pequeña fuera de posición para ver la siguiente carta o el showdown más barato que si el rival apostara.' },
  },
  {
    category: 'actions',
    en: { term: 'Continuation bet', def: 'A flop bet by the preflop raiser, whether or not they hit. It takes advantage of the initiative.' },
    es: { term: 'Apuesta de continuación', aka: ['Continuation bet', 'C-bet', 'Cbet'], def: 'Apuesta en el flop del jugador que subió preflop, haya ligado o no. Aprovecha la iniciativa.' },
  },
  {
    category: 'actions',
    en: { term: 'Protection bet', def: 'A bet with a made but vulnerable hand so draws have to pay and do not see the next card for free.' },
    es: { term: 'Apuesta de protección', aka: ['Protection bet'], def: 'Apuesta con una mano hecha pero vulnerable para cobrar a los proyectos y que no vean la siguiente carta gratis.' },
  },
  {
    category: 'actions',
    en: { term: 'Value bet', def: 'Betting in the hope that a worse hand calls. It is the main source of profit in poker.' },
    es: { term: 'Apuesta por valor', aka: ['Value bet', 'Value', 'Valuebet'], def: 'Apostar esperando que te pague una mano peor. Es la principal fuente de ganancias del póker.' },
  },
  {
    category: 'hands',
    en: { term: 'Ace high', def: 'A hand with no pair whose highest card is an ace. Sometimes it is enough to win at showdown.' },
    es: { term: 'As alto', aka: ['Ace high', 'Carta alta As'], def: 'Mano sin pareja cuya carta más alta es un As. A veces basta para ganar en el showdown.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Average stack', def: 'The average number of chips per remaining player in a tournament. It tells you whether you are above or below the field.' },
    es: { term: 'Average stack', aka: ['Stack medio'], def: 'Número medio de fichas por jugador que queda en un torneo. Sirve para saber si vas por encima o por debajo de la media.' },
  },
  {
    category: 'hands',
    en: { term: 'Backdoor draw', def: 'A draw that needs both remaining cards (turn and river) to help you. E.g. holding 3 cards of a suit on the flop.' },
    es: { term: 'Backdoor', aka: ['Backdoor draw', 'Backdoor flush', 'Backdoor straight', 'Runner-runner draw'], def: 'Proyecto que necesita que salgan las dos cartas que faltan (turn y river) a tu favor. Ej.: tener 3 cartas de un palo en el flop.' },
  },
  {
    category: 'slang',
    en: { term: 'Bad beat', def: 'Losing a hand as a big favorite because the opponent hits a very unlikely card at the end.' },
    es: { term: 'Bad beat', aka: ['Badbeat'], def: 'Perder una mano siendo gran favorito, porque el rival liga una carta muy improbable al final.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Bullet', def: 'Each entry you buy into a re-entry tournament. "Firing three bullets" means entering three times.' },
    es: { term: 'Bala', aka: ['Bullet'], def: 'Cada entrada que compras a un torneo con reentradas. "Disparar tres balas" es entrar tres veces.' },
  },
  {
    category: 'rooms',
    en: { term: 'Bankroll', def: 'Money you set aside only for poker. Managing it well protects you from variance.' },
    es: { term: 'Bankroll', aka: ['Banca', 'Fondos'], def: 'Dinero que reservas solo para jugar al póker. Gestionarlo bien te protege de la varianza.' },
  },
  {
    category: 'rooms',
    en: { term: 'Backer', def: 'Someone who pays another player’s buy-ins in exchange for a share of their winnings (staking).' },
    es: { term: 'Bancador', aka: ['Backer', 'Bancar', 'Staking'], def: 'Persona que paga las entradas de otro jugador a cambio de parte de sus ganancias. "Bancar" es hacer de bancador.' },
  },
  {
    category: 'rooms',
    en: { term: 'Bankroll management', def: 'Rules for playing stakes that suit your bankroll (for example, keeping at least 30–50 buy-ins for your level).' },
    es: { term: 'Bankroll management', aka: ['BRM', 'Gestión de bankroll'], def: 'Reglas para jugar a límites acordes a tu bankroll (por ejemplo, tener al menos 30–50 entradas del nivel que juegas).' },
  },
  {
    category: 'actions',
    en: { term: 'Barrel', def: 'Each consecutive bet on a new street after betting before. "Firing barrels" means continuing to bet on the turn and river.' },
    es: { term: 'Barrel', aka: ['Barrelear'], def: 'Cada apuesta consecutiva en calles distintas tras haber apostado antes. "Disparar varios barrels" es seguir apostando en turn y river.' },
  },
  {
    category: 'actions',
    en: { term: 'Missed c-bet', def: 'Checking when a bet was expected (for example, the preflop raiser not c-betting the flop).' },
    es: { term: 'Bet miss', def: 'Pasar cuando lo esperado era apostar (por ejemplo, el agresor preflop que no hace c-bet en el flop).' },
  },
  {
    category: 'hands',
    en: { term: 'Best hand', def: 'The hand that is ahead at that moment, or the one that wins at showdown.' },
    es: { term: 'Best hand', aka: ['Mejor mano'], def: 'La mano que va por delante en ese momento o la que gana en el showdown.' },
  },
  {
    category: 'rooms',
    en: { term: 'Big bet', def: 'In fixed-limit games, the double-size bet used on the turn and river.' },
    es: { term: 'Big bet', aka: ['Apuesta grande'], def: 'En partidas de límite fijo, la apuesta del doble de tamaño que se usa en turn y river.' },
  },
  {
    category: 'hands',
    en: { term: 'Big Slick', def: 'Nickname for ace-king as a starting hand. Very strong, but without improving it is still only ace high.' },
    es: { term: 'Big Slick', aka: ['AK', 'Anna Kournikova'], def: 'Apodo de la mano inicial As-Rey. Muy fuerte, pero sin ligar sigue siendo solo carta alta.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Big stack', def: 'A player with many chips compared with the rest of the table, able to pressure the short stacks.' },
    es: { term: 'Big stack', def: 'Jugador con muchas fichas respecto al resto de la mesa, que puede presionar a los stacks cortos.' },
  },
  {
    category: 'table',
    en: { term: 'Blank', def: 'A community card that changes nothing: it completes no draw and does not pair the board.' },
    es: { term: 'Blank', aka: ['Brick', 'Carta blanca', 'Ladrillo'], def: 'Carta comunitaria que no cambia nada: no completa proyectos ni empareja la mesa.' },
  },
  {
    category: 'strategy',
    en: { term: 'Blocker', def: 'A card in your hand that reduces the combinations your opponent can hold. E.g. holding the ace of hearts makes it less likely they have the nut flush.' },
    es: { term: 'Blocker', aka: ['Bloqueador', 'Card removal', 'Card removal effect'], def: 'Carta en tu mano que reduce las combinaciones que puede tener el rival. Ej.: tener el As de corazones hace menos probable que él tenga el color máximo.' },
  },
  {
    category: 'strategy',
    en: { term: 'Bluff catcher', def: 'A hand that only beats bluffs: it loses to any value bet. You call with it when you think the opponent is bluffing.' },
    es: { term: 'Bluff catcher', aka: ['Caza faroles'], def: 'Mano que solo gana a faroles: pierde contra cualquier apuesta por valor. Se paga con ella cuando crees que el rival farolea.' },
  },
  {
    category: 'strategy',
    en: { term: 'Bluff-heavy', def: 'A betting range with many bluffs relative to value hands.' },
    es: { term: 'Bluff heavy', aka: ['Orientado a farol'], def: 'Rango de apuestas con muchos faroles en proporción a las manos de valor.' },
  },
  {
    category: 'table',
    en: { term: 'Board', def: 'The face-up community cards in the middle: flop, turn and river.' },
    es: { term: 'Board', aka: ['Mesa', 'Tablero'], def: 'Las cartas comunitarias boca arriba en el centro: flop, turn y river.' },
  },
  {
    category: 'slang',
    en: { term: 'Boat', def: 'Slang for a full house.' },
    es: { term: 'Boat', aka: ['Full boat'], def: 'Forma coloquial de llamar al full.' },
  },
  {
    category: 'rooms',
    en: { term: 'Bonus', def: 'Extra money a poker room offers, usually on deposit, released as you play. A bonus code activates it.' },
    es: { term: 'Bono', aka: ['Bonus', 'Código de bono', 'Bonus code'], def: 'Dinero extra que ofrece una sala, normalmente al depositar, y que se libera jugando. El código de bono es la clave para activarlo.' },
  },
  {
    category: 'rooms',
    en: { term: 'Bot', def: 'A program that plays by itself. Bots are banned in online poker rooms.' },
    es: { term: 'Bot', def: 'Programa que juega solo. Está prohibido en las salas online.' },
  },
  {
    category: 'table',
    en: { term: 'Pot', def: 'All the chips bet in a hand, which the winner takes.' },
    es: { term: 'Bote', aka: ['Pot', 'Pozo'], def: 'Todas las fichas apostadas en una mano, que se lleva el ganador.' },
  },
  {
    category: 'table',
    en: { term: 'Multiway pot', def: 'A pot with three or more players. Play more carefully: it is more likely someone has something.' },
    es: { term: 'Bote multijugador', aka: ['Multiway pot', 'Multiway', 'Family pot'], def: 'Bote en el que participan tres o más jugadores. Hay que ser más prudente: es más fácil que alguien tenga algo.' },
  },
  {
    category: 'table',
    en: { term: 'Main pot', def: 'The pot every player competes for, including the all-in player. Anything bet beyond that goes to a side pot.' },
    es: { term: 'Bote principal', aka: ['Main pot'], def: 'Bote en el que compiten todos, incluido el jugador all-in. Lo que se apuesta por encima va a un bote secundario.' },
  },
  {
    category: 'table',
    en: { term: 'Button', def: 'The disc that marks the nominal dealer. It is the best position: it acts last after the flop.' },
    es: { term: 'Botón', aka: ['Button', 'BTN', 'Dealer button'], def: 'Disco que marca al repartidor teórico. Es la mejor posición: actúa el último después del flop.' },
  },
  {
    category: 'hands',
    en: { term: 'Bottom pair', def: 'Pairing the lowest card on the board.' },
    es: { term: 'Bottom pair', aka: ['Bottom', 'Pareja baja'], def: 'Emparejar la carta más baja de la mesa.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Bounty', def: 'A prize for knocking out a specific player. In knockout tournaments every player carries a bounty.' },
    es: { term: 'Bounty', aka: ['Recompensa', 'Knockout', 'KO'], def: 'Premio por eliminar a un jugador concreto. En los torneos knockout cada jugador lleva una recompensa.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Bracelet', def: 'The trophy awarded to the winner of each WSOP event.' },
    es: { term: 'Brazalete', aka: ['Bracelet'], def: 'Trofeo que reciben los ganadores de cada evento de las WSOP.' },
  },
  {
    category: 'rooms',
    en: { term: 'Break even', def: 'Neither winning nor losing in the long run. A break-even player ends up at zero (sometimes thanks to rakeback).' },
    es: { term: 'Break even', def: 'Ni ganar ni perder a largo plazo. Un jugador "break even" sale a cero (a veces gracias al rakeback).' },
  },
  {
    category: 'hands',
    en: { term: 'Broadway', def: 'The highest straight: A-K-Q-J-T. Cards from ten to ace are also called Broadway cards.' },
    es: { term: 'Broadway', aka: ['AKQJT', 'Escalera al As'], def: 'La escalera más alta: A-K-Q-J-T. También se llama así a las cartas de T a A.' },
  },
  {
    category: 'players',
    en: { term: 'Bumhunter', def: 'A player who only sits at tables with weak opponents and avoids good ones.' },
    es: { term: 'Bumhunter', def: 'Jugador que solo se sienta en mesas con rivales débiles y evita a los buenos.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Bubble', def: 'The point of a tournament just before the money. Whoever busts there (the "bubble boy") leaves with nothing.' },
    es: { term: 'Burbuja', aka: ['Bubble'], def: 'Momento del torneo justo antes de entrar en premios. El que cae ahí es el "bubble boy" y se va sin nada.' },
  },
  {
    category: 'table',
    en: { term: 'Burn card', def: 'A card the dealer discards face down before dealing the flop, turn and river, to prevent cheating.' },
    es: { term: 'Burn card', aka: ['Carta quemada'], def: 'Carta que el crupier descarta boca abajo antes de sacar flop, turn y river, para evitar trampas.' },
  },
  {
    category: 'slang',
    en: { term: 'Bust', def: 'Running out of chips in a tournament, or out of bankroll.' },
    es: { term: 'Busto', aka: ['Bust out', 'Quiebra', 'Broke'], def: 'Quedarse sin fichas en un torneo o sin bankroll.' },
  },
  {
    category: 'rooms',
    en: { term: 'Buy-in', def: 'The cost of entering a tournament, or the money you sit down with at a cash table.' },
    es: { term: 'Buy-in', aka: ['Buy in', 'Entrada', 'Entry fee', 'Caja'], def: 'Lo que cuesta entrar a un torneo o el dinero con el que te sientas en una mesa de cash.' },
  },
];
