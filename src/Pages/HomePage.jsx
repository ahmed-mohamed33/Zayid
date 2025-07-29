import React from "react";
import { motion } from "framer-motion";
import Nav from "../components/common/Nav.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import OurNumbers from "../components/home/OurNumbers.jsx";
import Catigarios from "../components/home/catigariosSection.jsx";
import TopMazad from "../components/home/TopMazad.jsx";
import ZayidFeatures from "../components/home/ZayidFeatures.jsx";

function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <HeroSection />

      <motion.div variants={sectionVariants}>
        <ZayidFeatures />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <OurNumbers />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <TopMazad />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <Catigarios />
      </motion.div>
    </motion.div>
  );
}

export default HomePage;
