export default function Loader() {
  return (
    // Fixed position overlay to cover the entire viewport
    <div 
      className="d-flex flex-column justify-content-center align-items-center bg-white bg-opacity-75" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 1050, // Ensures it sits above most content/modals
      }}
    >
      
      {/* Growing Spinner for a more dynamic look */}
      <div className="spinner-grow text-success" role="status" style={{ width: '4rem', height: '4rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      
      <p className="mt-4 text-dark fw-bold fs-5 animate__animated animate__pulse animate__infinite">
        Please wait...
      </p>
    </div>
  )
}