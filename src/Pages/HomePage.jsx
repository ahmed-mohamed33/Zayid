import React from 'react'
import Nav from '../components/common/Nav.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import OurNumbers from '../components/home/OurNumbers.jsx'
import Catigarios from '../components/home/catigariosSection.jsx'
import TopMazad from '../components/home/TopMazad.jsx'
import ZayidFeatures from '../components/home/ZayidFeatures.jsx'
function HomePage() {
  return (
    <>
    <HeroSection/>
    <OurNumbers/>
    <Catigarios/>
    <TopMazad/>
    <ZayidFeatures/>
    </>
  )
}

export default HomePage