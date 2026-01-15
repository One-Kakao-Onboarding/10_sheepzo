"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const webtoonImages = [
  {
    src: "/images/cheese.webp",
    alt: "웹툰 씬",
  },
  {
    src: "/images/company_love.jpeg",
    alt: "사내맞선",
  },
  {
    src: "/images/9791193821046.jpg",
    alt: "나혼자만 레벨업",
  },
  {
    src: "/images/revolution.jpg",
    alt: "연애혁명",
  },
  {
    src: "/images/debut.jpg",
    alt: "데뷔못하면죽는병걸림",
  },
  {
    src: "/images/b5qq77cumfn51ozzn-hw1avn5qfvuapzgxf0tnls-wslcqaznctsn-fkbd8jrwwfimi8odyn8ymajhpzd9knhq.webp",
    alt: "바니와 오빠들",
  },
  {
    src: "/images/oneday_princess.jpg",
    alt: "어느날 공주가 되어버렸다",
  },
  {
    src: "/images/0b0a-wsdncqa11nqqeyjp34mxu3b34hjt0yqjmk64g8tcpjyj163p78fawjkvfkts4pscpqc2qsiwfl4u5-ubq.webp",
    alt: "유미의 세포들",
  },
  {
    src: "/images/thumbnail-imag19-cbaaa393-baab-456a-b311-827953e4cf2e.jpg",
    alt: "로맨스 웹툰",
  },
  {
    src: "/images/1z2wfe05w8-1.jpg",
    alt: "전지적 독자 시점",
  },
]

interface CoverPageProps {
  onStart: () => void
}

export function CoverPage({ onStart }: CoverPageProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950">
      {/* Background image grid with overlay */}
      <div className="absolute inset-0">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-1 h-full opacity-40">
          {webtoonImages.map((image, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
            >
              <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-transparent to-zinc-950/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">AI 기반 캐스팅 매칭 시스템</span>
          </motion.div>

          {/* Main tagline */}
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <span className="text-zinc-400">막연한 </span>
            <span className="text-amber-400">{`'감'`}</span>
            <span className="text-zinc-400">이 아닌</span>
            <br />
            <span className="text-zinc-400">확실한 </span>
            <span className="text-amber-400">{`'데이터'`}</span>
            <span className="text-zinc-400">로,</span>
            <br />
            <span className="text-white">완벽한 배역의 주인공을 찾으세요.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            웹툰 · 웹소설 캐릭터를 분석하고,
            <br className="md:hidden" /> 최적의 배우를 AI가 추천해 드립니다.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="group relative px-8 py-6 text-lg font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-full transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={onStart}
            >
              <span>캐스팅 시작하기</span>
              <motion.span
                className="inline-block ml-2"
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Bottom floating images showcase */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <div className="flex justify-center gap-4 px-4">
            {webtoonImages.slice(0, 6).map((image, index) => (
              <motion.div
                key={index}
                className="w-20 h-28 md:w-24 md:h-32 rounded-lg overflow-hidden shadow-xl"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8 + index * 0.1, duration: 0.6 }}
                style={{
                  transform: `rotate(${(index - 2.5) * 3}deg)`,
                }}
              >
                <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
