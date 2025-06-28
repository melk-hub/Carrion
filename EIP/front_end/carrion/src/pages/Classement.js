import React, { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Classement.css"
import { useLanguage } from "../contexts/LanguageContext"

const API_URL = process.env.REACT_APP_API_URL

function Ranking() {
  const [users, setUsers] = useState([])
  const [topThreeUsers, setTopThreeUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [usersPerPage] = useState(10)
  const { t } = useLanguage()

  useEffect(() => {
    fetchRanking(1)
  }, [])

  const fetchRanking = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${API_URL}/user/all-users`, {
        withCredentials: true,
      })

      const currentUserResponse = await axios.get(`${API_URL}/user/profile`, {
        withCredentials: true,
      })

      const allUsers = response.data
      const currentUserData = currentUserResponse.data

      // Check if allUsers is null or undefined
      if (!allUsers || !Array.isArray(allUsers)) {
        console.warn(t('ranking.warnings.noUserDataReceived'))
        setUsers([])
        setTopThreeUsers([])
        setTotalPages(1)
        setCurrentPage(1)
        setCurrentUser(null)
        setLoading(false)
        return
      }

      // If the array is empty
      if (allUsers.length === 0) {
        console.warn(t('ranking.warnings.noUsersFound'))
        setUsers([])
        setTopThreeUsers([])
        setTotalPages(1)
        setCurrentPage(1)
        setCurrentUser(null)
        setLoading(false)
        return
      }

      // Sort users by total number of applications (descending)
      const sortedUsers = allUsers.sort((a, b) => b.totalApplications - a.totalApplications)

      // Add rank to each user
      const usersWithRank = sortedUsers.map((user, index) => ({
        ...user,
        rank: index + 1
      }))

      // Get top 3
      const topThree = usersWithRank.slice(0, 3)
      setTopThreeUsers(topThree)

      // Pagination
      const totalUsers = usersWithRank.length
      const totalPagesCalculated = Math.ceil(totalUsers / usersPerPage)
      const startIndex = (page - 1) * usersPerPage
      const endIndex = startIndex + usersPerPage
      const paginatedUsers = usersWithRank.slice(startIndex, endIndex)

      setUsers(paginatedUsers)
      setTotalPages(totalPagesCalculated)
      setCurrentPage(page)

      // Find current user in the list with their rank
      const currentUserWithRank = usersWithRank.find(user => user.id === currentUserData.id)
      if (currentUserWithRank) {
        const userPage = Math.ceil(currentUserWithRank.rank / usersPerPage)
        setCurrentUser({
          ...currentUserWithRank,
          page: userPage
        })
      }

    } catch (err) {
      setError(err.response?.data?.message || t('ranking.errors.fetchError'))
      console.error(t('ranking.errors.consoleError'), err)
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchRanking(page)
    }
  }

  const goToMyPosition = () => {
    if (currentUser?.page && currentUser.page !== currentPage) {
      fetchRanking(currentUser.page)
    }
  }

  const getRankIcon = (user) => {
    const rank = user.rank || 1
    switch (rank) {
      case 1:
        return t('ranking.positions.first')
      case 2:
        return t('ranking.positions.second')
      case 3:
        return t('ranking.positions.third')
      default:
        return t('ranking.positions.nth', { rank })
    }
  }

  const getRankClass = (user) => {
    const rank = user.rank || 1
    switch (rank) {
      case 1:
        return "rank-gold"
      case 2:
        return "rank-silver"
      case 3:
        return "rank-bronze"
      default:
        return "rank-default"
    }
  }

  // loading
  if (loading) {
    return (
      <div className="ranking-page">
        <div className="ranking-container">
          <div className="ranking-loading-state">
            <div className="ranking-loading-spinner"></div>
            <p>{t('ranking.loading.text')}</p>
          </div>
        </div>
      </div>
    )
  }

  // error
  if (error && users.length === 0) {
    return (
      <div className="ranking-page">
        <div className="ranking-container">
          <div className="ranking-error-state">
            <div className="ranking-error-icon">⚠️</div>
            <h3>{t('ranking.error.title')}</h3>
            <p>{error}</p>
            <button className="ranking-retry-button" onClick={fetchRanking}>
              {t('ranking.error.retryButton')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default display when no users are available
  if (!loading && users.length === 0 && topThreeUsers.length === 0) {
    return (
      <div className="ranking-page">
        <div className="ranking-container">
          <div className="ranking-empty-state">
            <h3>{t('ranking.empty.title')}</h3>
            <p>{t('ranking.empty.description')}</p>
            <p>{t('ranking.empty.futureInfo')}</p>
            <button className="ranking-retry-button" onClick={() => fetchRanking(1)}>
              {t('ranking.empty.refreshButton')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ranking-page">
      <div className="ranking-container">
        {error && (
          <div className="ranking-error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Top 3 podium - stays fixed */}
        {topThreeUsers.length > 0 && (
          <div className="podium-section">
            <h2>{t('ranking.podium.title')}</h2>
            <div className="ranking-podium">
              {/* 2nd place on the left */}
              {topThreeUsers[1] && (
                <div
                  key={topThreeUsers[1].id}
                  className={`podium-item rank-silver ${currentUser?.id === topThreeUsers[1].id ? "current-user" : ""}`}
                >
                  <div className="podium-rank">{getRankIcon(topThreeUsers[1])}</div>
                  <div className="podium-avatar">
                    {topThreeUsers[1].avatar ? (
                      <img
                        src={topThreeUsers[1].avatar || "/placeholder.svg"}
                        alt={`${topThreeUsers[1].firstName || topThreeUsers[1].username} ${topThreeUsers[1].lastName || ''}`}
                      />
                    ) : (
                      <div className="ranking-avatar-placeholder">
                        {topThreeUsers[1].firstName?.[0] || topThreeUsers[1].username?.[0] || '?'}
                        {topThreeUsers[1].lastName?.[0] || topThreeUsers[1].username?.[1] || ''}
                      </div>
                    )}
                  </div>
                  <div className="podium-info">
                    <h3>
                      {topThreeUsers[1].firstName && topThreeUsers[1].lastName 
                        ? `${topThreeUsers[1].firstName} ${topThreeUsers[1].lastName}`
                        : topThreeUsers[1].username}
                    </h3>
                    <div className="podium-stats">
                      <div className="ranking-stat-item">
                        <span className="ranking-stat-number">{topThreeUsers[1].totalApplications}</span>
                        <span className="ranking-stat-label">{t('ranking.stats.applications')}</span>
                      </div>
                    </div>
                  </div>
                  {currentUser?.id === topThreeUsers[1].id && <div className="ranking-current-user-badge">{t('ranking.badges.itsYou')}</div>}
                </div>
              )}

              {/* 1st place in the middle */}
              {topThreeUsers[0] && (
                <div
                  key={topThreeUsers[0].id}
                  className={`podium-item rank-gold ${currentUser?.id === topThreeUsers[0].id ? "current-user" : ""}`}
                >
                  <div className="podium-rank">{getRankIcon(topThreeUsers[0])}</div>
                  <div className="podium-avatar">
                    {topThreeUsers[0].avatar ? (
                      <img
                        src={topThreeUsers[0].avatar || "/placeholder.svg"}
                        alt={`${topThreeUsers[0].firstName || topThreeUsers[0].username} ${topThreeUsers[0].lastName || ''}`}
                      />
                    ) : (
                      <div className="ranking-avatar-placeholder">
                        {topThreeUsers[0].firstName?.[0] || topThreeUsers[0].username?.[0] || '?'}
                        {topThreeUsers[0].lastName?.[0] || topThreeUsers[0].username?.[1] || ''}
                      </div>
                    )}
                  </div>
                  <div className="podium-info">
                    <h3>
                      {topThreeUsers[0].firstName && topThreeUsers[0].lastName 
                        ? `${topThreeUsers[0].firstName} ${topThreeUsers[0].lastName}`
                        : topThreeUsers[0].username}
                    </h3>
                    <div className="podium-stats">
                      <div className="ranking-stat-item">
                        <span className="ranking-stat-number">{topThreeUsers[0].totalApplications}</span>
                        <span className="ranking-stat-label">{t('ranking.stats.applications')}</span>
                      </div>
                    </div>
                  </div>
                  {currentUser?.id === topThreeUsers[0].id && <div className="ranking-current-user-badge">{t('ranking.badges.itsYou')}</div>}
                </div>
              )}

              {/* 3rd place on the right */}
              {topThreeUsers[2] && (
                <div
                  key={topThreeUsers[2].id}
                  className={`podium-item rank-bronze ${currentUser?.id === topThreeUsers[2].id ? "current-user" : ""}`}
                >
                  <div className="podium-rank">{getRankIcon(topThreeUsers[2])}</div>
                  <div className="podium-avatar">
                    {topThreeUsers[2].avatar ? (
                      <img
                        src={topThreeUsers[2].avatar || "/placeholder.svg"}
                        alt={`${topThreeUsers[2].firstName || topThreeUsers[2].username} ${topThreeUsers[2].lastName || ''}`}
                      />
                    ) : (
                      <div className="ranking-avatar-placeholder">
                        {topThreeUsers[2].firstName?.[0] || topThreeUsers[2].username?.[0] || '?'}
                        {topThreeUsers[2].lastName?.[0] || topThreeUsers[2].username?.[1] || ''}
                      </div>
                    )}
                  </div>
                  <div className="podium-info">
                    <h3>
                      {topThreeUsers[2].firstName && topThreeUsers[2].lastName 
                        ? `${topThreeUsers[2].firstName} ${topThreeUsers[2].lastName}`
                        : topThreeUsers[2].username}
                    </h3>
                    <div className="podium-stats">
                      <div className="ranking-stat-item">
                        <span className="ranking-stat-number">{topThreeUsers[2].totalApplications}</span>
                        <span className="ranking-stat-label">{t('ranking.stats.applications')}</span>
                      </div>
                    </div>
                  </div>
                  {currentUser?.id === topThreeUsers[2].id && <div className="ranking-current-user-badge">{t('ranking.badges.itsYou')}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complete ranking with moved refresh button */}
        <div className="ranking-section">
          <div className="ranking-header-section">
            <div className="ranking-title-with-refresh">
            <h2>{t('ranking.complete.title')}</h2>
              <button 
                className="ranking-refresh-button" 
                onClick={() => fetchRanking(1)}
                disabled={loading}
                title={t('ranking.complete.refreshTitle')}
              >
                {t('ranking.complete.refreshButton')}
              </button>
            </div>
            <div className="ranking-controls">
            {currentUser && (
              <div className="ranking-user-position-info">
                <span>{t('ranking.userPosition.text', { rank: currentUser.rank })}</span>
                {currentUser.page !== currentPage && (
                  <button className="ranking-go-to-position-button" onClick={goToMyPosition}>
                    {t('ranking.userPosition.goToButton')}
                  </button>
                )}
              </div>
            )}
            </div>
          </div>

          <div className="ranking-list">
            {users.map((user) => (
              <div
                key={user.id}
                className={`ranking-item ${getRankClass(user)} ${currentUser?.id === user.id ? "current-user" : ""}`}
              >
                <div className="ranking-position">
                  <span className="ranking-rank-number">{getRankIcon(user)}</span>
                </div>

                <div className="ranking-user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar || "/placeholder.svg"} alt={`${user.firstName || user.username} ${user.lastName || ''}`} />
                  ) : (
                    <div className="ranking-avatar-placeholder">
                      {user.firstName?.[0] || user.username?.[0] || '?'}
                      {user.lastName?.[0] || user.username?.[1] || ''}
                    </div>
                  )}
                </div>

                <div className="ranking-user-info">
                  <h3>
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.username}
                    {currentUser?.id === user.id && <span className="ranking-you-badge">{t('ranking.badges.you')}</span>}
                  </h3>
                  <p>{user.email}</p>
                </div>

                <div className="ranking-user-stats">
                  <div className="ranking-stat-group">
                    <div className="ranking-stat-item primary">
                      <span className="ranking-stat-number">{user.totalApplications}</span>
                      <span className="ranking-stat-label">{t('ranking.stats.totalApplications')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ranking-pagination">
              <button
                className="ranking-pagination-button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← {t('ranking.pagination.previous')}
              </button>

              <div className="ranking-pagination-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNumber}
                      className={`ranking-pagination-number ${currentPage === pageNumber ? "active" : ""}`}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <button
                className="ranking-pagination-button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('ranking.pagination.next')} →
              </button>
            </div>
          )}

          <div className="ranking-pagination-info">
            {t('ranking.pagination.info', { 
              currentPage, 
              totalPages, 
              usersShown: users.length 
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking