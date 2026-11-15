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

const planningStages = [...document.querySelectorAll('#ux-planning .ux-stage')]
if (planningStages.length) {
 const combined = planningStages[0]
 combined.classList.add('planning-combined', 'project-media-scroll')
 const content = combined.querySelector('.story-content')
 const copies = document.createElement('div')
 copies.className = 'project-fixed-copy planning-copies'
 const rail = document.createElement('div')
 rail.className = 'project-media-rail planning-rail'
 planningStages.forEach((stage, index) => {
  const copy = stage.querySelector('.ux-stage-copy')
  copy.dataset.planningStep = String(index)
  copy.hidden = index !== 0
  copies.append(copy)
  const group = document.createElement('div')
  group.className = 'planning-image-group'
  group.dataset.planningStep = String(index)
  stage.querySelectorAll('.ux-stage-media img').forEach(asset => {
   const box = document.createElement('div')
   box.className = 'project-media-box'
   box.append(asset)
   group.append(box)
   asset.addEventListener('load', () => { updateStorySize(); requestRender() })
  })
  rail.append(group)
  if (stage !== combined) stage.remove()
 })
 content.replaceChildren(copies, rail)
}

const personalDetails = [...document.querySelectorAll('#personal-project .personal-detail')]
if (personalDetails.length) {
 const combined = personalDetails[0]
 combined.classList.add('planning-combined', 'personal-combined', 'project-media-scroll')
 const content = combined.querySelector('.story-content')
 const copies = document.createElement('div')
 copies.className = 'project-fixed-copy planning-copies personal-copies'
 const rail = document.createElement('div')
 rail.className = 'project-media-rail planning-rail'
 personalDetails.forEach((panel, index) => {
  const copy = panel.querySelector('.personal-detail-copy')
  copy.dataset.project = panel.classList.contains('personal-detail-kodak')
   ? 'kodak'
   : panel.classList.contains('personal-detail-juvelook') ? 'juvelook' : 'hugreen'
  copy.dataset.planningStep = String(index)
  copy.hidden = index !== 0
  copy.prepend(panel.querySelector('.personal-panel-label'))
  copy.querySelector('h2')?.classList.add('story-fill')
  copies.append(copy)
  const group = document.createElement('div')
  group.className = 'planning-image-group'
  group.dataset.planningStep = String(index)
  panel.querySelectorAll('.personal-detail-media img, .personal-detail-media video').forEach(asset => {
   if (asset.closest('.personal-kodak-hero-layer')) return
   const box = document.createElement('div')
   box.className = 'project-media-box'
   box.append(asset)
   group.append(box)
   asset.addEventListener(asset instanceof HTMLVideoElement ? 'loadedmetadata' : 'load', () => { updateStorySize(); requestRender() })
  })
  rail.append(group)
  if (panel !== combined) panel.remove()
 })
 content.replaceChildren(copies, rail)
}

