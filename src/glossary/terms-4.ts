// Glossary terms P to Z (by their Spanish name). Original definitions written for PokerToolBox.
import type { Term } from './types';

export const TERMS_P_Z: Term[] = [
  {
    category: 'actions',
    en: { term: 'Call', def: 'Putting in the same amount as the previous bet or raise to stay in the hand.' },
    es: { term: 'Pagar', aka: ['Call', 'Igualar', 'Ver'], def: 'Poner la misma cantidad que la apuesta o subida anterior para seguir en la mano.' },
  },
  {
    category: 'hands',
    en: { term: 'Pair', def: 'Two cards of the same rank, like 8-8.' },
    es: { term: 'Pareja', aka: ['Pair', 'Una pareja'], def: 'Dos cartas del mismo rango, como 8-8.' },
  },
  {
    category: 'hands',
    en: { term: 'Two pair', def: 'Two different pairs plus an unpaired card, like K-K-5-5-A.' },
    es: { term: 'Dobles parejas', aka: ['Double pair', 'Two pair', 'Pareja doble'], def: 'Dos parejas distintas más una carta suelta, como K-K-5-5-A.' },
  },
  {
    category: 'hands',
    en: { term: 'Pocket pair', def: 'Being dealt a pair as your two starting cards, like 7♠7♦.' },
    es: { term: 'Pareja en mano', aka: ['Pocket pair', 'Pareja de mano'], def: 'Recibir una pareja en tus dos cartas iniciales, como 7♠7♦.' },
  },
  {
    category: 'hands',
    en: { term: 'Top pair', def: 'Pairing the highest card on the board with one of yours.' },
    es: { term: 'Pareja máxima', aka: ['Top pair', 'Pareja mayor'], def: 'Emparejar la carta más alta de la mesa con una de las tuyas.' },
  },
  {
    category: 'hands',
    en: { term: 'Middle pair', def: 'Pairing the second-highest card on the board.' },
    es: { term: 'Pareja media', aka: ['Middle pair', 'Mid pair'], def: 'Emparejar la segunda carta más alta de la mesa.' },
  },
  {
    category: 'actions',
    en: { term: 'Check', def: 'Not betting when nobody has bet yet on that street, passing the action without putting in chips.' },
    es: { term: 'Pasar', aka: ['Check'], def: 'No apostar cuando nadie lo ha hecho antes en esa calle, pasando el turno sin poner fichas.' },
  },
  {
    category: 'players',
    en: { term: 'Passive', def: 'A player who prefers checking and calling to betting or raising.' },
    es: { term: 'Pasivo', aka: ['Passive', 'Jugador pasivo'], def: 'Jugador que prefiere pasar y pagar antes que apostar o subir.' },
  },
  {
    category: 'strategy',
    en: { term: 'Betting pattern', def: 'The usual way a player bets depending on their hand. Spotting it helps you read them.' },
    es: { term: 'Patrón de apuesta', aka: ['Betting pattern'], def: 'Forma habitual en que un jugador apuesta según su mano. Detectarlo ayuda a leerle.' },
  },
  {
    category: 'actions',
    en: { term: 'Peel', def: 'Calling a bet to see one more card, planning to give up if you do not improve.' },
    es: { term: 'Peel', aka: ['Pelar'], def: 'Pagar una apuesta para ver una carta más, sin intención de seguir si no mejoras.' },
  },
  {
    category: 'stats',
    en: { term: 'PFR', def: 'Preflop raise: the percentage of hands in which a player raises preflop. Together with VPIP it describes their style.' },
    es: { term: 'PFR', aka: ['Preflop raise', 'Preflop raise %'], def: 'Porcentaje de manos en las que un jugador sube preflop. Junto al VPIP retrata su estilo.' },
  },
  {
    category: 'rooms',
    en: { term: 'Pineapple', def: 'A Hold’em variant where you get three cards and discard one (before or after the flop, depending on the version).' },
    es: { term: 'Pineapple', aka: ['Pineapple poker'], def: 'Variante de Hold’em en la que recibes tres cartas y descartas una (antes o después del flop, según la versión).' },
  },
  {
    category: 'rooms',
    en: { term: 'Play money', def: 'Tables with chips that have no real value, for practice.' },
    es: { term: 'Play money', aka: ['Dinero ficticio', 'Fichas de juego'], def: 'Mesas con fichas sin valor real, para practicar.' },
  },
  {
    category: 'rooms',
    en: { term: 'PLO', def: 'Pot-Limit Omaha: each player gets four cards, must use exactly two, and the maximum bet is the size of the pot.' },
    es: { term: 'PLO', aka: ['Pot Limit Omaha', 'Omaha'], def: 'Variante con cuatro cartas por jugador, de las que debes usar exactamente dos, y apuesta máxima del tamaño del bote.' },
  },
  {
    category: 'rooms',
    en: { term: 'PLO5', def: 'Like PLO but with five cards per player.' },
    es: { term: 'PLO5', aka: ['Pot Limit Omaha 5', 'Omaha 5 cartas'], def: 'Como PLO pero con cinco cartas por jugador.' },
  },
  {
    category: 'hands',
    en: { term: 'Four of a kind', def: 'Four cards of the same rank, like 9-9-9-9 (also called quads). It only loses to a straight flush.' },
    es: { term: 'Póker', aka: ['Quads', 'Four of a kind', 'Cuatro iguales'], def: 'Cuatro cartas del mismo rango, como 9-9-9-9. Solo pierde contra la escalera de color.' },
  },
  {
    category: 'slang',
    en: { term: 'Poker face', def: 'A neutral expression that does not reveal what you have.' },
    es: { term: 'Poker face', aka: ['Cara de póker'], def: 'Expresión neutra que no revela lo que tienes.' },
  },
  {
    category: 'stats',
    en: { term: 'PokerTracker', def: 'Hand-tracking and stats software, an alternative to Hold’em Manager.' },
    es: { term: 'PokerTracker', aka: ['Poker tracker', 'PT4'], def: 'Programa de seguimiento de manos y estadísticas, alternativa a Hold’em Manager.' },
  },
  {
    category: 'strategy',
    en: { term: 'Polarize', def: 'Betting with a range of very strong hands and bluffs, with no medium hands. Associated with big bets.' },
    es: { term: 'Polarizar', aka: ['Polarize', 'Rango polarizado', 'Polarized range'], def: 'Apostar con un rango de manos muy fuertes y faroles, sin manos medias. Se asocia a apuestas grandes.' },
  },
  {
    category: 'table',
    en: { term: 'Postflop', def: 'Everything that happens after the flop is dealt: flop, turn and river.' },
    es: { term: 'Postflop', def: 'Todo lo que ocurre después de repartir el flop: flop, turn y river.' },
  },
  {
    category: 'strategy',
    en: { term: 'Pot committed', def: 'Having put in so many chips relative to your stack that folding no longer makes sense.' },
    es: { term: 'Pot committed', aka: ['Comprometido con el bote'], def: 'Haber metido tantas fichas en proporción a tu stack que retirarte ya no compensa.' },
  },
  {
    category: 'rooms',
    en: { term: 'Pot limit', def: 'A format where the maximum bet is the size of the pot at that moment.' },
    es: { term: 'Pot limit', aka: ['PL', 'Límite del bote'], def: 'Modalidad en la que la apuesta máxima es el tamaño del bote en ese momento.' },
  },
  {
    category: 'strategy',
    en: { term: 'Pot odds', def: 'The ratio between what you have to call and what you can win. If your chance of hitting is higher than the price, calling is profitable.' },
    es: { term: 'Pot odds', aka: ['Odds del bote'], def: 'Relación entre lo que tienes que pagar y lo que puedes ganar. Si tu probabilidad de ligar es mayor que la que te piden, pagar es rentable.' },
  },
  {
    category: 'table',
    en: { term: 'Preflop', def: 'The first betting round, with the hole cards dealt and before the flop.' },
    es: { term: 'Preflop', def: 'Primera ronda de apuestas, con las cartas iniciales repartidas y antes del flop.' },
  },
  {
    category: 'hands',
    en: { term: 'Premium hand', def: 'The best starting hands: AA, KK, QQ, AK…' },
    es: { term: 'Premium', aka: ['Premium hand', 'Mano premium'], def: 'Las mejores manos iniciales: AA, KK, QQ, AK…' },
  },
  {
    category: 'actions',
    en: { term: 'Probe bet', def: 'An out-of-position bet on the turn after the preflop raiser did not c-bet the flop.' },
    es: { term: 'Probe bet', aka: ['Probe'], def: 'Apuesta fuera de posición en el turn después de que el agresor preflop no hiciera c-bet en el flop.' },
  },
  {
    category: 'slang',
    en: { term: 'Prop bet', def: 'A bet between players on something unrelated to the hand (sports, challenges…). See also "Side bet".' },
    es: { term: 'Prop bet', aka: ['Apuesta lateral'], def: 'Apuesta entre jugadores sobre algo ajeno a la mano (deportes, retos…). Ver también "Side bet".' },
  },
  {
    category: 'strategy',
    en: { term: 'Protection', def: 'Betting so draws pay or fold instead of getting free cards. Also, placing a chip on your cards so they are not mucked.' },
    es: { term: 'Protección', aka: ['Proteger la mano'], def: 'Apostar para que los proyectos paguen o se retiren, en vez de darles cartas gratis. También, poner una ficha encima de tus cartas para que no las recojan.' },
  },
  {
    category: 'hands',
    en: { term: 'Draw', def: 'A hand that needs one more card to complete a strong hand, usually a flush or a straight.' },
    es: { term: 'Proyecto', aka: ['Draw', 'Drawing hand', 'Mano de proyecto'], def: 'Mano a la que le falta una carta para completar una jugada fuerte, normalmente color o escalera.' },
  },
  {
    category: 'hands',
    en: { term: 'Flush draw', def: 'Holding four cards of the same suit and waiting for the fifth: 9 outs.' },
    es: { term: 'Proyecto de color', aka: ['Flush draw', 'FD'], def: 'Tener cuatro cartas del mismo palo y esperar la quinta: 9 outs.' },
  },
  {
    category: 'hands',
    en: { term: 'Straight draw', def: 'Holding four cards that can make a straight with one more: open-ended (8 outs) or gutshot (4 outs).' },
    es: { term: 'Proyecto de escalera', aka: ['Straight draw'], def: 'Tener cuatro cartas que pueden formar escalera con una más: abierta (8 outs) o gutshot (4 outs).' },
  },
  {
    category: 'actions',
    en: { term: 'Shove', def: 'Going all-in, especially preflop with a short stack. "Push/fold" is the strategy of only going all-in or folding.' },
    es: { term: 'Push', aka: ['Shove', 'Jam', 'Empujar'], def: 'Ir all-in, sobre todo preflop con stack corto. "Push/fold" es la estrategia de solo ir all-in o tirar.' },
  },
  {
    category: 'table',
    en: { term: 'Rag', def: 'A low card that probably helps nobody.' },
    es: { term: 'Rag', aka: ['Carta baja'], def: 'Carta baja que probablemente no ayuda a nadie.' },
  },
  {
    category: 'table',
    en: { term: 'Ragged board', def: 'A board of low, disconnected cards, like 9-4-2 of different suits.' },
    es: { term: 'Ragged', aka: ['Mesa ragged', 'Ragged board'], def: 'Mesa de cartas bajas y desconectadas, como 9-4-2 de palos distintos.' },
  },
  {
    category: 'slang',
    en: { term: 'Rail', def: 'Watching a game from the outside, as a spectator (a "railbird").' },
    es: { term: 'Railear', aka: ['Rail', 'Railbird'], def: 'Mirar una partida desde fuera, como espectador.' },
  },
  {
    category: 'table',
    en: { term: 'Rainbow', def: 'A board where every card is a different suit: no flush draw.' },
    es: { term: 'Rainbow', aka: ['Arcoíris'], def: 'Mesa en la que todas las cartas son de palos distintos: no hay proyecto de color.' },
  },
  {
    category: 'stats',
    en: { term: 'Raked hand', def: 'A hand the room takes rake from (usually those that reach the flop).' },
    es: { term: 'Raked hand', aka: ['Mano con rake'], def: 'Mano de la que la sala cobra comisión (normalmente las que llegan al flop).' },
  },
  {
    category: 'rooms',
    en: { term: 'Rakeback', def: 'Part of the rake you paid that the room gives back to you.' },
    es: { term: 'Rakeback', def: 'Parte de la comisión pagada que la sala te devuelve.' },
  },
  {
    category: 'strategy',
    en: { term: 'Range', def: 'The set of hands a player can have in a spot. Think in ranges, not in one specific hand.' },
    es: { term: 'Rango', aka: ['Range', 'Rangos'], def: 'Conjunto de manos que puede tener un jugador en una situación. Se piensa en rangos, no en una mano concreta.' },
  },
  {
    category: 'strategy',
    en: { term: 'Wide range', def: 'A range with many different hands, typical of loose players or late positions.' },
    es: { term: 'Rango amplio', aka: ['Wide range'], def: 'Rango con muchas manos distintas, propio de jugadores loose o posiciones tardías.' },
  },
  {
    category: 'strategy',
    en: { term: 'Capped range', def: 'A range without the strongest hands, such as that of someone who only called preflop when they could have re-raised.' },
    es: { term: 'Rango capado', aka: ['Capped range'], def: 'Rango sin las manos más fuertes, por ejemplo el de quien solo pagó preflop pudiendo resubir.' },
  },
  {
    category: 'strategy',
    en: { term: 'Merged range', def: 'A range that bets strong and medium hands together, without pure bluffs (also called linear).' },
    es: { term: 'Rango despolarizado', aka: ['Merge range', 'Rango lineal', 'Linear range'], def: 'Rango que apuesta con manos fuertes y medias juntas, sin faroles puros.' },
  },
  {
    category: 'strategy',
    en: { term: 'Tight range', def: 'A range with few hands, only the best ones.' },
    es: { term: 'Rango estrecho', aka: ['Tight range', 'Narrow range'], def: 'Rango con pocas manos, solo las mejores.' },
  },
  {
    category: 'rooms',
    en: { term: 'Razz', def: 'A Stud variant where the lowest hand wins (the best is 5-4-3-2-A).' },
    es: { term: 'Razz', def: 'Variante de Stud en la que gana la mano más baja (la mejor es 5-4-3-2-A).' },
  },
  {
    category: 'rooms',
    en: { term: 'Real money', def: 'Games played for actual money, as opposed to play money.' },
    es: { term: 'Real money', aka: ['Dinero real'], def: 'Partidas con dinero de verdad, frente a las de play money.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Rebuy', def: 'Buying chips again in a tournament after losing them, during the allowed period.' },
    es: { term: 'Rebuy', aka: ['Recompra', 'Reentrada', 'Re-entry'], def: 'Volver a comprar fichas en un torneo después de perderlas, durante el periodo permitido.' },
  },
  {
    category: 'actions',
    en: { term: 'Re-raise', def: 'Raising after another player has already raised.' },
    es: { term: 'Resubida', aka: ['Reraise', 'Re-raise', 'Resubir'], def: 'Subir después de que otro jugador ya haya subido.' },
  },
  {
    category: 'actions',
    en: { term: 'Fold', def: 'Giving up the hand by throwing away your cards. You lose what you already put in the pot.' },
    es: { term: 'Retirarse', aka: ['Fold', 'Tirar', 'Foldear'], def: 'Abandonar la mano tirando tus cartas. Pierdes lo que ya pusiste en el bote.' },
  },
  {
    category: 'slang',
    en: { term: 'Rigged', def: 'A (nearly always unfounded) complaint that a poker room is fixed.' },
    es: { term: 'Rigged', aka: ['Amañado'], def: 'Queja (casi siempre infundada) de que una sala está trucada.' },
  },
  {
    category: 'table',
    en: { term: 'River', def: 'The fifth and last community card, followed by the final betting round.' },
    es: { term: 'River', def: 'Quinta y última carta comunitaria, seguida de la última ronda de apuestas.' },
  },
  {
    category: 'actions',
    en: { term: 'Blind steal', def: 'Raising from late position with a mediocre hand to take the blinds if nobody calls.' },
    es: { term: 'Robar la ciega', aka: ['Blind stealing', 'Steal', 'Robo de ciegas'], def: 'Subir desde posición tardía con una mano mediocre para llevarte las ciegas si nadie paga.' },
  },
  {
    category: 'players',
    en: { term: 'Rock', def: 'A very tight and passive player who hardly plays any hands. Very similar to a nit.' },
    es: { term: 'Roca', aka: ['Rock'], def: 'Jugador muy tight y pasivo que apenas juega manos. Muy parecido al nit.' },
  },
  {
    category: 'stats',
    en: { term: 'ROI', def: 'Return on investment in tournaments: profit divided by what you spent on buy-ins, as a %.' },
    es: { term: 'ROI', aka: ['Return on investment'], def: 'Retorno de la inversión en torneos: beneficio dividido entre lo gastado en entradas, en %.' },
  },
  {
    category: 'actions',
    en: { term: 'ROL', def: 'Raise over limpers: raising after one or more players have limped.' },
    es: { term: 'ROL', aka: ['Raise over limper', 'Raise over limpers'], def: 'Subir después de que uno o varios jugadores hayan hecho limp.' },
  },
  {
    category: 'slang',
    en: { term: 'Run', def: 'A streak (good or bad). Also a good tournament performance ("a deep run").' },
    es: { term: 'Run', aka: ['Racha'], def: 'Racha (buena o mala). También una buena actuación en un torneo ("hacer un deep run").' },
  },
  {
    category: 'table',
    en: { term: 'Run it twice', def: 'An agreement in an all-in to deal the remaining cards twice and split the pot by each result. It reduces variance.' },
    es: { term: 'Run it twice', aka: ['Repartir dos veces'], def: 'Acuerdo en un all-in para repartir las cartas restantes dos veces y dividir el bote según cada resultado. Reduce la varianza.' },
  },
  {
    category: 'hands',
    en: { term: 'Runner-runner', def: 'Hitting because both the turn and the river come your way.' },
    es: { term: 'Runner-runner', def: 'Ligar gracias a que salen a tu favor tanto el turn como el river.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Runner-up', def: 'The player who finishes second in a tournament.' },
    es: { term: 'Runner-up', aka: ['Subcampeón'], def: 'El segundo clasificado de un torneo.' },
  },
  {
    category: 'rooms',
    en: { term: 'Fast-fold poker', def: 'An online format where, when you fold, you instantly move to another table with new opponents (Rush, Zoom).' },
    es: { term: 'Rush poker', aka: ['Zoom poker', 'Fast fold', 'Zoom'], def: 'Formato online en el que, al retirarte, pasas al instante a otra mesa con rivales nuevos.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Satellite', def: 'A tournament whose prize is an entry into a more expensive tournament.' },
    es: { term: 'Satélite', aka: ['Satellite'], def: 'Torneo cuyo premio es la entrada a otro torneo más caro.' },
  },
  {
    category: 'slang',
    en: { term: 'Scared money', def: 'Playing with money you cannot afford to lose, which leads to fearful decisions.' },
    es: { term: 'Scared money', def: 'Jugar con dinero que no puedes permitirte perder, lo que lleva a decisiones miedosas.' },
  },
  {
    category: 'table',
    en: { term: 'Scare card', def: 'A community card that can complete many strong hands, such as the fourth card of a suit.' },
    es: { term: 'Scare card', aka: ['Scary card', 'Carta de miedo'], def: 'Carta comunitaria que puede completar muchas manos fuertes, como la cuarta del mismo palo.' },
  },
  {
    category: 'strategy',
    en: { term: 'Table selection', def: 'Choosing tables with weak opponents. One of the most profitable skills there is.' },
    es: { term: 'Selección de mesa', aka: ['Table selection'], def: 'Elegir mesas con rivales débiles. Es una de las habilidades que más ganancias da.' },
  },
  {
    category: 'actions',
    en: { term: 'Semi-bluff', def: 'Betting with a draw: you can win if the opponent folds or if you hit later.' },
    es: { term: 'Semifarol', aka: ['Semi bluff', 'Semi-bluff', 'Semi farol'], def: 'Apostar con un proyecto: puedes ganar si el rival se retira o si ligas después.' },
  },
  {
    category: 'hands',
    en: { term: 'Set', def: 'Three of a kind made with a pocket pair plus one board card. Very disguised and very strong.' },
    es: { term: 'Set', def: 'Trío formado con una pareja en mano más una carta de la mesa. Está muy disimulado y es muy fuerte.' },
  },
  {
    category: 'strategy',
    en: { term: 'Set mining', def: 'Calling preflop with a small pair hoping to flop a set (about 1 in 8.5 times). It needs deep stacks.' },
    es: { term: 'Set mining', def: 'Pagar preflop con una pareja baja buscando ligar un set (pasa 1 de cada 8,5 veces aprox.). Necesita stacks profundos.' },
  },
  {
    category: 'slang',
    en: { term: 'Setup', def: 'A spot where the cards make losing a big pot unavoidable, like set over set.' },
    es: { term: 'Setup', def: 'Situación en la que las cartas hacen inevitable perder un bote grande, como set contra set.' },
  },
  {
    category: 'players',
    en: { term: 'Shark', def: 'A very good player who preys on weak ones.' },
    es: { term: 'Shark', aka: ['Tiburón'], def: 'Jugador muy bueno que se aprovecha de los débiles.' },
  },
  {
    category: 'rooms',
    en: { term: 'Short deck', def: 'A Hold’em variant without the 2s to 5s. A flush beats a full house.' },
    es: { term: 'Short deck', aka: ['Six plus', '6+ Hold’em'], def: 'Variante de Hold’em sin las cartas del 2 al 5. El color gana al full.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Short stack', def: 'A player with few chips relative to the blinds or the table.' },
    es: { term: 'Short stack', aka: ['Shortstack', 'Stack corto'], def: 'Jugador con pocas fichas respecto a las ciegas o a la mesa.' },
  },
  {
    category: 'table',
    en: { term: 'Shorthanded', def: 'A table with few players (six or fewer).' },
    es: { term: 'Shorthanded', aka: ['Short-handed'], def: 'Mesa con pocos jugadores (seis o menos).' },
  },
  {
    category: 'table',
    en: { term: 'Showdown', def: 'The final moment when the remaining players show their cards to decide who wins.' },
    es: { term: 'Showdown', aka: ['Enseñar'], def: 'Momento final en el que los jugadores que quedan muestran sus cartas para decidir quién gana.' },
  },
  {
    category: 'slang',
    en: { term: 'Shuffle up and deal', def: 'The traditional phrase that starts a tournament.' },
    es: { term: 'Shuffle up and deal', aka: ['Shuffle and deal'], def: 'Frase tradicional para empezar un torneo: "barajen y repartan".' },
  },
  {
    category: 'slang',
    en: { term: 'Sick', def: 'Incredible, brutal (a play or a stroke of luck).' },
    es: { term: 'Sick', def: 'Increíble, brutal (una jugada o un golpe de suerte).' },
  },
  {
    category: 'slang',
    en: { term: 'Side bet', def: 'A bet between players outside the pot.' },
    es: { term: 'Side bet', def: 'Apuesta paralela entre jugadores, fuera del bote.' },
  },
  {
    category: 'table',
    en: { term: 'Side pot', def: 'A separate pot formed when someone is all-in and the others keep betting. The all-in player cannot win it.' },
    es: { term: 'Side pot', aka: ['Bote secundario'], def: 'Bote aparte que se forma cuando alguien va all-in y los demás siguen apostando. El jugador all-in no puede ganarlo.' },
  },
  {
    category: 'tournaments',
    en: { term: 'Sit & Go', def: 'A tournament that starts as soon as the seats fill, with no fixed start time. Usually a single table.' },
    es: { term: 'Sit & Go', aka: ['SNG', 'Sit and go', 'Sit n go'], def: 'Torneo que empieza en cuanto se llenan las plazas, sin hora fija. Suelen ser de una mesa.' },
  },
  {
    category: 'rooms',
    en: { term: 'Sit out', def: 'Sitting at the table without being dealt in for a while.' },
    es: { term: 'Sit out', aka: ['Ausente'], def: 'Estar sentado en la mesa sin recibir cartas temporalmente.' },
  },
  {
    category: 'strategy',
    en: { term: 'Skill', def: 'A player’s ability. In poker it outweighs luck in the long run.' },
    es: { term: 'Skill', aka: ['Habilidad'], def: 'Habilidad del jugador. En el póker, a largo plazo pesa más que la suerte.' },
  },
  {
    category: 'rooms',
    en: { term: 'Skin', def: 'A poker room that uses a larger network’s software and player pool under its own brand.' },
    es: { term: 'Skin', def: 'Sala que usa el software y los jugadores de una red más grande con su propia marca.' },
  },
  {
    category: 'strategy',
    en: { term: 'Slowplay', def: 'Playing a very strong hand passively to disguise it and get the opponent to put in more chips.' },
    es: { term: 'Slowplay', aka: ['Jugar lento', 'Slow play'], def: 'Jugar pasivamente una mano muy fuerte para disimularla y que el rival meta más fichas.' },
  },
  {
    category: 'slang',
    en: { term: 'Slowroll', def: 'Deliberately taking a long time to show a winning hand at showdown. Considered bad etiquette.' },
    es: { term: 'Slowroll', def: 'Tardar a propósito en enseñar una mano ganadora en el showdown. Se considera de mala educación.' },
  },
  {
    category: 'slang',
    en: { term: 'Soft', def: 'A table or tournament with weak opponents.' },
    es: { term: 'Soft', aka: ['Blando'], def: 'Mesa o torneo con rivales flojos.' },
  },
  {
    category: 'players',
    en: { term: 'Solid', def: 'A well-grounded player who makes few mistakes.' },
    es: { term: 'Sólido', aka: ['Solid'], def: 'Jugador fundamentado, que comete pocos errores.' },
  },
  {
    category: 'strategy',
    en: { term: 'SPR', def: 'Stack-to-pot ratio: the effective stack divided by the pot on the flop. With a low SPR it is easier to commit with a pair; with a high SPR, less so.' },
    es: { term: 'SPR', aka: ['Stack to pot ratio'], def: 'Relación entre el stack efectivo y el bote en el flop. Con SPR bajo es más fácil comprometerse con una pareja; con SPR alto, menos.' },
  },
  {
    category: 'actions',
    en: { term: 'Squeeze', def: 'Re-raising (3-betting) when there is already a raise and one or more calls, taking advantage of the dead money.' },
    es: { term: 'Squeeze', def: 'Resubir (3-bet) cuando ya hay una subida y uno o más pagos, aprovechando el dinero muerto.' },
  },
  {
    category: 'rooms',
    en: { term: 'Stable', def: 'A group of players staked and coached by the same organisation.' },
    es: { term: 'Stable', aka: ['Establo'], def: 'Grupo de jugadores bancados y entrenados por una misma organización.' },
  },
  {
    category: 'table',
    en: { term: 'Stack', def: 'The chips a player has.' },
    es: { term: 'Stack', aka: ['Pila'], def: 'Las fichas que tiene un jugador.' },
  },
  {
    category: 'strategy',
    en: { term: 'Effective stack', def: 'The smallest of the stacks involved in a hand: the most that can be won or lost between them.' },
    es: { term: 'Stack efectivo', aka: ['Effective stack'], def: 'El menor de los stacks implicados en una mano: es lo máximo que se puede ganar o perder entre ellos.' },
  },
  {
    category: 'stats',
    en: { term: 'Stats', def: 'Data about how someone plays (VPIP, PFR, AF…) gathered by tracking software.' },
    es: { term: 'Stats', aka: ['Estadísticas'], def: 'Datos sobre la forma de jugar (VPIP, PFR, AF…) que recogen los programas de seguimiento.' },
  },
  {
    category: 'rooms',
    en: { term: 'Stop loss', def: 'A loss limit after which you stop playing for the day.' },
    es: { term: 'Stop loss', def: 'Límite de pérdidas a partir del cual dejas de jugar ese día.' },
  },
  {
    category: 'table',
    en: { term: 'Straddle', def: 'A voluntary blind bet, usually twice the big blind, made by the UTG player before the deal.' },
    es: { term: 'Straddle', def: 'Apuesta ciega voluntaria, normalmente el doble de la ciega grande, que hace el jugador UTG antes de repartir.' },
  },
  {
    category: 'players',
    en: { term: 'Straightforward', def: 'A predictable player: bets when they have it and checks when they do not.' },
    es: { term: 'Straightforward', aka: ['Directo'], def: 'Jugador predecible: apuesta cuando tiene y pasa cuando no.' },
  },
  {
    category: 'rooms',
    en: { term: 'Streaming', def: 'Broadcasting your games live online.' },
    es: { term: 'Streaming', def: 'Retransmitir en directo tus partidas por internet.' },
  },
  {
    category: 'actions',
    en: { term: 'Raise', def: 'Increasing the bet already made on the street. The others must call the new amount, re-raise or fold.' },
    es: { term: 'Subir', aka: ['Raise', 'Subida'], def: 'Aumentar la apuesta que ya hay en la calle. Los demás tienen que pagar la nueva cantidad, resubir o retirarse.' },
  },
  {
    category: 'slang',
    en: { term: 'Suckout', def: 'Winning by hitting an unlikely card when you were far behind. The flip side of a bad beat.' },
    es: { term: 'Suckout', aka: ['Suck out'], def: 'Ganar ligando una carta improbable cuando ibas muy por detrás. Es el lado contrario del bad beat.' },
  },
  {
    category: 'hands',
    en: { term: 'Suited', def: 'Two starting cards of the same suit, like AKs.' },
    es: { term: 'Suited', aka: ['Del mismo palo'], def: 'Dos cartas iniciales del mismo palo, como AKs.' },
  },
  {
    category: 'strategy',
    en: { term: 'Starting hands chart', def: 'A chart showing which hands to play from each position.' },
    es: { term: 'Tabla de manos iniciales', aka: ['Starting hands chart'], def: 'Tabla que indica qué manos jugar según la posición.' },
  },
  {
    category: 'players',
    en: { term: 'TAG', def: 'Tight-aggressive: a player who plays few hands but aggressively. The recommended style for beginners.' },
    es: { term: 'TAG', aka: ['Tight aggressive', 'Tight agresivo'], def: 'Jugador que juega pocas manos pero de forma agresiva. Es el estilo recomendado para empezar.' },
  },
  {
    category: 'rooms',
    en: { term: 'Take a shot', def: 'Trying a higher stake than usual with a small part of your bankroll.' },
    es: { term: 'Take a shot', aka: ['Shot'], def: 'Probar suerte en un límite más alto del habitual con una parte pequeña del bankroll.' },
  },
  {
    category: 'strategy',
    en: { term: 'Bet sizing', def: 'How much you bet relative to the pot (a third, half, pot…). It changes the outcome of a hand a lot.' },
    es: { term: 'Tamaño de apuesta', aka: ['Bet sizing', 'Sizing'], def: 'Cuánto apuestas en relación al bote (un tercio, la mitad, el bote…). Cambia mucho el resultado de una mano.' },
  },
  {
    category: 'strategy',
    en: { term: 'Tell', def: 'An involuntary gesture or pattern that gives away the strength of a player’s hand.' },
    es: { term: 'Tell', def: 'Gesto o patrón involuntario que delata la fuerza de la mano de un jugador.' },
  },
  {
    category: 'rooms',
    en: { term: 'Texas Hold’em', def: 'The most played variant: two private cards per player and five community cards, with four betting rounds.' },
    es: { term: 'Texas Hold’em', aka: ['Hold’em', 'Holdem', 'Texas Holdem'], def: 'La variante más jugada: dos cartas privadas por jugador y cinco comunitarias, con cuatro rondas de apuestas.' },
  },
  {
    category: 'table',
    en: { term: 'Board texture', def: 'How connected the board is: dry, semi-coordinated, coordinated… It shapes how you should bet.' },
    es: { term: 'Textura', aka: ['Board texture', 'Textura de la mesa'], def: 'Cómo está de conectada la mesa: seca, semicoordinada, coordinada… Influye en cómo apostar.' },
  },
  {
    category: 'actions',
    en: { term: 'Triple barrel', def: 'Betting the river after betting the flop and the turn.' },
    es: { term: 'Third barrel', aka: ['Triple barrel', 'Tercer barrel'], def: 'Apostar en el river después de haber apostado en flop y turn.' },
  },
  {
    category: 'players',
    en: { term: 'Tight', def: 'A style that plays few hands, only good ones.' },
    es: { term: 'Tight', aka: ['Cerrado', 'Conservador'], def: 'Estilo que juega pocas manos, solo las buenas.' },
  },
  {
    category: 'slang',
    en: { term: 'Tilt', def: 'An emotional state (anger, frustration) that makes you play worse. Better to stop when you notice it.' },
    es: { term: 'Tilt', aka: ['Tiltearse', 'Tiltado'], def: 'Estado emocional (enfado, frustración) que te hace jugar peor. Es mejor parar cuando lo notas.' },
  },
  {
    category: 'hands',
    en: { term: 'Top two pair', def: 'Two pair with the two highest cards on the board.' },
    es: { term: 'Top two', aka: ['Top two pair'], def: 'Dobles parejas con las dos cartas más altas de la mesa.' },
  },
  {
    category: 'hands',
    en: { term: 'TPTK', def: 'Top pair, top kicker: top pair with the best possible kicker, like AK on a K-8-3 board.' },
    es: { term: 'TPTK', aka: ['Top pair top kicker'], def: 'Pareja máxima con el mejor kicker posible, como AK en una mesa K-8-3.' },
  },
  {
    category: 'stats',
    en: { term: 'Tracker', def: 'Software that stores your online hands and calculates stats, like Hold’em Manager or PokerTracker.' },
    es: { term: 'Tracker', def: 'Programa que guarda tus manos online y calcula estadísticas, como Hold’em Manager o PokerTracker.' },
  },
  {
    category: 'strategy',
    en: { term: 'Trap', def: 'Playing a very strong hand as if it were weak so the opponent bets.' },
    es: { term: 'Trap', aka: ['Tender una trampa'], def: 'Jugar una mano muy fuerte como si fuera débil para que el rival apueste.' },
  },
  {
    category: 'players',
    en: { term: 'Tricky', def: 'An unpredictable player who uses unusual plays (check-raises, slowplays…).' },
    es: { term: 'Tricky', def: 'Jugador imprevisible que usa jugadas poco habituales (check-raises, slowplays…).' },
  },
  {
    category: 'hands',
    en: { term: 'Three of a kind', def: 'Three cards of the same rank. Using a board pair and one of your cards is called "trips"; with a pocket pair, a "set".' },
    es: { term: 'Trío', aka: ['Trips', 'Three of a kind'], def: 'Tres cartas del mismo rango. Si usas una pareja de la mesa y una de tus cartas se llama "trips"; con pareja en mano, "set".' },
  },
  {
    category: 'tournaments',
    en: { term: 'Turbo', def: 'A tournament where the blinds go up very quickly.' },
    es: { term: 'Turbo', aka: ['Hyper turbo'], def: 'Torneo en el que las ciegas suben muy deprisa.' },
  },
  {
    category: 'table',
    en: { term: 'Turn', def: 'The fourth community card, followed by the third betting round.' },
    es: { term: 'Turn', def: 'Cuarta carta comunitaria, seguida de la tercera ronda de apuestas.' },
  },
  {
    category: 'rooms',
    en: { term: 'Two Plus Two', def: 'A well-known English-language poker forum and strategy book publisher.' },
    es: { term: 'Two plus two', aka: ['2+2', 'TwoPlusTwo'], def: 'Foro de póker en inglés muy conocido y editorial de libros de estrategia.' },
  },
  {
    category: 'strategy',
    en: { term: 'Underdog', def: 'A hand or player less likely to win at that moment.' },
    es: { term: 'Underdog', aka: ['Dog'], def: 'Mano o jugador con menos probabilidades de ganar en ese momento.' },
  },
  {
    category: 'hands',
    en: { term: 'Underpair', def: 'A pocket pair lower than the lowest card on the board.' },
    es: { term: 'Underpair', def: 'Pareja en mano más baja que la carta más baja de la mesa.' },
  },
  {
    category: 'table',
    en: { term: 'Unopened pot', def: 'A pot nobody has entered yet (only the blinds are in).' },
    es: { term: 'Unopened', aka: ['Bote sin abrir'], def: 'Bote en el que nadie ha entrado todavía (solo están las ciegas).' },
  },
  {
    category: 'slang',
    en: { term: 'Upswing', def: 'An extended period of winning above expectation.' },
    es: { term: 'Upswing', aka: ['Buena racha'], def: 'Periodo prolongado de ganancias por encima de lo esperado.' },
  },
  {
    category: 'table',
    en: { term: 'UTG', def: 'Under the gun: the first seat to act preflop, to the left of the big blind. It requires the strongest hands.' },
    es: { term: 'UTG', aka: ['Under the gun', 'Bajo la pistola'], def: 'Primera posición en hablar preflop, a la izquierda de la ciega grande. Exige las manos más fuertes.' },
  },
  {
    category: 'strategy',
    en: { term: 'Showdown value', def: 'A hand that has a chance to win if it gets to showdown, even if it is not good enough to bet.' },
    es: { term: 'Valor de showdown', aka: ['Showdown value'], def: 'Mano que tiene opciones de ganar si se llega a enseñar cartas, aunque no sea para apostar.' },
  },
  {
    category: 'strategy',
    en: { term: 'Expected value', def: 'What you win or lose on average with a decision if you repeated it many times (EV). A +EV play is profitable.' },
    es: { term: 'Valor esperado', aka: ['Expected value', 'EV', '+EV', '-EV'], def: 'Lo que ganas o pierdes de media con una decisión si la repitieras muchas veces. Una jugada +EV es rentable.' },
  },
  {
    category: 'strategy',
    en: { term: 'Value-heavy', def: 'A betting range with many value hands and few bluffs.' },
    es: { term: 'Value heavy', def: 'Rango de apuestas con muchas manos de valor y pocos faroles.' },
  },
  {
    category: 'strategy',
    en: { term: 'Variance', def: 'The ups and downs in results caused by short-term luck.' },
    es: { term: 'Varianza', aka: ['Variance', 'Swings'], def: 'Las subidas y bajadas de resultados debidas a la suerte a corto plazo.' },
  },
  {
    category: 'slang',
    en: { term: 'Villain', def: 'In hand reviews, the opponent.' },
    es: { term: 'Villano', aka: ['Villain'], def: 'En los análisis de manos, el rival.' },
  },
  {
    category: 'stats',
    en: { term: 'VPIP', def: 'Voluntarily put money in pot: the percentage of hands where a player puts money in preflop by choice. The higher, the looser.' },
    es: { term: 'VPIP', aka: ['VP$IP', 'Voluntarily put in pot'], def: 'Porcentaje de manos en las que un jugador pone dinero voluntariamente preflop. Cuanto más alto, más loose.' },
  },
  {
    category: 'table',
    en: { term: 'Walk', def: 'When everyone folds to the big blind, who wins the blinds without playing.' },
    es: { term: 'Walk', def: 'Cuando todos se retiran hasta la ciega grande y esta gana las ciegas sin jugar.' },
  },
  {
    category: 'strategy',
    en: { term: 'Way ahead / way behind', def: 'A spot where you are either far ahead or far behind, with nothing in between. Best to keep the pot small.' },
    es: { term: 'Way ahead / way behind', aka: ['WA/WB', 'Way ahead way behind'], def: 'Situación en la que vas muy por delante o muy por detrás, sin término medio. Conviene controlar el bote.' },
  },
  {
    category: 'stats',
    en: { term: 'Win rate', def: 'Average profit per 100 hands, usually in big blinds (bb/100).' },
    es: { term: 'Winrate', aka: ['Tasa de ganancia', 'bb/100'], def: 'Ganancia media por cada 100 manos, normalmente en ciegas grandes (bb/100).' },
  },
  {
    category: 'slang',
    en: { term: 'WP', def: '"Well played".' },
    es: { term: 'WP', aka: ['Well played'], def: '"Bien jugado".' },
  },
  {
    category: 'hands',
    en: { term: 'Wrap', def: 'A straight draw with many outs (more than 8), typical of Omaha.' },
    es: { term: 'Wrap', aka: ['Wraparound'], def: 'Proyecto de escalera con muchos outs (más de 8), típico del Omaha.' },
  },
  {
    category: 'tournaments',
    en: { term: 'WSOP', def: 'World Series of Poker: the most famous tournament series in the world, in Las Vegas. Its winners get a bracelet.' },
    es: { term: 'WSOP', aka: ['World Series of Poker', 'Series Mundiales'], def: 'Serie de torneos más famosa del mundo, en Las Vegas. Sus ganadores reciben un brazalete.' },
  },
];
