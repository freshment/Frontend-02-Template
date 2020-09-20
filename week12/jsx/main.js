import { createElement, Component } from './framework'

class Carousel extends Component {
  constructor() {
    super()
    this.attributes = Object.create(null)
  }
  setAttribute(name, value) {
    this.attributes[name] = value
  }
  render() {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')
    for(let record of this.attributes.src) {
      let child = document.createElement('div')
      child.style.backgroundImage = `url(${record})`
      this.root.appendChild(child)
    }

    let position = 0
    this.root.addEventListener('mousedown', event => {
      // 停止自动播放
      if(this.timer) clearInterval(this.timer)
      let children = this.root.children
      let startX = event.clientX

      let move = event => {
        let distanceX = event.clientX - startX
        let current = position - ((distanceX - distanceX % 300) / 300)

        for(let offset of [-1, 0, 1]) {
          let pos = current + offset
          pos = (pos + children.length) % children.length
          children[pos].style.transition = 'none'
          children[pos].style.transform = `translateX(${-pos * 300 + offset * 300 + distanceX % 300}px)`
        }
      }

      let up = event => {
        let distanceX = event.clientX - startX
        position = position - Math.round(distanceX / 300)
        for(let offset of [0, -Math.sign(Math.round(distanceX / 500) - distanceX + 150 * Math.sign(distanceX))]) {
          let pos = position + offset
          pos = (pos + children.length) % children.length
          children[pos].style.transition = ''
          children[pos].style.transform = `translateX(${-pos * 300 + offset * 300}px)`
        }

        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        startAuto()
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    })


    const startAuto = () => {
      let currentIndex = 0
      this.timer = setInterval(() => {
        let children = this.root.children
        let nextIndex = (currentIndex + 1) % children.length
  
        let current = children[currentIndex]
        let next = children[nextIndex]
  
        next.style.transition = 'none'
        next.style.transform = `translateX(${100 - nextIndex * 100}%)`
  
        setTimeout(() => {
          next.style.transition = ''
          current.style.transform = `translateX(${-100 - currentIndex * 100}%)`
          next.style.transform = `translateX(${-nextIndex * 100}%)`
          currentIndex = nextIndex
        }, 16)
      }, 3000)
    }
    startAuto()
    return this.root
  }
  mountTo(parent) {
    parent.appendChild(this.render())
  }
}

const imgList = [
  'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3479619770,2950062492&fm=26&gp=0.jpg',
  'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2534055477,3453824541&fm=26&gp=0.jpg',
  'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1803410037,2049245840&fm=26&gp=0.jpg',
  'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3506800691,3086208169&fm=26&gp=0.jpg'
]

let a = (<Carousel src={imgList} />)

a.mountTo(document.body)
