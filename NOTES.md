# Notes on the rules

Cases the rules do not cover clearly. Each one lists an example and the provisional
decision implemented in `src/logic/`.

# Tool 01 · Read the Board

## 1. Top pair on a paired board: does the kicker count?

- **Example**: T♣9♦ on T♠4♥4♦.
- **Conflict**: the required test says "strong (top pair with the best kicker)", but by the
  kicker definition, on T-4 the best kicker is A and the second is K, so the 9 would be a
  "kicker worse than the second best" → medium hand.
- **Provisional decision**: on a paired board, top pair (pairing the highest unpaired card)
  counts as **strong** with any kicker. This makes the required test pass. The explanation
  shown to the user flags it as a provisional rule.
- E.g. T♣2♦ on T♠4♥4♦ → strong.

## 2. Trips on the board (a 7-7-7 type flop)

- **Example**: A♣K♦ on 7♠7♥7♦.
- **Question**: everyone has "three of a kind". Does it count as "at least trips" → strong?
- **Provisional decision**: board trips are ignored (just like a board pair).
  A pocket pair → full house → very strong; a card that matches the trips → quads → very strong;
  otherwise ace high / king high with an ace on the board / nothing apply. A♣K♦ on 7♠7♥7♦ → weak.

## 3. Low pairs versus "at least ace high"

- **Example**: 6♣2♦ on K♠8♥6♦ (bottom pair, no ace).
- **Question**: the weak category says "but at least ace high". We read it in hand-ranking
  order: any pair beats ace high.
- **Provisional decision**: any pair below the medium category (bottom pair, middle pair with
  a bad kicker, a pocket pair below the second card) → **weak**, with or without an ace.
  The same on a coordinated board for everything below top pair.

## 4. A pocket pair below the second card on a paired board

- **Example**: 3♣3♦ on T♠4♥4♦ (really two pair, 4-4 and 3-3).
- **Provisional decision**: the board pair is ignored; the distinct cards are T and 4, so 33
  is a pocket pair below the second card → bottom pair → weak.

## 5. Extremely coordinated on the flop

- **Origin**: the original rules say it cannot happen on the flop (it needs 4 cards).
  It was added at the user's request with our own rule.
- **Rule**: the flop is monotone **and** some valid two-card combination (not counting the
  exceptions) makes a straight. It is checked before "coordinated".
  - E.g. 6♠7♠8♠, K♥Q♥J♥, 9♦7♦5♦ → extremely coordinated.
  - K♠Q♠2♠ (no straight) and A♣2♣3♣ (only 54, an exception) → coordinated.
- **Strength**: rated with the (monotone) coordinated-board rules: a flush or straight flush →
  very strong; a straight, trips or two pair → strong; top pair or an overpair → medium…
- **Balanced mode**: it comes up 10% of the time (30% for each of the other three types).
- On the turn it could be extended with the original definition (a draw completed with ONE card).

## 6. Unfinished draws (flush/straight)

- The strength rules only talk about made hands; draws do not raise the category.
  E.g. A♥2♥ on K♥8♥6♦ → ace high → weak.

---

# Tool 03 · Outs

Rules chosen with the user: both draws **and** improvements count, the percentage is graded
with the rule of 2 and 4, and spots are dealt on the flop and the turn.

## 7. Exact definition of an out

- A card is an out if, when it comes on the next street, your hand goes up a category **and**
  beats what the board alone would give with that card (if it only improves the board, it
  does not count).
- A straight, flush or better always counts (including trips → full house/quads by pairing the board).
- Two pair or trips: only if the card pairs one of your cards.
  E.g. Q♠J♦ on Q♥7♣3♦ → a 7 is not an out (the board gives QQ77 to everyone).
- Pair: only if it pairs an **overcard** (one of your cards above the whole board) → top pair.
  E.g. J♠4♦ on K♣8♥2♦ → 0 outs.
- Each card counts once and is grouped by the best hand it makes.
- "Dirty" outs are not discounted (e.g. a card that gives you a flush but may also give an
  opponent a full house): this is the textbook count for beginners.

## 8. Excluded deals

- Paired boards: counting improvements gets confusing (does an overcard that makes two pair
  with the board pair count as top pair?).
- Hands that already have a straight or better (only full-house outs would be left).
- Spots with fewer than 2 outs.
- 70% of deals have a flush or straight draw; 30% only improvements.

## 9. Percentages

- The correct answer is exactly outs × 4 (flop) or outs × 2 (turn), without the usual
  adjustment for many outs (e.g. 15 outs × 4 = 60% even though the exact value is 54.1%).
  The exact % is always shown after checking.
- The percentage is graded with the correct outs even if you counted the outs wrong.
