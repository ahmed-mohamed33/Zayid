import React, { useContext, useState, useMemo } from "react";
import { UserContext } from "../../../context/UserContext";
import { useAuctionActions } from "../../../hooks/useAuctionActions";
import AuctionFilters from "./AuctionFilters";
import AuctionTable from "./AuctionTable";
import AuctionModal from "./AuctionModal";
import { FullScreenImageModal } from "../modals";
import { Pagination } from "../shared";
import { FaImage, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function Product() {
  const { auctions, loading } = useContext(UserContext);
  const auctionActions = useAuctionActions();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for modals
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Helper function to get bid information from auction
  const getBidInfo = (auction) => {
    const bids = auction.bids || {};
    const bidsArray = Object.values(bids);
    const validBids = bidsArray.filter((bid) => bid.bidAmount > 0);

    const bidCount = validBids.length;
    let currentBid = 0;

    if (validBids.length > 0) {
      currentBid = Math.max(
        ...validBids.map((bid) => Number(bid.bidAmount) || 0)
      );
    }

    return { bidCount, currentBid };
  };

  // Modal handlers
  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setCurrentImageIndex(0);
    setShowModal(true);
  };

  const handleImageNavigation = (direction) => {
    if (!selectedAuction?.imageUrls) return;

    const totalImages = selectedAuction.imageUrls.length;
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(auctions.map((auction) => auction.categoryId)),
    ];
    return uniqueCategories.filter(Boolean);
  }, [auctions]);

  // Filter and sort auctions
  const filteredAndSortedAuctions = useMemo(() => {
    let filtered = auctions.filter((auction) => {
      const matchesSearch =
        auction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || auction.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || auction.categoryId === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort auctions
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "startPrice" || sortBy === "currentBid") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (
        sortBy === "createdAt" ||
        sortBy === "startDate" ||
        sortBy === "endDate"
      ) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [auctions, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAuctions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAuctions = filteredAndSortedAuctions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Helper functions
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "معلق" },
      approved: { color: "bg-blue-100 text-blue-800", text: "معتمد" },
      active: { color: "bg-green-100 text-green-800", text: "نشط" },
      ended: { color: "bg-gray-100 text-gray-800", text: "منتهي" },
      rejected: { color: "bg-red-100 text-red-800", text: "مرفوض" },
    };
    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="w-3 h-3 opacity-50" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="w-3 h-3" />
    ) : (
      <FaSortDown className="w-3 h-3" />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Empty state
  if (!auctions || auctions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
        <FaImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لا توجد مزادات
        </h3>
        <p className="text-gray-500">لم يتم العثور على أي مزادات في النظام.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <AuctionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categories={categories}
        totalAuctions={auctions.length}
        filteredCount={filteredAndSortedAuctions.length}
      />

      {/* Auctions Table */}
      <AuctionTable
        paginatedAuctions={paginatedAuctions}
        getBidInfo={getBidInfo}
        getStatusBadge={getStatusBadge}
        getSortIcon={getSortIcon}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleViewDetails={handleViewDetails}
        {...auctionActions}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
        totalItems={filteredAndSortedAuctions.length}
        setCurrentPage={setCurrentPage}
      />

      {/* Auction Details Modal */}
      <AuctionModal
        showModal={showModal}
        selectedAuction={selectedAuction}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        handleImageNavigation={handleImageNavigation}
        openImageModal={openImageModal}
        getBidInfo={getBidInfo}
        getStatusBadge={getStatusBadge}
        setShowModal={setShowModal}
      />

      {/* Full Screen Image Modal */}
      <FullScreenImageModal
        showImageModal={showImageModal}
        selectedAuction={selectedAuction}
        currentImageIndex={currentImageIndex}
        handleImageNavigation={handleImageNavigation}
        setShowImageModal={setShowImageModal}
      />
    </div>
  );
}
