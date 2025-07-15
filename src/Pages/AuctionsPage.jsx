import React, { useState, useContext } from "react";
import Sidebar from "../components/Mazadat/Sidebar";
import MazadCard from "../components/common/MazadCard";
import arrowRight from "../assets/icons/arrow-right.svg";
import arrowLeft from "../assets/icons/arrow-left.svg";
import { UserContext } from "../context/UserContext";

const PRODUCTS_PER_PAGE = 6;

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    productConditions: [],
    auctionStatuses: [],
    minPrice: "",
    maxPrice: "",
    filterByInterest: false,
  });

  const userInterests = ["عقارات وأراضي", "إلكترونيات", "تحف وأعمال فنية"];
  const { auctions } = useContext(UserContext);

  const applyFilters = () => {
    const term = searchTerm.trim().toLowerCase();

    return auctions.filter((auction) => {
      const matchesSearch =
        term === "" || auction.title?.toLowerCase().includes(term);

      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(auction.categoryId);

      const matchesCondition =
        filters.productConditions.length === 0 ||
        filters.productConditions.includes(auction.productCondition);

      const matchesStatus =
        filters.auctionStatuses.length === 0 ||
        filters.auctionStatuses.includes(auction.auctionStatus);

      const matchesMinPrice =
        !filters.minPrice || auction.startPrice >= parseFloat(filters.minPrice);

      const matchesMaxPrice =
        !filters.maxPrice || auction.startPrice <= parseFloat(filters.maxPrice);

      const matchesInterest =
        !filters.filterByInterest || userInterests.includes(auction.categoryId);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCondition &&
        matchesStatus &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesInterest
      );
    });
  };

  const filteredProducts = applyFilters();
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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
          <img src={arrowRight} alt="prev" />
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
          <img src={arrowLeft} alt="next" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-[#F6F6F6] min-h-screen flex flex-col">
      <main className="container mx-auto flex flex-row flex-1 gap-6 py-12 px-7">
        <section className="flex-1 flex flex-col gap-8">
          <div className="flex flex-row justify-between items-center w-full mb-6">
            <h2 className="text-right font-bold text-[#2D3142] text-[24px] font-[Almarai]">
              المزادات المتاحة
            </h2>
            <form
              className="flex w-full max-w-xl"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                placeholder="ابحث عن مزاد"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex px-7 py-[10px] pr-[16px] pl-[10px] rounded-r-[8px] border border-[#BFC0C0] bg-white flex-1"
              />
              <button
                type="submit"
                className="text-white px-[15px] py-[11px] rounded-l-[8px] bg-[#FA6300]"
              >
                بحث
              </button>
            </form>
          </div>

          <div className="flex w-full gap-6">
            <aside className="hidden lg:block w-72 shrink-0">
              <Sidebar onFilterChange={handleFilterChange} />
            </aside>
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {getPaginatedProducts().length > 0 ? (
                  getPaginatedProducts().map((product, idx) => (
                    <MazadCard key={idx} auctionId={product.id} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-full">
                    لا توجد مزادات مطابقة لبحثك.
                  </p>
                )}
              </div>

              <div className="flex justify-center w-full">{renderPagination()}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Products;
