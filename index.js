const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', /*黑桃*/
  'https://image.flaticon.com/icons/svg/105/105220.svg', /*紅心*/
  'https://image.flaticon.com/icons/svg/105/105212.svg', /*方塊*/
  'https://image.flaticon.com/icons/svg/105/105219.svg', /*梅花*/
]

const view = {

  // 產生卡片內容
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
    `
  },

  // 產生卡片外層包裹 container
  getCardElement(index) {
    return `
      <div data-index="${index}" class="card back">
      </div>
    `
  },

  // 特殊數字轉換
  transformNumber (number) {
    switch(number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  // 印出牌卡
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
    // rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join('')
    // rootElement.innerHTML = this.getCardElement(10)
  },

  // 把值蒐集起來變成陣列
  flipCards(...cards) {

    cards.map(card => {
      if (card.classList.contains('back')) {
        //回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', function (event){
        event.target.classList.remove('wrong'), {once: true}
      })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Congratulation! You complete the game!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照不同遊戲狀態做不同行為
  dispatchCardAction(card) {
    // 如果牌 class 不含 back => 結束
    if(!card.classList.contains('back')) {
      return
    }

    switch(this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        // 判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          // 配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if(model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
      // console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

  restart() {
    location.reload()
  }

}

const model = {
  revealedCards: [],
  
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0,
}

const utility = {

  // 解構賦值 [a, b] = [1, 2]
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }

}

// 加上重新開始按鈕
const restartButton = document.querySelector('button')
restartButton.addEventListener('click', event => history.go(0))

controller.generateCards() // 取代 view.displayCards()


// Node-list 類陣列但不是陣列，不能用 array.map
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
