import React, { useEffect, useState } from 'react'

interface HeroBackgroundProps {
  videoSrc: string
  fallbackImageSrc: string
}

export const HeroBackground = ({ videoSrc, fallbackImageSrc }: HeroBackgroundProps) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {isMobile ? (
        <img
          src={fallbackImageSrc}
          alt="Background"
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />
    </div>
  )
}