const videoDetails = [...document.querySelectorAll('#video-content .video-panel:not(.video-cover)')]
if (videoDetails.length) {
 const combined = videoDetails[0]
 combined.classList.remove('video-short-one')
 combined.classList.add('planning-combined', 'video-combined', 'project-media-scroll')
 const content = combined.querySelector('.story-content')
 const copies = document.createElement('div')
 copies.className = 'project-fixed-copy planning-copies video-copies'
 const rail = document.createElement('div')
 rail.className = 'project-media-rail planning-rail'
 videoDetails.forEach((panel, index) => {
  const copy = panel.querySelector('.video-detail-copy')
  copy.dataset.planningStep = String(index)
  copy.hidden = index !== 0
  copy.prepend(panel.querySelector('.video-panel-label'))
  copies.append(copy)
  const group = document.createElement('div')
  group.className = 'planning-image-group'
  group.dataset.planningStep = String(index)
  panel.querySelectorAll('.video-media video').forEach(asset => {
   const box = document.createElement('div')
   box.className = 'project-media-box'
   if (asset.matches('.video-short-preview')) box.classList.add('video-combined-short')
   box.append(asset)
   group.append(box)
   asset.addEventListener('loadedmetadata', () => { updateStorySize(); requestRender() })
  })
  rail.append(group)
  if (panel !== combined) panel.remove()
 })
 content.replaceChildren(copies, rail)
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
  const planningCopy = title.closest('[data-planning-step]')
  square.dataset.number = planningCopy
    ? String(Number(planningCopy.dataset.planningStep) + 1)
    : String(panels.indexOf(panel))
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
    if (panel.matches('.personal-combined') && (window.innerWidth < 1200 || reduceMotion.matches)) {
      const groups = [...panel.querySelectorAll('.planning-image-group')]
      panel.querySelectorAll('.personal-detail-copy').forEach((copy, step) => {
        const top = groups[step].getBoundingClientRect().top
        const fillProgress = reduceMotion.matches ? 1 : clamp((window.innerHeight * .4 - top) / (window.innerHeight * .35))
        copy.querySelectorAll('.story-fill').forEach(element => setFillProgress(element, fillProgress))
      })
      return
    }
    if (panel.matches('.planning-combined:not(.personal-combined):not(.video-combined)')) {
      let imageNumber = 1
      panel.querySelectorAll('.project-media-box').forEach((box, imageIndex) => {
        if (box.getBoundingClientRect().top <= window.innerHeight * .4) imageNumber = imageIndex + 1
      })
      panel.querySelectorAll('.title-square').forEach(square => {
        square.dataset.number = String(imageNumber)
      })
    }
    if (panel.matches('.planning-combined') && window.innerWidth >= 1200 && !reduceMotion.matches) {
      const rail = panel.querySelector('.planning-rail')
      const groups = [...rail.querySelectorAll('.planning-image-group')]
      const position = -(Number.parseFloat(rail.style.getPropertyValue('--media-y')) || 0) + window.innerHeight * .3
      const copies = [...panel.querySelectorAll('.planning-copies > [data-planning-step]')]
      copies.forEach((copy, step) => {
        const start = step === 0 ? window.innerHeight * .3 : groups[step].offsetTop
        const end = groups[step + 1]?.offsetTop ?? rail.scrollHeight
        const progress = clamp((position - start) / Math.max(1, Math.min(window.innerHeight * .35, (end - start) * .4)))
        copy.querySelectorAll('.story-fill').forEach(element => setFillProgress(element, progress))
        copy.querySelectorAll('.title-square').forEach(square => {
          square.style.setProperty('--square-rotation', `${progress * 90}deg`)
        })
      })
      return
    }
    const panelProgress = clamp(phase - index * 2)
    // Personal panels can have a very short media scroll; include the reveal
    // phase so their square rotation remains visible as the panel appears.
    const squareProgress = panel.matches('.personal-panel')
      ? clamp((phase - index * 2 + 1) / 2)
      : clamp(panelProgress / 0.25)
    const fillProgress = clamp((panelProgress - 0.15) / 0.5)
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

// Keep each panel's copy in place while its media runs vertically.
stories.forEach(({ panels }) => {
 panels.forEach(panel => {
  const content = panel.querySelector('.story-content')
  if (!content || panel.matches('.planning-combined')) return
  if (panel.matches('.story-cover, .ux-cover, .personal-cover, .video-cover')) {
   panel.classList.add('project-cover-layout')
   const visual = content.querySelector(':scope > .story-cover-mockup, :scope > .ux-cover-visual, :scope > .personal-media, :scope > .video-media')
   const copy = content.querySelector(':scope > .story-cover-copy, :scope > .ux-cover-copy, :scope > .personal-copy, :scope > .video-copy')
   visual?.classList.add('project-cover-visual')
   copy?.classList.add('project-cover-description')
   return
  }
  const media = [...content.children].filter(child =>
   /media|mockup/.test(child.className) && !/copy/.test(child.className))
  if (!media.length) return
  const rail = document.createElement('div')
  rail.className = 'project-media-rail'
  media.forEach(group => {
   const assets = [...group.querySelectorAll('img, video')].filter(asset =>
    !asset.closest('.personal-kodak-hero-layer'))
   if (panel.matches('.story-reflection') && assets.length) {
    const box = document.createElement('div')
    box.className = 'project-media-box project-comparison-box'
    assets.forEach((asset, index) => {
     const figure = document.createElement('figure')
     const caption = document.createElement('figcaption')
     caption.textContent = index === 0 ? 'BEFORE' : 'AFTER'
     figure.append(caption, asset)
     box.append(figure)
     asset.addEventListener('load', () => { updateStorySize(); requestRender() })
    })
    rail.append(box)
    group.remove()
    return
   }
   if (assets.length) {
    assets.forEach(asset => {
     const box = document.createElement('div')
     box.className = 'project-media-box'
     const annotatedFigure = asset.closest('.story-role-navigation')
     box.append(annotatedFigure ?? asset)
     rail.append(box)
     asset.addEventListener(asset instanceof HTMLVideoElement ? 'loadedmetadata' : 'load', () => { updateStorySize(); requestRender() })
    })
    group.remove()
   } else {
    const box = document.createElement('div')
    box.className = 'project-media-box'
    box.append(group)
    rail.append(box)
   }
  })
  const copy = document.createElement('div')
  copy.className = 'project-fixed-copy'
  ;[...content.children].forEach(child => copy.append(child))
  content.append(copy, rail)
  panel.classList.add('project-media-scroll')
 })
})

// Captions live outside the media frame, in Korean / English reading order.
const mediaCaptions = {
 'nintendo-brand-experience-01.png': ['히어로', 'Hero'],
 'nintendo-brand-experience-02-cropped.png': ['게임 IP 연결 페이지', 'Game IP Links Page'],
 'editorial-whats-new.png': ['새로운 소식 페이지', "What's New Page"],
 'editorial-nintendo-picks.png': ['닌텐도 추천 페이지', 'Nintendo Picks Page'],
 'ip-play-game-discovery.png': ['캐릭터별 게임 탐색', 'Game Discovery by Character'],
 'nintendo-before.png': ['리뉴얼 전', 'Before Renewal'],
 'nintendo-after-renewal.png': ['리뉴얼 후', 'After Renewal'],
 'image 561.png': ['40주년 메인 페이지 디자인', '40th Anniversary Main Page Design'],
 'what-i-do-character.png': ['캐릭터 서브페이지 디자인', 'Character Subpage Design'],
 'image 562.png': ['프로젝트 발표', 'Project Presentation'],
 'together-portrait.jpg': ['프로젝트 화면 검토', 'Project Review'],
 'together-working.jpg': ['팀 공동 코드 검토', 'Team Code Review'],
 'together-team-meeting.jpg': ['프로젝트 팀 회의', 'Project Team Meeting'],
 'ux-brand-research.png': ['자사·브랜드 조사', 'Company & Brand Research'],
 'ux-user-interviews.png': ['사용자 인터뷰와 분석', 'User Interviews & Analysis'],
 'ux-user-journey-map.png': ['사용자 여정 지도', 'User Journey Map'],
 'ux-team-structure.png': ['메뉴 구조 및 정보 구조도', 'Menu Structure & Information Architecture'],
 'ux-team-workflow.png': ['팀 작업 프로세스와 우선순위', 'Team Workflow & Priorities'],
 'ux-design-direction.png': ['디자인 방향과 레퍼런스', 'Design Direction & References'],
 'ux-screen-design.png': ['화면 설계 와이어프레임', 'Screen Wireframes'],
 'kodak-apparel-scroll-v2.mp4': ['코닥 어패럴 전체 페이지', 'KODAK Apparel Full Page'],
 'kodak-this-month.png': ['이달의 코닥 상품 소개', 'KODAK Monthly Selection'],
 'kodak-weekly-best.png': ['주간 인기 상품', 'Weekly Best Sellers'],
 'juvelook-scroll.mp4': ['쥬베룩 전체 페이지', 'JUVELOOK Full Page'],
 'juvelook-product-design.png': ['쥬베룩 볼륨 제품과 콜라겐 기술 소개', 'JUVELOOK Volume & Collagen Technology'],
 'juvelook-about-design.png': ['쥬베룩 브랜드 소개와 글로벌 성과', 'JUVELOOK Brand & Global Presence'],
 'hugreen-scroll.mp4': ['휴그린 전체 페이지', 'HUGREEN Full Page'],
 'hugreen-window-message.png': ['휴그린 브랜드 메시지', 'HUGREEN Brand Message'],
 'hugreen-content-design.png': ['창호 상담 안내와 제품 혜택', 'Window Consultation & Product Benefits'],
 'hugreen-short-form.mp4': ['휴그린 숏폼 영상', 'HUGREEN Short-form Video'],
 'kodak-hero.mp4': ['코닥 어패럴 메인 영상', 'KODAK Apparel Hero Video'],
 'juvelook-hero.mp4': ['쥬베룩 메인 영상', 'JUVELOOK Hero Video'],
}
const createMediaCaption = (labels) => {
 const caption = document.createElement('figcaption')
 caption.className = 'project-media-caption'
 labels.forEach((label, index) => {
  const text = document.createElement('span')
  text.lang = index === 0 ? 'ko' : 'en'
  text.textContent = label
  caption.append(text)
 })
 return caption
}
document.querySelectorAll('.project-media-box').forEach(box => {
 if (box.querySelector('.story-role-navigation')) return
 const assets = [...box.querySelectorAll('img, video')]
 assets.forEach(asset => {
  const source = asset.getAttribute('src') ?? asset.querySelector('source')?.getAttribute('src') ?? ''
  const filename = decodeURIComponent(source.split('/').pop())
  // Vite adds a content hash to asset names in production builds.
  const originalName = Object.keys(mediaCaptions).find(name => {
   const dot = name.lastIndexOf('.')
   return filename.startsWith(`${name.slice(0, dot)}-`) && filename.endsWith(name.slice(dot))
  })
  const labels = mediaCaptions[filename] ?? mediaCaptions[originalName]
  if (filename === 'nintendo-brand-experience-01.png' || originalName === 'nintendo-brand-experience-01.png') {
   asset.classList.add('nintendo-brand-cropped')
  }
  if (!labels) return
  const caption = createMediaCaption(labels)
  if (box.classList.contains('project-comparison-box')) {
   asset.closest('figure').querySelector('figcaption').replaceWith(caption)
  } else {
   const figure = document.createElement('figure')
   figure.className = 'project-media-item'
   box.before(figure)
   figure.append(caption, box)
  }
 })
})

document.querySelectorAll('.project-media-box > img').forEach(image => {
 if (!image.getAttribute('src')?.includes('editorial-whats-new')) return
 const preview = document.createElement('div')
 preview.className = 'nintendo-news-preview'
 const iframe = document.createElement('iframe')
 iframe.src = '/previews/nintendo-news.html'
 iframe.title = 'Nintendo 새로운 소식 웹 인터랙션 자동 미리보기'
 iframe.loading = 'lazy'
 iframe.tabIndex = -1
 const link = document.createElement('a')
 link.className = 'nintendo-news-original'
 link.href = 'https://mbc-teamproject-red.vercel.app/'
 link.target = '_blank'
 link.rel = 'noopener noreferrer'
 link.textContent = '원본 웹에서 직접 보기 ↗'
 preview.append(iframe)
 window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === iframe.contentWindow && event.data === 'nintendo-news-ready') {
   preview.classList.add('is-ready')
  }
 })
 image.replaceWith(preview, link)
 new ResizeObserver(entries => {
  iframe.style.transform = `scale(${entries[0].contentRect.width / 1920})`
 }).observe(preview)
})

