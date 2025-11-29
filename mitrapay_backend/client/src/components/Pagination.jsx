import React from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'

const Pagination = ({ page, totalPages, setPage }) => {
  const generatePageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="d-flex justify-content-center align-items-center gap-2 pb-5 flex-wrap">
      <button
        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        <FaAngleLeft /> 
      </button>

      {generatePageNumbers().map((p, index) =>
        p === '...' ? (
          <span key={index} className="px-2">...</span>
        ) : (
          <button
            key={index}
            onClick={() => setPage(p)}
            className={`btn btn-sm ${p === page ? 'btn-primary text-white' : 'btn-outline-primary'}`}
            style={{ width: '36px', height: '36px', padding: 0 }}
          >
            {p}
          </button>
        )
      )}

      <button
        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
        disabled={page === totalPages}
        // style={{borderColor:" rgb(255, 102, 0)"}}
        onClick={() => setPage(page + 1)}
        >
         <FaAngleRight />
      </button>
    </div>
  )
}

export default Pagination
