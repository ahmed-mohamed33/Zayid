import React, { useContext, useEffect, useState, useMemo } from "react";
import { UserContext } from "../../../context/UserContext";
import { getDatabase, ref, onValue } from "firebase/database";
import { useUserActions } from "../../../hooks/useUserActions";
import UserProfile from "./UserProfile";
import UserFilters from "./UserFilters";
import UserStatsCards from "./UserStatsCards";
import UserTable from "./UserTable";
import { Pagination } from "../shared";
import { FaUsers, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function User() {
  const { loading } = useContext(UserContext);
  const userActions = useUserActions();

  // State for user data
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch users data
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const usersArray = Object.entries(data).map(([id, userData]) => ({
            id,
            ...userData,
          }));
          setAllUsers(usersArray);
        } else {
          setAllUsers([]);
        }
        setUsersLoading(false);
      },
      (error) => {
        setAllUsers([]);
        setUsersLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handler functions
  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const handleBackFromProfile = () => {
    setSelectedUser(null);
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = allUsers.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.nationalID?.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive === true) ||
        (statusFilter === "inactive" && user.isActive === false) ||
        (statusFilter === "pending" &&
          (user.isActive === null || user.isActive === undefined));

      const matchesUserType =
        userTypeFilter === "all" ||
        (userTypeFilter === "company" && user.isCompany) ||
        (userTypeFilter === "individual" && !user.isCompany);

      return matchesSearch && matchesStatus && matchesUserType;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allUsers, searchTerm, statusFilter, userTypeFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Helper functions
  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="w-3 h-3 opacity-50" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="w-3 h-3" />
    ) : (
      <FaSortDown className="w-3 h-3" />
    );
  };

  // Loading state
  if (loading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show user profile if selected
  if (selectedUser) {
    return <UserProfile user={selectedUser} onBack={handleBackFromProfile} />;
  }

  // Empty state
  if (!allUsers || allUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
        <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لا توجد مستخدمين
        </h3>
        <p className="text-gray-500">
          لم يتم العثور على أي مستخدمين في النظام.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <UserStatsCards users={allUsers} />

      {/* Filters Section */}
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        userTypeFilter={userTypeFilter}
        setUserTypeFilter={setUserTypeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        totalUsers={allUsers.length}
        filteredCount={filteredAndSortedUsers.length}
      />

      {/* Users Table */}
      <UserTable
        paginatedUsers={paginatedUsers}
        getSortIcon={getSortIcon}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleViewUser={handleViewUser}
        {...userActions}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
        totalItems={filteredAndSortedUsers.length}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