const getMediaTravel = (rail) => {
 if (rail.closest('.video-short-one')) return 0
 const content = rail.closest('.story-content')
 const topInset = content ? Number.parseFloat(getComputedStyle(content).paddingTop) || 0 : 0
 return Math.max(0, rail.scrollHeight + topInset - window.innerHeight)
}
const getPanelHold = (panel) => {
 const rail = panel.querySelector('.project-media-rail')
 if (!rail) return 1
 const travel = getMediaTravel(rail)
 return travel > 0 ? travel / window.innerHeight : 0.25
}
const updateStorySize = () => {
  stories.forEach(({ story, track, panels }) => {
    if (!track || window.innerWidth < 1200 || reduceMotion.matches) {
      story.style.removeProperty('--story-height')
      return
    }
    const total = panels.reduce((sum, panel, index) => sum + getPanelHold(panel) + (index < panels.length - 1 ? 1 : 0), 0)
    story.style.setProperty('--story-height', `${window.innerHeight * (total + 1)}px`)
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
      panels.forEach(panel => {
        panel.style.removeProperty('--overlap-y')
        panel.style.removeProperty('z-index')
        panel.querySelector('.project-media-rail')?.style.removeProperty('--media-y')
        panel.inert = false
        if (panel.matches('.planning-combined')) {
          let active = 0
          panel.querySelectorAll('.planning-image-group').forEach((group, index) => {
            if (group.getBoundingClientRect().top <= window.innerHeight * .4) active = index
          })
          panel.querySelectorAll('.planning-copies > [data-planning-step]').forEach((copy, index) => { copy.hidden = index !== active })
        }
      })
      setStoryFill(panels, phaseCount)
      return
    }
    const rect = story.getBoundingClientRect()
    const progressValue = Math.min(1, Math.max(0, -rect.top / Math.max(1, story.offsetHeight - window.innerHeight)))
    const total = panels.reduce((sum, panel, index) => sum + getPanelHold(panel) + (index < panels.length - 1 ? 1 : 0), 0)
    let remaining = progressValue * total
    let rawPhase = phaseCount
    for (let index = 0; index < panels.length; index++) {
      const hold = getPanelHold(panels[index])
      const duration = hold + (index < panels.length - 1 ? 1 : 0)
      if (remaining <= duration) {
        rawPhase = index * 2 + (remaining <= hold ? remaining / hold : 1 + remaining - hold)
        break
      }
      remaining -= duration
    }
    const boundary = Math.round(rawPhase)
    const phase = Math.abs(rawPhase - boundary) < 0.001 ? boundary : rawPhase
    panels.forEach((panel, index) => {
      const exit = index === panels.length - 1 ? 0 : clamp(phase - (index * 2 + 1))
      panel.style.zIndex = String(panels.length - index)
      panel.style.setProperty('--overlap-y', (-exit * 100) + '%')
      const rail = panel.querySelector('.project-media-rail')
      if (rail) {
       const mediaProgress = clamp(phase - index * 2)
       const travel = getMediaTravel(rail)
       rail.style.setProperty('--media-y', (-travel * mediaProgress) + 'px')
       if (panel.matches('.planning-combined')) {
        const groups = [...rail.querySelectorAll('.planning-image-group')]
        const position = travel * mediaProgress + window.innerHeight * .3
        let active = 0
        groups.forEach((group, index) => { if (group.offsetTop <= position) active = index })
        panel.querySelectorAll('.planning-copies > [data-planning-step]').forEach((copy, index) => { copy.hidden = index !== active })
       }
      }
      panel.inert = index !== Math.min(panels.length - 1, Math.floor((phase + 1) / 2))
    })
    setStoryFill(panels, phase)
  })
  const selfIntroduction = document.querySelector('.self-introduction-section')
  const selfIntroductionTitle = document.querySelector('#self-introduction-title')
  if (selfIntroduction && selfIntroductionTitle) {
    const titleRect = selfIntroductionTitle.getBoundingClientRect()
    const fillStart = window.innerHeight * .8
    const fillEnd = window.innerHeight * .35
    const fillProgress = reduceMotion.matches
      ? 1
      : window.innerWidth >= 1200
        ? clamp(-selfIntroduction.getBoundingClientRect().top / Math.max(1, selfIntroduction.offsetHeight - window.innerHeight))
        : clamp((fillStart - titleRect.top) / (fillStart - fillEnd))
    setFillProgress(selfIntroductionTitle, fillProgress)
    selfIntroduction.style.setProperty('--profile-flower-rotation', `${reduceMotion.matches ? 0 : fillProgress * 540}deg`)
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

const opening = document.querySelector('.hero')
const openingTitle = opening?.querySelector('.kinetic-title')
const openingObject = openingTitle?.querySelector('.hero-object')
const openingText = openingTitle?.querySelector('.hero-title-text')
const openingInverse = openingTitle?.querySelector('.hero-title-inverse')
const openingMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const openingCopy = opening?.querySelector('.hero-copy')
const openingCopySteps = [...(openingCopy?.querySelectorAll('.hero-copy-step') ?? [])]
const renderOpeningCopy = (progress) => {
 const staticCopy = openingMotion.matches
 openingCopy?.classList.toggle('has-copy-motion', !staticCopy)
 const phase = clamp(progress / .78) * openingCopySteps.length
 const activeIndex = Math.min(openingCopySteps.length - 1, Math.floor(phase))
 openingCopySteps.forEach((step, index) => {
  const active = staticCopy || index === activeIndex
  step.classList.toggle('is-active', active)
  step.setAttribute('aria-hidden', String(!active))
  const lines = [...step.querySelectorAll('.story-fill')]
  const fill = staticCopy ? 1 : clamp((phase - index) / .8)
  lines.forEach((line, lineIndex) => setFillProgress(line, staticCopy ? 1 : clamp(fill * lines.length - lineIndex)))
 })
}
let openingFrame = 0
const renderOpening = () => {
 openingFrame = 0
 if (!opening || !openingTitle || !openingObject) return
 const letters = [...openingTitle.querySelectorAll('i')]
 if (openingMotion.matches) {
  renderOpeningCopy(1)
  openingTitle.style.transform = ''
  openingObject.style.transform = ''
  if (openingInverse) openingInverse.style.clipPath = 'polygon(0 0, 0 0, 0 0, 0 0)'
  letters.forEach(letter => { letter.style.transform = '' })
  return
 }
 const p = Math.max(0, Math.min(1, -opening.getBoundingClientRect().top / Math.max(1, opening.offsetHeight - innerHeight)))
 renderOpeningCopy(p)
 const travel = Math.max(0, openingTitle.scrollWidth - opening.clientWidth * .9)
 const horizontalProgress = Math.min(1, p / .75)
 const rotationProgress = Math.min(1, p / .75)
 const stretchProgress = Math.max(0, (p - .75) / .25)
 const angle = rotationProgress * Math.PI * 2
 openingTitle.style.transform = 'translate3d(' + (-travel * horizontalProgress) + 'px,0,0)'
 // Counter the title's horizontal movement so the square stays at its original position.
 openingObject.style.transform = `translateX(${travel * horizontalProgress}px) rotate(${rotationProgress * 360}deg)`
 let stretch = 1
 if (openingText && stretchProgress > 0) {
  const square = openingObject.getBoundingClientRect()
  const text = openingText.getBoundingClientRect()
  const side = openingObject.offsetWidth
  const targetWidth = Math.max(side, text.right - square.left + 10)
  stretch = 1 + (targetWidth / side - 1) * stretchProgress
  // Compensate for scaling around the center to keep the left edge in place.
  openingObject.style.transform = `translateX(${travel * horizontalProgress + (stretch - 1) * side / 2}px) rotate(360deg) scaleX(${stretch})`
 }
 if (openingText && openingInverse) {
  const textRect = openingText.getBoundingClientRect()
  const squareRect = openingObject.getBoundingClientRect()
  const side = openingObject.offsetWidth
  const centerX = squareRect.left + squareRect.width / 2 - textRect.left
  const centerY = squareRect.top + squareRect.height / 2 - textRect.top
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
    const dx = x * side * stretch / 2
    const dy = y * side / 2
    return `${centerX + dx * Math.cos(angle) - dy * Math.sin(angle)}px ${centerY + dx * Math.sin(angle) + dy * Math.cos(angle)}px`
  })
  openingInverse.style.left = `${openingText.offsetLeft}px`
  openingInverse.style.top = `${openingText.offsetTop}px`
  openingInverse.style.clipPath = `polygon(${corners.join(', ')})`
 }

}
const queueOpening = () => {
 if (!openingFrame) openingFrame = requestAnimationFrame(renderOpening)
}
window.addEventListener('scroll', queueOpening, { passive: true })
window.addEventListener('resize', queueOpening)
openingMotion.addEventListener('change', queueOpening)
document.fonts.ready.then(queueOpening)
queueOpening()

