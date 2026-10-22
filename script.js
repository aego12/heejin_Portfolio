const menuButton = document.querySelector('.menu-toggle')
const navigation = document.querySelector('.primary-nav')
const gridButton = document.querySelector('.grid-toggle')
const progress = document.querySelector('.scroll-progress')

if (menuButton && navigation) {
  const closeMenu = () => {
    navigation.classList.remove('is-open')
    menuButton.setAttribute('aria-expanded', 'false')
  }

  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open')
    menuButton.setAttribute('aria-expanded', String(isOpen))
  })

  navigation.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu()
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu()
  })
}

const year = document.querySelector('[data-year]')
if (year) year.textContent = String(new Date().getFullYear())

gridButton?.addEventListener('click', () => {
  const isVisible = document.body.classList.toggle('show-grid')
  gridButton.setAttribute('aria-pressed', String(isVisible))
})

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible')
  })
}, { threshold: 0.12 })

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))

const storyPreview = document.querySelector('.story-scroll-video')
if (storyPreview) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const previewObserver = new IntersectionObserver(([entry]) => {
    if (reducedMotion.matches || !entry.isIntersecting) {
      storyPreview.pause()
      return
    }
    storyPreview.play().catch(() => {})
  }, { threshold: 0.25 })
  previewObserver.observe(storyPreview)
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) storyPreview.pause()
  })
}

const kodakPagePreview = document.querySelector('.personal-kodak-video')
const kodakHeroLayer = document.querySelector('.personal-kodak-hero-layer')
const kodakHeroPreview = kodakHeroLayer?.querySelector('video')
if (kodakPagePreview && kodakHeroLayer && kodakHeroPreview) {
  const pageWidth = 1920
  const pageHeight = 15086
  const heroTop = 852
  const heroHeight = 1090
  let kodakSyncFrame = 0

  const syncKodakHeroVideo = () => {
    if (!kodakPagePreview.duration || !kodakPagePreview.videoWidth || !kodakPagePreview.videoHeight) return
    const scale = kodakPagePreview.clientWidth / pageWidth
    const viewportHeight = kodakPagePreview.clientHeight
    const viewportPageHeight = viewportHeight / scale
    const pageScroll = kodakPagePreview.currentTime / kodakPagePreview.duration * (pageHeight - viewportPageHeight)
    const top = kodakPagePreview.offsetTop + (heroTop - pageScroll) * scale
    const height = heroHeight * scale
    kodakHeroLayer.style.left = `${kodakPagePreview.offsetLeft}px`
    kodakHeroLayer.style.top = `${top}px`
    kodakHeroLayer.style.width = `${kodakPagePreview.clientWidth}px`
    kodakHeroLayer.style.height = `${height}px`

    const isVisible = top < viewportHeight && top + height > 0
    kodakHeroLayer.style.visibility = isVisible ? 'visible' : 'hidden'
    if (isVisible && kodakHeroPreview.paused) kodakHeroPreview.play().catch(() => {})
    if (!isVisible && !kodakHeroPreview.paused) kodakHeroPreview.pause()
    if (!kodakPagePreview.paused) kodakSyncFrame = requestAnimationFrame(syncKodakHeroVideo)
  }

  kodakPagePreview.addEventListener('seeked', syncKodakHeroVideo)
  kodakPagePreview.addEventListener('loadedmetadata', syncKodakHeroVideo)
  kodakPagePreview.addEventListener('play', () => {
    cancelAnimationFrame(kodakSyncFrame)
    syncKodakHeroVideo()
  })
  kodakPagePreview.addEventListener('pause', () => cancelAnimationFrame(kodakSyncFrame))
  window.addEventListener('resize', syncKodakHeroVideo)
  syncKodakHeroVideo()
}

const stories = [...document.querySelectorAll('.horizontal-story')].map((story) => {
  const track = story.querySelector('.story-track')
  const panels = [...(track?.querySelectorAll('.story-panel') ?? [])]
  return { story, track, panels, phaseCount: Math.max(0, panels.length * 2 - 1) }
})
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const skillScroll = document.querySelector('[data-skill-scroll]')
const skillPin = skillScroll?.querySelector('.skill-pin')
const skillArtwork = skillScroll?.querySelector('.skill-artwork')
const skillFrame = skillScroll?.querySelector('.skill-artwork-frame')
const skillContent = skillScroll?.querySelector('.skill-artwork-content')
let frame = 0

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

document.querySelectorAll('.horizontal-story .story-panel:not(:first-child) h2').forEach((title) => {
  const square = document.createElement('span')
  square.className = 'title-square'
  square.setAttribute('aria-hidden', 'true')
  const panel = title.closest('.story-panel')
  const panels = [...panel.parentElement.querySelectorAll('.story-panel')]
  square.dataset.number = String(panels.indexOf(panel))
  title.prepend(square)
})

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const fillElements = [...document.querySelectorAll('.story-fill')]

fillElements.forEach((element) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)

  const originalText = element.textContent ?? ''
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment()
    for (const { segment } of segmenter.segment(node.textContent ?? '')) {
      const character = document.createElement('span')
      character.className = 'fill-char'
      character.setAttribute('aria-hidden', 'true')
      character.textContent = segment
      fragment.append(character)
    }
    node.replaceWith(fragment)
  })

  element.setAttribute('aria-label', originalText)
  element._fillCharacters = [...element.querySelectorAll('.fill-char')]
  element._filledCharacterCount = 0
})

