import React, { useState } from "react";
import Sidebar from "../components/Mazadat/Sidebar";
import MazadCard from "../components/common/MazadCard";
import smartWatch from "../assets/images/smartWatch.png";

const products = [
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },

  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
  {
    image: smartWatch,
    price: "3,500 جنيه",
    title: "اسم المنتج",
    usersInMAzad: 8,
    time: 5,
  },
];

const PRODUCTS_PER_PAGE = 6;

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const getPaginatedProducts = () => {
    const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  const renderPagination = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }
    return (
      <div className="flex justify-center items-center gap-2 mb-8">
        <button
          className="px-3 py-1 rounded bg-white border text-[#4F5D75]"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="px-2">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-[#4F5D75] text-white"
                  : "bg-white border text-[#4F5D75]"
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          )
        )}
        <button
          className="px-3 py-1 rounded bg-white border text-[#4F5D75]"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="bg-[#F6F6F6] min-h-screen flex flex-col">

      <main className="container mx-auto flex flex-row flex-1 gap-6 py-12 px-7">
        {/* Sidebar */}
        <section className="flex-1 flex flex-col gap-8">
          {/* Top: Title and Search */}
          <div className="flex flex-row justify-between items-center w-full mb-6">
            <h2 className="text-right font-bold not-italic leading-normal text-[var(--text-primary,#2D3142)] text-[length:var(--typography-font-size-heading-H4,24px)] font-[Almarai]">
              المزادات المتاحة
            </h2>
            <form
              className="flex w-full max-w-xl"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="ابحث عن مزاد"
                className="flex px-7 py-[10px] pr-[16px] pl-[10px] justify-end items-center gap-[10px] flex-[1_0_0%] self-stretch rounded-r-[8px] border-t border-r border-b border-[var(--text-tritiary,#BFC0C0)] bg-[var(--card-bg,#FFF)]"
              />
              <button
                className="text-white flex w-[163px] px-[15px] py-[11px] justify-center items-center gap-[10px] shrink-0 self-stretch rounded-l-[8px] bg-[var(--1,#FA6300)]"
                type="submit"
              >
                بحث
              </button>
            </form>
          </div>
          {/* Bottom: Sidebar and Cards */}
          <div className="flex w-full gap-6">
            <aside className="hidden lg:block w-72 shrink-0">
              <Sidebar />
            </aside>
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {getPaginatedProducts().map((product, idx) => (
                  <MazadCard key={idx} {...product} />
                ))}
              </div>
              <div className="flex justify-center w-full">
                {renderPagination()}
              </div>
            </div>
          </div>
        </section>
      </main>
                
    </div>
  );
};

export default Products;