const capabilitiesSection = document.querySelector('.capabilities-section')
const capabilitiesInner = capabilitiesSection?.querySelector('.capabilities')
const capabilitiesCards = [...(capabilitiesSection?.querySelectorAll('.capability-list article') ?? [])]
const capabilitiesMedia = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)')
if (capabilitiesSection && capabilitiesInner && capabilitiesCards.length) {
 const wipe = document.createElement('div')
 wipe.className = 'capabilities-wipe'
 wipe.setAttribute('aria-hidden', 'true')
 capabilitiesInner.append(wipe)
 let pending = false
 const renderCapabilities = () => {
  pending = false
  const enabled = capabilitiesMedia.matches
  capabilitiesSection.classList.toggle('has-scroll-transition', enabled)
  const heading = capabilitiesInner.querySelector('.capabilities-heading')
  if (!enabled) {
   capabilitiesCards.forEach(card => {
    card.style.transform = ''
    card.style.opacity = ''
    card.style.height = ''
    card.querySelectorAll(':scope > :not(.capability-object)').forEach(text => { text.style.opacity = '' })
    card.querySelector('.capability-object').style.position = ''
    card.querySelector('.capability-object').style.top = ''
    card.querySelector('.capability-object').style.transform = ''
    card.querySelector('.capability-icon').style.opacity = ''
   })
   if (heading) heading.style.opacity = ''
   return
  }
  const rect = capabilitiesSection.getBoundingClientRect()
  const p = clamp(-rect.top / Math.max(1, capabilitiesSection.offsetHeight - innerHeight))
  const collapse = clamp(p / .12)
  const merge = clamp((p - .15) / .35)
  const reveal = clamp((p - .65) / .35)
  const list = capabilitiesInner.querySelector('.capability-list')
  const listRect = list.getBoundingClientRect()
  capabilitiesCards.forEach((card, index) => {
   // Read the original layout position so transforms never feed back into the movement.
   card.style.transform = 'none'
   card.style.height = ''
   const object = card.querySelector('.capability-object')
   object.style.position = ''
   object.style.top = ''
   // Measure the original square so rotation cannot shift its vertical anchor.
   object.style.transform = 'none'
   const cardRect = card.getBoundingClientRect()
   const objectRect = object.getBoundingClientRect()
   const border = Number.parseFloat(getComputedStyle(card).borderTopWidth) || 0
   const objectTop = objectRect.top - cardRect.top - border
   const compactHeight = objectTop * 2 + objectRect.height + border * 2
   object.style.position = 'absolute'
   object.style.top = objectTop + 'px'
   card.style.height = (cardRect.height + (compactHeight - cardRect.height) * collapse) + 'px'
   card.querySelectorAll(':scope > :not(.capability-object)').forEach(text => {
    text.style.opacity = String(1 - clamp(collapse / .6))
   })
   const shift = listRect.left + listRect.width / 2 - cardRect.left - cardRect.width / 2
   card.style.transform = 'translateX(' + (shift * merge) + 'px)'
   card.querySelector('.capability-icon').style.opacity = String(1 - merge * merge * (3 - 2 * merge))
   card.style.zIndex = String(capabilitiesCards.length - index)
   card.style.opacity = String(1 - reveal)
   const spin = clamp((p - .35 - index * .036) / .3)
   object.style.transform = 'rotate(' + (spin * 90) + 'deg)'
  })
  if (heading) heading.style.opacity = String(1 - reveal)
  const wipeRect = wipe.getBoundingClientRect()
  const squareSize = Math.max(wipeRect.width, wipeRect.height) * reveal
  const insetX = (wipeRect.width - squareSize) / 2
  const insetY = (wipeRect.height - squareSize) / 2
  wipe.style.clipPath = `inset(${insetY}px ${insetX}px)`
 }
 const queueCapabilities = () => {
  if (!pending) { pending = true; requestAnimationFrame(renderCapabilities) }
 }
 window.addEventListener('scroll', queueCapabilities, { passive: true })
 window.addEventListener('resize', queueCapabilities)
 capabilitiesMedia.addEventListener('change', queueCapabilities)
 renderCapabilities()
}

const aboutGrid = document.querySelector('.about-grid-section')
const aboutGridStage = aboutGrid?.querySelector('.about-grid-stage')
const aboutGridCurtain = aboutGrid?.querySelector('.about-grid-curtain')
const aboutGridFlow = aboutGrid?.querySelector('.about-grid-flow')
if (aboutGrid && aboutGridStage && aboutGridCurtain && aboutGridFlow) {
 const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
 const rows = [...aboutGridFlow.querySelectorAll('.about-grid-row')]
 const groups = rows.map(row => row.querySelector('.about-grid-blocks'))
 const rail = document.createElement('div')
 rail.className = 'about-image-rail'
 const copies = document.createElement('div')
 copies.className = 'about-scroll-copies'
 const textGroups = rows.map(row => {
  const copy = document.createElement('div')
  copy.className = 'about-scroll-copy'
  copy.append(row.querySelector('h3'), row.querySelector('p'))
  copy.querySelectorAll('h3, p').forEach(element => {
   const original = element.textContent
   element.classList.add('story-fill')
   element.setAttribute('aria-label', original)
   element.replaceChildren(...[...segmenter.segment(original)].map(({ segment }) => {
    const character = document.createElement('span')
    character.className = 'fill-char'
    character.setAttribute('aria-hidden', 'true')
    character.textContent = segment
    return character
   }))
   element._fillCharacters = [...element.children]
   element._filledCharacterCount = 0
  })
  return copy
 })
 groups.forEach(group => group.querySelectorAll('i[aria-hidden="true"]').forEach(block => block.remove()))
 let scheduled = false
 const drawAboutGrid = () => {
  scheduled = false
  if (motion.matches) {
   aboutGridFlow.style.transform = ''
   return
  }
  const distance = Math.max(0, rail.scrollWidth - aboutGridFlow.clientWidth, groups.at(-1).offsetLeft)
  const entranceDistance = innerHeight * .65
  const total = entranceDistance + distance + innerHeight * .35
  aboutGrid.style.height = `${innerHeight + total}px`
  const scroll = clamp(-aboutGrid.getBoundingClientRect().top, 0, total)
  const opening = clamp(scroll / entranceDistance)
  const ease = opening * opening * (3 - 2 * opening)
  aboutGridCurtain.style.transform = `rotate(${ease * 145}deg) scale(${1 - ease})`
  aboutGridCurtain.style.visibility = opening === 1 ? 'hidden' : 'visible'
  const x = clamp(scroll - entranceDistance, 0, distance)
  rail.style.transform = `translate3d(${-x}px,0,0)`
  let active = 0
  groups.forEach((group, index) => { if (x >= group.offsetLeft - 1) active = index })
  textGroups.forEach((copy, index) => {
   copy.classList.toggle('is-active', index === active)
   copy.setAttribute('aria-hidden', String(index !== active))
   const start = index === 0 ? entranceDistance * .7 : entranceDistance + groups[index].offsetLeft
   const progress = clamp((scroll - start) / Math.max(1, Math.min(innerHeight * .3, groups[index].offsetWidth * .25)))
   copy.querySelectorAll('.story-fill').forEach(element => setFillProgress(element, progress))
  })
 }
 const queueAboutGrid = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(drawAboutGrid) } }
 const configureAbout = () => {
  aboutGrid.classList.toggle('has-horizontal-about', !motion.matches)
  if (!motion.matches) {
   groups.forEach((group, index) => {
    rail.append(group)
    const copy = textGroups[index]
    if (!copy.children.length) copy.append(rows[index].querySelector('h3'), rows[index].querySelector('p'))
    copies.append(copy)
   })
   aboutGridFlow.append(rail, copies)
  } else {
   groups.forEach((group, index) => {
    rows[index].append(group, ...textGroups[index].children)
    rows[index].querySelectorAll('.story-fill').forEach(element => setFillProgress(element, 1))
   })
   rail.remove()
   copies.remove()
   aboutGrid.style.height = ''
  }
  queueAboutGrid()
 }
 // Land on the visible ABOUT heading after the curtain has opened.
 const navigateToAbout = (event) => {
  event.preventDefault()
  const sectionTop = scrollY + aboutGrid.getBoundingClientRect().top
  const offset = motion.matches ? 0 : innerHeight * .65
  if (location.hash !== '#about') history.pushState(null, '', '#about')
  window.scrollTo({ top: sectionTop + offset, behavior: motion.matches ? 'instant' : 'smooth' })
 }
 document.querySelectorAll('.primary-nav a[href="#about"]').forEach((link) => {
  link.addEventListener('click', navigateToAbout)
 })
 addEventListener('scroll', queueAboutGrid, { passive: true })
 addEventListener('resize', queueAboutGrid)
 motion.addEventListener('change', configureAbout)
 document.fonts.ready.then(queueAboutGrid)
 configureAbout()
}

