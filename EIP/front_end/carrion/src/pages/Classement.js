import React, { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Classement.css"

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

  useEffect(() => {
    fetchRanking(1)
  }, [])

  const fetchRanking = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${API_URL}/routejsp`, {
        withCredentials: true,
      })

      setUsers(response.data.users)
      setCurrentUser(response.data.currentUser)
      setCurrentPage(response.data.currentPage)
      setTotalPages(response.data.totalPages)

      if (response.data.topThree) {
        setTopThreeUsers(response.data.topThree)
      }

      if (response.data.currentUser?.page && page === 1) {
        setCurrentPage(response.data.currentUser.page)
        if (response.data.currentUser.page !== 1) {
          fetchRanking(response.data.currentUser.page)
          return
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la récupération du classement")
      console.error("Erreur:", err)

      const allMockUsers = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        firstName: ["Marie", "Pierre", "Sophie", "Thomas", "Julie", "Antoine", "Emma", "Xin", "Camille", "Garen"][
          i % 10
        ],
        lastName: ["Dupont", "Martin", "Bernard", "Petit", "Moreau", "Leroy", "Stone", "Zhao", "Ferros", "Demacia"][
          i % 10
        ],
        email: `user${i + 1}@email.com`,
        avatar: "data:image/jpeg;base64,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",
        totalApplications: Math.max(1, 50 - i),
        acceptedApplications: Math.floor((50 - i) * 0.2),
        pendingApplications: Math.floor((50 - i) * 0.3),
        rejectedApplications: Math.floor((50 - i) * 0.5),
        successRate: Math.max(5, 25 - i * 0.2),
        rank: i + 1,
      }))

      if (topThreeUsers.length === 0) {
        setTopThreeUsers(allMockUsers.slice(0, 3))
      }

      const totalUsers = allMockUsers.length
      const totalPagesCalculated = Math.ceil(totalUsers / usersPerPage)
      const startIndex = (page - 1) * usersPerPage
      const endIndex = startIndex + usersPerPage
      const paginatedUsers = allMockUsers.slice(startIndex, endIndex)

      setUsers(paginatedUsers)
      setCurrentUser({ id: 3, rank: 3, page: 1 })
      setCurrentPage(page)
      setTotalPages(totalPagesCalculated)
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
        return "1er"
      case 2:
        return "2e"
      case 3:
        return "3e"
      default:
        return `${rank}e`
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

  const getSuccessRateColor = (rate) => {
    if (rate >= 20) return "success-high"
    if (rate >= 15) return "success-medium"
    return "success-low"
  }

  // loading
  if (loading) {
    return (
      <div className="ranking-page">
        <div className="ranking-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement du classement...</p>
          </div>
        </div>
      </div>
    )
  }

  // erreur
  if (error && users.length === 0) {
    return (
      <div className="ranking-page">
        <div className="ranking-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Erreur de chargement</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchRanking}>
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ranking-page">
      <div className="ranking-container">
        <div className="ranking-header">
          <button className="refresh-button" onClick={() => fetchRanking(1)}>
            Actualiser
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Podium Top 3 - Reste fixe */}
        {topThreeUsers.length > 0 && (
          <div className="podium-section">
            <h2>Podium</h2>
            <div className="podium">
              {/* 2ème place à gauche */}
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
                        alt={`${topThreeUsers[1].firstName} ${topThreeUsers[1].lastName}`}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {topThreeUsers[1].firstName?.[0]}
                        {topThreeUsers[1].lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="podium-info">
                    <h3>
                      {topThreeUsers[1].firstName} {topThreeUsers[1].lastName}
                    </h3>
                    <div className="podium-stats">
                      <div className="stat-item">
                        <span className="stat-number">{topThreeUsers[1].totalApplications}</span>
                        <span className="stat-label">Candidatures</span>
                      </div>
                      <div className="stat-item">
                        <span className={`stat-number ${getSuccessRateColor(topThreeUsers[1].successRate)}`}>
                          {topThreeUsers[1].successRate}%
                        </span>
                        <span className="stat-label">Succès</span>
                      </div>
                    </div>
                  </div>
                  {currentUser?.id === topThreeUsers[1].id && <div className="current-user-badge">C'est vous !</div>}
                </div>
              )}

              {/* 1er place au milieu */}
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
                        alt={`${topThreeUsers[0].firstName} ${topThreeUsers[0].lastName}`}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {topThreeUsers[0].firstName?.[0]}
                        {topThreeUsers[0].lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="podium-info">
                    <h3>
                      {topThreeUsers[0].firstName} {topThreeUsers[0].lastName}
                    </h3>
                    <div className="podium-stats">
                      <div className="stat-item">
                        <span className="stat-number">{topThreeUsers[0].totalApplications}</span>
                        <span className="stat-label">Candidatures</span>
                      </div>
                      <div className="stat-item">
                        <span className={`stat-number ${getSuccessRateColor(topThreeUsers[0].successRate)}`}>
                          {topThreeUsers[0].successRate}%
                        </span>
                        <span className="stat-label">Succès</span>
                      </div>
                    </div>
                  </div>
                  {currentUser?.id === topThreeUsers[0].id && <div className="current-user-badge">C'est vous !</div>}
                </div>
              )}

              {/* 3ème place à droite */}
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
                        alt={`${topThreeUsers[2].firstName} ${topThreeUsers[2].lastName}`}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {topThreeUsers[2].firstName?.[0]}
                        {topThreeUsers[2].lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="podium-info">
                    <h3>
                      {topThreeUsers[2].firstName} {topThreeUsers[2].lastName}
                    </h3>
                    <div className="podium-stats">
                      <div className="stat-item">
                        <span className="stat-number">{topThreeUsers[2].totalApplications}</span>
                        <span className="stat-label">Candidatures</span>
                      </div>
                      <div className="stat-item">
                        <span className={`stat-number ${getSuccessRateColor(topThreeUsers[2].successRate)}`}>
                          {topThreeUsers[2].successRate}%
                        </span>
                        <span className="stat-label">Succès</span>
                      </div>
                    </div>
                  </div>
                  {currentUser?.id === topThreeUsers[2].id && <div className="current-user-badge">C'est vous !</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classement complet */}
        <div className="ranking-section">
          <div className="ranking-header-section">
            <h2>Classement Complet</h2>
            {currentUser && (
              <div className="user-position-info">
                <span>Votre position : {currentUser.rank}e</span>
                {currentUser.page !== currentPage && (
                  <button className="go-to-position-button" onClick={goToMyPosition}>
                    Aller à ma position
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ranking-list">
            {users.map((user) => (
              <div
                key={user.id}
                className={`ranking-item ${getRankClass(user)} ${currentUser?.id === user.id ? "current-user" : ""}`}
              >
                <div className="ranking-position">
                  <span className="rank-number">{getRankIcon(user)}</span>
                </div>

                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                  )}
                </div>

                <div className="user-info">
                  <h3>
                    {user.firstName} {user.lastName}
                    {currentUser?.id === user.id && <span className="you-badge">Vous</span>}
                  </h3>
                  <p>{user.email}</p>
                </div>

                <div className="user-stats">
                  <div className="stat-group">
                    <div className="stat-item primary">
                      <span className="stat-number">{user.totalApplications}</span>
                      <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-item success">
                      <span className="stat-number">{user.acceptedApplications}</span>
                      <span className="stat-label">Acceptées</span>
                    </div>
                    <div className="stat-item pending">
                      <span className="stat-number">{user.pendingApplications}</span>
                      <span className="stat-label">En attente</span>
                    </div>
                    <div className="stat-item rejected">
                      <span className="stat-number">{user.rejectedApplications}</span>
                      <span className="stat-label">Refusées</span>
                    </div>
                  </div>
                  <div className="success-rate">
                    <span className={`rate-value ${getSuccessRateColor(user.successRate)}`}>{user.successRate}%</span>
                    <span className="rate-label">Taux de succès</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Précédent
              </button>

              <div className="pagination-numbers">
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
                      className={`pagination-number ${currentPage === pageNumber ? "active" : ""}`}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <button
                className="pagination-button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant →
              </button>
            </div>
          )}

          <div className="pagination-info">
            Page {currentPage} sur {totalPages} ({users.length} utilisateurs affichés)
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="global-stats">
          <h2>Statistiques Globales</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <span className="stat-number">{users.length}</span>
                <span className="stat-label">Utilisateurs actifs</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <span className="stat-number">{users.reduce((total, user) => total + user.totalApplications, 0)}</span>
                <span className="stat-label">Candidatures totales</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking