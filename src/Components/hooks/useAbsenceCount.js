// absenceCount.js

import axios from "axios"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"

const useAbsenceCount = (page = 1, itemsPerPage = 10, debouncedSearchTerm = "", filterStatus = "", filterDate = "") => {
  const BASE_URL = "https://timemanagementsystemserver.onrender.com/"
  const token = useSelector((state) => state.auth.token)

  const [absentCount, setAbsentCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAbsenceCount = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${BASE_URL}api/super-admin/daily`, {
          params: {
            page,
            limit: itemsPerPage,
            search: debouncedSearchTerm,
            status: filterStatus || undefined,
            date: filterDate || undefined,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const { summary = {} } = response.data
        setAbsentCount(summary.absentCount || 0)
      } catch (error) {
        console.error("Error fetching absent count:", error)
        setError("Failed to load absent count")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAbsenceCount()
  }, [token, page, itemsPerPage, debouncedSearchTerm, filterStatus, filterDate])

  return { absentCount, isLoading, error }
}

export default useAbsenceCount;