const setStoryFill = (panels, phase) => {
  panels.forEach((panel, index) => {
    const panelProgress = clamp(phase - index * 2)
    const squareProgress = clamp(panelProgress / 0.25)
    const fillProgress = clamp((panelProgress - 0.25) / 0.75)
    panel.querySelectorAll('.title-square').forEach((square) => {
      square.style.setProperty('--square-rotation', `${squareProgress * 90}deg`)
    })
    panel.querySelectorAll('.story-fill').forEach((element) => {
      setFillProgress(element, fillProgress)
    })
  })
}

const setFillProgress = (element, progress) => {
  const characters = element._fillCharacters ?? []
  const filledCount = Math.round(progress * characters.length)
  let previousCount = element._filledCharacterCount ?? 0
  while (previousCount < filledCount) characters[previousCount++]?.classList.add('is-filled')
  while (previousCount > filledCount) characters[--previousCount]?.classList.remove('is-filled')
  element._filledCharacterCount = filledCount
}

const updateStorySize = () => {
  stories.forEach(({ story, track, phaseCount }) => {
    if (!track || window.innerWidth < 1200 || reduceMotion.matches) {
      story.style.removeProperty('--story-height')
      return
    }
    story.style.setProperty('--story-height', `${window.innerHeight * (phaseCount + 1)}px`)
  })
}

const updateSkillSize = () => {
  if (!skillScroll || !skillArtwork || !skillFrame || !skillContent) return
  const scale = Math.min(1, window.innerWidth / 1920)
  skillFrame.style.setProperty('--skill-scale', String(scale))
  skillFrame.style.setProperty('--skill-x', '0px')
  skillScroll.style.setProperty('--skill-frame-height', `${615 * scale}px`)
  skillScroll.style.setProperty('--skill-artwork-inset', `${16 * scale}px`)
  const contentRight = skillContent.getBoundingClientRect().right
  const artworkRight = skillArtwork.getBoundingClientRect().right
  const travel = Math.max(0, contentRight - artworkRight)
  const scrollLength = reduceMotion.matches ? 0 : travel
  skillScroll.style.setProperty('--skill-scroll-length', `${scrollLength}px`)
  skillScroll.dataset.travel = String(travel)
}

const renderScroll = () => {
  frame = 0
  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
  }
  stories.forEach(({ story, track, panels, phaseCount }) => {
    if (!track) return
    if (window.innerWidth < 1200 || reduceMotion.matches) {
      setStoryFill(panels, phaseCount)
      return
    }
    const rect = story.getBoundingClientRect()
    const distance = Math.max(0, track.scrollWidth - window.innerWidth)
    const progressValue = Math.min(1, Math.max(0, -rect.top / Math.max(1, story.offsetHeight - window.innerHeight)))
    const rawPhase = progressValue * phaseCount
    const boundary = Math.round(rawPhase)
    const phase = Math.abs(rawPhase - boundary) < 0.001 ? boundary : rawPhase
    let horizontalProgress = 0
    panels.slice(0, -1).forEach((_, index) => {
      horizontalProgress += clamp(phase - (index * 2 + 1))
    })
    horizontalProgress /= Math.max(1, panels.length - 1)
    story.style.setProperty('--story-x', `${-distance * horizontalProgress}px`)
    story.style.setProperty('--panel-shift', `${horizontalProgress * 5}vw`)
    setStoryFill(panels, phase)
  })
  const about = document.querySelector('.about-section')
  const aboutTitle = document.querySelector('#about-title')
  if (about && aboutTitle) {
    const titleRect = aboutTitle.getBoundingClientRect()
    const fillStart = window.innerHeight * .8
    const fillEnd = window.innerHeight * .35
    const fillProgress = reduceMotion.matches
      ? 1
      : window.innerWidth >= 1200
        ? clamp(-about.getBoundingClientRect().top / Math.max(1, about.offsetHeight - window.innerHeight))
        : clamp((fillStart - titleRect.top) / (fillStart - fillEnd))
    setFillProgress(aboutTitle, fillProgress)
  }
  if (skillScroll && skillPin && skillArtwork && skillFrame) {
    const travel = Number(skillScroll.dataset.travel ?? 0)
    const range = Math.max(1, skillScroll.offsetHeight - skillArtwork.clientHeight)
    const startOffset = Number.parseFloat(getComputedStyle(skillPin).top) || 0
    const scrollProgress = reduceMotion.matches || travel === 0
      ? 0
      : clamp((startOffset - skillScroll.getBoundingClientRect().top) / range)
    skillFrame.style.setProperty('--skill-x', `${-travel * scrollProgress}px`)
  }
}

const requestRender = () => {
  if (!frame) frame = requestAnimationFrame(renderScroll)
}

window.addEventListener('scroll', requestRender, { passive: true })
window.addEventListener('resize', () => { updateStorySize(); updateSkillSize(); requestRender() })
reduceMotion.addEventListener?.('change', () => { updateStorySize(); updateSkillSize(); requestRender() })
updateStorySize()
updateSkillSize()
renderScroll()
