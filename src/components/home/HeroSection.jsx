import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import {
  FaGem,
  FaPaintBrush,
  FaTools,
  FaCar,
  FaTv,
  FaCouch,
  FaHome,
} from "react-icons/fa";

// Import the category images
import heroArt from "../../assets/images/heroart.png";
import heroMetal from "../../assets/images/herometal.jpg";
import heroElectro from "../../assets/images/heroelectro.jpg";
import heroimg from "../../assets/images/Hero.webp";
import heroCar from "../../assets/images/herocars1.jpg";
import heroJewelry from "../../assets/images/herojewlry.jpg";

function HeroSection() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: heroimg,
      title: "أهلاً بك في زايد",
      subtitle: "أول منصة مزايدات عربية",
      description: "اكتشف كنوز لا تنتهي من التحف النادرة إلى السيارات الفاخرة",
      ctaText: "ابدأ المزايدة",
      ctaLink: "/auctions",
      category: null,
    },
    {
      image: heroArt,
      title: "تحف وأعمال فنية",
      subtitle: "كنوز الفن والتاريخ",
      description:
        "من اللوحات الكلاسيكية إلى المنحوتات المعاصرة، اكتشف أعمال فنية فريدة تحكي قصص الحضارات",
      ctaText: "استكشف التحف الفنية",
      ctaLink: "/auctions?category=تحف وأعمال فنية",
      category: "تحف وأعمال فنية",
      icon: <FaPaintBrush />,
      story:
        "كل قطعة فنية تحمل قصة فريدة، من الفرشاة الأولى إلى اللحظة التي تصبح فيها ملكك",
    },
    {
      image: heroMetal,
      title: "خردة وبواقي معادن",
      subtitle: "قيمة في كل قطعة",
      description:
        "تحويل المعادن المستعملة إلى فرص استثمارية ذكية، من الحديد إلى المعادن النفيسة",
      ctaText: "تسوق المعادن",
      ctaLink: "/auctions?category=خردة وبواقي معادن",
      category: "خردة وبواقي معادن",
      icon: <FaTools />,
      story:
        "المعادن المستعملة اليوم قد تكون كنز الغد، اكتشف القيمة الحقيقية لكل قطعة",
    },
    {
      image: heroElectro,
      title: "إلكترونيات وتكنولوجيا",
      subtitle: "عالم الابتكار",
      description:
        "من الأجهزة الذكية إلى التكنولوجيا المتطورة، احصل على أحدث التقنيات بأسعار منافسة",
      ctaText: "اكتشف الإلكترونيات",
      ctaLink: "/auctions?category=إلكترونيات",
      category: "إلكترونيات",
      icon: <FaTv />,
      story:
        "التكنولوجيا تتطور بسرعة، لكن القيمة الحقيقية تكمن في الاختيار الذكي",
    },
    {
      image: heroCar,
      title: "سيارات فاخرة",
      subtitle: "الفخامة على عجلات",
      description:
        "من السيارات الكلاسيكية إلى الفاخرة، اكشف عن عوالم جديدة من الأناقة والسرعة",
      ctaText: "تصفح السيارات",
      ctaLink: "/auctions?category=سيارات",
      category: "سيارات",
      icon: <FaCar />,
      story:
        "كل سيارة لها شخصيتها الفريدة، من المحرك إلى التصميم، كل تفصيل يحكي قصة",
    },
    {
      image: heroJewelry,
      title: "مجوهرات ثمينة",
      subtitle: "بريق الألماس",
      description:
        "من الألماس النادر إلى الذهب الأصيل، اكتشف عالم المجوهرات الفاخرة",
      ctaText: "تسوق المجوهرات",
      ctaLink: "/auctions?category=مجوهرات",
      category: "مجوهرات",
      icon: <FaGem />,
      story: "كل حجر كريم يحمل تاريخاً طويلاً، من أعماق الأرض إلى يديك",
    },
  ];

  // Auto-play functionality with longer duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000); // Increased to 10 seconds for better storytelling

    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlideData = slides[currentSlide];

  return (
    <section className="hero-section relative h-screen overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <motion.img
                src={currentSlideData.image}
                alt={`slide-${currentSlide}`}
                className="h-full w-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
            </div>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content - Left Side */}
                <motion.div
                  className="text-right space-y-8"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Category Icon and Badge */}
                  {currentSlideData.category && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex items-center justify-end gap-3 mb-4"
                    >
                      <div className="bg-[#FA6300]/20 backdrop-blur-sm border border-[#FA6300]/30 rounded-full p-3">
                        <span className="text-[#FA6300] text-xl">
                          {currentSlideData.icon}
                        </span>
                      </div>
                      <span className="bg-[#FA6300] text-white px-4 py-2 rounded-full text-sm font-medium">
                        {currentSlideData.category}
                      </span>
                    </motion.div>
                  )}

                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                      {currentSlideData.title}
                    </h1>
                  </motion.div>

                  {/* Subtitle */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <h2 className="text-2xl lg:text-4xl font-semibold mb-6 text-white/90 leading-tight">
                      {currentSlideData.subtitle}
                    </h2>
                  </motion.div>

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <p className="text-lg lg:text-xl mb-6 text-white/80 leading-relaxed">
                      {currentSlideData.description}
                    </p>
                  </motion.div>

                  {/* Story Quote */}
                  {currentSlideData.story && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                      className="bg-white/10 backdrop-blur-sm border-r-4 border-[#FA6300] p-4 rounded-lg mb-6"
                    >
                      <p className="text-white/90 text-lg italic">
                        "{currentSlideData.story}"
                      </p>
                    </motion.div>
                  )}

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <motion.button
                      className="bg-[#FA6300] hover:bg-[#e55a00] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(currentSlideData.ctaLink)}
                    >
                      {currentSlideData.ctaText}
                      <IoIosArrowForward className="group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>

                    {/* Secondary CTA */}
                    <motion.button
                      className="border-2 border-white text-white hover:bg-white hover:text-[#FA6300] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        currentSlideData.image === heroimg
                          ? navigate("/faq")
                          : navigate("/auctions")
                      }
                    >
                      {currentSlideData.image === heroimg
                        ? "تعرف علينا أكثر"
                        : "تصفح جميع المزادات"}
                      <IoIosArrowForward className="group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Right Side - Category Showcase */}
                <motion.div
                  className="hidden lg:flex flex-col justify-center items-center space-y-6"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {/* Main Category Image */}
                  <div className="relative">
                    <motion.div
                      className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={currentSlideData.image}
                        alt={currentSlideData.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    {/* Floating Elements */}
                    <motion.div
                      className="absolute -top-4 -right-4 w-16 h-16 bg-[#FA6300] rounded-full flex items-center justify-center shadow-lg"
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="text-white text-xl">
                        {currentSlideData.icon}
                      </span>
                    </motion.div>

                    <motion.div
                      className="absolute -bottom-4 -left-4 bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="w-8 h-8 border-2 border-white/50 rounded-full"></div>
                    </motion.div>
                  </div>

                  {/* Category Stats */}
                  {currentSlideData.category && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    >
                      <div className="text-center text-white">
                        <div className="text-2xl font-bold mb-1">150+</div>
                        <div className="text-sm opacity-80">مزاد نشط</div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Progress Bar */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-[#FA6300] scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-[#FA6300]"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 10, ease: "linear" }}
          key={currentSlide}
        />
      </div>
    </section>
  );
}

export default HeroSection;
