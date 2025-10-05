"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import Loading from "@/components/Loading";

// --- Type Definitions ---
interface User {
  id: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  totalApplications: number;
  rank: number;
  page?: number;
}

interface RankingClientProps {
  initialUsersWithRank: User[];
  initialTopThreeUsers: User[];
  initialCurrentUser: User | null;
  error: string | null;
}

export default function RankingClient({ initialUsersWithRank, initialTopThreeUsers, initialCurrentUser, error: initialError }: RankingClientProps) {
  const [allUsers, setAllUsers] = useState<User[]>(initialUsersWithRank);
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
  const [topThreeUsers, setTopThreeUsers] = useState<User[]>(initialTopThreeUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(initialCurrentUser);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { t } = useLanguage();
  const usersPerPage = 10;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const processAndSetUsers = (usersData: User[], page: number) => {
    const total = Math.ceil(usersData.length / usersPerPage) || 1;
    setTotalPages(total);
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    setAllUsers(usersData);
    setPaginatedUsers(usersData.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  useEffect(() => {
    processAndSetUsers(initialUsersWithRank, 1);
  }, [initialUsersWithRank]);
  
  const fetchRanking = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/user/all-users-ranking`, { withCredentials: true });
      const currentUserResponse = await axios.get(`${API_URL}/user/profile`, { withCredentials: true });
      if (!response.data || !Array.isArray(response.data)) throw new Error(t('ranking.warnings.noUserDataReceived') as string);
      
      const sortedUsers = [...response.data].sort((a, b) => b.totalApplications - a.totalApplications);
      const usersWithRank = sortedUsers.map((user, index) => ({ ...user, rank: index + 1 }));
      setTopThreeUsers(usersWithRank.slice(0, 3));
      
      const currentUserData = currentUserResponse.data;
      const currentUserWithRank = usersWithRank.find(user => user.id === currentUserData.id);
      if (currentUserWithRank) {
        setCurrentUser({ ...currentUserWithRank, page: Math.ceil(currentUserWithRank.rank / usersPerPage) });
      }
      processAndSetUsers(usersWithRank, page);
    } catch (err: unknown) {

      if (err instanceof Error) {
        setError(err.message || t('ranking.errors.fetchError') as string);
      }
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      const startIndex = (page - 1) * usersPerPage;
      const endIndex = startIndex + usersPerPage;
      setPaginatedUsers(allUsers.slice(startIndex, endIndex));
    }
  };
  
  const goToMyPosition = () => {
    if (currentUser?.page && currentUser.page !== currentPage) goToPage(currentUser.page);
  };

  const getRankIcon = (user: User) => {
    switch (user.rank) {
      case 1: return t('ranking.positions.first');
      case 2: return t('ranking.positions.second');
      case 3: return t('ranking.positions.third');
      default: return t('ranking.positions.nth', { rank: user.rank });
    }
  };

  const getRankClass = (user: User) => {
    switch (user.rank) {
      case 1: return "rank-gold";
      case 2: return "rank-silver";
      case 3: return "rank-bronze";
      default: return "rank-default";
    }
  };

  if (loading) return <Loading message={t('ranking.loading.text') as string} />;

  if (error && allUsers.length === 0) {
    return (
      <div className="ranking-page"><div className="ranking-container">
        <div className="ranking-error-state">
          <div className="ranking-error-icon">⚠️</div>
          <h3>{t('ranking.error.title') as string}</h3>
          <p>{error}</p>
          <button className="ranking-retry-button" onClick={() => fetchRanking(1)}>{t('ranking.error.retryButton') as string}</button>
        </div>
      </div></div>
    );
  }

  if (!loading && allUsers.length === 0) {
    return (
      <div className="ranking-page"><div className="ranking-container">
        <div className="ranking-empty-state">
          <h3>{t('ranking.empty.title') as string}</h3>
          <p>{t('ranking.empty.description') as string}</p>
          <p>{t('ranking.empty.futureInfo') as string}</p>
          <button className="ranking-retry-button" onClick={() => fetchRanking(1)}>{t('ranking.empty.refreshButton') as string}</button>
        </div>
      </div></div>
    );
  }

  return (
    <div className="ranking-page">
      <div className="ranking-container">
        {error && (<div className="ranking-error-banner"><span>⚠️ {error}</span><button onClick={() => setError(null)}>✕</button></div>)}
        {topThreeUsers.length > 0 && (
          <div className="podium-section">
            <h2 className="podium-title">{t('ranking.podium.title') as string}</h2>
            <div className="ranking-podium">
              {topThreeUsers[1] && (<div className={`podium-item rank-silver ${currentUser?.id === topThreeUsers[1].id ? "current-user" : ""}`}><div className="podium-rank">{getRankIcon(topThreeUsers[1])}</div><div className="podium-avatar"><Image src={topThreeUsers[1].avatar || "/assets/avatar.png"} alt="avatar" width={80} height={80} className="rounded-full" /></div><h3>{topThreeUsers[1].firstName || topThreeUsers[1].username}</h3><span className="podium-stat-number">{topThreeUsers[1].totalApplications}</span></div>)}
              {topThreeUsers[0] && (<div className={`podium-item rank-gold ${currentUser?.id === topThreeUsers[0].id ? "current-user" : ""}`}><div className="podium-rank">{getRankIcon(topThreeUsers[0])}</div><div className="podium-avatar"><Image src={topThreeUsers[0].avatar || "/assets/avatar.png"} alt="avatar" width={100} height={100} className="rounded-full" /></div><h3>{topThreeUsers[0].firstName || topThreeUsers[0].username}</h3><span className="podium-stat-number">{topThreeUsers[0].totalApplications}</span></div>)}
              {topThreeUsers[2] && (<div className={`podium-item rank-bronze ${currentUser?.id === topThreeUsers[2].id ? "current-user" : ""}`}><div className="podium-rank">{getRankIcon(topThreeUsers[2])}</div><div className="podium-avatar"><Image src={topThreeUsers[2].avatar || "/assets/avatar.png"} alt="avatar" width={80} height={80} className="rounded-full" /></div><h3>{topThreeUsers[2].firstName || topThreeUsers[2].username}</h3><span className="podium-stat-number">{topThreeUsers[2].totalApplications}</span></div>)}
            </div>
          </div>
        )}
        <div className="ranking-section">
          <div className="ranking-header-section">
            <div className="ranking-title-with-refresh"><h2>{t('ranking.complete.title') as string}</h2><button className="ranking-refresh-button" onClick={() => fetchRanking(1)} disabled={loading} title={t('ranking.complete.refreshTitle') as string}>{t('ranking.complete.refreshButton') as string}</button></div>
            {currentUser && (<div className="ranking-user-position-info"><span>{t('ranking.userPosition.text', { rank: currentUser.rank })}</span>{currentUser.page !== currentPage && (<button className="ranking-go-to-position-button" onClick={goToMyPosition}>{t('ranking.userPosition.goToButton') as string}</button>)}</div>)}
          </div>
          <div className="ranking-list">
            {paginatedUsers.map((user) => (<div key={user.id} className={`ranking-item ${getRankClass(user)} ${currentUser?.id === user.id ? "current-user" : ""}`}><div className="ranking-position"><span className="ranking-rank-number">{getRankIcon(user)}</span></div><div className="ranking-user-avatar"><Image src={user.avatar || "/assets/avatar.png"} alt="avatar" width={40} height={40} className="rounded-full" /></div><div className="ranking-user-info"><h3>{user.firstName ? `${user.firstName} ${user.lastName}` : user.username}{currentUser?.id === user.id && <span className="ranking-you-badge">{t('ranking.badges.you') as string}</span>}</h3><p>{user.email}</p></div><div className="ranking-user-stats"><div className="ranking-stat-item primary"><span className="ranking-stat-number">{user.totalApplications}</span><span className="ranking-stat-label">{t('ranking.stats.totalApplications') as string}</span></div></div></div>))}
          </div>
          {totalPages > 1 && (<div className="ranking-pagination"><button className="ranking-pagination-button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>← {t('ranking.pagination.previous') as string}</button><div className="ranking-pagination-numbers">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {let pageNumber; if (totalPages <= 5) pageNumber = i + 1; else if (currentPage <= 3) pageNumber = i + 1; else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i; else pageNumber = currentPage - 2 + i; return (<button key={pageNumber} className={`ranking-pagination-number ${currentPage === pageNumber ? "active" : ""}`} onClick={() => goToPage(pageNumber)}>{pageNumber}</button>);})}</div><button className="ranking-pagination-button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>{t('ranking.pagination.next') as string} →</button></div>)}
          <div className="ranking-pagination-info">{t('ranking.pagination.info', { currentPage, totalPages, usersShown: paginatedUsers.length })}</div>
        </div>
      </div>
    </div>
  );
}