const cloneCanvas = document.querySelector('.clone-canvas')
if (cloneCanvas) {
 const cloneMotion = matchMedia('(prefers-reduced-motion: reduce)')
 const finePointer = matchMedia('(pointer: fine)')
 const layers = [...cloneCanvas.querySelectorAll('.clone-art, .clone-word, .clone-orb')]
 const layerPositions = new Map()
 const pointer = document.createElement('div')
 pointer.className = 'clone-pointer'
 pointer.setAttribute('aria-hidden', 'true')
 document.body.append(pointer)
 let pending = false
 const renderClone = () => {
  pending = false
  const bounds = cloneCanvas.getBoundingClientRect()
  if (cloneMotion.matches) {
   layers.forEach(layer => layer.style.removeProperty('--clone-drift'))
   layerPositions.clear()
   return
  }
  if (bounds.bottom < 0 || bounds.top > innerHeight) return
  let settling = false
  layers.forEach(layer => {
   const rect = layer.getBoundingClientRect()
   const isArt = layer.classList.contains('clone-art')
   const isOrb = layer.classList.contains('clone-orb')
   const current = layerPositions.get(layer) || 0
   const baseCenter = rect.top - current + rect.height / 2
   // Each layer crosses its resting position at a different viewport height.
   const anchor = isArt ? .56 : isOrb ? .38 : .68
   const speed = isArt ? .035 : isOrb ? .025 : -.018
   const limit = isArt ? 16 : isOrb ? 12 : 8
   const target = Math.max(-limit, Math.min(limit, (innerHeight * anchor - baseCenter) * speed))
   const follow = isArt ? .16 : isOrb ? .035 : .2
   const next = Math.abs(target - current) < .1 ? target : current + (target - current) * follow
   if (Math.abs(target - next) > .1) settling = true
   layerPositions.set(layer, next)
   layer.style.setProperty('--clone-drift', `${next}px`)
  })
  if (settling) queueClone()
 }
 const queueClone = () => { if (!pending) { pending = true; requestAnimationFrame(renderClone) } }
 addEventListener('scroll', queueClone, {passive: true})
 addEventListener('resize', queueClone)
 cloneMotion.addEventListener('change', queueClone)
 document.addEventListener('pointermove', event => {
  if (!finePointer.matches || cloneMotion.matches) return
  pointer.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`
  pointer.style.opacity = '1'
  pointer.classList.toggle('is-over-link', Boolean(event.target.closest('a, button, input, select, textarea, summary, [role="button"], [role="link"]')))
 })
 document.documentElement.addEventListener('pointerleave', () => { pointer.style.opacity = '0' })
 window.addEventListener('blur', () => { pointer.style.opacity = '0' })
 queueClone()
}
