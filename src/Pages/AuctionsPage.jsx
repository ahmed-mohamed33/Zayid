import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../components/Mazadat/Sidebar";
import MazadCard from "../components/common/MazadCard";
import arrowRight from "../assets/icons/arrow-right.svg";
import arrowLeft from "../assets/icons/arrow-left.svg";
import { UserContext } from "../context/UserContext";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  useEffect(() => {
    if (categoryFromUrl) {
      setFilters((prev) => ({
        ...prev,
        categories: [categoryFromUrl],
      }));
    }
  }, [categoryFromUrl]);
  const { auctions, userData } = useContext(UserContext);
  const userInterests = userData?.userInterests || [];
  console.log("User Interests:", userInterests);

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
      filters.auctionStatuses.includes(auction.status);

    const matchesMinPrice =
      !filters.minPrice || auction.startPrice >= parseFloat(filters.minPrice);

    const matchesMaxPrice =
      !filters.maxPrice || auction.startPrice <= parseFloat(filters.maxPrice);

    const matchesInterest =
      !filters.filterByInterest ||
      userInterests.includes(auction.categoryId);

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
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 bg-white rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition disabled:opacity-50"
      >
        <img src={arrowRight} alt="prev" />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="w-10 h-10 flex items-center justify-center text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${
              currentPage === page
                ? "bg-[#4F5D75] text-white"
                : "bg-white text-gray-500 border-gray-300 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 bg-white rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition disabled:opacity-50"
      >
        <img src={arrowLeft} alt="next" />
      </button>
    </div>
  );
};


  return (
    <div className="bg-[#f1f1f1] min-h-screen flex flex-col px-[56px">
      <main className="container mx-auto flex flex-row flex-1 py-6 px-7">
        <section className="flex-1 flex flex-col">
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

          <div className="flex w-full">
            <aside className="hidden lg:block w-72 shrink-0">
              <Sidebar
                onFilterChange={handleFilterChange}
                filters={filters}
                categoryFromUrl={categoryFromUrl}
              />
            </aside>
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[24px] mb-8">
                {getPaginatedProducts().length > 0 ? (
                  getPaginatedProducts().map((product, idx) => (product.status === "approved" || product.status === "ended" ?
                    <MazadCard key={idx} auctionId={product.id}  />
                  : null))
                ) : (
                  <p className="text-center text-gray-500 col-span-full">
                    لا توجد مزادات مطابقة لبحثك.
                  </p>
                )}
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
