const numberOfPlayers = sessionStorage.getItem("playersNum");
const numberOfRounds = 0;
const numberOfCards = 28;
const values = Array.from({ length: 7 }, (_, index) => {
  return index + 6;
});

const suits = ["hearts", "spades", "diamonds", "clubs"];

class Player {
  constructor(id, name, cards) {
    this.id = id;
    this.name = name;
    this.cards = cards;
    this.outOfCards = false;
    this.createUl();
  }
  createUl() {
    const playerContainer = document.getElementById(`player-${this.id + 1}`);
    const ul = document.createElement("ul");
    playerContainer.appendChild(ul);
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Game {
  constructor(numberOfPlayers, numberOfCards, suits, values) {
    this.numberOfPlayers = Number(numberOfPlayers);
    this.numberOfCards = numberOfCards;
    this.currentCards = [];
    this.currentPlayerIndex = 0;
    this.nextPlayerIndex = 0;
    this.trumpCard;
    this.players = [];
    this.isPlayerTurn = true;
    this.movesCounter = 1;
    this.totalRounds = 0;
    this.leftoversCards = [];
    this.turnType = "attack";
    this.initEventListeners();
    this.gameText = "";
    this.playField;
    this.disablePassButton();
    this.allSuits = suits;
    this.allValues = values;
    this.deck = [];
    this.winnersOrder = [];
  }

  rerenderPlayerHand(player) {
    const playerContainer = document.getElementById(`player-${player.id + 1}`);
    const ul = playerContainer.querySelector("ul");
    const cards = Array.from(ul.children);
    const count = cards.length;
    ul.style.setProperty("--count", count);
    cards.forEach((card, index) => {
      card.style.setProperty("--i", index);
    });
  }
  captureFlipSnapshot(el) {
    const rect = el.getBoundingClientRect();

    const ownMatrix = new DOMMatrix(getComputedStyle(el).transform);
    ownMatrix.e = 0;
    ownMatrix.f = 0;

    const parent = el.parentElement;
    const parentMatrix = parent
      ? new DOMMatrix(getComputedStyle(parent).transform)
      : new DOMMatrix();
    parentMatrix.e = 0;
    parentMatrix.f = 0;

    // Абсолютний кут картки НА МОМЕНТ знімку (з урахуванням батька)
    const absoluteMatrix = parentMatrix.multiply(ownMatrix);

    return { rect, absoluteMatrix };
  }
  playFlip(el, before) {
    const afterRect = el.getBoundingClientRect();
    if (afterRect.left === 0 && afterRect.top === 0) return;

    const screenDeltaX =
      before.rect.left +
      before.rect.width / 2 -
      (afterRect.left + afterRect.width / 2);
    const screenDeltaY =
      before.rect.top +
      before.rect.height / 2 -
      (afterRect.top + afterRect.height / 2);

    const parent = el.parentElement;
    const destParentMatrix = parent
      ? new DOMMatrix(getComputedStyle(parent).transform)
      : new DOMMatrix();
    destParentMatrix.e = 0;
    destParentMatrix.f = 0;

    const localDelta = new DOMPoint(screenDeltaX, screenDeltaY).matrixTransform(
      destParentMatrix.inverse(),
    );

    const rotationMatrix = destParentMatrix
      .inverse()
      .multiply(before.absoluteMatrix);
    const localAngleDeg =
      (Math.atan2(rotationMatrix.b, rotationMatrix.a) * 180) / Math.PI;

    el.style.transition = "none";
    el.style.transformOrigin = "center";
    el.style.transform = `translate(${localDelta.x}px, ${localDelta.y}px) rotate(${localAngleDeg}deg)`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "transform 1s ease-in-out";
        el.style.transform = "";
        el.addEventListener(
          "transitionend",
          () => {
            el.style.transformOrigin = "";
          },
          { once: true },
        );
      });
    });
  }

  moveCardFLIP(fromContainer, toContainer, player = null) {
    const firstRect = fromContainer.getBoundingClientRect();
    const lastRect = toContainer.getBoundingClientRect();
    if (lastRect.left === 0 && lastRect.top === 0) return;

    const screenDeltaX =
      firstRect.left +
      firstRect.width / 2 -
      (lastRect.left + lastRect.width / 2);
    const screenDeltaY =
      firstRect.top +
      firstRect.height / 2 -
      (lastRect.top + lastRect.height / 2);
    let handUl = null;
    if (player) {
      handUl = document
        .getElementById(`player-${player.id + 1}`)
        .querySelector("ul");
      console.log(handUl);
    } else {
      handUl = toContainer.parentElement;
    }
    const parentMatrix = new DOMMatrix(
      window.getComputedStyle(handUl).transform,
    );
    parentMatrix.e = 0;
    parentMatrix.f = 0;

    const localDelta = new DOMPoint(screenDeltaX, screenDeltaY).matrixTransform(
      parentMatrix.inverse(),
    );

    const firstMatrix = new DOMMatrix(
      window.getComputedStyle(fromContainer).transform,
    );
    firstMatrix.e = 0;
    firstMatrix.f = 0;

    const rotationMatrix = parentMatrix.inverse().multiply(firstMatrix);
    const localAngleDeg =
      (Math.atan2(rotationMatrix.b, rotationMatrix.a) * 180) / Math.PI;

    // ===== НОВЕ: піднімаємо весь stacking context UL над колодою =====
    // handUl має власний transform (rotate 90/180/-90deg для гравців 2/3/4),
    // тому створює ІЗОЛЬОВАНИЙ stacking context — z-index карти всередині
    // ul НЕ порівнюється напряму з z-index колоди. Піднімаємо сам ul.
    const prevZIndex = handUl.style.zIndex;
    handUl.style.zIndex = 999;

    toContainer.style.transition = "none";
    toContainer.style.transformOrigin = "center";
    toContainer.style.transform = `translate(${localDelta.x}px, ${localDelta.y}px) rotate(${localAngleDeg}deg)`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toContainer.style.transition = "transform 1s ease-in-out";
        toContainer.style.transform = "";

        toContainer.addEventListener(
          "transitionend",
          () => {
            toContainer.style.transformOrigin = "";
            // Повертаємо z-index назад, коли політ завершено —
            // картка вже фізично в руці й більше не перетинається з колодою
            handUl.style.zIndex = prevZIndex;
          },
          { once: true },
        );
      });
    });
  }

  renderFlyingCard(player, card) {
    const deckContainer = document.getElementById("deck");
    const deckCards = deckContainer.children;
    const playerContainer = document.getElementById(`player-${player.id + 1}`);
    const ul = playerContainer.querySelector("ul");
    let deckCardContainer = document.createElement("div");
    let playerCardContainer = 0;
    if (playerContainer) {
      const div = document.createElement("div");
      const li = document.createElement("li");
      const frontSide = document.createElement("img");
      const backSide = document.createElement("img");
      frontSide.src = `images/cards/reverse_card.svg`;
      frontSide.alt = `reverse side of card`;
      backSide.dataset.cardUrl = `${card.value}_of_${card.type}.svg`;
      frontSide.classList.add("the-front");
      backSide.src = `images/cards/${card.value}_of_${card.type}.svg`;
      backSide.classList.add("the-back");
      div.appendChild(frontSide);
      div.appendChild(backSide);
      li.appendChild(div);
      ul.append(li);
      div.classList.add("the-card");
      playerCardContainer = li;
    } else {
      console.log(`No container was found.`);
    }
    const cards = Array.from(ul.children);
    const count = cards.length;
    ul.style.setProperty("--count", count);
    cards.forEach((card, index) => {
      card.style.setProperty("--i", index);
    });
    if (this.deck.length > 9 && deckCards.length > 8) {
      const deckCard = document.createElement("img");
      deckCardContainer.classList.add("deck-card");
      deckCard.src = `images/cards/reverse_card.svg`;
      deckCardContainer.appendChild(deckCard);
      deckCardContainer.style.setProperty("--i", 9);
      deckContainer.appendChild(deckCardContainer);
    } else {
      deckCardContainer = deckContainer.lastChild;
    }

    this.moveCardFLIP(deckCardContainer, playerCardContainer);

    deckCardContainer.remove();
  }

   initEventListeners() {
    const playerContainer = document.getElementById(`player-1`);
    const passButton = document.getElementById("pass-btn");
    passButton.style.zIndex = "9999";

    this.disablePassButton();
    passButton.addEventListener("click", async (event) => {
      if (this.turnType === "attack") {
        this.isPlayerTurn = false;
        if (
          this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
            .length < 6
        ) {
          this.updateDeck(
            6 -
              this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
                .length,
            this.players[this.currentPlayerIndex % this.numberOfPlayers],
          );
          await wait(600)
        }
        if (
          this.players[this.nextPlayerIndex % this.numberOfPlayers].cards
            .length < 6
        ) {
          this.updateDeck(
            6 -
              this.players[this.nextPlayerIndex % this.numberOfPlayers].cards
                .length,
            this.players[this.nextPlayerIndex % this.numberOfPlayers],
          );
        }
        console.log(
          this.players[this.currentPlayerIndex % this.numberOfPlayers],
        );
        console.log(this.players[this.nextPlayerIndex % this.numberOfPlayers]);
        console.log(this.players[0]);
        this.updateLeftovers();
        this.disablePassButton();
        this.currentPlayerIndex = this.findAvailablePlayer();
        this.nextPlayerIndex = this.findNextAvailablePlayer();
        this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name} `;
        this.movesCounter = 1;
        setTimeout(() => {
          this.botMove(
            this.players[this.currentPlayerIndex % this.numberOfPlayers],
            null,
            "attack",
            document.getElementById(`cards-${this.movesCounter}`),
          );
        }, 3000);
      }
      if (this.turnType === "defence") {
        const playerUl = playerContainer.querySelector("ul");
        this.disablePassButton();
        console.log(...this.currentCards);
        console.log(
          ...this.players[this.currentPlayerIndex % this.numberOfPlayers].cards,
        );
        this.isPlayerTurn = false;
        this.currentCards.forEach((card) => {
          this.players[this.nextPlayerIndex % this.numberOfPlayers].cards.push(
            card,
          );
          const cardImg = document.createElement("img");
          const li = document.createElement("li");

          cardImg.src = `/images/cards/${card.value}_of_${card.type}.svg`;
          cardImg.dataset.cardUrl = `${card.value}_of_${card.type}.svg`;

          li.appendChild(cardImg);
          playerUl.appendChild(li);
        });
        this.rerenderPlayerHand(this.players[0])
        const slots = document.querySelectorAll("#cards-part-of-field > div");
        slots.forEach((slot) => {
          slot.innerHTML = "";
        });
        console.log(this.players[0]);
        if (
          this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
            .length -
            6 <
          0
        ) {
          this.updateDeck(
            6 -
              this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
                .length,
            this.players[this.currentPlayerIndex % this.numberOfPlayers],
          );
        }
        this.currentCards = [];
        ++this.currentPlayerIndex;
        this.currentPlayerIndex = this.findAvailablePlayer();
        this.nextPlayerIndex = this.findNextAvailablePlayer();
        this.movesCounter = 1;
        setTimeout(() => {
          this.botMove(
            this.players[this.currentPlayerIndex % this.numberOfPlayers],
            null,
            "attack",
            document.getElementById(`cards-${this.movesCounter}`),
          );
        }, 3000);
        this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name} `;
      }
    });
    playerContainer.addEventListener("click", (event) => {
      if (!this.isPlayerTurn || this.players[0].outOfCards === true) return;

      if (event.target.tagName === "IMG") {
        console.log(event.target);
        console.log(event.target.dataset.cardUrl);
        const cardInfo = event.target.dataset.cardUrl;
        console.log("Hello");
        console.log(cardInfo);
        const cardValue = Number(cardInfo.split("_")[0]);
        const cardType = cardInfo.split("_")[2].split(".")[0];

        if (this.turnType === "attack") {
          if (
            !this.currentCards.some(
              (card) => Number(cardValue) === Number(card.value),
            ) &&
            this.movesCounter != 1
          ) {
            event.target.classList.add("invalid-card");
            setTimeout(() => {
              event.target.classList.remove("invalid-card");
            }, 4000);
          }
          if (
            this.movesCounter === 1 ||
            this.currentCards.some(
              (card) => Number(cardValue) === Number(card.value),
            )
          ) {
            const cardsContainter = document.getElementById(
              `cards-${this.movesCounter}`,
            );
            const div = document.createElement("div");
            div.classList.add("the-card");
            const frontSide = document.createElement("img");
            const backSide = document.createElement("img");
            frontSide.src = `images/cards/reverse_card.svg`;
            frontSide.alt = `reverse side of card`;
            backSide.src = `/images/cards/${cardValue}_of_${cardType}.svg`;
            backSide.dataset.cardUrl = `${cardValue}_of_${cardType}.svg`;
            backSide.classList.add("attack-card", "the-back");
            backSide.classList.add("rotate360")
            frontSide.classList.add("attack-card", "the-front");
            div.appendChild(frontSide);
            div.appendChild(backSide);

            this.players[this.currentPlayerIndex % this.numberOfPlayers].cards =
              this.players[
                this.currentPlayerIndex % this.numberOfPlayers
              ].cards.filter(
                (card) => card.value != cardValue || card.type != cardType,
              );
            console.log(this.currentPlayerIndex % this.numberOfPlayers);

            this.currentCards.push({
              value: Number(cardValue),
              type: cardType.toString(),
            });
            cardsContainter.appendChild(div);

            this.moveCardFLIP(event.target.parentElement.parentElement, div);
            event.target.parentElement.parentElement.remove();
            this.rerenderPlayerHand(
              this.players[this.currentPlayerIndex % this.numberOfPlayers],
            );
            

            this.isPlayerTurn = false;
            if (this.isPlayerTurn && this.movesCounter != 1) {
              this.enablePassButton();
            }
            if (!this.isPlayerTurn || this.movesCounter === 1) {
              this.disablePassButton();
            }
            this.gameText.textContent = `${this.players[this.nextPlayerIndex % this.numberOfPlayers].name}'s turn...`;
            const attackCardInfo = { value: cardValue, type: cardType };
            setTimeout(() => {
              this.botMove(
                this.players[this.nextPlayerIndex % this.numberOfPlayers],
                attackCardInfo,
                "defence",
                cardsContainter,
              );
              this.isPlayerTurn = true;

              if (this.isPlayerTurn && this.movesCounter != 1) {
                this.enablePassButton();
              }
              if (!this.isPlayerTurn || this.movesCounter === 1) {
                this.disablePassButton();
              }
              this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn...`;
            }, 5000);
          }
        }
        if (this.turnType === "defence") {
          console.log([...this.currentCards]);
          const isValidMove =
            (cardValue >
              this.currentCards[this.currentCards.length - 1].value &&
              cardType ===
                this.currentCards[this.currentCards.length - 1].type) ||
            (cardType === this.trumpCard.type &&
              this.currentCards[this.currentCards.length - 1].type !==
                this.trumpCard.type);
          if (!isValidMove) {
            event.target.classList.add("invalid-card");
            setTimeout(() => {
              event.target.classList.remove("invalid-card");
            }, 4000);
          } else {
            const div = document.createElement("div");
            div.classList.add("the-card");
            const frontSide = document.createElement("img");
            const backSide = document.createElement("img");
            frontSide.src = `images/cards/reverse_card.svg`;
            frontSide.alt = `reverse side of card`;
            let cardsContainter = document.getElementById(
              `cards-${this.movesCounter}`,
            );
            backSide.src = `/images/cards/${cardValue}_of_${cardType}.svg`;
            backSide.dataset.cardUrl = `${cardValue}_of_${cardType}.svg`;
            backSide.classList.add("defence-card", "the-back");
            frontSide.classList.add("defence-card", "the-front");
            div.appendChild(frontSide);
            div.appendChild(backSide);
            this.currentCards.push({
              value: Number(cardValue),
              type: cardType.toString(),
            });
            console.log([...this.currentCards]);
            console.log(this.currentPlayerIndex);
            console.log(this.players[0]);
            cardsContainter.appendChild(div);
            this.rerenderPlayerHand(
              this.players[this.nextPlayerIndex % this.numberOfPlayers],
            );
            this.moveCardFLIP(event.target.parentElement.parentElement, div);
            this.players[this.nextPlayerIndex % this.numberOfPlayers].cards =
              this.players[
                this.nextPlayerIndex % this.numberOfPlayers
              ].cards.filter(
                (card) => card.type != cardType || card.value != cardValue,
              );
            event.target.parentElement.parentElement.remove();
            this.rerenderPlayerHand(
              this.players[this.currentPlayerIndex % this.numberOfPlayers],
            );

            this.rerenderPlayerHand(
              this.players[this.nextPlayerIndex % this.numberOfPlayers],
            );
            ++this.movesCounter;
            if (
              this.movesCounter > 6 ||
              this.players[0].cards.length === 0 ||
              this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
                .length === 0
            ) {
              console.log("Some'one is out of cards.");
              if (
                this.checkIfWinner(
                  this.players[this.currentPlayerIndex % numberOfPlayers],
                ) ||
                this.checkIfWinner(
                  this.players[this.nextPlayerIndex % numberOfPlayers],
                )
              ) {
                if (this.checkIfAllAreWinners()) {
                  return;
                }
                if (!this.checkIfAllAreWinners()) {
                  this.currentPlayerIndex = this.nextPlayerIndex;
                  this.findAvailablePlayer();
                  this.findNextAvailablePlayer();
                  this.movesCounter = 1;
                  this.updateLeftovers();
                  this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name}`;
                  if (this.currentPlayerIndex % numberOfPlayers === 0) {
                    this.disablePassButton();
                    this.turnType = "attack";
                    this.isPlayerTurn = true;
                  } else {
                    this.botMove(
                      this.players[
                        this.currentPlayerIndex % this.numberOfPlayers
                      ],
                      null,
                      "attack",
                      document.getElementById(`cards-${this.movesCounter}`),
                    );
                  }
                }
                return;
              }
            }
            this.disablePassButton();
            console.log([
              ...this.players[this.currentPlayerIndex % this.numberOfPlayers]
                .cards,
            ]);
            this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn...`;

            cardsContainter = document.getElementById(
              `cards-${this.movesCounter}`,
            );
            setTimeout(() => {
              this.botMove(
                this.players[this.currentPlayerIndex % this.numberOfPlayers],
                null,
                "attack",
                cardsContainter,
              );
              this.isPlayerTurn = true;

              if (this.isPlayerTurn && this.movesCounter != 1) {
                this.enablePassButton();
              }
              if (!this.isPlayerTurn || this.movesCounter === 1) {
                this.disablePassButton();
              }
            }, 5000);
          }
        }
      }
    });
  }
  checkIfAllAreWinners() {
    if(this.players[0].outOfCards===true){
      this.disablePassButton()
    }
    if (this.winnersOrder.length === this.numberOfPlayers - 1) {
      const nonWinner = this.players.find(
        (player) => player.outOfCards === false,
      );
      this.winnersOrder.push(nonWinner);
      console.log(
        `Winner is: ${this.winnersOrder[0].name}. Loser is ${nonWinner.name}`,
      );
      this.gameText.textContent = `Winner is: ${this.winnersOrder[0].name}. Loser is ${this.winnersOrder[this.winnersOrder.length - 1].name}`;
      this.endGame();
      return true;
    }
    if (this.winnersOrder.length === this.numberOfPlayers) {
      console.log(
        `Winner is: ${this.winnersOrder[0].name}. Loser is ${this.winnersOrder[this.winnersOrder.length - 1].name}`,
      );
      this.gameText.textContent = `Winner is: ${this.winnersOrder[0].name}. Loser is ${this.winnersOrder[this.winnersOrder.length - 1].name}`;
      this.endGame();
      return true;
    } else {
      return false;
    }
  }
  createDeck() {
    this.deck = [];
    for (const type of this.allSuits) {
      for (const value of this.allValues) {
        this.deck.push({ value, type });
      }
    }
  }
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
  checkIfWinner(player) {
    if (player.cards.length === 0 && this.deck.length === 0) {
      player.outOfCards = true;
      this.winnersOrder.push(player);
      return true;
    } else {
      return false;
    }
  }
  async startGame() {
    this.createDeck();
    this.shuffleDeck();
    this.initializeTrump();
    this.renderDeck();
    this.initializePlayers().then(()=>{console.log(this.deck.length)});
    this.findNextAvailablePlayer();
    

    console.log(this.deck.length)
    let gameState = true;
    const field = document.getElementById("game-text");
    this.gameText = document.createElement("h2");
    let turnType = "";
    if (this.currentPlayerIndex % this.numberOfPlayers == 0) {
      this.turnType = "attack";
    }
    if (this.nextPlayerIndex % this.numberOfPlayers == 0) {
      this.turnType = "defence";
    }
    field.appendChild(this.gameText);
    console.log(this.players);
    console.log(this.numberOfPlayers);
    console.log(this.numberOfPlayers);
    this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name}`;
    const playerContainer = document.getElementById(
      `player-${this.players[this.nextPlayerIndex % this.numberOfPlayers].id}`,
    );

    console.log(`${this.movesCounter},${this.isPlayerTurn}`);
  }
  async botMove(player, card, moveType, container) {
    console.log(this.movesCounter);
    if (moveType === "attack") {
      const playerContainer = document.getElementById(
        `player-${player.id + 1}`,
      );
      const nonTrumpCards = player.cards
        .filter((card) => card.type != this.trumpCard.type)
        .sort((a, b) => a.value - b.value);
      const cardsWithSameValue = player.cards
        .filter((cards) =>
          this.currentCards.some(
            (currentCardsCard) => cards.value === currentCardsCard.value,
          ),
        )
        .sort((a, b) => a.value - b.value);
      let attackCard = 0;
      console.log(nonTrumpCards);

      if (this.movesCounter === 1) {
        console.log("Hello");
        if (nonTrumpCards.length != 0) {
          attackCard = nonTrumpCards[0];
          this.currentCards.push(attackCard);

          console.log(attackCard);
        } else {
          const cardsSorted = player.cards.sort((a, b) => a.value - b.value);
          attackCard = cardsSorted[0];
          this.currentCards.push(attackCard);

          console.log(attackCard);
        }
      }
      if (this.movesCounter != 1) {
        const satisfyCards = player.cards.filter((playerCard) =>
          this.currentCards.some((card) => playerCard.value === card.value),
        );
        if (satisfyCards.length != 0) {
          satisfyCards.sort((a, b) => {
            const aIsTrump = a.type === this.trumpCard.type;
            const bIsTrump = b.type === this.trumpCard.type;
            return aIsTrump - bIsTrump; // Не-козирі підуть першими
          });
          attackCard = satisfyCards[0];
          console.log(attackCard);
          this.currentCards.push(attackCard);
        }
      }
      if (attackCard) {
        console.log(attackCard);
        const div = document.createElement("div");
        div.classList.add("the-card");
        const frontSide = document.createElement("img");
        const backSide = document.createElement("img");
        frontSide.src = `images/cards/reverse_card.svg`;
        frontSide.alt = `reverse side of card`;
        backSide.src = `/images/cards/${attackCard.value}_of_${attackCard.type}.svg`;
        backSide.dataset.cardUrl = `${attackCard.value}_of_${attackCard.type}.svg`;
        backSide.classList.add("attack-card", "the-back");
        frontSide.classList.add("attack-card", "the-front");
        div.appendChild(frontSide);
        div.appendChild(backSide);

        const cardUrl = `${attackCard.value}_of_${attackCard.type}.svg`;
        const cardElement = playerContainer.querySelector(
          `[data-card-url="${cardUrl}"]`,
        );
        if (cardElement) {
          container.appendChild(div);
          this.moveCardFLIP(cardElement, div);
          cardElement.parentElement.parentElement.remove();
          this.rerenderPlayerHand(
            this.players[this.currentPlayerIndex % this.numberOfPlayers],
          );
        }
        player.cards = player.cards.filter(
          (card) =>
            card.value != attackCard.value || card.type != attackCard.type,
        );
        this.rerenderPlayerHand(
          this.players[this.currentPlayerIndex % this.numberOfPlayers],
        );
        this.gameText.textContent = `${this.players[this.nextPlayerIndex % this.numberOfPlayers].name}'s turn... `;
        if (this.nextPlayerIndex % this.numberOfPlayers != 0) {
          setTimeout(() => {
            this.botMove(
              this.players[this.nextPlayerIndex % this.numberOfPlayers],
              attackCard,
              "defence",
              container,
            );
          }, 3000);
        }
        if (this.nextPlayerIndex % this.numberOfPlayers === 0) {
          console.log(this.currentPlayerIndex);
          console.log("Player defence turn");
          this.enablePassButton();
          this.turnType = "defence";
          this.isPlayerTurn = true;
        }
        console.log(attackCard);
      }
      if (!attackCard) {
        if (player.cards.length - 6 < 0) {
          console.log("less than 6");
          this.updateDeck(6 - player.cards.length, player);
          await wait(600)
        }
        if (
          this.players[this.nextPlayerIndex % this.numberOfPlayers].cards
            .length -
            6 <
          0
        ) {
          this.updateDeck(
            6 -
              this.players[this.nextPlayerIndex % this.numberOfPlayers].cards
                .length,
            this.players[this.nextPlayerIndex % this.numberOfPlayers],
          );
        }
        console.log("hewloo");
        this.updateLeftovers();
        this.currentPlayerIndex = this.findAvailablePlayer();
        this.nextPlayerIndex = this.findNextAvailablePlayer();
        this.movesCounter = 1;
        this.disablePassButton()
        this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name} `;
        if (this.currentPlayerIndex % this.numberOfPlayers === 0) {
          console.log(this.currentPlayerIndex);
          console.log("Player attack turn");
          this.turnType = "attack";
          this.isPlayerTurn = true;
        } else {
          setTimeout(() => {
            this.botMove(
              this.players[this.currentPlayerIndex % this.numberOfPlayers],
              null,
              "attack",
              document.getElementById(`cards-${this.movesCounter}`),
            );
          }, 3000);
        }
      }
    }
    if (moveType === "defence") {
      const playerContainer = document.getElementById(
        `player-${player.id + 1}`,
      );

      const cardValue = card.value;
      const cardType = card.type;
      console.log(cardValue);
      console.log(cardType);
      const sameType = [];
      const trumpCards = [];
      console.log([...player.cards]);
      let foundCard;
      const trump = this.trumpCard.type;
      console.log(trump);
      player.cards.forEach((card) => {
        if (card.type == cardType && card.value > cardValue) {
          sameType.push(card);
        }
        if (card.type == trump) {
          trumpCards.push(card);
        }
      });
      if (sameType.length && cardType != trump) {
        sameType.sort((a, b) => a.value - b.value);
        foundCard = sameType.find((card) => card.value > cardValue);
        console.log(`Same type found.`);
        console.log(foundCard);
        console.log(sameType);
      }
      if (!sameType.length || !foundCard) {
        trumpCards.sort((a, b) => a.value - b.value);
        if (cardType === this.trumpCard.type) {
          foundCard = trumpCards.find((card) => card.value > cardValue);
        } else {
          foundCard = trumpCards[0];
        }
        console.log(foundCard);
      }
      if (foundCard) {
        console.log(foundCard);
        player.cards = player.cards.filter(
          (card) =>
            card.value != foundCard.value || card.type != foundCard.type,
        );
        console.log([...player.cards]);

        const cardUrl = `${foundCard.value}_of_${foundCard.type}.svg`;
        const cardElement = playerContainer.querySelector(
          `[data-card-url="${cardUrl}"]`,
        );
        console.log(cardElement);
        if (cardElement) {
          const div = document.createElement("div");
          div.classList.add("the-card");
          const frontSide = document.createElement("img");
          const backSide = document.createElement("img");
          frontSide.src = `images/cards/reverse_card.svg`;
          frontSide.alt = `reverse side of card`;
          backSide.src = `/images/cards/${foundCard.value}_of_${foundCard.type}.svg`;
          backSide.dataset.cardUrl = `${foundCard.value}_of_${foundCard.type}.svg`;
          backSide.classList.add("defence-card", "the-back");
          frontSide.classList.add("defence-card", "the-front");
          div.appendChild(frontSide);
          div.appendChild(backSide);
          
          container.appendChild(div);

          this.moveCardFLIP(
            cardElement.parentElement.parentElement,
            div,
            player,
          );
          cardElement.parentElement.parentElement.remove();
          this.rerenderPlayerHand(
            this.players[this.nextPlayerIndex % this.numberOfPlayers],
          );
        }
        player.cards = player.cards.filter(
          (card) =>
            card.value != foundCard.value || card.type != foundCard.type,
        );
        this.rerenderPlayerHand(
          this.players[this.nextPlayerIndex % this.numberOfPlayers],
        );

        this.currentCards.push({
          value: Number(foundCard.value),
          type: foundCard.type.toString(),
        });
        console.log([...this.currentCards]);

        ++this.movesCounter;
        if (
          this.movesCounter > 6 ||
          this.players[this.nextPlayerIndex % this.numberOfPlayers].cards
            .length === 0 ||
          this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
            .length === 0
        ) {
          console.log("Test");
          if (
            this.checkIfWinner(
              this.players[this.currentPlayerIndex % numberOfPlayers],
            ) ||
            this.checkIfWinner(
              this.players[this.nextPlayerIndex % numberOfPlayers],
            )
          ) {
            if (this.checkIfAllAreWinners()) {
              return;
            }
            if (!this.checkIfAllAreWinners()) {
              this.currentPlayerIndex = this.nextPlayerIndex;
              this.findAvailablePlayer();
              this.findNextAvailablePlayer();
              this.movesCounter = 1;

              console.log(this.players);

              if (this.currentPlayerIndex % numberOfPlayers === 0) {
                setTimeout(() => {
                  this.updateLeftovers();
                  this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name} `;
                  this.turnType = "attack";
                  this.isPlayerTurn = true;
                }, 3000);
              } else {
                setTimeout(() => {
                  this.updateLeftovers();
                  this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name} `;
                  this.botMove(
                    this.players[this.currentPlayerIndex % numberOfPlayers],
                    null,
                    "attack",
                    document.getElementById(`cards-${this.movesCounter}`),
                  );
                }, 3000);
              }
            }
          }
          return;
        }

        if (this.currentPlayerIndex % this.numberOfPlayers != 0) {
          this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn...`;
          setTimeout(() => {
            this.botMove(
              this.players[this.currentPlayerIndex % this.numberOfPlayers],
              null,
              "attack",
              document.getElementById(`cards-${this.movesCounter}`),
            );
          }, 3000);
        }
        if (this.currentPlayerIndex % this.numberOfPlayers === 0) {
          this.turnType = "attack";
          this.isPlayerTurn = true;
        }
      }
      if (!foundCard) {
        console.log(`Pass.`);
        this.currentCards.forEach((card) => {
          const li = document.createElement("li");
          const div = document.createElement("div");
          const newCard = document.createElement("img");
          newCard.src = `images/cards/reverse_card.svg`;
          newCard.dataset.cardUrl = `${card.value}_of_${card.type}.svg`;
          div.appendChild(newCard);
          li.appendChild(div);
          playerContainer.lastElementChild.appendChild(li);

          player.cards.push(card);

          console.log([...player.cards]);
        });
        const slots = document.querySelectorAll("#cards-part-of-field > div");
        slots.forEach((slot) => {
          slot.innerHTML = "";
        });
        this.rerenderPlayerHand(
          this.players[this.nextPlayerIndex % this.numberOfPlayers],
        );
        if (
          this.movesCounter > 6 ||
          this.players[this.nextPlayerIndex % this.numberOfPlayers].cards
            .length === 0 ||
          this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
            .length === 0
        ) {
          console.log("Test");
          if (
            this.checkIfWinner(
              this.players[this.currentPlayerIndex % numberOfPlayers],
            ) ||
            this.checkIfWinner(
              this.players[this.nextPlayerIndex % numberOfPlayers],
            )
          ) {
            if (this.checkIfAllAreWinners()) {
              return;
            }
            if (!this.checkIfAllAreWinners()) {
              this.currentPlayerIndex = this.nextPlayerIndex;

              this.findAvailablePlayer();
              this.findNextAvailablePlayer();
              this.updateLeftovers();
              this.movesCounter = 1;
              console.log(this.players);
              this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name} `;
              if (this.currentPlayerIndex % numberOfPlayers === 0) {
                this.turnType = "attack";
                this.isPlayerTurn = true;
              } else {
                setTimeout(() => {
                  this.botMove(
                    this.players[this.currentPlayerIndex % numberOfPlayers],
                    null,
                    "attack",
                    document.getElementById(`cards-${this.movesCounter}`),
                  );
                }, 4000);
              }
            }
          }
          return;
        }
        if (
          this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
            .length -
            6 <
          0
        ) {
          this.updateDeck(
            6 -
              this.players[this.currentPlayerIndex % this.numberOfPlayers].cards
                .length,
            this.players[this.currentPlayerIndex % this.numberOfPlayers],
          );
        }

        this.currentCards = [];
        ++this.currentPlayerIndex;
        this.currentPlayerIndex = this.findAvailablePlayer();
        this.nextPlayerIndex = this.findNextAvailablePlayer();
        this.movesCounter = 1;
        this.gameText.textContent = `${this.players[this.currentPlayerIndex % this.numberOfPlayers].name}'s turn to ${this.players[this.nextPlayerIndex % this.numberOfPlayers].name} `;
        if (this.currentPlayerIndex % this.numberOfPlayers === 0) {
          console.log(this.currentPlayerIndex);
          console.log("Player attack turn");

          this.isPlayerTurn = true;
          this.turnType = "attack";
        }
        if (this.currentPlayerIndex % this.numberOfPlayers != 0) {
          setTimeout(() => {
            this.botMove(
              this.players[this.currentPlayerIndex % this.numberOfPlayers],
              null,
              "attack",
              document.getElementById(`cards-${this.movesCounter}`),
            );
          }, 3000);
        }
      }
    }
  }

  findAvailablePlayer() {
    if (this.checkIfAllAreWinners()) {
      return;
    } else {
      let index = this.currentPlayerIndex + 1;
      for (let i = 0; i < this.numberOfPlayers - 1; i++) {
        if (this.players[index % this.numberOfPlayers].outOfCards === false) {
          this.currentPlayerIndex = index;
          break;
        } else {
          index += 1;
        }
      }
      console.log(`Found available ${this.currentPlayerIndex} player`);
      return index;
    }
  }
  findNextAvailablePlayer() {
    if (this.checkIfAllAreWinners()) {
      return;
    } else {
      let index = this.currentPlayerIndex + 1;
      for (let i = 0; i < this.numberOfPlayers - 1; i++) {
        if (this.players[index % this.numberOfPlayers].outOfCards === false) {
          this.nextPlayerIndex = index;
          break;
        } else {
          index += 1;
        }
      }
      console.log(`Found next available ${this.nextPlayerIndex} player`);
      return index;
    }
  }
  initializeTrump() {
    let check = true;
    this.trumpCard = this.deck[0];
  }

  initializeCards() {
    let cardsInitialization = [];

    for (let i = 0; i < 6; i++) {
      cardsInitialization.push(this.deck.pop());
    }
    return cardsInitialization;
  }
  endGame() {
    this.updateLeftovers();
    console.log(this.winnersOrder);
    console.log("End of game.");
  }
  async initializePlayers() {
    this.players.push(new Player(0, sessionStorage.getItem("playerName"), []));
    for (let i = 1; i < this.numberOfPlayers; i++) {
      this.players.push(new Player(i, `Bot${i}`, []));
    }

    for (let i = 0; i < this.numberOfPlayers * 6; i++) {
      const player = this.players[i % numberOfPlayers];
      await this.initializeCard(player);
    }
    await this.flipPlayerCards();
  }
  async initializeCard(player) {
    const pulledCard = this.deck.pop();
    player.cards.push(pulledCard);
    this.renderFlyingCard(player, pulledCard);
    await wait(600);
  }
  flipPlayerCards() {
    const player = this.players[0];
    const playerContainer = document.getElementById(`player-${player.id + 1}`);
    const ul = playerContainer.querySelector("ul");
    console.log(ul);
    const cards = [...ul.children];
    cards.forEach((card) => {
      const div = card.lastChild;
      div.classList.add("the-card", "card-flipped");
    });
  }
  renderPlayerHand(playerId) {
    const player = this.players[playerId];
    const container = document.getElementById(`player-${playerId + 1}`);
    if (container) {
      const ul = document.createElement("ul");
      container.appendChild(ul);
      player.cards.forEach((card) => {
        const li = document.createElement("li");
        const img = document.createElement("img");
        img.src = `images/cards/reverse_card.svg`;
        img.alt = `reverse side of card`;
        img.dataset.cardUrl = `${card.value}_of_${card.type}.svg`;
        img.classList.add("the-front");
        li.appendChild(img);
        ul.append(li);
        this.renderFlyingCard(this.players[playerId], ul.lastChild);
      });
    } else {
      console.log(`No container was found.`);
    }
  }

  renderDeck() {
    const deckContainer = document.getElementById("deck");
    if (this.deck.length === 0 || !this.trumpCard) {
      deckContainer.innerHTML = "";
      console.log(this.numberOfCards);
      return;
    }
    if (this.trumpCard) {
      const container = document.createElement("div");
      const card = document.createElement("img");

      card.src = `/images/cards/${this.trumpCard.value}_of_${this.trumpCard.type}.svg`;
      container.appendChild(card);
      deckContainer.appendChild(container);
    }
    let cardsToRender = 0;
    if (this.deck.length > 9) {
      cardsToRender = 9;
    } else {
      cardsToRender = this.deck.length;
    }
    for (let i = 0; i < cardsToRender; i++) {
      const container = document.createElement("div");
      const card = document.createElement("img");
      container.classList.add("deck-card");
      card.src = `images/cards/reverse_card.svg`;
      container.appendChild(card);
      container.style.setProperty("--i", i);
      deckContainer.appendChild(container);
    }
    console.log(deckContainer.children);
  }
  async updateDeck(cardsToPick, player) {
    console.log(...this.deck);
    console.log(`Updating deck when ${this.deck.length} cards left`);
    console.log(this.currentPlayerIndex);
    
    if (this.deck.length === 0) {
      return;
    } else {
      for (let i = 0; i < cardsToPick; i++) {
        if (this.deck.length === 0) {
          return;
        }
        const card = this.deck.pop();
        player.cards.push(card);
        await wait(600)
        this.renderFlyingCard(player,card)
        if(player.id===0){
          
          this.flipPlayerCards()
        }
        if (this.deck.length < 9) {
          console.log(this.deck.length)
          
          const deckContainer = document.getElementById("deck");
          if (this.deck.length === 0 && deckContainer.children.length!=1) {
            const container = document.createElement("div");
            const card = document.createElement("img");

            card.src = `/images/cards/${this.trumpCard.value}_of_${this.trumpCard.type}.svg`;

            container.appendChild(card);
            container.style.opacity = "0.25";
            deckContainer.appendChild(container);
          }
        }

        console.log(`${player.id} picked a ${card.value}, ${card.type}`);
      }
    }
    this.rerenderPlayerHand(player);
    console.log(player);
  }

  updateLeftovers() {
    const deckContainer = document.getElementById("cards-part-of-field");
    const divs = deckContainer.querySelectorAll("div");
    this.leftoversCards.push(this.currentCards);
    console.log([...this.currentCards]);
    const leftoversContainer = document.getElementById("leftovers");
    if (this.leftoversCards.length > 9) {
      divs.forEach((div) => {
        div.innerHTML = "";
      });
      this.currentCards = [];
      return;
    }
    if (this.currentCards.length === 0) {
      return;
    }
    console.log([...this.currentCards]);
    divs.forEach((div) => {
      div.innerHTML = "";
    });
    for (
      let i = this.leftoversCards.length;
      i < this.currentCards.length + this.leftoversCards.length;
      i++
    ) {
      if (i < 9) {
        const card = document.createElement("img");
        card.src = `images/cards/reverse_card.svg`;
        card.style.setProperty(`--i`, i);
        card.classList.add("deck-card");
        leftoversContainer.appendChild(card);
        this.moveCardFLIP();
      } else {
        break;
      }
    }

    this.leftoversCards.push(this.currentCards);
    this.currentCards = [];
  }

  updateLeftovers() {
    const deckContainer = document.getElementById("cards-part-of-field");
    const divs = Array.from(deckContainer.children);
    console.log(divs);
    console.log([...this.currentCards]);
    const leftoversContainer = document.getElementById("leftovers");
    if (this.currentCards.length === 0) {
      return;
    }
    if (divs) {
      divs.forEach((div) => {
        const divCards = Array.from(div.children);
        if (divCards) {
          divCards.forEach((divCard) => {
            const i =
              this.leftoversCards.length >= 9 ? 9 : this.leftoversCards.length;
            const snapshot = this.captureFlipSnapshot(divCard);
            divCard.style.setProperty("--i", i);
            divCard.classList.add("deck-card");
            leftoversContainer.appendChild(divCard);
            this.playFlip(divCard, snapshot);
            const backSide = divCard.lastChild
            backSide.classList.remove()
            this.leftoversCards.push(this.currentCards.shift());
          });
        }
      });
    }
    this.currentCards = [];
    return;
  }

  disablePassButton() {
    const passButton = document.getElementById("pass-btn");
    passButton.classList.add("hidden");
  }
  enablePassButton() {
    const passButton = document.getElementById("pass-btn");
    passButton.classList.remove("hidden");
  }
}

const game = new Game(numberOfPlayers, numberOfCards, suits, values);
game.startGame();
